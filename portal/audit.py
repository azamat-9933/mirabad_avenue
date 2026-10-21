"""Activity log of money and billing: one entry point for writing AuditEvent rows and one rule for reading them."""

from contextvars import ContextVar

from django.conf import settings

from .models import AuditEvent


# The request being served, so code without it at hand (the Click callback) still records the address.
_current_request: ContextVar = ContextVar("audit_current_request", default=None)


class AuditRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = _current_request.set(request)
        try:
            return self.get_response(request)
        finally:
            _current_request.reset(token)


def current_request():
    return _current_request.get()


def client_ip(request):
    if request is None:
        return None
    if getattr(settings, "TRUST_X_FORWARDED_FOR", False):
        # The last hop is the address our own proxy saw; earlier hops are client-supplied.
        forwarded = [part.strip() for part in request.META.get("HTTP_X_FORWARDED_FOR", "").split(",") if part.strip()]
        if forwarded:
            return forwarded[-1]
    return request.META.get("REMOTE_ADDR") or None


def _authenticated_user(request):
    user = getattr(request, "user", None)
    return user if getattr(user, "is_authenticated", False) else None


def record_event(request=None, *, user=None, actor=None, **fields):
    """Append an audit entry attributed to the signed-in operator of ``request`` (or the current one).

    Only the kinds the log keeps (AuditEvent.TYPE_CHOICES) are accepted.
    """
    if fields.get("event_type") not in AuditEvent.LOGGED_TYPES:
        raise ValueError(f"The activity log does not keep {fields.get('event_type')!r} events.")
    request = request if request is not None else current_request()
    user = user or _authenticated_user(request)
    fields.setdefault("ip_address", client_ip(request))
    return AuditEvent.objects.create(
        user=user,
        actor=(user.get_username() if user else actor or "System")[:120],
        **fields,
    )


def can_view_audit(user):
    """Superusers (every operator account, see portal.accounts) or users granted the view permission."""
    return bool(getattr(user, "is_authenticated", False) and user.has_perm("portal.view_auditevent"))
