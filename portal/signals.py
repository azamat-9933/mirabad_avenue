"""Write operator activity that happens outside portal views: sign-ins and Django admin edits."""

from contextlib import contextmanager
from contextvars import ContextVar

from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntry
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.urls import NoReverseMatch

from main_app.models import Apartment, Building, Complex, Owner

from .audit import current_request, record_event
from .models import AuditEvent


@receiver(user_logged_in)
def audit_login(sender, request, user, **kwargs):
    record_event(
        request,
        user=user,
        event_type=AuditEvent.TYPE_AUTH,
        title="Signed in",
        message=f"{user.get_username()} signed in.",
        metadata={"source": "auth", "action": "login"},
    )


@receiver(user_logged_out)
def audit_logout(sender, request, user, **kwargs):
    if user is None:
        return
    record_event(
        request,
        user=user,
        event_type=AuditEvent.TYPE_AUTH,
        title="Signed out",
        message=f"{user.get_username()} signed out.",
        metadata={"source": "auth", "action": "logout"},
    )


@receiver(user_login_failed)
def audit_login_failed(sender, credentials, request=None, **kwargs):
    # Django already masks the password in ``credentials``; only the attempted username is kept.
    username = str(credentials.get("username") or "")[:120]
    record_event(
        request,
        actor=username or "Unknown",
        event_type=AuditEvent.TYPE_AUTH,
        title="Failed sign-in",
        message=f"Failed sign-in attempt for {username or 'an empty username'}.",
        metadata={"source": "auth", "action": "login_failed", "username": username},
    )


ADMIN_ACTIONS = {ADDITION: "added", CHANGE: "changed", DELETION: "deleted"}


def _related_targets(obj):
    """Resident/apartment/house/sector the edited object belongs to, so the log can be filtered by them."""
    targets = {}
    if isinstance(obj, Owner):
        targets["owner"] = obj
        obj = obj.apartment
    if isinstance(obj, Apartment):
        targets["apartment"] = obj
        obj = obj.building
    if isinstance(obj, Building):
        targets["building"] = obj
        obj = obj.complex
    if isinstance(obj, Complex):
        targets["complex"] = obj
    return targets


# Set while the admin "Delete selected" action runs: it logs every object it deletes itself, because
# Django bulk-creates the LogEntry rows of a multi-object deletion and bulk_create sends no post_save.
_deletions_logged_by_action: ContextVar = ContextVar("admin_deletions_logged_by_action", default=False)


@contextmanager
def deletions_logged_by_action():
    """Skip the LogEntry receiver for deletions while the "Delete selected" action logs them itself."""
    token = _deletions_logged_by_action.set(True)
    try:
        yield
    finally:
        _deletions_logged_by_action.reset(token)


def _record_admin_action(user, action_flag, content_type, object_id, object_repr, change_message="", targets=None, admin_url=""):
    action = ADMIN_ACTIONS.get(action_flag, "edited")
    model_class = content_type.model_class() if content_type else None
    model_name = str(model_class._meta.verbose_name) if model_class else "object"
    record_event(
        current_request(),
        user=user,
        event_type=AuditEvent.TYPE_ADMIN,
        title=f"Admin: {model_name} {action}"[:180],
        message=f"{model_name.capitalize()} \"{object_repr}\" was {action} in admin."
        + (f" {change_message}" if change_message and action_flag == CHANGE else ""),
        metadata={
            "source": "django_admin",
            "action": action,
            "contentType": f"{content_type.app_label}.{content_type.model}" if content_type else "",
            "objectId": object_id,
            "objectRepr": object_repr,
            "changes": change_message,
            "adminUrl": admin_url,
        },
        **(targets or {}),
    )


def deletion_entry(obj):
    """What the log keeps of an object about to be deleted, taken as Django's LogEntry takes it."""
    return ContentType.objects.get_for_model(obj, for_concrete_model=False), str(obj.pk), str(obj)[:200]


def record_admin_deletion(user, entry):
    """Log one object deleted by the "Delete selected" action, from its ``deletion_entry``.

    No resident/apartment links: the object and whatever cascaded with it no longer exist.
    """
    content_type, object_id, object_repr = entry
    _record_admin_action(user, DELETION, content_type, object_id, object_repr)


@receiver(post_save, sender=LogEntry)
def audit_admin_change(sender, instance, created, **kwargs):
    """Mirror every Django admin add/change/delete into the operator log."""
    if not created:
        return
    if instance.action_flag == DELETION and _deletions_logged_by_action.get():
        return
    targets = {}
    admin_url = ""
    if instance.action_flag != DELETION:
        try:
            targets = _related_targets(instance.get_edited_object())
        except Exception:
            targets = {}
        try:
            admin_url = instance.get_admin_url() or ""
        except NoReverseMatch:
            admin_url = ""
    _record_admin_action(
        instance.user,
        instance.action_flag,
        instance.content_type if instance.content_type_id else None,
        instance.object_id,
        instance.object_repr,
        instance.get_change_message() or "",
        targets,
        admin_url,
    )
