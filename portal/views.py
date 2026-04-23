import json
import base64
import io
import re
import zipfile
from decimal import Decimal, InvalidOperation
from datetime import timedelta

from django.contrib.auth import logout
from django.core.paginator import EmptyPage, Paginator
from django.core.exceptions import ImproperlyConfigured
from django.db import DatabaseError, OperationalError, transaction
from django.db.models import Case, Count, F, IntegerField, Max, Prefetch, Q, Sum, Value, When
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView

from billing.models import HotWaterMeterReading
from main_app.models import DEFAULT_SECTOR_NAME
from properties.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from portal.models import (
    AuditEvent,
    ChecklistNote,
    MaintenanceTask,
    PortalNotification,
    PortalStatusOverride,
    SupportTicket,
    SystemAlert,
)

from .backend_data import (
    _alert_icon,
    _date,
    _date_section,
    _datetime,
    _health_from_split,
    _money,
    _residential_status_to_tone,
    _risk_from_split,
    _serialize_profile,
    _tone_for_priority,
    _transaction_type,
    build_portal_data,
)


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


LIST_DEFAULT_PAGE_SIZE = 25
LIST_MAX_PAGE_SIZE = 100


def _query_param(request, key, default=""):
    return str(request.GET.get(key, default) or default).strip()


def _query_int(request, key, default):
    try:
        return int(request.GET.get(key, default))
    except (TypeError, ValueError):
        return default


def _query_bool(request, key, default=None):
    raw = request.GET.get(key)
    if raw in (None, ""):
        return default
    value = str(raw).strip().lower()
    if value in {"1", "true", "yes", "on"}:
        return True
    if value in {"0", "false", "no", "off"}:
        return False
    return default


def _page_params(request):
    page = max(1, _query_int(request, "page", 1))
    page_size = max(1, min(LIST_MAX_PAGE_SIZE, _query_int(request, "page_size", LIST_DEFAULT_PAGE_SIZE)))
    return page, page_size


def _normalize_ordering(ordering, allowed, default):
    raw_parts = [part.strip() for part in str(ordering or "").split(",") if part.strip()]
    if not raw_parts:
        raw_parts = [default]
    normalized = []
    for part in raw_parts:
        descending = part.startswith("-")
        key = part[1:] if descending else part
        mapped = allowed.get(key)
        if not mapped:
            continue
        normalized.append(f"-{mapped}" if descending else mapped)
    return normalized or [allowed.get(default.lstrip("-"), default)]


def _paginated_response(results, page, page_size, total, ordering):
    pages = max(1, (total + page_size - 1) // page_size) if page_size else 1
    return JsonResponse(
        {
            "results": results,
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": pages,
            "ordering": ordering,
        }
    )


def _paginate_queryset(queryset, page, page_size):
    paginator = Paginator(queryset, page_size)
    try:
        page_obj = paginator.page(page)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages or 1)
    return page_obj


def _apply_period_filter(queryset, field_name, period):
    period_value = str(period or "").strip().lower()
    if not period_value or period_value == "all":
        return queryset
    now = timezone.localtime()
    if period_value == "30":
        return queryset.filter(**{f"{field_name}__gte": now - timedelta(days=30)})
    if period_value == "90":
        return queryset.filter(**{f"{field_name}__gte": now - timedelta(days=90)})
    if period_value == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return queryset.filter(**{f"{field_name}__gte": start})
    return queryset


def _apply_related_district_filter(queryset, district, *lookup_paths):
    district_value = str(district or "").strip()
    if not district_value or district_value.lower() == "all":
        return queryset
    query = Q()
    for path in lookup_paths:
        query |= Q(**{f"{path}__icontains": district_value})
    return queryset.filter(query) if query else queryset


def _resident_status_value(owner):
    balance = _money(owner.balance)
    return "debtor" if balance < 0 else "paid"


def _serialize_resident_row(owner):
    apartment = owner.apartment
    building = apartment.building
    complex_obj = building.complex
    balance = _money(owner.balance)
    last_payment_at = getattr(owner, "last_payment_at", None)
    telegram_status = str(owner.telegram_status or "").strip().lower()
    telegram_user = str(owner.telegram_user or "").strip()
    telegram_id = str(owner.telegram_id or "").strip()
    telegram_connected = bool(telegram_user or telegram_id or telegram_status in {"connected", "active", "verified"})
    return {
        "id": f"owner-{owner.id}",
        "backendId": owner.id,
        "ownerBackendId": owner.id,
        "complexId": f"complex-{complex_obj.id}",
        "complexBackendId": complex_obj.id,
        "buildingId": f"building-{building.id}",
        "buildingBackendId": building.id,
        "apartmentId": f"apartment-{apartment.id}",
        "apartmentBackendId": apartment.id,
        "name": owner.fio,
        "apartment": f"Apartment {apartment.number}",
        "apartmentNumber": apartment.number,
        "section": apartment.section.name if apartment.section_id else "",
        "building": f"House {building.number}",
        "buildingNumber": building.number,
        "complex": complex_obj.title,
        "complexAddress": complex_obj.address or "",
        "phone": owner.phone or "",
        "lastPayment": _date(last_payment_at),
        "lastPaymentAt": _datetime(last_payment_at),
        "balance": balance,
        "status": _resident_status_value(owner),
        "photo": "",
        "area": f"{apartment.area:g} m²",
        "rooms": "Apartment",
        "charge": "",
        "contract": f"APT-{apartment.id}",
        "meter": apartment.section.name if apartment.section_id else "",
        "email": "",
        "telegramStatus": telegram_status or "not_linked",
        "telegramUser": telegram_user,
        "telegramId": telegram_id,
        "telegramConnected": telegram_connected,
        "createdAt": _datetime(owner.created_at),
    }


def _transaction_override_map(transaction_ids):
    if not transaction_ids:
        return {}
    return {
        item.target_id: item.status_value
        for item in PortalStatusOverride.objects.filter(
            context=PortalStatusOverride.CONTEXT_TRANSACTIONS,
            target_type=PortalStatusOverride.TARGET_TRANSACTION,
            target_id__in=transaction_ids,
        )
    }


def _serialize_transaction_row(transaction_row, override_map=None):
    override_map = override_map or {}
    owner = transaction_row.owner
    apartment = owner.apartment
    building = apartment.building
    complex_obj = building.complex
    amount = _money(transaction_row.amount)
    status = "Success" if amount > 0 else "Pending"
    if transaction_row.id in override_map:
        status = override_map[transaction_row.id]
    return {
        "id": f"trx-{transaction_row.id}",
        "backendId": transaction_row.id,
        "ownerBackendId": owner.id,
        "apartmentBackendId": apartment.id,
        "buildingBackendId": building.id,
        "complexBackendId": complex_obj.id,
        "residentId": f"owner-{owner.id}",
        "residentName": owner.fio,
        "complexId": f"complex-{complex_obj.id}",
        "buildingId": f"building-{building.id}",
        "type": _transaction_type(transaction_row),
        "method": transaction_row.get_payment_type_display(),
        "paymentType": transaction_row.payment_type,
        "date": _date(transaction_row.created_at),
        "createdAt": _datetime(transaction_row.created_at),
        "amount": abs(amount),
        "signedAmount": amount,
        "status": status,
        "description": transaction_row.description or "",
        "externalId": transaction_row.external_id or "",
    }


def _maintenance_priority_rank():
    return Case(
        When(priority=MaintenanceTask.PRIORITY_HIGH, then=Value(3)),
        When(priority=MaintenanceTask.PRIORITY_MEDIUM, then=Value(2)),
        default=Value(1),
        output_field=IntegerField(),
    )


def _maintenance_status_rank():
    return Case(
        When(status=MaintenanceTask.STATUS_IN_PROGRESS, then=Value(5)),
        When(status=MaintenanceTask.STATUS_SCHEDULED, then=Value(4)),
        When(status=MaintenanceTask.STATUS_PLANNED, then=Value(3)),
        When(status=MaintenanceTask.STATUS_DEFERRED, then=Value(2)),
        default=Value(1),
        output_field=IntegerField(),
    )


def _serialize_maintenance_row(task):
    scheduled = timezone.localtime(task.scheduled_at) if task.scheduled_at else None
    return {
        "id": f"maintenance-{task.id}",
        "backendId": task.id,
        "task": task.title,
        "title": task.title,
        "location": task.location or task.notes or (task.complex.title if task.complex_id else ""),
        "priority": task.get_priority_display(),
        "priorityKey": task.priority,
        "status": task.get_status_display(),
        "statusKey": task.status,
        "date": scheduled.strftime("%d.%m.%Y | %H:%M") if scheduled else "",
        "day": scheduled.strftime("%d") if scheduled else "",
        "month": scheduled.strftime("%b").upper() if scheduled else "",
        "assignedTo": task.assigned_to,
        "action": task.action_label or "Open checklist",
        "icon": task.icon or "fact_check",
        "tone": _tone_for_priority(task.priority),
        "complexId": f"complex-{task.complex_id}" if task.complex_id else "",
        "buildingId": f"building-{task.building_id}" if task.building_id else "",
        "adminUrl": f"/admin/portal/maintenancetask/{task.id}/change/",
        "scheduledAt": _datetime(task.scheduled_at),
    }


def _notification_severity_rank():
    return Case(
        When(severity=PortalNotification.SEVERITY_CRITICAL, then=Value(3)),
        When(severity=PortalNotification.SEVERITY_WARNING, then=Value(2)),
        default=Value(1),
        output_field=IntegerField(),
    )


def _serialize_alert_row(item):
    related = item.complex or (item.building.complex if item.building_id else None)
    return {
        "id": f"notification-{item.id}",
        "backendId": item.id,
        "severity": item.severity,
        "title": item.title,
        "message": item.message,
        "section": _date_section(item.event_at),
        "read": item.status == PortalNotification.STATUS_READ,
        "pinned": item.pinned,
        "eventAt": _datetime(item.event_at),
        "actionPrimary": item.action_primary,
        "actionSecondary": item.action_secondary,
        "actionState": item.action_state,
        "complexId": f"complex-{related.id}" if related else "",
        "buildingId": f"building-{item.building_id}" if item.building_id else "",
        "ownerId": f"owner-{item.owner_id}" if item.owner_id else "",
        "status": item.status,
        "adminUrl": f"/admin/portal/portalnotification/{item.id}/change/",
    }


def _serialize_audit_row(event):
    return {
        "id": f"audit-{event.id}",
        "backendId": event.id,
        "type": event.event_type,
        "label": event.get_event_type_display(),
        "title": event.title,
        "message": event.message,
        "actor": event.actor,
        "time": _datetime(event.created_at),
        "complexId": f"complex-{event.complex_id}" if event.complex_id else "",
        "buildingId": f"building-{event.building_id}" if event.building_id else "",
        "ownerId": f"owner-{event.owner_id}" if event.owner_id else "",
        "adminUrl": f"/admin/portal/auditevent/{event.id}/change/",
    }


def _residential_override_maps():
    override_map = {
        (item.target_type, item.target_id): item.status_value
        for item in PortalStatusOverride.objects.filter(context=PortalStatusOverride.CONTEXT_RESIDENTIAL)
    }
    return {
        "complex": {target_id: value for (target_type, target_id), value in override_map.items() if target_type == PortalStatusOverride.TARGET_COMPLEX},
        "building": {target_id: value for (target_type, target_id), value in override_map.items() if target_type == PortalStatusOverride.TARGET_BUILDING},
        "apartment": {target_id: value for (target_type, target_id), value in override_map.items() if target_type == PortalStatusOverride.TARGET_APARTMENT},
    }


def _serialize_complex_row(complex_obj, override_maps=None, hot_water_by_complex=None):
    override_maps = override_maps or {"complex": {}, "building": {}, "apartment": {}}
    hot_water_by_complex = hot_water_by_complex or {}
    building_rows = []
    debtor_count = 0
    paid_count = 0
    debt_total = 0.0
    collected_total = 0.0
    unit_total = 0

    for building in complex_obj.buildings.all():
        apartment_rows = []
        building_debtors = 0
        building_paid = 0
        building_debt = 0.0
        building_collected = 0.0
        apartments = list(building.apartments.all())
        unit_total += len(apartments)
        for apartment in apartments:
            owner = getattr(apartment, "owner", None)
            owner_transactions = list(getattr(owner, "prefetched_transactions", [])) if owner else []
            positive_transactions = [item for item in owner_transactions if item.amount > 0]
            latest_payment = positive_transactions[0] if positive_transactions else None
            balance = _money(owner.balance if owner else 0)
            is_debtor = balance < 0
            if is_debtor:
                debtor_count += 1
                building_debtors += 1
                debt_total += abs(balance)
                building_debt += abs(balance)
            else:
                paid_count += 1
                building_paid += 1
            owner_collected = sum(_money(item.amount) for item in positive_transactions)
            collected_total += owner_collected
            building_collected += owner_collected
            apartment_status = override_maps["apartment"].get(apartment.id, "Overdue" if is_debtor else "Paid")
            resident_id = f"owner-{owner.id}" if owner else f"apartment-{apartment.id}"
            apartment_rows.append(
                {
                    "id": resident_id,
                    "backendId": apartment.id,
                    "apartmentBackendId": apartment.id,
                    "ownerBackendId": owner.id if owner else None,
                    "complexId": f"complex-{complex_obj.id}",
                    "complexBackendId": complex_obj.id,
                    "buildingId": f"building-{building.id}",
                    "buildingBackendId": building.id,
                    "unit": apartment.number,
                    "owner": {
                        "name": owner.fio if owner else "Unassigned owner",
                        "phone": owner.phone if owner else "",
                        "email": "",
                        "photo": "",
                    },
                    "balance": balance,
                    "status": apartment_status,
                    "rooms": "Apartment",
                    "area": f"{apartment.area:g} m²",
                    "charge": "",
                    "meter": apartment.section.name if apartment.section_id else "",
                    "contract": f"APT-{apartment.id}",
                    "visit": "",
                    "lastPayment": _date(latest_payment.created_at) if latest_payment else "",
                    "occupancy": "Resident" if owner else "Vacant",
                    "isOccupied": bool(owner),
                }
            )
        building_risk = _risk_from_split(building_debtors, building_paid, building_debt)
        building_risk = override_maps["building"].get(building.id, building_risk)
        building_rows.append(
            {
                "id": f"building-{building.id}",
                "backendId": building.id,
                "complexBackendId": complex_obj.id,
                "name": f"House {building.number}",
                "number": building.number,
                "address": building.address,
                "apartments": apartment_rows,
                "units": len(apartment_rows),
                "debt": building_debt,
                "collected": building_collected,
                "debtorResidents": building_debtors,
                "paidResidents": building_paid,
                "risk": building_risk,
                "health": _health_from_split(building_debtors, building_paid),
                "tone": _residential_status_to_tone(building_risk),
                "floors": "",
                "entrance": "",
            }
        )
    risk = _risk_from_split(debtor_count, paid_count, debt_total)
    risk = override_maps["complex"].get(complex_obj.id, risk)
    health = _health_from_split(debtor_count, paid_count)
    water_m3 = hot_water_by_complex.get(complex_obj.id, 0)
    return {
        "id": f"complex-{complex_obj.id}",
        "backendId": complex_obj.id,
        "name": complex_obj.title,
        "sector": DEFAULT_SECTOR_NAME,
        "prefix": complex_obj.title,
        "buildings": len(building_rows),
        "units": unit_total,
        "water": "Optimal",
        "heating": "Optimal",
        "health": health,
        "waterM3": round(water_m3, 2),
        "heatingM3": 0,
        "pressurePsi": round(45 + (health / 100) * 15, 1),
        "extraDebt": debt_total,
        "baselineCollected": collected_total,
        "debt": debt_total,
        "finances": health,
        "image": "",
        "icon": "apartment",
        "risk": risk,
        "tone": _residential_status_to_tone(risk),
        "debtorResidents": debtor_count,
        "paidResidents": paid_count,
        "buildingItems": building_rows,
    }


def api_list_residents(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    status_value = _query_param(request, "status", "all").lower()
    telegram_value = _query_param(request, "telegram", "all").lower()
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    ordering_raw = _query_param(request, "ordering", "name")
    allowed_ordering = {
        "name": "fio",
        "balance": "balance",
        "created_at": "created_at",
        "last_payment": "last_payment_at",
        "apartment": "apartment__number",
        "complex": "apartment__building__complex__title",
    }
    queryset = Owner.objects.select_related(
        "apartment",
        "apartment__section",
        "apartment__building",
        "apartment__building__complex",
    ).annotate(
        last_payment_at=Max("transactions__created_at", filter=Q(transactions__amount__gt=0))
    )
    if search:
        normalized_search = re.sub(
            r"\b(apartment|apt|house|home|unit|flat|квартира|кв|дом|уй|uy|kvartira)\b\.?",
            "",
            search,
            flags=re.IGNORECASE,
        ).strip()
        search_filter = (
            Q(fio__icontains=search)
            | Q(phone__icontains=search)
            | Q(apartment__number__icontains=search)
            | Q(apartment__building__number__icontains=search)
            | Q(apartment__building__complex__title__icontains=search)
            | Q(apartment__building__complex__address__icontains=search)
        )
        if normalized_search and normalized_search != search:
            search_filter |= (
                Q(apartment__number__icontains=normalized_search)
                | Q(apartment__building__number__icontains=normalized_search)
            )
        queryset = queryset.filter(search_filter)
    if status_value == "debtor":
        queryset = queryset.filter(balance__lt=0)
    elif status_value == "paid":
        queryset = queryset.filter(balance__gte=0)
    if telegram_value == "connected":
        queryset = queryset.filter(
            (Q(telegram_user__isnull=False) & ~Q(telegram_user=""))
            | (Q(telegram_id__isnull=False) & ~Q(telegram_id=""))
            | Q(telegram_status__in=["connected", "active", "verified"])
        )
    elif telegram_value in {"pending", "review"}:
        queryset = queryset.filter(telegram_status__in=["pending", "review"])
    elif telegram_value in {"not_linked", "offline"}:
        queryset = queryset.filter(
            Q(telegram_user__isnull=True) | Q(telegram_user="")
        ).filter(
            Q(telegram_id__isnull=True) | Q(telegram_id="")
        ).exclude(telegram_status__in=["connected", "active", "verified", "pending", "review"])
    queryset = _apply_related_district_filter(
        queryset,
        district_value,
        "apartment__building__complex__title",
        "apartment__building__complex__address",
    )
    queryset = _apply_period_filter(queryset, "created_at", period_value)
    complex_id = _query_int(request, "complex_id", 0)
    building_id = _query_int(request, "building_id", 0)
    apartment_id = _query_int(request, "apartment_id", 0)
    if complex_id:
        queryset = queryset.filter(apartment__building__complex_id=complex_id)
    if building_id:
        queryset = queryset.filter(apartment__building_id=building_id)
    if apartment_id:
        queryset = queryset.filter(apartment_id=apartment_id)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "name")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "id"), page, page_size)
    results = [_serialize_resident_row(owner) for owner in page_obj.object_list]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


def api_list_transactions(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    status_value = _query_param(request, "status", "").lower()
    payment_type = _query_param(request, "payment_type", "").lower()
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    ordering_raw = _query_param(request, "ordering", "-created_at")
    allowed_ordering = {
        "id": "id",
        "created_at": "created_at",
        "amount": "amount",
        "resident": "owner__fio",
        "method": "payment_type",
        "type": "payment_type",
        "status": "status_rank",
    }
    queryset = Transaction.objects.select_related(
        "owner",
        "owner__apartment",
        "owner__apartment__building",
        "owner__apartment__building__complex",
    ).annotate(
        status_rank=Case(
            When(amount__gt=0, then=Value(2)),
            default=Value(1),
            output_field=IntegerField(),
        )
    )
    if search:
        queryset = queryset.filter(
            Q(owner__fio__icontains=search)
            | Q(owner__phone__icontains=search)
            | Q(description__icontains=search)
            | Q(external_id__icontains=search)
            | Q(owner__apartment__number__icontains=search)
            | Q(owner__apartment__building__number__icontains=search)
            | Q(owner__apartment__building__complex__title__icontains=search)
        )
    owner_id = _query_int(request, "owner_id", 0)
    complex_id = _query_int(request, "complex_id", 0)
    building_id = _query_int(request, "building_id", 0)
    apartment_id = _query_int(request, "apartment_id", 0)
    if owner_id:
        queryset = queryset.filter(owner_id=owner_id)
    if complex_id:
        queryset = queryset.filter(owner__apartment__building__complex_id=complex_id)
    if building_id:
        queryset = queryset.filter(owner__apartment__building_id=building_id)
    if apartment_id:
        queryset = queryset.filter(owner__apartment_id=apartment_id)
    if payment_type:
        queryset = queryset.filter(payment_type=payment_type)
    queryset = _apply_related_district_filter(
        queryset,
        district_value,
        "owner__apartment__building__complex__title",
        "owner__apartment__building__complex__address",
    )
    queryset = _apply_period_filter(queryset, "created_at", period_value)
    if status_value in {"success", "paid"}:
        queryset = queryset.filter(amount__gt=0)
    elif status_value in {"pending", "overdue", "debt"}:
        queryset = queryset.filter(amount__lte=0)
    elif status_value:
        override_ids = PortalStatusOverride.objects.filter(
            context=PortalStatusOverride.CONTEXT_TRANSACTIONS,
            target_type=PortalStatusOverride.TARGET_TRANSACTION,
            status_value__iexact=status_value,
        ).values_list("target_id", flat=True)
        queryset = queryset.filter(pk__in=override_ids)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "-created_at")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "-id"), page, page_size)
    overrides = _transaction_override_map([item.id for item in page_obj.object_list])
    results = [_serialize_transaction_row(item, overrides) for item in page_obj.object_list]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


def api_list_maintenance(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    status_value = _query_param(request, "status", "").lower()
    priority_value = _query_param(request, "priority", "").lower()
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    ordering_raw = _query_param(request, "ordering", "priority,-scheduled_at")
    allowed_ordering = {
        "title": "title",
        "scheduled_at": "scheduled_at",
        "priority": "priority_rank",
        "status": "status_rank",
        "location": "location",
    }
    queryset = MaintenanceTask.objects.select_related("complex", "building").annotate(
        priority_rank=_maintenance_priority_rank(),
        status_rank=_maintenance_status_rank(),
    )
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(location__icontains=search)
            | Q(notes__icontains=search)
            | Q(complex__title__icontains=search)
            | Q(building__number__icontains=search)
        )
    complex_id = _query_int(request, "complex_id", 0)
    building_id = _query_int(request, "building_id", 0)
    if complex_id:
        queryset = queryset.filter(complex_id=complex_id)
    if building_id:
        queryset = queryset.filter(building_id=building_id)
    if status_value:
        queryset = queryset.filter(status=status_value)
    if priority_value:
        queryset = queryset.filter(priority=priority_value)
    queryset = _apply_related_district_filter(queryset, district_value, "complex__title", "complex__address", "location")
    queryset = _apply_period_filter(queryset, "scheduled_at", period_value)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "priority")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "id"), page, page_size)
    results = [_serialize_maintenance_row(item) for item in page_obj.object_list]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


def api_list_alerts(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    severity = _query_param(request, "severity", "").lower()
    status_value = _query_param(request, "status", "").lower()
    pinned = _query_bool(request, "pinned", None)
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    ordering_raw = _query_param(request, "ordering", "-pinned,-event_at")
    allowed_ordering = {
        "event_at": "event_at",
        "severity": "severity_rank",
        "pinned": "pinned",
        "title": "title",
    }
    queryset = PortalNotification.objects.select_related(
        "complex",
        "building",
        "apartment",
        "owner",
    ).exclude(status=PortalNotification.STATUS_ARCHIVED).annotate(
        severity_rank=_notification_severity_rank()
    )
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(message__icontains=search)
            | Q(owner__fio__icontains=search)
            | Q(building__number__icontains=search)
            | Q(complex__title__icontains=search)
        )
    if severity:
        queryset = queryset.filter(severity=severity)
    if status_value:
        queryset = queryset.filter(status=status_value)
    if pinned is not None:
        queryset = queryset.filter(pinned=pinned)
    queryset = _apply_related_district_filter(queryset, district_value, "complex__title", "complex__address", "message")
    queryset = _apply_period_filter(queryset, "event_at", period_value)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "-pinned")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "-id"), page, page_size)
    results = [_serialize_alert_row(item) for item in page_obj.object_list]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


def api_list_audit(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    event_type = _query_param(request, "type", "").lower()
    actor = _query_param(request, "actor", "")
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    ordering_raw = _query_param(request, "ordering", "-created_at")
    allowed_ordering = {
        "created_at": "created_at",
        "actor": "actor",
        "type": "event_type",
        "title": "title",
    }
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "-created_at")
    try:
        queryset = AuditEvent.objects.select_related(
            "complex",
            "building",
            "apartment",
            "owner",
        )
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(message__icontains=search)
                | Q(actor__icontains=search)
                | Q(owner__fio__icontains=search)
                | Q(complex__title__icontains=search)
            )
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if actor:
            queryset = queryset.filter(actor__icontains=actor)
        complex_id = _query_int(request, "complex_id", 0)
        owner_id = _query_int(request, "owner_id", 0)
        if complex_id:
            queryset = queryset.filter(complex_id=complex_id)
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        queryset = _apply_related_district_filter(queryset, district_value, "complex__title", "complex__address", "message")
        queryset = _apply_period_filter(queryset, "created_at", period_value)
        page_obj = _paginate_queryset(queryset.order_by(*ordering, "-id"), page, page_size)
        results = [_serialize_audit_row(item) for item in page_obj.object_list]
        return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)
    except (DatabaseError, OperationalError):
        # Fresh DB can open the portal before portal migrations are applied.
        # Keep API contract stable instead of returning HTTP 500.
        return _paginated_response([], page, page_size, 0, ordering_raw)


def api_list_complexes(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    debt_status = _query_param(request, "debt_status", "").lower()
    district_value = _query_param(request, "district", "")
    ordering_raw = _query_param(request, "ordering", "complex")
    transactions_prefetch = Prefetch(
        "owner__transactions",
        queryset=Transaction.objects.order_by("-created_at"),
        to_attr="prefetched_transactions",
    )
    apartment_queryset = Apartment.objects.select_related("section").prefetch_related(
        Prefetch("owner", queryset=Owner.objects.prefetch_related(transactions_prefetch))
    ).order_by("number")
    building_queryset = Building.objects.prefetch_related(
        Prefetch("apartments", queryset=apartment_queryset),
        "sections",
    ).order_by("number")
    queryset = Complex.objects.prefetch_related(Prefetch("buildings", queryset=building_queryset))
    if district_value and district_value.lower() != "all":
        queryset = queryset.filter(Q(title__icontains=district_value) | Q(address__icontains=district_value))
    page_obj = _paginate_queryset(queryset.order_by("title", "id"), page, page_size)
    override_maps = _residential_override_maps()
    hot_water_by_complex = {
        row["apartment__building__complex_id"]: _money(row["total"])
        for row in HotWaterMeterReading.objects.values("apartment__building__complex_id").annotate(total=Sum("end_reading"))
    }
    all_results = []
    for complex_obj in queryset:
        row = _serialize_complex_row(complex_obj, override_maps, hot_water_by_complex)
        if search:
            search_value = search.lower()
            searchable_parts = [
                row["name"],
                row["sector"],
                row["risk"],
            ]
            for building in row.get("buildingItems", []):
                searchable_parts.extend([
                    building.get("name", ""),
                    building.get("address", ""),
                    building.get("risk", ""),
                ])
                for apartment in building.get("apartments", []):
                    searchable_parts.extend([
                        apartment.get("unit", ""),
                        apartment.get("status", ""),
                        apartment.get("owner", {}).get("name", ""),
                        apartment.get("owner", {}).get("phone", ""),
                    ])
            if search_value not in " ".join(str(part or "").lower() for part in searchable_parts):
                continue
        if debt_status:
            normalized = row["risk"].strip().lower().replace(" ", "_")
            if debt_status == "critical" and normalized != "critical":
                continue
            if debt_status in {"medium", "medium_risk"} and normalized != "medium_risk":
                continue
            if debt_status in {"low", "low_risk"} and normalized != "low_risk":
                continue
        all_results.append(row)

    order_parts = [part.strip() for part in ordering_raw.split(",") if part.strip()] or ["complex"]
    sort_map = {
        "complex": lambda item: str(item.get("name", "")).lower(),
        "infra": lambda item: (-int(item.get("buildings", 0)), -int(item.get("units", 0)), str(item.get("name", "")).lower()),
        "systems": lambda item: (-float(item.get("health", 0) or 0), str(item.get("risk", "")).lower(), str(item.get("name", "")).lower()),
        "finances": lambda item: -float(item.get("finances", 0) or 0),
        "debt": lambda item: -float(item.get("debt", 0) or 0),
        "actions": lambda item: (-int(item.get("debtorResidents", 0) or 0), -int(item.get("paidResidents", 0) or 0)),
    }
    for part in reversed(order_parts):
        descending = part.startswith("-")
        key = part[1:] if descending else part
        sorter = sort_map.get(key, sort_map["complex"])
        all_results.sort(key=sorter, reverse=descending)

    total = len(all_results)
    pages = max(1, (total + page_size - 1) // page_size) if page_size else 1
    page = min(page, pages)
    start = (page - 1) * page_size
    results = all_results[start:start + page_size]
    return JsonResponse(
        {
            "results": results,
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": pages,
            "ordering": ordering_raw,
        }
    )


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
    try:
        return model.objects.get(pk=value)
    except (model.DoesNotExist, ValueError, TypeError):
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


def _unique_ints(values):
    seen = set()
    rows = []
    for value in values or []:
        try:
            item = int(value)
        except (TypeError, ValueError):
            continue
        if item and item not in seen:
            rows.append(item)
            seen.add(item)
    return rows


def _current_user_or_none(request):
    user = getattr(request, "user", None)
    return user if getattr(user, "is_authenticated", False) else None


def _status_choice_value(raw_value, allowed):
    normalized = str(raw_value or "").strip().lower().replace("-", "_").replace(" ", "_")
    if normalized in allowed:
        return normalized
    return ""


def _collect_owner_targets(payload):
    owner_ids = _unique_ints(payload.get("owner_ids"))
    owner_id = payload.get("owner_id")
    if owner_id not in (None, "", "null"):
        owner_ids.extend(_unique_ints([owner_id]))
    owners = list(
        Owner.objects.select_related("apartment", "apartment__building", "apartment__building__complex")
        .filter(pk__in=_unique_ints(owner_ids))
    )
    if owners:
        return owners

    apartment = _optional_instance(Apartment, payload.get("apartment_id"))
    building = _optional_instance(Building, payload.get("building_id"))
    complex_obj = _optional_instance(Complex, payload.get("complex_id"))

    queryset = Owner.objects.select_related("apartment", "apartment__building", "apartment__building__complex")
    if apartment:
        return list(queryset.filter(apartment=apartment))
    if building:
        return list(queryset.filter(apartment__building=building))
    if complex_obj:
        return list(queryset.filter(apartment__building__complex=complex_obj))
    return []


def _encode_download(filename, mime, content_bytes):
    return {
        "filename": filename,
        "mime": mime,
        "content": base64.b64encode(content_bytes).decode("ascii"),
    }


def _pdf_escape(value):
    return str(value).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_simple_pdf(title, rows):
    safe_title = _pdf_escape(title)
    lines = [safe_title, ""]
    for row in rows:
        lines.append(" | ".join(_pdf_escape(cell) for cell in row))
    if not lines:
        lines = [safe_title]
    y = 800
    content_lines = ["BT", "/F1 11 Tf", "40 800 Td"]
    first = True
    for line in lines[:45]:
        if first:
            content_lines.append(f"({_pdf_escape(line)}) Tj")
            first = False
        else:
            y -= 16
            content_lines.append(f"0 -16 Td ({_pdf_escape(line)}) Tj")
    content_lines.append("ET")
    content = "\n".join(content_lines).encode("latin-1", "replace")
    objects = []
    objects.append(b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
    objects.append(b"2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n")
    objects.append(b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n")
    objects.append(b"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n")
    objects.append(f"5 0 obj << /Length {len(content)} >> stream\n".encode("ascii") + content + b"\nendstream endobj\n")
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)
    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer << /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF".encode("ascii")
    )
    return bytes(pdf)


def _backend_id_set(value):
    return {int(item) for item in _unique_ints(value)}


def _portal_export_rows(portal_data, context, filters=None):
    filters = filters or {}
    complex_ids = _backend_id_set(filters.get("complex_backend_ids"))
    building_ids = _backend_id_set(filters.get("building_backend_ids"))
    apartment_ids = _backend_id_set(filters.get("apartment_backend_ids"))
    transaction_ids = _backend_id_set(filters.get("transaction_backend_ids"))
    maintenance_ids = _backend_id_set(filters.get("maintenance_backend_ids"))
    owner_ids = _backend_id_set(filters.get("owner_ids") or [filters.get("owner_id")])
    rows = []
    if context == "residential":
        for complex_row in portal_data.get("complexes", []):
            if complex_ids and int(complex_row.get("backendId") or 0) not in complex_ids:
                continue
            rows.append([
                complex_row.get("name", ""),
                complex_row.get("sector", ""),
                str(complex_row.get("buildings", "")),
                str(complex_row.get("units", "")),
                complex_row.get("risk", ""),
                f'{complex_row.get("extraDebt", 0):,.0f} UZS',
            ])
    elif context == "transactions":
        for item in portal_data.get("transactions", []):
            if transaction_ids and int(item.get("backendId") or 0) not in transaction_ids:
                continue
            if owner_ids and int(item.get("ownerBackendId") or 0) not in owner_ids:
                continue
            if apartment_ids and int(item.get("apartmentBackendId") or 0) not in apartment_ids:
                continue
            if building_ids and int(item.get("buildingBackendId") or 0) not in building_ids:
                continue
            if complex_ids and int(item.get("complexBackendId") or 0) not in complex_ids:
                continue
            rows.append([
                item.get("residentName", item.get("residentId", "")),
                item.get("type", ""),
                item.get("method", ""),
                item.get("date", ""),
                f'{item.get("signedAmount", item.get("amount", 0)):,.0f} UZS',
                item.get("status", ""),
            ])
    elif context == "maintenance":
        for item in portal_data.get("maintenanceTasks", []):
            if maintenance_ids and int(item.get("backendId") or 0) not in maintenance_ids:
                continue
            if building_ids and int(item.get("buildingBackendId") or 0) not in building_ids:
                continue
            if complex_ids and int(item.get("complexBackendId") or 0) not in complex_ids:
                continue
            rows.append([
                item.get("title", ""),
                item.get("location", ""),
                item.get("priority", ""),
                item.get("date", ""),
                item.get("status", ""),
                item.get("assignedTo", ""),
            ])
    return rows


def _render_export_payload(portal_data, context, export_format, source, language, filters=None):
    titles = {
        "residential": {"en": "Residential Export", "ru": "Экспорт жилых объектов", "uz": "Turar joylar eksporti"},
        "transactions": {"en": "Transaction Export", "ru": "Экспорт транзакций", "uz": "Tranzaksiyalar eksporti"},
        "maintenance": {"en": "Maintenance Export", "ru": "Экспорт обслуживания", "uz": "Xizmat eksporti"},
    }
    headers = {
        "residential": {
            "en": ["Complex", "District", "Buildings", "Units", "Risk", "Debt"],
            "ru": ["Комплекс", "Район", "Домов", "Квартир", "Статус", "Долг"],
            "uz": ["Majmua", "Tuman", "Uylar", "Xonadonlar", "Holat", "Qarz"],
        },
        "transactions": {
            "en": ["Resident", "Type", "Method", "Date", "Amount", "Status"],
            "ru": ["Житель", "Тип", "Метод", "Дата", "Сумма", "Статус"],
            "uz": ["Rezident", "Turi", "Usul", "Sana", "Summa", "Holat"],
        },
        "maintenance": {
            "en": ["Task", "Location", "Priority", "Date", "Status", "Assigned to"],
            "ru": ["Задача", "Локация", "Приоритет", "Дата", "Статус", "Назначено"],
            "uz": ["Vazifa", "Joy", "Muhimlik", "Sana", "Holat", "Biriktirilgan"],
        },
    }
    lang = language if language in {"en", "ru", "uz"} else "en"
    rows = _portal_export_rows(portal_data, context, filters)
    header = headers.get(context, headers["residential"])[lang]
    title = titles.get(context, titles["residential"])[lang]
    filename_base = f"{context or 'export'}-{timezone.localtime():%Y%m%d-%H%M}"

    if export_format == "CSV":
        csv_lines = []
        for row in [header, *rows]:
            escaped = [f'"{str(cell).replace(chr(34), chr(34) * 2)}"' for cell in row]
            csv_lines.append(",".join(escaped))
        return _encode_download(
            f"{filename_base}.csv",
            "text/csv;charset=utf-8",
            ("\ufeff" + "\n".join(csv_lines)).encode("utf-8"),
        )

    if export_format == "XLSX":
        def xml_escape(value):
            return (
                str(value)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
            )

        def excel_col(index):
            result = ""
            while index:
                index, remainder = divmod(index - 1, 26)
                result = chr(65 + remainder) + result
            return result or "A"

        worksheet_rows = []
        for row_index, row in enumerate([header, *rows], start=1):
            cells = []
            for col_index, cell in enumerate(row, start=1):
                ref = f"{excel_col(col_index)}{row_index}"
                cells.append(
                    f'<c r="{ref}" t="inlineStr"><is><t>{xml_escape(cell)}</t></is></c>'
                )
            worksheet_rows.append(f"<row r=\"{row_index}\">{''.join(cells)}</row>")
        sheet_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            f"<sheetData>{''.join(worksheet_rows)}</sheetData>"
            "</worksheet>"
        )
        workbook_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f'<sheets><sheet name="{xml_escape(title[:31])}" sheetId="1" r:id="rId1"/></sheets>'
            "</workbook>"
        )
        workbook_rels = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            'Target="worksheets/sheet1.xml"/>'
            '<Relationship Id="rId2" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
            'Target="styles.xml"/>'
            "</Relationships>"
        )
        root_rels = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
            'Target="xl/workbook.xml"/>'
            "</Relationships>"
        )
        content_types = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            '<Override PartName="/xl/styles.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            "</Types>"
        )
        styles_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
            '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
            '<borders count="1"><border/></borders>'
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
            "</styleSheet>"
        )
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as workbook:
            workbook.writestr("[Content_Types].xml", content_types)
            workbook.writestr("_rels/.rels", root_rels)
            workbook.writestr("xl/workbook.xml", workbook_xml)
            workbook.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
            workbook.writestr("xl/worksheets/sheet1.xml", sheet_xml)
            workbook.writestr("xl/styles.xml", styles_xml)
        return _encode_download(
            f"{filename_base}.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            buffer.getvalue(),
        )

    pdf_bytes = _build_simple_pdf(title, [header, *rows])
    return _encode_download(f"{filename_base}.pdf", "application/pdf", pdf_bytes)


@require_POST
def api_audit_note(request):
    payload = _json_payload(request)
    message = str(payload.get("message") or "").strip()
    title = str(payload.get("title") or "Audit note").strip() or "Audit note"
    if not message:
        return JsonResponse({"ok": False, "error": "Audit note text is required."}, status=400)

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

    event = AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_NOTE,
        title=title,
        message=message,
        actor=_actor(request),
        complex=complex_obj,
        building=building,
        apartment=apartment,
        owner=owner,
        metadata={"source": "portal_audit_note"},
    )
    return JsonResponse(
        {
            "ok": True,
            "eventId": event.id,
            "portalData": safe_portal_data(request),
        }
    )


@require_POST
def api_checklist_note(request):
    payload = _json_payload(request)
    mode = str(payload.get("mode") or "create").strip().lower()
    note = _optional_instance(ChecklistNote, payload.get("note_id"))

    if mode == "create":
        text = str(payload.get("text") or "").strip()
        if not text:
            return JsonResponse({"ok": False, "error": "Checklist note text is required."}, status=400)
        note = ChecklistNote.objects.create(
            text=text,
            template_key=str(payload.get("template_key") or "").strip(),
            scope=str(payload.get("scope") or "Operations").strip() or "Operations",
            done=False,
            created_by=_current_user_or_none(request),
        )
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_NOTE,
            title="Checklist note added",
            message=text,
            actor=_actor(request),
            metadata={"source": "portal_checklist_note", "noteId": note.id},
        )
        return JsonResponse({"ok": True, "noteId": note.id, "portalData": safe_portal_data(request)})

    if not note:
        return JsonResponse({"ok": False, "error": "Checklist note was not found."}, status=404)

    if mode == "toggle":
        note.done = not note.done
        note.save(update_fields=["done", "updated_at"])
        return JsonResponse({"ok": True, "noteId": note.id, "done": note.done, "portalData": safe_portal_data(request)})

    if mode == "delete":
        note_id = note.id
        note.delete()
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_NOTE,
            title="Checklist note removed",
            message=f"Checklist note #{note_id} was deleted.",
            actor=_actor(request),
            metadata={"source": "portal_checklist_note", "noteId": note_id},
        )
        return JsonResponse({"ok": True, "noteId": note_id, "portalData": safe_portal_data(request)})

    return JsonResponse({"ok": False, "error": "Unknown checklist note mode."}, status=400)


@require_POST
def api_support_ticket(request):
    payload = _json_payload(request)
    title = str(payload.get("title") or "").strip() or "Portal support request"
    message = str(payload.get("message") or "").strip()
    category = str(payload.get("category") or SupportTicket.CATEGORY_OTHER).strip().lower()
    priority = str(payload.get("priority") or SupportTicket.PRIORITY_MEDIUM).strip().lower()
    source = str(payload.get("source") or "portal_support").strip() or "portal_support"

    valid_categories = {value for value, _label in SupportTicket.CATEGORY_CHOICES}
    valid_priorities = {value for value, _label in SupportTicket.PRIORITY_CHOICES}
    if category not in valid_categories:
        category = SupportTicket.CATEGORY_OTHER
    if priority not in valid_priorities:
        priority = SupportTicket.PRIORITY_MEDIUM

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

    ticket = SupportTicket.objects.create(
        title=title,
        message=message,
        category=category,
        priority=priority,
        source=source,
        created_by=_current_user_or_none(request),
        complex=complex_obj,
        building=building,
        apartment=apartment,
        owner=owner,
    )
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_SYSTEM,
        title="Support ticket created",
        message=f"{ticket.title} was created from the portal support drawer.",
        actor=_actor(request),
        complex=complex_obj,
        building=building,
        apartment=apartment,
        owner=owner,
        metadata={"source": "portal_support_ticket", "ticketId": ticket.id},
    )
    return JsonResponse(
        {
            "ok": True,
            "ticketId": ticket.id,
            "adminUrl": f"/admin/portal/supportticket/{ticket.id}/change/",
            "portalData": safe_portal_data(request),
        }
    )


@require_POST
def api_logout(request):
    logout(request)
    return JsonResponse({"ok": True, "redirectUrl": "/"})


@require_POST
def api_create_complex(request):
    return JsonResponse(
        {
            "ok": False,
            "error": "Sector creation is disabled. This project uses one fixed sector.",
        },
        status=410,
    )


@require_POST
def api_create_building(request):
    payload = _json_payload(request)
    complex_id = payload.get("complex_id")
    number = str(payload.get("number") or "").strip()
    address = str(payload.get("address") or "").strip()

    if not complex_id or not number:
        return JsonResponse(
            {"ok": False, "error": "Complex and house number are required."},
            status=400,
        )

    try:
        complex_obj = Complex.objects.get(pk=complex_id)
    except (Complex.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"ok": False, "error": "Selected complex was not found."}, status=404)

    if Building.objects.filter(complex=complex_obj, number__iexact=number).exists():
        return JsonResponse(
            {"ok": False, "error": "This house already exists in the selected complex."},
            status=409,
        )

    building = Building.objects.create(
        complex=complex_obj,
        number=number,
        address=address,
        author=_actor(request),
    )
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_SYSTEM,
        title="Building created",
        message=f"House {building.number} was added to {complex_obj.title} from the portal.",
        actor=_actor(request),
        complex=complex_obj,
        building=building,
        metadata={"source": "portal_building_form"},
    )
    return JsonResponse(
        {
            "ok": True,
            "buildingId": building.id,
            "adminUrl": f"/admin/main_app/building/{building.id}/change/",
            "portalData": safe_portal_data(request),
        }
    )


@require_POST
def api_create_apartment(request):
    payload = _json_payload(request)
    building_id = payload.get("building_id")
    number = str(payload.get("number") or "").strip()
    area_raw = payload.get("area")
    section_name = str(payload.get("section_name") or "").strip()

    if not building_id or not number or area_raw in (None, ""):
        return JsonResponse(
            {"ok": False, "error": "Building, apartment number and area are required."},
            status=400,
        )

    try:
        building = Building.objects.select_related("complex").get(pk=building_id)
    except (Building.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"ok": False, "error": "Selected building was not found."}, status=404)

    try:
        area = float(area_raw)
    except (TypeError, ValueError):
        return JsonResponse({"ok": False, "error": "Area must be a valid number."}, status=400)

    if area <= 0:
        return JsonResponse({"ok": False, "error": "Area must be greater than zero."}, status=400)

    section = None
    if section_name:
        section, _created = building.sections.get_or_create(name=section_name)

    duplicate_qs = Apartment.objects.filter(building=building, number__iexact=number)
    if section:
        duplicate_qs = duplicate_qs.filter(section=section)
    elif section_name == "":
        duplicate_qs = duplicate_qs.filter(section__isnull=True)
    if duplicate_qs.exists():
        return JsonResponse(
            {"ok": False, "error": "This apartment already exists in the selected house/section."},
            status=409,
        )

    apartment = Apartment.objects.create(
        building=building,
        section=section,
        number=number,
        area=area,
        author=_actor(request),
    )
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_SYSTEM,
        title="Apartment created",
        message=f"Apartment {apartment.number} was added to house {building.number}.",
        actor=_actor(request),
        complex=building.complex,
        building=building,
        apartment=apartment,
        metadata={"source": "portal_apartment_form"},
    )
    return JsonResponse(
        {
            "ok": True,
            "apartmentId": apartment.id,
            "adminUrl": f"/admin/main_app/apartment/{apartment.id}/change/",
            "portalData": safe_portal_data(request),
        }
    )


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


@require_POST
def api_export_report(request):
    payload = _json_payload(request)
    context = str(payload.get("context") or payload.get("source_context") or "residential").strip().lower()
    if context not in {"residential", "transactions", "maintenance"}:
        source = str(payload.get("source") or "").lower()
        if "transaction" in source:
            context = "transactions"
        elif "maintenance" in source:
            context = "maintenance"
        else:
            context = "residential"

    export_format = str(payload.get("format") or "CSV").strip().upper()
    if export_format not in {"CSV", "XLSX", "PDF"}:
        export_format = "CSV"

    language = str(payload.get("language") or "en").strip().lower()
    source = str(payload.get("source") or "Current page").strip() or "Current page"
    portal_data = safe_portal_data(request)
    download = _render_export_payload(portal_data, context, export_format, source, language, payload)
    row_count = len(_portal_export_rows(portal_data, context, payload))

    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_EXPORT,
        title="Portal export generated",
        message=f"{export_format} export generated from {source}.",
        actor=_actor(request),
        metadata={
            "source": "portal_export_report",
            "context": context,
            "format": export_format,
            "language": language,
            "rowCount": row_count,
        },
    )
    return JsonResponse({"ok": True, "download": download, "portalData": safe_portal_data(request)})


@require_POST
def api_send_reminder(request):
    payload = _json_payload(request)
    owners = _collect_owner_targets(payload)
    if not owners:
        return JsonResponse({"ok": False, "error": "No backend owner targets were resolved."}, status=400)

    debtors = [owner for owner in owners if (owner.balance or Decimal("0")) < 0]
    targets = debtors or owners
    created = 0
    for owner in targets:
        apartment = owner.apartment if owner.apartment_id else None
        building = apartment.building if apartment and apartment.building_id else None
        complex_obj = building.complex if building and building.complex_id else None
        PortalNotification.objects.create(
            title=f"Reminder for {owner.fio}",
            message=f"Outstanding balance reminder for apartment {apartment.number if apartment else '-'}",
            severity=PortalNotification.SEVERITY_WARNING if (owner.balance or Decimal("0")) < 0 else PortalNotification.SEVERITY_INFO,
            status=PortalNotification.STATUS_UNREAD,
            pinned=False,
            event_at=timezone.now(),
            action_primary="Review owner",
            action_secondary="Archive",
            action_state="Reminder queued",
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=owner,
            created_by=_current_user_or_none(request),
        )
        created += 1

    first_owner = targets[0]
    apartment = first_owner.apartment if first_owner.apartment_id else None
    building = apartment.building if apartment and apartment.building_id else None
    complex_obj = building.complex if building and building.complex_id else None
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_REMINDER,
        title="Reminder queued",
        message=f"{created} reminder(s) were created from the portal.",
        actor=_actor(request),
        complex=complex_obj,
        building=building,
        apartment=apartment,
        owner=first_owner,
        metadata={"source": "portal_send_reminder", "count": created},
    )
    return JsonResponse({"ok": True, "count": created, "portalData": safe_portal_data(request)})


@require_POST
def api_assign_technician(request):
    payload = _json_payload(request)
    technician = str(payload.get("technician") or "Field Team A").strip() or "Field Team A"
    note = str(payload.get("note") or "").strip()

    maintenance = _optional_instance(MaintenanceTask, payload.get("maintenance_id"))
    if maintenance:
        maintenance.assigned_to = technician
        if maintenance.status in {MaintenanceTask.STATUS_PLANNED, MaintenanceTask.STATUS_SCHEDULED}:
            maintenance.status = MaintenanceTask.STATUS_IN_PROGRESS
        if note:
            maintenance.notes = "\n".join(filter(None, [maintenance.notes, note]))
        maintenance.save(update_fields=["assigned_to", "status", "notes"])
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_SYSTEM,
            title="Technician assigned",
            message=f"{technician} assigned to maintenance task {maintenance.title}.",
            actor=_actor(request),
            complex=maintenance.complex,
            building=maintenance.building,
            metadata={"source": "portal_assign_technician", "maintenanceId": maintenance.id},
        )
        return JsonResponse({"ok": True, "portalData": safe_portal_data(request)})

    alert = _optional_instance(SystemAlert, payload.get("alert_id"))
    if alert:
        alert.assigned_to = technician
        if alert.status == SystemAlert.STATUS_ACTIVE:
            alert.status = SystemAlert.STATUS_ACKNOWLEDGED
        if note:
            alert.message = "\n".join(filter(None, [alert.message, note]))
        alert.save(update_fields=["assigned_to", "status", "message"])
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_ALERT,
            title="Technician assigned",
            message=f"{technician} assigned to alert {alert.title}.",
            actor=_actor(request),
            complex=alert.complex,
            building=alert.building,
            apartment=alert.apartment,
            owner=alert.owner,
            metadata={"source": "portal_assign_technician", "alertId": alert.id},
        )
        return JsonResponse({"ok": True, "portalData": safe_portal_data(request)})

    notification = _optional_instance(PortalNotification, payload.get("notification_id"))
    if notification:
        notification.action_state = f"Assigned to {technician}"
        notification.status = PortalNotification.STATUS_READ
        notification.save(update_fields=["action_state", "status"])
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_ALERT,
            title="Notification assigned",
            message=f"{technician} assigned through notification center.",
            actor=_actor(request),
            complex=notification.complex,
            building=notification.building,
            apartment=notification.apartment,
            owner=notification.owner,
            metadata={"source": "portal_assign_technician", "notificationId": notification.id},
        )
        return JsonResponse({"ok": True, "portalData": safe_portal_data(request)})

    owners = _collect_owner_targets(payload)
    if owners:
        primary = owners[0]
        apartment = primary.apartment if primary.apartment_id else None
        building = apartment.building if apartment and apartment.building_id else None
        complex_obj = building.complex if building and building.complex_id else None
        alert = SystemAlert.objects.create(
            title=f"Resident follow-up: {primary.fio}",
            message=note or "Assigned from resident workflow.",
            category=SystemAlert.CATEGORY_OTHER,
            severity=SystemAlert.SEVERITY_INFO,
            status=SystemAlert.STATUS_ACKNOWLEDGED,
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=primary,
            assigned_to=technician,
            action_label="Open owner",
            metadata={"source": "portal_assign_technician"},
        )
        PortalNotification.objects.create(
            title=alert.title,
            message=alert.message,
            severity=PortalNotification.SEVERITY_INFO,
            status=PortalNotification.STATUS_UNREAD,
            event_at=timezone.now(),
            action_primary="Open owner",
            action_secondary="Resolve",
            action_state=f"Assigned to {technician}",
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=primary,
            created_by=_current_user_or_none(request),
        )
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_SYSTEM,
            title="Technician assigned",
            message=f"{technician} assigned for resident {primary.fio}.",
            actor=_actor(request),
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=primary,
            metadata={"source": "portal_assign_technician", "alertId": alert.id},
        )
        return JsonResponse({"ok": True, "portalData": safe_portal_data(request)})

    return JsonResponse({"ok": False, "error": "No backend target was resolved for assignment."}, status=400)


@require_POST
def api_assign_status(request):
    payload = _json_payload(request)
    context = str(payload.get("context") or "").strip().lower()
    status_value = str(payload.get("status") or "").strip()
    selected = payload.get("selected") or []
    if context not in {
        PortalStatusOverride.CONTEXT_RESIDENTIAL,
        PortalStatusOverride.CONTEXT_TRANSACTIONS,
        PortalStatusOverride.CONTEXT_MAINTENANCE,
    }:
        return JsonResponse({"ok": False, "error": "Unknown status context."}, status=400)
    if not status_value or not selected:
        return JsonResponse({"ok": False, "error": "Status value and selected rows are required."}, status=400)

    updated = 0
    user = _current_user_or_none(request)
    maintenance_status_map = {
        "scheduled": MaintenanceTask.STATUS_SCHEDULED,
        "in_progress": MaintenanceTask.STATUS_IN_PROGRESS,
        "completed": MaintenanceTask.STATUS_COMPLETED,
        "deferred": MaintenanceTask.STATUS_DEFERRED,
    }

    with transaction.atomic():
        for item in selected:
            target_type = str(item.get("target_type") or "").strip().lower()
            target_id = item.get("target_id")
            try:
                target_id = int(target_id)
            except (TypeError, ValueError):
                continue

            if context == PortalStatusOverride.CONTEXT_MAINTENANCE:
                task = _optional_instance(MaintenanceTask, target_id)
                if not task:
                    continue
                normalized = _status_choice_value(status_value, set(maintenance_status_map))
                task.status = maintenance_status_map.get(normalized, task.status)
                task.save(update_fields=["status"])
                updated += 1
                continue

            if context == PortalStatusOverride.CONTEXT_RESIDENTIAL and target_type not in {
                PortalStatusOverride.TARGET_COMPLEX,
                PortalStatusOverride.TARGET_BUILDING,
                PortalStatusOverride.TARGET_APARTMENT,
            }:
                continue
            if context == PortalStatusOverride.CONTEXT_TRANSACTIONS:
                target_type = PortalStatusOverride.TARGET_TRANSACTION

            PortalStatusOverride.objects.update_or_create(
                context=context,
                target_type=target_type,
                target_id=target_id,
                defaults={
                    "status_value": status_value,
                    "note": str(payload.get("note") or "").strip(),
                    "created_by": user,
                },
            )
            updated += 1

    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_STATUS,
        title="Status assigned",
        message=f"{status_value} applied to {updated} row(s) in {context}.",
        actor=_actor(request),
        metadata={"source": "portal_assign_status", "context": context, "updated": updated},
    )
    return JsonResponse({"ok": True, "updated": updated, "portalData": safe_portal_data(request)})
