from drf_spectacular.authentication import SessionScheme
from rest_framework.authentication import SessionAuthentication


class PortalSessionAuthentication(SessionAuthentication):
    """Session auth that answers 401 (not 403) when no session is present.

    Plain SessionAuthentication has no WWW-Authenticate challenge, so DRF turns
    a missing session into 403 — indistinguishable from a CSRF failure. The
    portal frontend relies on 401 to send the user back to the login page.
    """

    def authenticate_header(self, request):
        return 'Session realm="portal"'


class PortalSessionScheme(SessionScheme):
    """Documents PortalSessionAuthentication as cookie auth in the OpenAPI schema."""

    target_class = PortalSessionAuthentication
