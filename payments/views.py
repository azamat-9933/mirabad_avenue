"""Click's callbacks. Click signs its requests instead of signing in, so these views need no
session or CSRF token; the signature check in payments.click is what lets a request through."""
import json

from django.conf import settings
from django.contrib.auth.decorators import login_not_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from portal.audit import client_ip

from . import click


def _from_click(request) -> bool:
    allowed = settings.CLICK_ALLOWED_IPS
    return not allowed or client_ip(request) in allowed


def _answer(body):
    return JsonResponse(body, json_dumps_params={"ensure_ascii": False})


def _refused():
    return JsonResponse(
        {"error": click.BAD_REQUEST, "error_note": click.ERROR_NOTES[click.BAD_REQUEST]}, status=403
    )


@csrf_exempt
@login_not_required
@require_POST
def click_advanced(request):
    """Advanced Shop: getInfo, Prepare, Complete, Check and Compare on one URL (JSON)."""
    if not _from_click(request):
        return _refused()
    try:
        # Numbers stay as sent: the signature is built from their exact text.
        payload = json.loads(request.body.decode("utf-8") or "{}", parse_int=str, parse_float=str)
    except (UnicodeDecodeError, ValueError):
        payload = None
    return _answer(click.handle_advanced(payload))


@csrf_exempt
@login_not_required
@require_POST
def click_shop(request):
    """SHOP API: Prepare (action 0) and Complete (action 1), form-encoded; one URL serves both."""
    if not _from_click(request):
        return _refused()
    return _answer(click.handle_shop(request.POST))
