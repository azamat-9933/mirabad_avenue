"""Database side of the residents' Telegram bot: connect a Telegram account to apartments, by
personal account (Лицевой счет) or by phone, and read their balances and payment history.

The personal account and its balance belong to the apartment; the bot links the apartment's
resident (Owner) to the Telegram account, so one Telegram user may follow several apartments.
The functions are synchronous; the bot calls them through ``sync_to_async``. They return plain
data, so async handlers never touch lazy ORM relations.
"""
import datetime
import re
from dataclasses import dataclass, field
from decimal import Decimal

from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from main_app.models import Apartment, Owner
from payments.click import masked_name
from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG
from portal.models import AuditEvent

# Uzbek numbers are +998 and 9 national digits. Matching on those digits ignores formatting and
# the country code: "+998 90 123-45-67", "998901234567" and "90 123 45 67" are the same phone.
PHONE_MATCH_DIGITS = 9
BOT_ACTOR = "Telegram bot"

# Someone guessing personal account numbers sees names and balances: a user gets this many
# account lookups per window.
ACCOUNT_LOOKUPS_PER_WINDOW = 10
ACCOUNT_LOOKUP_WINDOW_SECONDS = 3600
HISTORY_ROWS = 10

# AccountLookup.status
LOOKUP_OK = "ok"
LOOKUP_MISSING = "missing"          # no apartment has this personal account
LOOKUP_NO_RESIDENT = "no_resident"  # the apartment has no resident to link
LOOKUP_TAKEN = "taken"              # linked to another Telegram account
LOOKUP_YOURS = "yours"              # already linked to this Telegram account
LOOKUP_LIMITED = "limited"          # too many lookups


@dataclass(frozen=True)
class Account:
    """One apartment account of a registered resident, as the bot shows it."""

    house: str
    apartment: str
    balance: Decimal
    # The apartment's personal account (Лицевой счет); the balance belongs to it, not to the owner.
    account: str = ""


def phone_key(value) -> str:
    """The digits two phone numbers must share to be the same phone; "" when too short."""
    digits = re.sub(r"\D", "", str(value or ""))
    return digits[-PHONE_MATCH_DIGITS:] if len(digits) >= PHONE_MATCH_DIGITS else ""


def _accounts(owners) -> list[Account]:
    return [
        Account(
            house=owner.apartment.building.number,
            apartment=owner.apartment.number,
            # The account belongs to the apartment; Owner.balance only mirrors it.
            balance=owner.apartment.balance,
            account=owner.apartment.personal_account,
        )
        for owner in owners
    ]


def _owners_with_accounts(queryset):
    return queryset.select_related("apartment", "apartment__building", "apartment__building__complex").order_by(
        "apartment__building__number", "apartment__number"
    )


def registration(telegram_id) -> tuple[str, list[Account]]:
    """(language, accounts) of a Telegram user; accounts is empty while they are not registered."""
    owners = list(
        _owners_with_accounts(
            Owner.objects.filter(telegram_id=str(telegram_id), telegram_status=Owner.TELEGRAM_CONNECTED)
        )
    )
    language = next((owner.telegram_language for owner in owners if owner.telegram_language), "")
    return language, _accounts(owners)


def link_by_phone(*, telegram_id, username, phone, full_name, language) -> list[Account]:
    """Connect the Telegram account to every resident with this phone; [] when nobody has it.

    One person may own several apartments, so all residents with the phone are connected. A
    resident who registers again from another Telegram account is moved to the new account.
    """
    key = phone_key(phone)
    matched = [owner.pk for owner in Owner.objects.only("id", "phone") if key and phone_key(owner.phone) == key]
    if not matched:
        return []

    with transaction.atomic():
        Owner.objects.filter(pk__in=matched).update(
            telegram_id=str(telegram_id),
            telegram_user=username or None,
            telegram_status=Owner.TELEGRAM_CONNECTED,
            telegram_language=language,
        )
        owners = list(_owners_with_accounts(Owner.objects.filter(pk__in=matched)))
        for owner in owners:
            AuditEvent.objects.create(
                event_type=AuditEvent.TYPE_TELEGRAM,
                title="Telegram connected",
                message=f"{owner.fio} connected Telegram (registered in the bot as {full_name}, {phone}).",
                actor=BOT_ACTOR,
                complex=owner.apartment.building.complex,
                building=owner.apartment.building,
                apartment=owner.apartment,
                owner=owner,
                metadata={"telegram_id": str(telegram_id), "telegram_user": username or ""},
            )
    return _accounts(owners)


def set_language(telegram_id, language) -> None:
    """Remember the bot language of a registered Telegram user."""
    Owner.objects.filter(telegram_id=str(telegram_id), telegram_status=Owner.TELEGRAM_CONNECTED).update(
        telegram_language=language
    )


@dataclass(frozen=True)
class AccountLookup:
    """What the bot shows before linking: whose apartment a personal account is."""

    status: str
    account: str = ""
    apartment_id: int | None = None
    name: str = ""
    house: str = ""
    apartment: str = ""


@dataclass(frozen=True)
class HistoryEntry:
    date: datetime.date
    # click, payme, cash, manual, charge or opening (the carried-over balance)
    kind: str
    amount: Decimal
    balance_after: Decimal


@dataclass(frozen=True)
class AccountHistory:
    account: Account
    entries: list = field(default_factory=list)


def _too_many_lookups(telegram_id) -> bool:
    key = f"telegram-bot:account-lookups:{telegram_id}"
    cache.add(key, 0, ACCOUNT_LOOKUP_WINDOW_SECONDS)
    try:
        count = cache.incr(key)
    except ValueError:  # expired between add and incr
        cache.set(key, 1, ACCOUNT_LOOKUP_WINDOW_SECONDS)
        count = 1
    return count > ACCOUNT_LOOKUPS_PER_WINDOW


def find_account(telegram_id, number) -> AccountLookup:
    """The apartment behind a personal account, as the user confirms it before linking."""
    if _too_many_lookups(telegram_id):
        return AccountLookup(LOOKUP_LIMITED, number)
    apartment = Apartment.objects.select_related("building").filter(personal_account=number).first()
    if apartment is None:
        return AccountLookup(LOOKUP_MISSING, number)
    owner = Owner.objects.filter(apartment=apartment).first()
    if owner is None:
        return AccountLookup(LOOKUP_NO_RESIDENT, number)
    if owner.telegram_status == Owner.TELEGRAM_CONNECTED and owner.telegram_id:
        return AccountLookup(LOOKUP_YOURS if owner.telegram_id == str(telegram_id) else LOOKUP_TAKEN, number)
    return AccountLookup(
        LOOKUP_OK,
        number,
        apartment_id=apartment.pk,
        name=masked_name(owner.fio),
        house=apartment.building.number,
        apartment=apartment.number,
    )


def link_by_account(*, telegram_id, username, apartment_id, language) -> tuple[str, list[Account]]:
    """Link the resident of the apartment the user confirmed; (status, all the user's accounts).

    An apartment already followed by another Telegram account is not taken over here: the owner
    asks the administration, which disconnects the old account in admin first.
    """
    with transaction.atomic():
        owner = (
            Owner.objects.select_for_update()
            .select_related("apartment__building__complex")
            .filter(apartment_id=apartment_id)
            .first()
        )
        if owner is None:
            return LOOKUP_NO_RESIDENT, []
        if owner.telegram_status == Owner.TELEGRAM_CONNECTED and owner.telegram_id and owner.telegram_id != str(telegram_id):
            return LOOKUP_TAKEN, []
        owner.telegram_id = str(telegram_id)
        owner.telegram_user = username or None
        owner.telegram_status = Owner.TELEGRAM_CONNECTED
        owner.telegram_language = language
        owner.save(update_fields=["telegram_id", "telegram_user", "telegram_status", "telegram_language"])
        apartment = owner.apartment
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_TELEGRAM,
            title="Telegram connected",
            message=(
                f"{owner.fio} connected Telegram by personal account {apartment.personal_account}"
                f"{f' (@{username})' if username else ''}."
            ),
            actor=BOT_ACTOR,
            complex=apartment.building.complex,
            building=apartment.building,
            apartment=apartment,
            owner=owner,
            metadata={"telegram_id": str(telegram_id), "telegram_user": username or "", "method": "personal_account"},
        )
    return LOOKUP_OK, registration(telegram_id)[1]


def _entry_kind(row) -> str:
    if OPENING_BALANCE_TAG in (row.description or ""):
        return "opening"
    known = {
        Transaction.TYPE_CLICK, Transaction.TYPE_PAYME, Transaction.TYPE_CASH,
        Transaction.TYPE_MANUAL, Transaction.TYPE_CHARGE,
    }
    return row.payment_type if row.payment_type in known else Transaction.TYPE_MANUAL


def history(telegram_id, limit=HISTORY_ROWS) -> list[AccountHistory]:
    """The latest ledger rows of every apartment the user follows, newest first."""
    owners = list(
        _owners_with_accounts(
            Owner.objects.filter(telegram_id=str(telegram_id), telegram_status=Owner.TELEGRAM_CONNECTED)
        )
    )
    result = []
    for owner, account in zip(owners, _accounts(owners)):
        rows = Transaction.objects.filter(apartment_id=owner.apartment_id).order_by("-created_at", "-id")[:limit]
        entries = [
            HistoryEntry(
                date=timezone.localtime(row.created_at).date(),
                kind=_entry_kind(row),
                amount=row.amount,
                balance_after=row.balance_after,
            )
            for row in rows
        ]
        result.append(AccountHistory(account=account, entries=entries))
    return result
