"""Payme Business payments on the apartment ledger (Merchant API: JSON-RPC on one URL).

Payme calls, in order:

* CheckPerformTransaction: can this personal account be paid, and what Payme shows the payer in
  ``additional`` (whose account it is, the house, the apartment, the balance and the debt);
* CreateTransaction: holds the payment (state 1); an account takes any number of payments;
* PerformTransaction: the money goes on the apartment account (state 2);
* CancelTransaction: state -1, or -2 after PerformTransaction, when the money is taken back off the account.

CheckTransaction and GetStatement report what we hold; SetFiscalData keeps the receipt Payme registered.
A transaction created while PAYME_SANDBOX is on (the test key, Payme's sandbox) goes through the same
states but never touches the balance, the ledger, the activity log or Telegram.
Every request carries ``Authorization: Basic base64("Paycom:" + PAYME_KEY)``; while the key is empty
every request is refused. Answers are always HTTP 200: Payme reads any other status as an error.
https://developer.help.paycom.uz/metody-merchant-api/
"""
import base64
import binascii
import hmac
import logging
import re
from decimal import Decimal

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from portal.audit import record_event
from portal.models import AuditEvent

# The payer sees the same account details Click shows.
from .click import account_info, find_apartment
from .models import PaymeTransaction, Transaction
from .services import apply_account_change, mark_ledger_cancelled

logger = logging.getLogger(__name__)

PAYME_LOGIN = "Paycom"
PAYME_ACTOR = "Payme"
# A transaction not performed 12 hours after it was created is cancelled with reason 4.
TIMEOUT_MS = 43_200_000
REASON_TIMEOUT = 4

INVALID_AMOUNT = -31001
TRANSACTION_NOT_FOUND = -31003
CANNOT_PERFORM = -31008
ACCOUNT_NOT_FOUND = -31050
RECEIPT_NOT_FOUND = -32001
NOT_POST = -32300
SYSTEM_ERROR = -32400
INSUFFICIENT_PRIVILEGE = -32504
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
PARSE_ERROR = -32700

# Payme shows the message to the payer: (ru, uz, en).
MESSAGES = {
    INVALID_AMOUNT: ("Неверная сумма", "Noto'g'ri summa", "Incorrect amount"),
    TRANSACTION_NOT_FOUND: ("Транзакция не найдена", "Tranzaksiya topilmadi", "Transaction not found"),
    CANNOT_PERFORM: ("Невозможно выполнить операцию", "Amalni bajarib bo'lmaydi", "Unable to perform operation"),
    ACCOUNT_NOT_FOUND: ("Лицевой счёт не найден", "Abonent raqami topilmadi", "Personal account not found"),
    RECEIPT_NOT_FOUND: ("Чек с таким id не найден", "Bunday id li chek topilmadi", "Receipt not found"),
    NOT_POST: ("Метод запроса должен быть POST", "So'rov POST bo'lishi kerak", "The request method must be POST"),
    SYSTEM_ERROR: ("Системная ошибка", "Tizim xatosi", "System error"),
    INSUFFICIENT_PRIVILEGE: ("Недостаточно привилегий", "Ruxsat yetarli emas", "Insufficient privilege"),
    INVALID_REQUEST: ("Неверный запрос", "Noto'g'ri so'rov", "Invalid request"),
    METHOD_NOT_FOUND: ("Метод не найден", "Metod topilmadi", "Method not found"),
    INVALID_PARAMS: ("Неверные параметры", "Noto'g'ri parametrlar", "Invalid parameters"),
    PARSE_ERROR: ("Ошибка разбора JSON", "JSON xato", "JSON parse error"),
}


class PaymeError(Exception):
    def __init__(self, code, data=None):
        super().__init__(code)
        self.code = code
        self.data = data


def error_body(code, request_id=None, data=None) -> dict:
    ru, uz, en = MESSAGES[code]
    error = {"code": code, "message": {"ru": ru, "uz": uz, "en": en}}
    if data is not None:
        error["data"] = data
    return {"jsonrpc": "2.0", "id": request_id, "error": error}


def authorized(header) -> bool:
    """``Basic base64("Paycom:<key>")`` with the configured key; nothing passes while the key is empty."""
    key = settings.PAYME_KEY
    scheme, _space, encoded = str(header or "").partition(" ")
    if not key or scheme.lower() != "basic":
        return False
    try:
        login, _colon, password = base64.b64decode(encoded.strip(), validate=True).decode("utf-8").partition(":")
    except (binascii.Error, UnicodeDecodeError):
        return False
    return login == PAYME_LOGIN and hmac.compare_digest(password.encode("utf-8"), key.encode("utf-8"))


def _ms(moment) -> int:
    """A Payme Timestamp: milliseconds since 1970; 0 for a moment that has not happened."""
    return int(moment.timestamp() * 1000) if moment else 0


def _uzs(tiyin) -> Decimal:
    return (Decimal(tiyin) / 100).quantize(Decimal("0.01"))


def _expired(held) -> bool:
    return _ms(timezone.now()) - _ms(held.created_at) > TIMEOUT_MS


def _integer(value, code=INVALID_REQUEST) -> int:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value != int(value):
        raise PaymeError(code)
    return int(value)


def _payme_id(params) -> str:
    payme_id = params.get("id")
    if not isinstance(payme_id, str) or not payme_id.strip():
        raise PaymeError(INVALID_REQUEST)
    return payme_id.strip()


def _amount(params) -> int:
    """The sum in tiyin; refused outside PAYME_MIN_AMOUNT..PAYME_MAX_AMOUNT (UZS)."""
    amount = _integer(params.get("amount"), INVALID_AMOUNT)
    uzs = _uzs(amount)
    if amount <= 0 or uzs < Decimal(settings.PAYME_MIN_AMOUNT) or uzs > Decimal(settings.PAYME_MAX_AMOUNT):
        raise PaymeError(INVALID_AMOUNT)
    return amount


def _apartment(params):
    """The apartment whose personal account the payer typed, and that account as typed (spaces dropped)."""
    field = settings.PAYME_ACCOUNT_FIELD
    account = params.get("account")
    value = re.sub(r"\s", "", str(account.get(field) or "")) if isinstance(account, dict) else ""
    apartment = find_apartment(account=value) if value else None
    if apartment is None:
        raise PaymeError(ACCOUNT_NOT_FOUND, field)
    return apartment, value


def _fiscal_detail(amount) -> dict | None:
    """The receipt Payme fiscalizes: one line of the whole sum under the IKPU code, once one is set."""
    if not settings.PAYME_FISCAL_IKPU:
        return None
    return {
        "receipt_type": 0,
        "items": [{
            "title": settings.PAYME_FISCAL_TITLE,
            "price": amount,
            "count": 1,
            "code": settings.PAYME_FISCAL_IKPU,
            "package_code": settings.PAYME_FISCAL_PACKAGE_CODE,
            "vat_percent": settings.PAYME_FISCAL_VAT_PERCENT,
        }],
    }


def _report(held) -> dict:
    return {
        "create_time": _ms(held.created_at),
        "perform_time": _ms(held.performed_at),
        "cancel_time": _ms(held.cancelled_at),
        "transaction": str(held.pk),
        "state": held.state,
        "reason": held.reason,
    }


def locked_rows():
    """Transactions to change, locked: only their own row. The apartment is nullable, so it joins as an
    outer join, and PostgreSQL refuses FOR UPDATE on the nullable side of one."""
    return PaymeTransaction.objects.select_for_update(of=("self",)).select_related("apartment__building__complex")


def _locked(payme_id):
    held = locked_rows().filter(payme_id=payme_id).first()
    if held is None:
        raise PaymeError(TRANSACTION_NOT_FOUND)
    return held


def _keep(held, key, params) -> None:
    held.raw_payload = {**(held.raw_payload or {}), key: params}


def _cancel(held, reason, params) -> None:
    held.state = PaymeTransaction.STATE_CANCELLED
    held.reason = reason
    held.cancelled_at = timezone.now()
    _keep(held, "cancel", params)
    held.save(update_fields=["state", "reason", "cancelled_at", "raw_payload"])


def _audit(held, ledger, title, sign) -> None:
    apartment = held.apartment
    owner = ledger.owner
    record_event(
        actor=PAYME_ACTOR,
        event_type=AuditEvent.TYPE_ONLINE_PAYMENT,
        title=title,
        message=(
            f"{owner.fio if owner else f'Apartment {apartment.number}'}: {sign}{abs(ledger.amount)} UZS via Payme "
            f"(transaction {held.payme_id}, account {held.account_id})."
        ),
        complex=apartment.building.complex,
        building=apartment.building,
        apartment=apartment,
        owner=owner,
        metadata={
            "source": "payme",
            "transaction_id": ledger.id,
            "payme_id": held.payme_id,
            "amount": str(ledger.amount),
            "balance_before": str(ledger.balance_before),
            "balance_after": str(ledger.balance_after),
            "reason": held.reason,
        },
    )


# ── methods ───────────────────────────────────────────────────────────────────


def check_perform_transaction(params):
    apartment, _account = _apartment(params)
    amount = _amount(params)
    result = {"allow": True, "additional": account_info(apartment)}
    detail = _fiscal_detail(amount)
    if detail:
        result["detail"] = detail
    return result


def create_transaction(params):
    payme_id = _payme_id(params)
    with transaction.atomic():
        held = PaymeTransaction.objects.select_for_update().filter(payme_id=payme_id).first()
        if held is None:
            apartment, account = _apartment(params)
            amount = _amount(params)
            payme_time = _integer(params.get("time"))
            try:
                with transaction.atomic():
                    held = PaymeTransaction.objects.create(
                        payme_id=payme_id,
                        payme_time=payme_time,
                        account_id=account,
                        apartment=apartment,
                        amount_tiyin=amount,
                        sandbox=settings.PAYME_SANDBOX,
                        raw_payload={"create": params},
                    )
            except IntegrityError:  # the same Payme transaction, created by a parallel request
                held = _locked(payme_id)
        elif held.state == PaymeTransaction.STATE_CREATED and _expired(held):
            _cancel(held, REASON_TIMEOUT, params)
    # Raised after the block: a timeout cancellation is kept.
    if held.state != PaymeTransaction.STATE_CREATED:
        raise PaymeError(CANNOT_PERFORM)
    return {"create_time": _ms(held.created_at), "transaction": str(held.pk), "state": held.state}


def perform_transaction(params):
    payme_id = _payme_id(params)
    with transaction.atomic():
        held = _locked(payme_id)
        if held.state == PaymeTransaction.STATE_CREATED:
            if _expired(held):
                _cancel(held, REASON_TIMEOUT, params)
            elif held.sandbox:
                held.state = PaymeTransaction.STATE_PERFORMED
                held.performed_at = timezone.now()
                _keep(held, "perform", params)
                held.save(update_fields=["state", "performed_at", "raw_payload"])
            else:
                ledger = apply_account_change(
                    held.apartment_id,
                    _uzs(held.amount_tiyin),
                    Transaction.TYPE_PAYME,
                    description=f"Payme: payment {held.payme_id}, account {held.account_id}",
                    created_by=PAYME_ACTOR,
                    external_id=f"payme:{held.payme_id}",
                )
                held.state = PaymeTransaction.STATE_PERFORMED
                held.transaction = ledger
                held.performed_at = timezone.now()
                _keep(held, "perform", params)
                held.save(update_fields=["state", "transaction", "performed_at", "raw_payload"])
                _audit(held, ledger, "Payme payment received", "+")
                # Imported here: the bot's modules import the payment modules.
                from telegram_bot.notifications import notify_payment_later

                notify_payment_later(ledger.pk)
    if held.state != PaymeTransaction.STATE_PERFORMED:
        raise PaymeError(CANNOT_PERFORM)
    return {"transaction": str(held.pk), "perform_time": _ms(held.performed_at), "state": held.state}


def cancel_transaction(params):
    payme_id = _payme_id(params)
    reason = _integer(params.get("reason"))
    with transaction.atomic():
        held = _locked(payme_id)
        if held.state == PaymeTransaction.STATE_CREATED:
            _cancel(held, reason, params)
        elif held.state == PaymeTransaction.STATE_PERFORMED and held.sandbox:
            held.state = PaymeTransaction.STATE_CANCELLED_AFTER_PERFORM
            held.reason = reason
            held.cancelled_at = timezone.now()
            _keep(held, "cancel", params)
            held.save(update_fields=["state", "reason", "cancelled_at", "raw_payload"])
        elif held.state == PaymeTransaction.STATE_PERFORMED:
            # A refund: the money paid is taken back off the apartment account.
            debit = apply_account_change(
                held.apartment_id,
                -_uzs(held.amount_tiyin),
                Transaction.TYPE_PAYME,
                description=f"Payme: payment {held.payme_id} cancelled (reason {reason}), account {held.account_id}",
                created_by=PAYME_ACTOR,
                external_id=f"payme-cancel:{held.payme_id}",
            )
            held.state = PaymeTransaction.STATE_CANCELLED_AFTER_PERFORM
            held.reason = reason
            held.cancelled_at = timezone.now()
            _keep(held, "cancel", params)
            held.save(update_fields=["state", "reason", "cancelled_at", "raw_payload"])
            mark_ledger_cancelled([held.transaction_id, debit.id], note=f"Payme reason {reason}")
            _audit(held, debit, "Payme payment cancelled", "-")
    return {"transaction": str(held.pk), "cancel_time": _ms(held.cancelled_at), "state": held.state}


def check_transaction(params):
    held = PaymeTransaction.objects.filter(payme_id=_payme_id(params)).first()
    if held is None:
        raise PaymeError(TRANSACTION_NOT_FOUND)
    return _report(held)


def get_statement(params):
    since, until = _integer(params.get("from")), _integer(params.get("to"))
    rows = PaymeTransaction.objects.filter(payme_time__gte=since, payme_time__lte=until).order_by("payme_time", "pk")
    return {
        "transactions": [
            {
                "id": held.payme_id,
                "time": held.payme_time,
                "amount": held.amount_tiyin,
                "account": {settings.PAYME_ACCOUNT_FIELD: held.account_id},
                **_report(held),
            }
            for held in rows
        ]
    }


def set_fiscal_data(params):
    """The receipt Payme registered for a payment (PERFORM) or its cancellation (CANCEL), kept with the transaction."""
    kind = str(params.get("type") or "").upper()
    if kind not in {"PERFORM", "CANCEL"} or not isinstance(params.get("fiscal_data"), dict):
        raise PaymeError(INVALID_PARAMS)
    with transaction.atomic():
        held = PaymeTransaction.objects.select_for_update().filter(payme_id=str(params.get("id") or "")).first()
        if held is None:
            raise PaymeError(RECEIPT_NOT_FOUND)
        _keep(held, f"fiscal_{kind.lower()}", params["fiscal_data"])
        held.save(update_fields=["raw_payload"])
    return {"success": True}


METHODS = {
    "CheckPerformTransaction": check_perform_transaction,
    "CreateTransaction": create_transaction,
    "PerformTransaction": perform_transaction,
    "CancelTransaction": cancel_transaction,
    "CheckTransaction": check_transaction,
    "GetStatement": get_statement,
    "SetFiscalData": set_fiscal_data,
}


def handle(payload, authorization) -> dict:
    """One JSON-RPC request (None when the body was not JSON) -> the response body."""
    if not isinstance(payload, dict):
        return error_body(PARSE_ERROR if payload is None else INVALID_REQUEST)
    request_id = payload.get("id")
    if not authorized(authorization):
        return error_body(INSUFFICIENT_PRIVILEGE, request_id)
    method, params = payload.get("method"), payload.get("params")
    if not isinstance(method, str) or not isinstance(params, dict):
        return error_body(INVALID_REQUEST, request_id)
    handler = METHODS.get(method)
    if handler is None:
        return error_body(METHOD_NOT_FOUND, request_id, method)
    try:
        return {"jsonrpc": "2.0", "id": request_id, "result": handler(params)}
    except PaymeError as error:
        return error_body(error.code, request_id, error.data)
    except Exception:  # Payme retries a system error; the payer must not be charged for our failure
        logger.exception("Payme %s failed", method)
        return error_body(SYSTEM_ERROR, request_id)
