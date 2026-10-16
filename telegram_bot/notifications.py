"""Messages the portal sends to residents through the bot: the payment (debt) notice."""
from aiogram.exceptions import TelegramAPIError, TelegramForbiddenError
from asgiref.sync import async_to_sync
from django.conf import settings

from main_app.models import Owner

from .runner import create_bot

SEND_TIMEOUT_SECONDS = 15


class NoticeNotSent(Exception):
    """The notice was not sent; the message is shown to the portal user, ``status`` is the HTTP status."""

    def __init__(self, message, status):
        super().__init__(message)
        self.status = status


async def _send(token, chat_id, text):
    bot = create_bot(token)
    try:
        await bot.send_message(chat_id=chat_id, text=text, request_timeout=SEND_TIMEOUT_SECONDS)
    finally:
        await bot.session.close()


def send_debt_notice(owner, text) -> str:
    """Send the resident's notice (HTML text built by portal.billing_notice) to their Telegram chat."""
    if not settings.TELEGRAM_BOT_TOKEN:
        raise NoticeNotSent("The Telegram bot is not configured (TELEGRAM_BOT_TOKEN).", status=503)
    if owner.telegram_status != Owner.TELEGRAM_CONNECTED or not owner.telegram_id:
        raise NoticeNotSent("The resident is not connected to Telegram.", status=409)
    if owner.apartment.balance >= 0:
        raise NoticeNotSent("The resident has no debt.", status=409)

    try:
        async_to_sync(_send)(settings.TELEGRAM_BOT_TOKEN, owner.telegram_id, text)
    except TelegramForbiddenError as error:
        raise NoticeNotSent(
            "The resident has blocked the bot, so Telegram did not deliver the notice.", status=502
        ) from error
    except TelegramAPIError as error:
        raise NoticeNotSent(f"Telegram did not deliver the notice: {error.message}", status=502) from error
    return text
