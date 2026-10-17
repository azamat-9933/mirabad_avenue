"""Operators (portal users) in the bot: linking their Telegram and the alert messages they receive.

An operator links Telegram from the portal profile: the portal makes a one-time token and the link
``https://t.me/<bot>?start=op_<token>``; pressing Start in the bot sends ``/start op_<token>``, and
``link_operator`` attaches that chat to the operator's account. No phone number is needed, and a
token works once and only for a day.

The functions are synchronous; the bot calls them through ``sync_to_async``.
"""
import secrets
from dataclasses import dataclass
from datetime import timedelta
from html import escape

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from portal.models import AuditEvent, PortalNotification, WorkspaceProfile

LINK_PREFIX = "op_"
LINK_TOKEN_LIFETIME = timedelta(days=1)
LANGUAGES = ("uz", "ru", "en")

TEXTS = {
    "uz": {
        "linked": "✅ Telegram portal hisobingizga ulandi: <b>{name}</b>.\nSizga qo'yilgan ogohlantirishlar shu yerga keladi.",
        "invalid": "Havola eskirgan yoki ishlatilgan. Portalda profilingizdan yangi havola oling.",
        "alert_title": "🔔 Sizga yangi ogohlantirish",
        "severity": "Muhimligi",
        "from": "Qo'ydi",
        "time": "Vaqt",
        "footer": "Portaldagi «Bildirishnomalar» bo'limida «Hal qilish» tugmasi bilan yoping.",
        "critical": "Kritik",
        "warning": "Ogohlantirish",
        "info": "Ma'lumot",
    },
    "ru": {
        "linked": "✅ Telegram подключён к вашей учётной записи портала: <b>{name}</b>.\nОповещения, назначенные вам, будут приходить сюда.",
        "invalid": "Ссылка устарела или уже использована. Получите новую в профиле на портале.",
        "alert_title": "🔔 Вам назначено новое оповещение",
        "severity": "Серьёзность",
        "from": "Поставил",
        "time": "Время",
        "footer": "Закройте его кнопкой «Решить» в разделе «Уведомления» на портале.",
        "critical": "Критично",
        "warning": "Предупреждение",
        "info": "Инфо",
    },
    "en": {
        "linked": "✅ Telegram is connected to your portal account: <b>{name}</b>.\nAlerts assigned to you will arrive here.",
        "invalid": "The link has expired or was already used. Get a new one from your portal profile.",
        "alert_title": "🔔 A new alert is assigned to you",
        "severity": "Severity",
        "from": "Set by",
        "time": "Time",
        "footer": "Close it with «Resolve» under Notifications in the portal.",
        "critical": "Critical",
        "warning": "Warning",
        "info": "Info",
    },
}


def language_of(value) -> str:
    return value if value in LANGUAGES else "uz"


def text(language, key) -> str:
    return TEXTS[language_of(language)][key]


def invalid_link_text() -> str:
    """An unknown or used token tells us nothing about the operator's language: answer in Uzbek and Russian."""
    return f"{text('uz', 'invalid')}\n\n{text('ru', 'invalid')}"


def display_name(user) -> str:
    return (user.get_full_name() or "").strip() or user.get_username()


def profile_of(user) -> WorkspaceProfile:
    profile, _created = WorkspaceProfile.objects.get_or_create(user=user)
    return profile


def new_link_token(user, language) -> str:
    """A fresh one-time token for the operator's link (replaces any earlier unused one)."""
    profile = profile_of(user)
    profile.telegram_link_token = secrets.token_urlsafe(18)
    profile.telegram_link_requested_at = timezone.now()
    profile.telegram_language = language_of(language)
    profile.save(update_fields=["telegram_link_token", "telegram_link_requested_at", "telegram_language", "updated_at"])
    return profile.telegram_link_token


@dataclass(frozen=True)
class LinkResult:
    linked: bool
    language: str
    name: str = ""


def link_operator(token, chat_id, username) -> LinkResult:
    """Attach the Telegram chat to the operator whose token this is (one chat per account)."""
    token = str(token or "").strip()
    fresh_since = timezone.now() - LINK_TOKEN_LIFETIME
    with transaction.atomic():
        profile = (
            WorkspaceProfile.objects.select_for_update()
            .select_related("user")
            .filter(telegram_link_token=token, telegram_link_requested_at__gte=fresh_since, user__is_active=True)
            .first()
            if token
            else None
        )
        if profile is None:
            return LinkResult(linked=False, language="uz")
        # The same Telegram account cannot receive another operator's alerts.
        WorkspaceProfile.objects.filter(telegram_chat_id=chat_id).exclude(pk=profile.pk).update(
            telegram_chat_id=None, telegram_username="", telegram_linked_at=None
        )
        profile.telegram_chat_id = chat_id
        profile.telegram_username = str(username or "")[:64]
        profile.telegram_linked_at = timezone.now()
        profile.telegram_link_token = ""
        profile.telegram_link_requested_at = None
        profile.save()
        user = profile.user
        AuditEvent.objects.create(
            user=user,
            actor=user.get_username(),
            event_type=AuditEvent.TYPE_SYSTEM,
            title="Operator Telegram connected",
            message=f"{display_name(user)} connected Telegram{f' (@{profile.telegram_username})' if profile.telegram_username else ''}.",
            metadata={"source": "telegram_bot", "chatId": chat_id},
        )
    return LinkResult(linked=True, language=profile.telegram_language, name=display_name(user))


def unlink_operator(user) -> None:
    WorkspaceProfile.objects.filter(user=user).update(
        telegram_chat_id=None,
        telegram_username="",
        telegram_linked_at=None,
        telegram_link_token="",
        telegram_link_requested_at=None,
    )


def operator_chat(user):
    """(chat id, language) of the operator's linked Telegram, or (None, language)."""
    profile = WorkspaceProfile.objects.filter(user=user).first()
    if profile is None:
        return None, "uz"
    return profile.telegram_chat_id, profile.telegram_language


def alert_text(notification: PortalNotification, language) -> str:
    """The alert as the assignee reads it in Telegram (HTML; every value is escaped)."""
    language = language_of(language)
    creator = display_name(notification.created_by) if notification.created_by_id else "—"
    when = timezone.localtime(notification.event_at).strftime("%d.%m.%Y %H:%M")
    lines = [
        f"<b>{escape(text(language, 'alert_title'))}</b>",
        "",
        f"<b>{escape(notification.title)}</b>",
    ]
    if notification.message:
        lines.append(escape(notification.message))
    lines.extend([
        "",
        f"{escape(text(language, 'severity'))}: {escape(text(language, notification.severity if notification.severity in ('critical', 'warning', 'info') else 'info'))}",
        f"{escape(text(language, 'from'))}: {escape(creator)}",
        f"{escape(text(language, 'time'))}: {when}",
        "",
        escape(text(language, "footer")),
    ])
    return "\n".join(lines)


def active_operators():
    return get_user_model().objects.filter(is_active=True)
