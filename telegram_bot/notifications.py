"""Messages the portal sends through the bot: the payment (debt) notice to residents and alerts to
operators."""
import logging

from aiogram.exceptions import TelegramAPIError, TelegramForbiddenError
from asgiref.sync import async_to_sync
from django.conf import settings

from main_app.models import Owner
from portal.models import PortalNotification

from . import operators
from .runner import create_bot

SEND_TIMEOUT_SECONDS = 15
logger = logging.getLogger(__name__)
_bot_username_cache = {}


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


async def _username(token):
    bot = create_bot(token)
    try:
        me = await bot.get_me(request_timeout=SEND_TIMEOUT_SECONDS)
        return me.username or ""
    finally:
        await bot.session.close()


def bot_username() -> str:
    """The bot's @username for t.me links: TELEGRAM_BOT_USERNAME, or asked from Telegram once per process."""
    configured = getattr(settings, "TELEGRAM_BOT_USERNAME", "")
    if configured:
        return configured.lstrip("@")
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return ""
    if token not in _bot_username_cache:
        _bot_username_cache[token] = async_to_sync(_username)(token)
    return _bot_username_cache[token]


def operator_link(token) -> str:
    """The t.me link an operator opens to connect Telegram (the bot receives /start op_<token>)."""
    username = bot_username()
    return f"https://t.me/{username}?start={operators.LINK_PREFIX}{token}" if username else ""


def send_operator_alert(notification: PortalNotification) -> str:
    """Send the alert to its assignee's Telegram; returns the PortalNotification.TELEGRAM_* status.

    Delivery problems are reported through the status, never raised: the alert itself is saved
    and shown in the portal either way.
    """
    if not notification.assignee_id:
        return ""
    chat_id, language = operators.operator_chat(notification.assignee)
    if not chat_id:
        return PortalNotification.TELEGRAM_NOT_LINKED
    if not settings.TELEGRAM_BOT_TOKEN:
        return PortalNotification.TELEGRAM_FAILED
    try:
        async_to_sync(_send)(settings.TELEGRAM_BOT_TOKEN, chat_id, operators.alert_text(notification, language))
    except TelegramAPIError as error:
        logger.warning("Alert %s was not delivered to Telegram: %s", notification.pk, error)
        return PortalNotification.TELEGRAM_FAILED
    except Exception:  # network errors: the portal keeps the alert regardless
        logger.exception("Alert %s was not delivered to Telegram", notification.pk)
        return PortalNotification.TELEGRAM_FAILED
    return PortalNotification.TELEGRAM_SENT
