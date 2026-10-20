"""Messages the portal sends through the bot: the payment (debt) notice and payment receipts to
residents, and alerts to operators."""
import logging
import threading

from aiogram.exceptions import TelegramAPIError, TelegramForbiddenError
from asgiref.sync import async_to_sync
from django.conf import settings
from django.db import connection, transaction

from main_app.models import Owner
from payments.models import Transaction
from portal.models import PortalNotification

from . import operators
from .runner import create_bot
from .texts import DEFAULT_LANGUAGE, payment_received_text

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


PAYMENT_METHODS = {
    Transaction.TYPE_CLICK: "Click",
    Transaction.TYPE_PAYME: "Payme",
}


def notify_payment(transaction_id) -> bool:
    """Tell the apartment's resident in Telegram that a payment landed; False when nobody was told.

    Never raises: a payment is recorded whether or not the resident hears about it.
    """
    if not settings.TELEGRAM_BOT_TOKEN:
        return False
    try:
        ledger = Transaction.objects.select_related("apartment__building").get(pk=transaction_id)
        owner = (
            Owner.objects.filter(apartment_id=ledger.apartment_id, telegram_status=Owner.TELEGRAM_CONNECTED)
            .exclude(telegram_id__isnull=True)
            .exclude(telegram_id="")
            .first()
        )
        if owner is None:
            return False
        apartment = ledger.apartment
        text = payment_received_text(
            house=apartment.building.number,
            apartment=apartment.number,
            account=apartment.personal_account,
            amount=ledger.amount,
            method=PAYMENT_METHODS.get(ledger.payment_type, ledger.get_payment_type_display()),
            balance=ledger.balance_after,
            language=owner.telegram_language or DEFAULT_LANGUAGE,
        )
        async_to_sync(_send)(settings.TELEGRAM_BOT_TOKEN, owner.telegram_id, text)
    except Exception:  # blocked bot, network, a deleted row: the payment stands regardless
        logger.exception("Payment %s was not announced in Telegram", transaction_id)
        return False
    return True


def _close_connection_after(func, *args):
    try:
        func(*args)
    finally:
        connection.close()


def _in_background(func, *args):
    threading.Thread(target=_close_connection_after, args=(func, *args), daemon=True).start()


def notify_payment_later(transaction_id) -> None:
    """Announce the payment once the transaction that recorded it commits, without making the
    caller (Click, waiting for our answer) wait for Telegram."""
    transaction.on_commit(lambda: _in_background(notify_payment, transaction_id))
