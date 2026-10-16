"""Database side of the residents' Telegram bot: connect a Telegram account to residents by phone.

The functions are synchronous; the bot calls them through ``sync_to_async``. They return plain
data, so async handlers never touch lazy ORM relations.
"""
import re
from dataclasses import dataclass
from decimal import Decimal

from django.db import transaction

from main_app.models import Owner
from portal.models import AuditEvent

# Uzbek numbers are +998 and 9 national digits. Matching on those digits ignores formatting and
# the country code: "+998 90 123-45-67", "998901234567" and "90 123 45 67" are the same phone.
PHONE_MATCH_DIGITS = 9
BOT_ACTOR = "Telegram bot"


@dataclass(frozen=True)
class Account:
    """One apartment account of a registered resident, as the bot shows it."""

    house: str
    apartment: str
    balance: Decimal


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
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_STATUS,
            title="Telegram registration: phone not found",
            message=f"{full_name} tried to register in the Telegram bot with {phone}; no resident has this phone.",
            actor=BOT_ACTOR,
            metadata={"telegram_id": str(telegram_id), "telegram_user": username or ""},
        )
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
                event_type=AuditEvent.TYPE_STATUS,
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
