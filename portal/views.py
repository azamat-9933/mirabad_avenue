import json
from decimal import Decimal, InvalidOperation
from datetime import timedelta

from django.core.exceptions import ImproperlyConfigured
from django.db import DatabaseError, OperationalError, transaction
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView

from main_app.models import Apartment, Building, Complex, Owner
from portal.models import AuditEvent, MaintenanceTask

from .backend_data import build_portal_data


def safe_portal_data(request=None):
    try:
        return build_portal_data(getattr(request, "user", None))
    except (DatabaseError, OperationalError, ImproperlyConfigured) as exc:
        return {
            "source": "backend_unavailable",
            "error": str(exc),
            "complexes": [],
            "residents": [],
            "transactions": [],
        }


@method_decorator(ensure_csrf_cookie, name="dispatch")
class PortalPageView(TemplateView):
    page_title = "HydroFlow Enterprise"
    active_page = ""

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["page_title"] = self.page_title
        ctx["active_page"] = self.active_page
        ctx["backend_billing_data_json"] = json.dumps(safe_portal_data(self.request), ensure_ascii=False)
        return ctx


class DashboardView(PortalPageView):
    template_name = "portal/dashboard.html"
    page_title = "HydroFlow Enterprise | Overview Dashboard"
    active_page = "dashboard"


class ResidentialView(PortalPageView):
    template_name = "portal/residential.html"
    page_title = "Residential Units Management | HydroFlow Enterprise"
    active_page = "residential"


class SystemHealthView(PortalPageView):
    template_name = "portal/system_health.html"
    page_title = "Infrastructure & System Health | HydroFlow"
    active_page = "system_health"


class BillingView(PortalPageView):
    template_name = "portal/billing.html"
    page_title = "Residential Complex Management | HydroFlow"
    active_page = "billing"


class AnalyticsView(PortalPageView):
    template_name = "portal/analytics.html"
    page_title = "HydroFlow Enterprise | Analytics Overview"
    active_page = "analytics"


def api_health(request):
    return JsonResponse({"status": "ok"})


def api_portal_data(request):
    return JsonResponse(safe_portal_data(request))


def _json_payload(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except (UnicodeDecodeError, json.JSONDecodeError):
        return {}


def _decimal_or_zero(value):
    try:
        return Decimal(str(value or "0").replace(",", "").strip() or "0")
    except (InvalidOperation, ValueError):
        return Decimal("0")


def _actor(request):
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        return user.get_username()
    return "Portal"


@require_POST
def api_create_resident(request):
    payload = _json_payload(request)
    fio = str(payload.get("fio") or "").strip()
    phone = str(payload.get("phone") or "").strip()
    apartment_id = payload.get("apartment_id")

    if not fio or not phone or not apartment_id:
        return JsonResponse(
            {"ok": False, "error": "Full name, phone and apartment are required."},
            status=400,
        )

    try:
        apartment = Apartment.objects.select_related(
            "building",
            "building__complex",
            "section",
        ).get(pk=apartment_id)
    except (Apartment.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"ok": False, "error": "Selected apartment was not found."}, status=404)

    if Owner.objects.filter(apartment=apartment).exists():
        return JsonResponse(
            {"ok": False, "error": "Selected apartment already has an owner."},
            status=409,
        )

    with transaction.atomic():
        owner = Owner.objects.create(
            fio=fio,
            phone=phone[:20],
            apartment=apartment,
            balance=_decimal_or_zero(payload.get("balance")),
            telegram_id=str(payload.get("telegram_id") or "").strip() or None,
            telegram_user=str(payload.get("telegram_user") or "").strip() or None,
            telegram_status=str(payload.get("telegram_status") or "").strip() or "pending",
        )
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_SYSTEM,
            title="Resident created",
            message=f"{owner.fio} was added to apartment {apartment.number} from the portal.",
            actor=_actor(request),
            complex=apartment.building.complex,
            building=apartment.building,
            apartment=apartment,
            owner=owner,
            metadata={"source": "portal_resident_form"},
        )

    return JsonResponse(
        {
            "ok": True,
            "ownerId": owner.id,
            "adminUrl": f"/admin/main_app/owner/{owner.id}/change/",
            "portalData": safe_portal_data(request),
        }
    )


@require_POST
def api_deploy_maintenance(request):
    payload = _json_payload(request)
    complex_id = payload.get("complex_id")
    building_id = payload.get("building_id")

    complex_obj = None
    building = None
    if building_id:
        try:
            building = Building.objects.select_related("complex").get(pk=building_id)
            complex_obj = building.complex
        except (Building.DoesNotExist, ValueError, TypeError):
            building = None
    if not complex_obj and complex_id:
        try:
            complex_obj = Complex.objects.get(pk=complex_id)
        except (Complex.DoesNotExist, ValueError, TypeError):
            complex_obj = None
    if not complex_obj:
        complex_obj = Complex.objects.order_by("title").first()
    if complex_obj and not building:
        building = complex_obj.buildings.order_by("number").first()

    if not complex_obj:
        return JsonResponse(
            {"ok": False, "error": "Create at least one residential complex before deploying maintenance."},
            status=400,
        )

    title = str(payload.get("title") or "Preventive maintenance deployment").strip()
    location = str(payload.get("location") or "").strip()
    if not location:
        location = f"{complex_obj.title}{' / ' + building.number if building else ''}"

    task = MaintenanceTask.objects.create(
        title=title,
        location=location,
        priority=payload.get("priority") or MaintenanceTask.PRIORITY_MEDIUM,
        status=MaintenanceTask.STATUS_SCHEDULED,
        scheduled_at=timezone.now() + timedelta(hours=2),
        assigned_to=str(payload.get("assigned_to") or "Operations Team").strip(),
        action_label="Open checklist",
        icon="build",
        complex=complex_obj,
        building=building,
        notes="Created from the portal Deploy Maintenance action.",
        metadata={"source": "portal_deploy_maintenance"},
    )
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_SYSTEM,
        title="Maintenance deployed",
        message=f"{task.title} was scheduled for {location}.",
        actor=_actor(request),
        complex=complex_obj,
        building=building,
        metadata={"source": "portal_deploy_maintenance", "taskId": task.id},
    )

    return JsonResponse(
        {
            "ok": True,
            "taskId": task.id,
            "adminUrl": f"/admin/portal/maintenancetask/{task.id}/change/",
            "portalData": safe_portal_data(request),
        }
    )
