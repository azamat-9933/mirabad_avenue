"""Messages the portal sends to residents through the bot: the billing (debt) notice."""
from aiogram.exceptions import TelegramAPIError, TelegramForbiddenError
from asgiref.sync import async_to_sync
from django.conf import settings
from django.utils import timezone

from main_app.models import Owner

from .runner import create_bot
from .texts import DEFAULT_LANGUAGE, format_amount, t

SEND_TIMEOUT_SECONDS = 15


class NoticeNotSent(Exception):
    """The notice was not sent; the message is shown to the portal user, ``status`` is the HTTP status."""

    def __init__(self, message, status):
        super().__init__(message)
        self.status = status


def debt_notice_text(owner, as_of) -> str:
    """The notice in the resident's bot language, with the debt of their apartment account."""
    apartment = owner.apartment
    return t(
        owner.telegram_language or DEFAULT_LANGUAGE,
        "debt_notice",
        name=owner.fio,
        account=f"ACC-{owner.pk}",
        house=apartment.building.number,
        apartment=apartment.number,
        amount=format_amount(apartment.balance),
        date=as_of.strftime("%d.%m.%Y"),
    )


async def _send(token, chat_id, text):
    bot = create_bot(token)
    try:
        await bot.send_message(chat_id=chat_id, text=text, request_timeout=SEND_TIMEOUT_SECONDS)
    finally:
        await bot.session.close()


def send_debt_notice(owner) -> str:
    """Send the resident's debt notice to their Telegram chat and return the text that was sent.

    The text is built here from the current account balance, so the resident never gets a stale
    amount or text composed in the browser.
    """
    if not settings.TELEGRAM_BOT_TOKEN:
        raise NoticeNotSent("The Telegram bot is not configured (TELEGRAM_BOT_TOKEN).", status=503)
    if owner.telegram_status != Owner.TELEGRAM_CONNECTED or not owner.telegram_id:
        raise NoticeNotSent("The resident is not connected to Telegram.", status=409)
    if owner.apartment.balance >= 0:
        raise NoticeNotSent("The resident has no debt.", status=409)

    text = debt_notice_text(owner, timezone.localdate())
    try:
        async_to_sync(_send)(settings.TELEGRAM_BOT_TOKEN, owner.telegram_id, text)
    except TelegramForbiddenError as error:
        raise NoticeNotSent(
            "The resident has blocked the bot, so Telegram did not deliver the notice.", status=502
        ) from error
    except TelegramAPIError as error:
        raise NoticeNotSent(f"Telegram did not deliver the notice: {error.message}", status=502) from error
    return text
