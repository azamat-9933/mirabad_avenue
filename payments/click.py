"""Click payments on the apartment ledger.

Two protocols share one log (ClickTransaction) and one ledger (payments.services):

* Advanced Shop (JSON, one URL): getInfo (action 0) shows the payer whose personal account it is
  and what is owed, Prepare (1) checks the account and amount and holds the attempt, Complete (2)
  puts the money on the apartment account, Check (3) reports an attempt's state and Compare (4)
  lists the confirmed payments of a period.
* SHOP API (form-encoded): Prepare (action 0) and Complete (action 1) with merchant_trans_id as
  the personal account; Click's payment link (my.click.uz/services/pay) goes through this one.

Signed requests are checked against CLICK_SECRET_KEY before anything else; while the key is empty
every signed request is refused. getInfo and Compare carry no signature, so in production
CLICK_ALLOWED_IPS must list Click's servers (the views refuse other addresses).
https://docs.click.uz/shop-api/requests, https://docs.click.uz/additional/get-info
"""
import hashlib
import hmac
import logging
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from main_app.models import Apartment, Building, Owner
from portal.audit import record_event
from portal.models import AuditEvent

from .models import ClickTransaction, Transaction
from .services import apply_account_change

logger = logging.getLogger(__name__)

SUCCESS = 0
SIGN_CHECK_FAILED = -1
INCORRECT_AMOUNT = -2
ACTION_NOT_FOUND = -3
ALREADY_PAID = -4
USER_NOT_FOUND = -5
TRANSACTION_NOT_FOUND = -6
FAILED_TO_UPDATE = -7
BAD_REQUEST = -8
TRANSACTION_CANCELLED = -9

ERROR_NOTES = {
    SUCCESS: "Success",
    SIGN_CHECK_FAILED: "SIGN CHECK FAILED!",
    INCORRECT_AMOUNT: "Incorrect parameter amount",
    ACTION_NOT_FOUND: "Action not found",
    ALREADY_PAID: "Already paid",
    USER_NOT_FOUND: "User does not exist",
    TRANSACTION_NOT_FOUND: "Transaction does not exist",
    FAILED_TO_UPDATE: "Failed to update user",
    BAD_REQUEST: "Error in request from click",
    TRANSACTION_CANCELLED: "Transaction cancelled",
}

# Check (action 3): what Click should do with an attempt.
CHECK_NOT_PROCESSED = 0
CHECK_FAILED = 1
CHECK_DONE = 2

COMPARE_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
CLICK_ACTOR = "Click"

# House and apartment numbers as payers type them: "60в", "60 V", "60-v" are house 60V.
_UNIT_LETTERS = str.maketrans({"А": "A", "В": "V", "Б": "B", "а": "A", "в": "V", "б": "B"})


class ClickError(Exception):
    def __init__(self, code, note=None, transaction=None):
        super().__init__(note or ERROR_NOTES[code])
        self.code = code
        self.note = note or ERROR_NOTES[code]
        self.transaction = transaction


# ── shared checks ─────────────────────────────────────────────────────────────


def _sign_value(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


def signature(*parts) -> str:
    return hashlib.md5("".join(_sign_value(part) for part in parts).encode("utf-8")).hexdigest()


def _check_sign(given, *parts):
    """``parts`` is the signed string in order, with None where the secret key goes."""
    secret = settings.CLICK_SECRET_KEY
    if not secret or not given:
        raise ClickError(SIGN_CHECK_FAILED)
    expected = signature(*(secret if part is None else part for part in parts))
    if not hmac.compare_digest(expected, str(given).strip().lower()):
        raise ClickError(SIGN_CHECK_FAILED)


def _check_service(service_id):
    if not str(service_id or "").strip().isdigit():
        raise ClickError(BAD_REQUEST)
    if settings.CLICK_SERVICE_ID and str(service_id).strip() != str(settings.CLICK_SERVICE_ID):
        raise ClickError(BAD_REQUEST)


def _int(value) -> int:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        raise ClickError(BAD_REQUEST) from None


def _echo(value):
    """An id Click sent, sent back as a number when it is one."""
    text = str(value).strip()
    return int(text) if text.lstrip("-").isdigit() else value


def parse_amount(raw) -> Decimal:
    """Click sends sums in UZS with up to two decimals; anything else, or out of range, is refused."""
    try:
        amount = Decimal(str(raw).strip())
    except (InvalidOperation, TypeError, ValueError):
        raise ClickError(INCORRECT_AMOUNT) from None
    if not amount.is_finite() or amount != amount.quantize(Decimal("0.01")):
        raise ClickError(INCORRECT_AMOUNT)
    if amount < Decimal(settings.CLICK_MIN_AMOUNT) or amount > Decimal(settings.CLICK_MAX_AMOUNT):
        raise ClickError(INCORRECT_AMOUNT)
    return amount.quantize(Decimal("0.01"))


def _unit_key(value) -> str:
    return re.sub(r"[\s\-]", "", str(value or "")).translate(_UNIT_LETTERS).upper()


def find_apartment(account="", house="", apartment_number=""):
    """The apartment by personal account, or (for a house + apartment form) by its numbers."""
    apartments = Apartment.objects.select_related("building", "building__complex")
    account = re.sub(r"\s", "", str(account or ""))
    if account:
        return apartments.filter(personal_account=account).first()
    if not (house and apartment_number):
        return None
    house_key, apartment_key = _unit_key(house), _unit_key(apartment_number)
    building = next((item for item in Building.objects.all() if _unit_key(item.number) == house_key), None)
    if building is None:
        return None
    return next((item for item in apartments.filter(building=building) if _unit_key(item.number) == apartment_key), None)


def _apartment_from_params(params):
    if not isinstance(params, dict):
        raise ClickError(BAD_REQUEST)
    account = params.get(settings.CLICK_ACCOUNT_PARAM) or params.get("account") or params.get("contract")
    apartment = find_apartment(account, params.get("house_num"), params.get("apart_num"))
    if apartment is None:
        raise ClickError(USER_NOT_FOUND)
    return apartment, re.sub(r"\s", "", str(account or "")) or apartment.personal_account or ""


def masked_name(fio: str) -> str:
    """'TO‘RAYEV LAZIZBEK KAMOLIDDIN O‘G‘LI' -> 'TO‘RAYEV L. K.'; a company name stays whole."""
    words = (fio or "").split()
    if len(words) < 2 or any(mark in fio for mark in '"«»'):
        return fio or ""
    return " ".join([words[0], *(f"{word[0]}." for word in words[1:3])])


def account_info(apartment) -> dict:
    """What Click shows the payer: whose account it is and the balance (negative = debt)."""
    apartment.refresh_from_db(fields=["balance"])
    owner = Owner.objects.filter(apartment=apartment).only("fio").first()
    balance = apartment.balance
    return {
        "account": apartment.personal_account,
        "full_name": masked_name(owner.fio) if owner else "",
        "house_num": apartment.building.number,
        "apart_num": apartment.number,
        "balance": f"{balance:.2f}",
        "debt": f"{max(-balance, Decimal('0')):.2f}",
    }


# ── one attempt: hold, then confirm or cancel ─────────────────────────────────


def _hold(protocol, *, click_trans_id, click_paydoc_id, service_id, account, apartment, amount, payload):
    """Prepare: the attempt held for Complete; the same attempt asked twice gets the same answer."""
    with transaction.atomic():
        existing = (
            ClickTransaction.objects.select_for_update()
            .filter(protocol=protocol, click_trans_id=click_trans_id)
            .first()
        )
        if existing is None:
            if ClickTransaction.objects.filter(
                click_paydoc_id=click_paydoc_id, state=ClickTransaction.STATE_CONFIRMED
            ).exists():
                raise ClickError(ALREADY_PAID)
            try:
                with transaction.atomic():
                    return ClickTransaction.objects.create(
                        protocol=protocol,
                        click_trans_id=click_trans_id,
                        click_paydoc_id=click_paydoc_id,
                        service_id=service_id,
                        account=account[:64],
                        apartment=apartment,
                        amount=amount,
                        prepare_payload=payload,
                    )
            except IntegrityError:
                existing = ClickTransaction.objects.select_for_update().get(
                    protocol=protocol, click_trans_id=click_trans_id
                )
        if existing.apartment_id != apartment.pk or existing.amount != amount:
            raise ClickError(BAD_REQUEST, transaction=existing)
        if existing.state == ClickTransaction.STATE_CANCELLED:
            raise ClickError(TRANSACTION_CANCELLED, transaction=existing)
        if existing.state == ClickTransaction.STATE_CONFIRMED:
            raise ClickError(ALREADY_PAID, transaction=existing)
        return existing


def _cancel(held, payload, note=""):
    held.state = ClickTransaction.STATE_CANCELLED
    held.cancelled_at = timezone.now()
    held.error_note = str(note or "")[:255]
    held.complete_payload = payload
    held.save(update_fields=["state", "cancelled_at", "error_note", "complete_payload"])


def _complete(held, payload, *, click_error=None):
    """Complete a locked attempt; returns (error code, the attempt to report).

    Click's own negative error cancels the attempt; otherwise the money goes on the account once
    per Click payment. Nothing here raises after writing, so the caller's transaction keeps a
    cancellation it has to report as an error.
    """
    if held.state == ClickTransaction.STATE_CONFIRMED:
        return ALREADY_PAID, held
    if held.state == ClickTransaction.STATE_CANCELLED:
        return TRANSACTION_CANCELLED, held
    if click_error is not None and click_error < 0:
        _cancel(held, payload, payload.get("error_note"))
        return TRANSACTION_CANCELLED, held
    paid = (
        ClickTransaction.objects.filter(click_paydoc_id=held.click_paydoc_id, state=ClickTransaction.STATE_CONFIRMED)
        .exclude(pk=held.pk)
        .first()
    )
    if paid is not None:
        # Another attempt of the same Click payment already put the money on the account.
        _cancel(held, payload, "Duplicate attempt of a confirmed payment")
        return ALREADY_PAID, paid
    try:
        ledger = apply_account_change(
            held.apartment_id,
            held.amount,
            Transaction.TYPE_CLICK,
            description=f"Click: payment {held.click_paydoc_id}, account {held.account}",
            created_by=CLICK_ACTOR,
            external_id=f"click:{held.click_paydoc_id}",
        )
    except Exception:  # the card is already charged: Click has to hear that we failed
        logger.exception("Click payment %s could not be posted", held.click_paydoc_id)
        return FAILED_TO_UPDATE, held
    held.state = ClickTransaction.STATE_CONFIRMED
    held.transaction = ledger
    held.confirmed_at = timezone.now()
    held.complete_payload = payload
    held.save(update_fields=["state", "transaction", "confirmed_at", "complete_payload"])
    _audit(held, ledger)
    # Imported here: the bot's modules import this one (masked_name).
    from telegram_bot.notifications import notify_payment_later

    notify_payment_later(ledger.pk)
    return SUCCESS, held


def _audit(held, ledger):
    apartment = held.apartment
    owner = ledger.owner
    record_event(
        actor=CLICK_ACTOR,
        event_type=AuditEvent.TYPE_BALANCE,
        title="Click payment received",
        message=(
            f"{owner.fio if owner else f'Apartment {apartment.number}'}: +{held.amount} UZS via Click "
            f"(payment {held.click_paydoc_id}, account {held.account})."
        ),
        complex=apartment.building.complex,
        building=apartment.building,
        apartment=apartment,
        owner=owner,
        metadata={
            "source": "click",
            "transaction_id": ledger.id,
            "click_paydoc_id": held.click_paydoc_id,
            "amount": str(held.amount),
            "balance_before": str(ledger.balance_before),
            "balance_after": str(ledger.balance_after),
        },
    )


def _locked(protocol, merchant_prepare_id, **match):
    if not str(merchant_prepare_id or "").strip().isdigit():
        raise ClickError(TRANSACTION_NOT_FOUND)
    held = (
        ClickTransaction.objects.select_for_update()
        .select_related("apartment__building__complex")
        .filter(pk=int(str(merchant_prepare_id).strip()), protocol=protocol, **match)
        .first()
    )
    if held is None:
        raise ClickError(TRANSACTION_NOT_FOUND)
    return held


# ── Advanced Shop (JSON) ──────────────────────────────────────────────────────


def _advanced_sign(payload):
    """md5(click_paydoc_id + attempt_trans_id + service_id + SECRET_KEY + params values + action + sign_time)."""
    params = payload.get("params")
    if not isinstance(params, dict):
        raise ClickError(BAD_REQUEST)
    _check_sign(
        payload.get("sign_string"),
        payload.get("click_paydoc_id"), payload.get("attempt_trans_id"), payload.get("service_id"), None,
        *params.values(), payload.get("action"), payload.get("sign_time"),
    )
    _check_service(payload.get("service_id"))


def _advanced_ids(payload):
    return {
        "click_paydoc_id": _int(payload.get("click_paydoc_id")),
        "attempt_trans_id": _int(payload.get("attempt_trans_id")),
    }


def advanced_get_info(payload):
    _check_service(payload.get("service_id"))
    apartment, _ = _apartment_from_params(payload.get("params"))
    return {"error": SUCCESS, "error_note": ERROR_NOTES[SUCCESS], "params": account_info(apartment)}


def advanced_prepare(payload):
    _advanced_sign(payload)
    ids = _advanced_ids(payload)
    params = payload["params"]
    apartment, account = _apartment_from_params(params)
    held = _hold(
        ClickTransaction.PROTOCOL_ADVANCED,
        click_trans_id=ids["attempt_trans_id"],
        click_paydoc_id=ids["click_paydoc_id"],
        service_id=_int(payload.get("service_id")),
        account=account,
        apartment=apartment,
        amount=parse_amount(params.get("amount")),
        payload=payload,
    )
    return {
        **ids,
        "merchant_prepare_id": str(held.pk),
        "params": account_info(apartment),
        "error": SUCCESS,
        "error_note": ERROR_NOTES[SUCCESS],
    }


def advanced_complete(payload):
    _advanced_sign(payload)
    ids = _advanced_ids(payload)
    click_error = payload.get("error")
    with transaction.atomic():
        held = _locked(
            ClickTransaction.PROTOCOL_ADVANCED,
            payload.get("merchant_prepare_id"),
            click_paydoc_id=ids["click_paydoc_id"],
        )
        amount = payload["params"].get("amount")
        if amount is not None and parse_amount(amount) != held.amount:
            raise ClickError(INCORRECT_AMOUNT, transaction=held)
        code, reported = _complete(
            held, payload, click_error=_int(click_error) if click_error not in (None, "") else None
        )
    if code != SUCCESS:
        raise ClickError(code, transaction=reported)
    return {
        **ids,
        "merchant_confirm_id": str(held.transaction_id),
        "params": account_info(held.apartment),
        "error": SUCCESS,
        "error_note": ERROR_NOTES[SUCCESS],
    }


def advanced_check(payload):
    _advanced_sign(payload)
    ids = _advanced_ids(payload)
    with transaction.atomic():
        held = _locked(
            ClickTransaction.PROTOCOL_ADVANCED,
            payload.get("merchant_prepare_id"),
            click_paydoc_id=ids["click_paydoc_id"],
        )
    status = {
        ClickTransaction.STATE_CONFIRMED: CHECK_DONE,
        ClickTransaction.STATE_CANCELLED: CHECK_FAILED,
    }.get(held.state, CHECK_NOT_PROCESSED)
    response = {**ids, "error": SUCCESS, "error_note": ERROR_NOTES[SUCCESS], "status": status, "params": {}}
    if held.state == ClickTransaction.STATE_CONFIRMED:
        response["merchant_confirm_id"] = str(held.transaction_id)
    return response


def _compare_date(value):
    try:
        moment = datetime.strptime(str(value or "").strip(), COMPARE_DATE_FORMAT)
    except ValueError:
        raise ClickError(BAD_REQUEST) from None
    return timezone.make_aware(moment)


def advanced_compare(payload):
    _check_service(payload.get("service_id"))
    since, until = _compare_date(payload.get("from_date")), _compare_date(payload.get("till_date"))
    if until <= since:
        raise ClickError(BAD_REQUEST)
    confirmed = ClickTransaction.objects.filter(
        state=ClickTransaction.STATE_CONFIRMED, confirmed_at__gte=since, confirmed_at__lt=until
    ).order_by("confirmed_at")
    return {
        "error": SUCCESS,
        "error_note": ERROR_NOTES[SUCCESS],
        "requests": {
            str(item.click_paydoc_id): {
                "click_paydoc_id": item.click_paydoc_id,
                "params": {"account": item.account, "amount": f"{item.amount:.2f}"},
            }
            for item in confirmed
        },
    }


ADVANCED_ACTIONS = {
    "0": advanced_get_info,
    "1": advanced_prepare,
    "2": advanced_complete,
    "3": advanced_check,
    "4": advanced_compare,
}


def handle_advanced(payload) -> dict:
    """One Advanced Shop request (parsed JSON, numbers kept as sent) to the JSON answer for Click."""
    if not isinstance(payload, dict):
        return {"error": BAD_REQUEST, "error_note": ERROR_NOTES[BAD_REQUEST]}
    handler = ADVANCED_ACTIONS.get(str(payload.get("action", "")).strip())
    try:
        if handler is None:
            raise ClickError(ACTION_NOT_FOUND)
        return handler(payload)
    except ClickError as error:
        response = {"error": error.code, "error_note": error.note}
        for key in ("click_paydoc_id", "attempt_trans_id"):
            if payload.get(key) not in (None, ""):
                response[key] = _echo(payload.get(key))
        if error.transaction is not None:
            response["merchant_prepare_id"] = str(error.transaction.pk)
            if error.transaction.transaction_id:
                response["merchant_confirm_id"] = str(error.transaction.transaction_id)
        return response


# ── SHOP API (form-encoded) ───────────────────────────────────────────────────


def _shop_fields(data):
    error = str(data.get("error", "")).strip()
    return {
        "click_trans_id": _int(data.get("click_trans_id")),
        "click_paydoc_id": _int(data.get("click_paydoc_id")),
        "service_id": _int(data.get("service_id")),
        "merchant_trans_id": re.sub(r"\s", "", str(data.get("merchant_trans_id") or "")),
        "error": _int(error) if error else None,
    }


def shop_prepare(data):
    """md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)."""
    _check_sign(
        data.get("sign_string"),
        data.get("click_trans_id"), data.get("service_id"), None, data.get("merchant_trans_id"),
        data.get("amount"), data.get("action"), data.get("sign_time"),
    )
    _check_service(data.get("service_id"))
    fields = _shop_fields(data)
    if fields["error"] is not None and fields["error"] < 0:
        raise ClickError(TRANSACTION_CANCELLED)
    apartment = find_apartment(fields["merchant_trans_id"])
    if apartment is None:
        raise ClickError(USER_NOT_FOUND)
    held = _hold(
        ClickTransaction.PROTOCOL_SHOP,
        click_trans_id=fields["click_trans_id"],
        click_paydoc_id=fields["click_paydoc_id"],
        service_id=fields["service_id"],
        account=fields["merchant_trans_id"],
        apartment=apartment,
        amount=parse_amount(data.get("amount")),
        payload=dict(data.items()),
    )
    return {
        "click_trans_id": fields["click_trans_id"],
        "merchant_trans_id": fields["merchant_trans_id"],
        "merchant_prepare_id": held.pk,
        "error": SUCCESS,
        "error_note": ERROR_NOTES[SUCCESS],
    }


def shop_complete(data):
    """md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)."""
    _check_sign(
        data.get("sign_string"),
        data.get("click_trans_id"), data.get("service_id"), None, data.get("merchant_trans_id"),
        data.get("merchant_prepare_id"), data.get("amount"), data.get("action"), data.get("sign_time"),
    )
    _check_service(data.get("service_id"))
    fields = _shop_fields(data)
    with transaction.atomic():
        held = _locked(
            ClickTransaction.PROTOCOL_SHOP,
            data.get("merchant_prepare_id"),
            click_trans_id=fields["click_trans_id"],
        )
        if held.account != fields["merchant_trans_id"]:
            raise ClickError(USER_NOT_FOUND, transaction=held)
        if parse_amount(data.get("amount")) != held.amount:
            raise ClickError(INCORRECT_AMOUNT, transaction=held)
        code, reported = _complete(held, dict(data.items()), click_error=fields["error"])
    if code != SUCCESS:
        raise ClickError(code, transaction=reported)
    return {
        "click_trans_id": fields["click_trans_id"],
        "merchant_trans_id": fields["merchant_trans_id"],
        "merchant_confirm_id": held.transaction_id,
        "error": SUCCESS,
        "error_note": ERROR_NOTES[SUCCESS],
    }


SHOP_ACTIONS = {"0": shop_prepare, "1": shop_complete}


def handle_shop(data) -> dict:
    """One SHOP API request (form fields) to the JSON answer for Click."""
    handler = SHOP_ACTIONS.get(str(data.get("action", "")).strip())
    try:
        if handler is None:
            raise ClickError(ACTION_NOT_FOUND)
        return handler(data)
    except ClickError as error:
        response = {"error": error.code, "error_note": error.note}
        for key in ("click_trans_id", "merchant_trans_id"):
            if data.get(key) not in (None, ""):
                response[key] = _echo(data.get(key)) if key == "click_trans_id" else data.get(key)
        if error.transaction is not None:
            response["merchant_prepare_id"] = error.transaction.pk
            if error.transaction.transaction_id:
                response["merchant_confirm_id"] = error.transaction.transaction_id
        return response
