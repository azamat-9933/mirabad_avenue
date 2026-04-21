import json
from decimal import Decimal, InvalidOperation
from datetime import timedelta

from django.core.exceptions import ImproperlyConfigured
from django.db import DatabaseError, OperationalError, transaction
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView

from main_app.models import Apartment, Building, Complex, Owner
from portal.models import AuditEvent, MaintenanceTask, PortalNotification, SystemAlert

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


def _scheduled_datetime(value):
    parsed = parse_datetime(str(value or "").strip()) if value else None
    if parsed is None:
        return timezone.now() + timedelta(hours=2)
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def _optional_instance(model, value):
    if value in (None, "", "null"):
        return None


def _owner_relations(owner_ids):
    owners = list(
        Owner.objects.select_related("apartment", "apartment__building", "apartment__building__complex")
        .filter(pk__in=owner_ids)
    )
    primary = owners[0] if owners else None
    apartment = primary.apartment if primary and primary.apartment_id else None
    building = apartment.building if apartment and apartment.building_id else None
    complex_obj = building.complex if building and building.complex_id else None
    return owners, primary, apartment, building, complex_obj
    try:
        return model.objects.get(pk=value)
    except (model.DoesNotExist, ValueError, TypeError):
        return None


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
def api_resident_kit_action(request):
    payload = _json_payload(request)
    action = str(payload.get("action") or "").strip().lower()
    visible_count = int(payload.get("visible_count") or 0)
    debtor_count = int(payload.get("debtor_count") or 0)
    owner_ids = []
    for value in payload.get("owner_ids") or []:
        try:
            owner_ids.append(int(value))
        except (TypeError, ValueError):
            continue

    owners, primary_owner, apartment, building, complex_obj = _owner_relations(owner_ids)
    if not visible_count:
        visible_count = len(owners)

    if action == "move_in_checklist":
        event_type = AuditEvent.TYPE_SYSTEM
        title = "Move-in checklist opened"
        message = f"Resident move-in checklist opened for {visible_count} visible residents."
    elif action == "reminder_script":
        event_type = AuditEvent.TYPE_REMINDER
        title = "Reminder script prepared"
        count = debtor_count or visible_count
        message = f"Reminder script prepared for {count} residents with outstanding balance."
    elif action == "contact_sheet":
        event_type = AuditEvent.TYPE_EXPORT
        title = "Resident contact sheet exported"
        message = f"Resident contact sheet exported for {visible_count} visible residents."
    else:
        return JsonResponse({"ok": False, "error": "Unknown resident kit action."}, status=400)

    AuditEvent.objects.create(
        event_type=event_type,
        title=title,
        message=message,
        actor=_actor(request),
        complex=complex_obj,
        building=building,
        apartment=apartment,
        owner=primary_owner,
        metadata={
            "source": "portal_resident_kit",
            "action": action,
            "visibleCount": visible_count,
            "debtorCount": debtor_count,
            "ownerIds": owner_ids[:50],
        },
    )

    return JsonResponse(
        {
            "ok": True,
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
    priority = str(payload.get("priority") or MaintenanceTask.PRIORITY_MEDIUM).strip().lower()
    valid_priorities = {value for value, _label in MaintenanceTask.PRIORITY_CHOICES}
    if priority not in valid_priorities:
        priority = MaintenanceTask.PRIORITY_MEDIUM
    status = str(payload.get("status") or MaintenanceTask.STATUS_SCHEDULED).strip().lower()
    valid_statuses = {value for value, _label in MaintenanceTask.STATUS_CHOICES}
    if status not in valid_statuses:
        status = MaintenanceTask.STATUS_SCHEDULED
    assigned_to = str(payload.get("assigned_to") or "Operations Team").strip() or "Operations Team"
    action_label = str(payload.get("action_label") or "Open checklist").strip() or "Open checklist"
    notes = str(payload.get("notes") or "").strip()
    if not notes:
        notes = "Created from the portal Deploy Maintenance action."

    task = MaintenanceTask.objects.create(
        title=title,
        location=location,
        priority=priority,
        status=status,
        scheduled_at=_scheduled_datetime(payload.get("scheduled_at")),
        assigned_to=assigned_to,
        action_label=action_label,
        icon="build",
        complex=complex_obj,
        building=building,
        notes=notes,
        metadata={
            "source": "portal_deploy_maintenance",
            "requestedFrom": "system_health",
        },
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


@require_POST
def api_usage_report_export(request):
    payload = _json_payload(request)
    export_format = str(payload.get("format") or "CSV").strip().upper()
    source = str(payload.get("source") or "Usage Report").strip() or "Usage Report"
    row_count = int(payload.get("row_count") or 0)
    total_usage = _decimal_or_zero(payload.get("total_usage"))

    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_EXPORT,
        title="Usage report generated",
        message=f"{export_format} usage report exported from {source}.",
        actor=_actor(request),
        metadata={
            "source": "portal_usage_report",
            "format": export_format,
            "sourceLabel": source,
            "rowCount": row_count,
            "totalUsage": float(total_usage),
        },
    )
    return JsonResponse({"ok": True, "portalData": safe_portal_data(request)})


@require_POST
def api_system_alerts_configure(request):
    payload = _json_payload(request)
    mode = str(payload.get("mode") or "create").strip().lower()
    alert = _optional_instance(SystemAlert, payload.get("alert_id"))

    if mode in {"acknowledge", "resolve"}:
        if not alert:
            return JsonResponse({"ok": False, "error": "System alert was not found."}, status=404)
        alert.status = SystemAlert.STATUS_ACKNOWLEDGED if mode == "acknowledge" else SystemAlert.STATUS_RESOLVED
        if mode == "resolve":
            alert.resolved_at = timezone.now()
        alert.save(update_fields=["status", "resolved_at"])

        notification_id = (alert.metadata or {}).get("notification_id")
        notification = _optional_instance(PortalNotification, notification_id)
        if notification:
            notification.status = PortalNotification.STATUS_READ if mode == "acknowledge" else PortalNotification.STATUS_ARCHIVED
            notification.action_state = "Acknowledged from dashboard" if mode == "acknowledge" else "Resolved from dashboard"
            notification.save(update_fields=["status", "action_state"])

        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_ALERT,
            title="System alert updated",
            message=f"{alert.title} was {mode}d from the portal.",
            actor=_actor(request),
            complex=alert.complex,
            building=alert.building,
            apartment=alert.apartment,
            owner=alert.owner,
            metadata={"source": "portal_system_alerts", "mode": mode, "alertId": alert.id},
        )
        return JsonResponse(
            {
                "ok": True,
                "alertId": alert.id,
                "adminUrl": f"/admin/portal/systemalert/{alert.id}/change/",
                "portalData": safe_portal_data(request),
            }
        )

    title = str(payload.get("title") or "").strip()
    if not title:
        return JsonResponse({"ok": False, "error": "Alert title is required."}, status=400)

    category = str(payload.get("category") or SystemAlert.CATEGORY_OTHER).strip().lower()
    valid_categories = {value for value, _label in SystemAlert.CATEGORY_CHOICES}
    if category not in valid_categories:
        category = SystemAlert.CATEGORY_OTHER

    severity = str(payload.get("severity") or SystemAlert.SEVERITY_WARNING).strip().lower()
    valid_severities = {value for value, _label in SystemAlert.SEVERITY_CHOICES}
    if severity not in valid_severities:
        severity = SystemAlert.SEVERITY_WARNING

    status = str(payload.get("status") or SystemAlert.STATUS_ACTIVE).strip().lower()
    valid_statuses = {value for value, _label in SystemAlert.STATUS_CHOICES}
    if status not in valid_statuses:
        status = SystemAlert.STATUS_ACTIVE

    complex_obj = _optional_instance(Complex, payload.get("complex_id"))
    building = _optional_instance(Building, payload.get("building_id"))
    apartment = _optional_instance(Apartment, payload.get("apartment_id"))
    owner = _optional_instance(Owner, payload.get("owner_id"))

    if apartment and not building:
        building = apartment.building
    if owner and not apartment and owner.apartment_id:
        apartment = owner.apartment
    if apartment and not complex_obj:
        complex_obj = apartment.building.complex
    if building and not complex_obj:
        complex_obj = building.complex

    assigned_to = str(payload.get("assigned_to") or "Operations Team").strip() or "Operations Team"
    action_label = str(payload.get("action_label") or "Review alert").strip() or "Review alert"
    message = str(payload.get("message") or "").strip()
    if not message:
        scoped_label = building.number if building else complex_obj.title if complex_obj else "global network scope"
        message = f"Configured from dashboard for {scoped_label}."

    with transaction.atomic():
        alert = SystemAlert.objects.create(
            title=title,
            message=message,
            category=category,
            severity=severity,
            status=status,
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=owner,
            assigned_to=assigned_to,
            action_label=action_label,
            metadata={"source": "portal_system_alerts"},
        )
        notification = PortalNotification.objects.create(
            title=title,
            message=message,
            severity=severity,
            status=PortalNotification.STATUS_UNREAD,
            pinned=severity == PortalNotification.SEVERITY_CRITICAL,
            event_at=timezone.now(),
            action_primary=action_label,
            action_secondary="Resolve",
            action_state="Created from dashboard",
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=owner,
            created_by=getattr(request, "user", None) if getattr(getattr(request, "user", None), "is_authenticated", False) else None,
        )
        alert.metadata = {
            **(alert.metadata or {}),
            "notification_id": notification.id,
        }
        alert.save(update_fields=["metadata"])
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_ALERT,
            title="System alert created",
            message=f"{alert.title} was created from the portal.",
            actor=_actor(request),
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=owner,
            metadata={"source": "portal_system_alerts", "alertId": alert.id},
        )

    return JsonResponse(
        {
            "ok": True,
            "alertId": alert.id,
            "adminUrl": f"/admin/portal/systemalert/{alert.id}/change/",
            "portalData": safe_portal_data(request),
        }
    )
