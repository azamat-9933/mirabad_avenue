import json
import base64
import re
from collections import defaultdict
from urllib.parse import urlencode
from decimal import Decimal, InvalidOperation
from datetime import datetime, time, timedelta

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import logout
from django.core.paginator import EmptyPage, Paginator
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import DatabaseError, OperationalError, connection, transaction
from django.db.models import Case, IntegerField, Max, Prefetch, Q, Value, When
from django.http import JsonResponse
from django.http.request import RawPostDataException
from django.shortcuts import redirect, resolve_url
from django.urls import reverse
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django.utils.decorators import method_decorator
from django.utils.safestring import mark_safe
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from billing.models import BillingPeriod, Expense, HeatingApartmentUsage, HeatingRecord
from properties.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from payments.services import apply_balance_change, incoming_payment_q
from telegram_bot.notifications import NoticeNotSent, send_debt_notice
from portal.models import (
    AuditEvent,
    ChecklistItem,
    ChecklistNote,
    PortalNotification,
    PortalStatusOverride,
    SupportTicket,
    SystemAlert,
)

from .billing_notice import build_debt_notice, debt_of, notice_pdf, notice_telegram_text
from .backend_data import (
    _datetime,
    _display_name,
    _payment_type_labels,
    account_payment_totals,
    build_portal_data,
    hot_water_totals_by_complex,
    residential_override_maps,
    serialize_audit_event,
    serialize_complex,
    serialize_notification,
    serialize_resident,
    serialize_transaction,
    transaction_override_map,
)
from .report_exports import ALLOWED_REPORT_TYPES, build_report_payload, build_table_export


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


def _json_for_script_tag(value):
    """JSON safe to place inside <script type="application/json">: nothing in it can close the tag.

    Same escaping as Django's json_script, but keeps non-ASCII (Cyrillic names) unescaped, and uses
    str.replace, which is ~100x faster than str.translate on a multi-megabyte snapshot.
    """
    raw = json.dumps(value, ensure_ascii=False)
    return mark_safe(raw.replace("<", "\\u003C").replace(">", "\\u003E").replace("&", "\\u0026"))


@method_decorator(ensure_csrf_cookie, name="dispatch")
class PortalPageView(TemplateView):
    page_title = "Utility Manager"
    active_page = ""

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["page_title"] = self.page_title
        ctx["active_page"] = self.active_page
        ctx["backend_billing_data_json"] = _json_for_script_tag(safe_portal_data(self.request))
        return ctx


class DashboardView(PortalPageView):
    template_name = "portal/dashboard.html"
    page_title = "Utility Manager | Dashboard"
    active_page = "dashboard"


class ResidentialView(PortalPageView):
    template_name = "portal/residential.html"
    page_title = "Utility Manager | Properties"
    active_page = "residential"


class BillingView(PortalPageView):
    template_name = "portal/billing.html"
    page_title = "Utility Manager | Payments"
    active_page = "billing"


class BillingPeriodCreateView(PortalPageView):
    template_name = "portal/billing_period_create.html"
    page_title = "Utility Manager | Billing Period"
    active_page = "billing_period"

    def _redirect_with_filters(self, request):
        query = {}
        building_id = str(request.POST.get("building_id") or request.GET.get("building_id") or "").strip()
        period_id = str(request.POST.get("period_id") or request.GET.get("period_id") or "").strip()
        if building_id:
            query["building_id"] = building_id
        if period_id:
            query["period_id"] = period_id
        url = reverse("portal:billing_period_create")
        if query:
            url = f"{url}?{urlencode(query)}"
        return redirect(url)

    def _parse_int(self, value):
        try:
            return int(str(value or "").strip())
        except (TypeError, ValueError):
            return 0

    def _missing_billing_core_tables(self):
        existing = set(connection.introspection.table_names())
        required = {
            "billing_buildingservice",
            "billing_serviceexpense",
            "billing_heatingapartmentusage",
            "billing_hotwaterreading",
            "billing_charge",
            "billing_invoice",
            "billing_recalculationlog",
            "billing_heatingcalculationsummary",
            "billing_hotwatercalculationsummary",
        }
        return sorted(required - existing)

    def _parse_excluded_dates(self, raw_value, period):
        raw = str(raw_value or "").strip()
        if not raw:
            return []
        tokens = [token.strip() for token in re.split(r"[,\s]+", raw) if token.strip()]
        values = []
        seen = set()
        for token in tokens:
            date_value = parse_date(token)
            if not date_value:
                raise ValidationError(f"Noto'g'ri sana formati: {token}. Format YYYY-MM-DD.")
            if date_value < period.start_date or date_value > period.end_date:
                raise ValidationError(
                    f"Sana davr oralig'idan tashqarida: {token}. Davr: {period.start_date} - {period.end_date}."
                )
            key = date_value.isoformat()
            if key in seen:
                continue
            seen.add(key)
            values.append(key)
        values.sort()
        return values

    def post(self, request, *args, **kwargs):
        action = str(request.POST.get("action") or "").strip()
        try:
            if action == "add_expense":
                self._handle_add_expense(request)
            elif action == "update_status":
                self._handle_update_status(request)
            elif action == "update_heating_record":
                self._handle_update_heating_record(request)
            else:
                messages.error(request, "Noma'lum amal.")
        except ValidationError as exc:
            messages.error(request, str(exc))
        except (DatabaseError, OperationalError) as exc:
            messages.error(
                request,
                f"Bazada billing jadvallari to'liq emas yoki xatolik bor: {exc}",
            )
        return self._redirect_with_filters(request)

    def _handle_add_expense(self, request):
        period_id = self._parse_int(request.POST.get("period_id"))
        building_id = self._parse_int(request.POST.get("building_id"))
        service_type = str(request.POST.get("service_type") or "").strip()
        name = str(request.POST.get("name") or "").strip()
        amount_raw = str(request.POST.get("amount") or "").strip()

        if not period_id or not building_id:
            raise ValidationError("Davr va uy tanlanishi shart.")
        if service_type not in {"heating", "hot_water"}:
            raise ValidationError("Xizmat turi noto'g'ri.")
        if not name:
            raise ValidationError("Xarajat nomini kiriting.")
        try:
            amount = Decimal(amount_raw)
        except (InvalidOperation, TypeError):
            raise ValidationError("Summa noto'g'ri.")
        if amount <= 0:
            raise ValidationError("Summa 0 dan katta bo'lishi kerak.")

        period = BillingPeriod.objects.get(pk=period_id)
        building = Building.objects.get(pk=building_id)
        Expense.objects.create(
            period=period,
            building=building,
            service_type=service_type,
            name=name,
            amount=amount,
        )
        period.buildings.add(building)
        messages.success(request, "Xarajat qo'shildi.")

    def _handle_update_status(self, request):
        period_id = self._parse_int(request.POST.get("period_id"))
        if not period_id:
            raise ValidationError("Davr tanlanmadi.")
        status = str(request.POST.get("status") or "").strip().lower()
        period = BillingPeriod.objects.get(pk=period_id)
        missing_tables = self._missing_billing_core_tables()

        if status == period.status:
            messages.info(request, "Davr holati o'zgarmadi.")
            return
        if status == BillingPeriod.STATUS_CLOSED:
            if missing_tables:
                raise ValidationError(
                    "Hisoblarni yopish uchun billing migratsiyalarini qo'llang. "
                    f"Yo'q jadvallar: {', '.join(missing_tables)}."
                )
            period.close_period()
            messages.success(request, "Davr yopildi, hisoblar foydalanuvchilarga qo'yildi.")
            return
        if status == BillingPeriod.STATUS_REOPENED:
            if missing_tables:
                raise ValidationError(
                    "Davr holatini qayta ochish uchun billing migratsiyalarini qo'llang. "
                    f"Yo'q jadvallar: {', '.join(missing_tables)}."
                )
            period.reopen_period()
            messages.warning(request, "Davr qayta ochildi.")
            return
        if status == BillingPeriod.STATUS_DRAFT:
            period.status = BillingPeriod.STATUS_DRAFT
            period.closed_at = None
            period.save(update_fields=["status", "closed_at"])
            messages.success(request, "Davr holati draft ga o'zgartirildi.")
            return
        raise ValidationError("Noto'g'ri status.")

    def _handle_update_heating_record(self, request):
        period_id = self._parse_int(request.POST.get("period_id"))
        apartment_id = self._parse_int(request.POST.get("apartment_id"))
        if not period_id or not apartment_id:
            raise ValidationError("Davr yoki kvartira tanlanmadi.")

        period = BillingPeriod.objects.get(pk=period_id)
        apartment = Apartment.objects.select_related("building").get(pk=apartment_id)
        excluded_dates = self._parse_excluded_dates(request.POST.get("excluded_dates", ""), period)

        record, _ = HeatingRecord.objects.get_or_create(period=period, apartment=apartment)
        record.excluded_dates = excluded_dates
        record.save(update_fields=["excluded_dates"])

        for usage in HeatingApartmentUsage.objects.filter(
            service__period=period,
            service__building=apartment.building,
            apartment=apartment,
        ):
            usage.days_provided = record.heated_days
            usage.save(update_fields=["days_provided", "heated_area", "updated_at"])

        messages.success(request, f"Kv.{apartment.number} uchun isitish kunlari yangilandi.")

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        missing_core_tables = self._missing_billing_core_tables()
        can_count_charges = "billing_charge" not in missing_core_tables
        can_count_invoices = "billing_invoice" not in missing_core_tables

        buildings = list(
            Building.objects.select_related("complex").prefetch_related("apartments").order_by("number", "id")
        )
        periods = list(
            BillingPeriod.objects.prefetch_related("buildings").order_by("-start_date", "-id")
        )
        expenses = list(
            Expense.objects.select_related("building", "period")
            .order_by("-id")
        )

        expense_totals = defaultdict(Decimal)
        for expense in expenses:
            expense_totals[(expense.period_id, expense.building_id, expense.service_type)] += expense.amount or Decimal("0")

        periods_by_building = defaultdict(list)
        for period in periods:
            for building in period.buildings.all():
                periods_by_building[building.id].append(period)

        building_period_cards = []
        for building in buildings:
            period_rows = []
            for period in periods_by_building.get(building.id, []):
                period_rows.append(
                    {
                        "id": period.id,
                        "name": period.title,
                        "start_date": period.start_date,
                        "end_date": period.end_date,
                        "total_days": period.total_days,
                        "status": period.status,
                        "heating_expense": expense_totals[(period.id, building.id, "heating")],
                        "hot_water_expense": expense_totals[(period.id, building.id, "hot_water")],
                        "charges_count": (
                            period.charges.filter(
                                apartment__building=building,
                                is_cancelled=False,
                            ).count()
                            if can_count_charges
                            else 0
                        ),
                        "invoices_count": (
                            period.invoices.filter(apartment__building=building).count()
                            if can_count_invoices
                            else 0
                        ),
                    }
                )
            building_period_cards.append(
                {
                    "building": building,
                    "periods": period_rows,
                }
            )

        selected_building_id = self._parse_int(self.request.GET.get("building_id"))
        selected_period_id = self._parse_int(self.request.GET.get("period_id"))
        selected_building = None
        if selected_building_id:
            selected_building = next((item for item in buildings if item.id == selected_building_id), None)
        if not selected_building and building_period_cards:
            selected_building = building_period_cards[0]["building"]

        selected_period = None
        if selected_building:
            selected_periods = periods_by_building.get(selected_building.id, [])
            if selected_period_id:
                selected_period = next((item for item in selected_periods if item.id == selected_period_id), None)
            if not selected_period and selected_periods:
                selected_period = selected_periods[0]

        apartment_rows = []
        if selected_building and selected_period:
            apartment_queryset = selected_building.apartments.select_related("owner").order_by("number", "id")
            record_map = {
                record.apartment_id: record
                for record in HeatingRecord.objects.filter(
                    period=selected_period,
                    apartment__building=selected_building,
                ).select_related("apartment")
            }
            for apartment in apartment_queryset:
                record = record_map.get(apartment.id)
                heated_days = record.heated_days if record else selected_period.total_days
                not_heated = len(record.excluded_dates) if record else 0
                apartment_rows.append(
                    {
                        "apartment": apartment,
                        "owner": getattr(apartment, "owner", None),
                        "heated_days": heated_days,
                        "not_heated_days": not_heated,
                        "excluded_dates": ", ".join(record.excluded_dates) if record else "",
                        "record_admin_url": (
                            reverse("admin:billing_heatingrecord_change", args=[record.id])
                            if record else ""
                        ),
                    }
                )

        ctx.update(
            {
                "building_period_cards": building_period_cards,
                "billing_periods": periods,
                "selected_building": selected_building,
                "selected_period": selected_period,
                "apartment_rows": apartment_rows,
                "status_choices": BillingPeriod.STATUS_CHOICES,
                "missing_billing_core_tables": missing_core_tables,
            }
        )
        return ctx


class AnalyticsView(PortalPageView):
    template_name = "portal/analytics.html"
    page_title = "Utility Manager | Reports"
    active_page = "analytics"


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
@permission_classes([AllowAny])
def api_health(request):
    return JsonResponse({"status": "ok"})


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_root(request):
    return JsonResponse(
        {
            "name": "HydroFlow API",
            "docs": "/api/docs/",
            "schema": "/api/schema/",
            "health": "/api/health/",
            "portal_data": "/api/portal-data/",
        }
    )


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
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
        # A key may sort by several fields, e.g. house then apartment.
        for field in mapped if isinstance(mapped, tuple) else (mapped,):
            normalized.append(f"-{field}" if descending else field)
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


def _apply_period_filter(queryset, field_name, period, period_from="", period_to=""):
    from_date = parse_date(str(period_from or "").strip()) if period_from else None
    to_date = parse_date(str(period_to or "").strip()) if period_to else None
    if from_date or to_date:
        current_tz = timezone.get_current_timezone()
        if from_date:
            start_dt = timezone.make_aware(datetime.combine(from_date, time.min), current_tz)
            queryset = queryset.filter(**{f"{field_name}__gte": start_dt})
        if to_date:
            end_dt = timezone.make_aware(datetime.combine(to_date, time.max), current_tz)
            queryset = queryset.filter(**{f"{field_name}__lte": end_dt})
        return queryset
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


def _notification_severity_rank():
    return Case(
        When(severity=PortalNotification.SEVERITY_CRITICAL, then=Value(3)),
        When(severity=PortalNotification.SEVERITY_WARNING, then=Value(2)),
        default=Value(1),
        output_field=IntegerField(),
    )


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_list_residents(request):
    page, page_size = _page_params(request)
    status_value = _query_param(request, "status", "all").lower()
    telegram_value = _query_param(request, "telegram", "all").lower()
    contract_value = _query_param(request, "contract", "all").lower()
    owner_id_value = _query_param(request, "owner_id", "")
    search_value = _query_param(request, "search", "")
    name_value = _query_param(request, "name", "")
    phone_value = _query_param(request, "phone", "")
    telegram_user_value = _query_param(request, "telegram_user", "")
    building_value = _query_param(request, "building", "")
    apartment_value = _query_param(request, "apartment", "")
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    period_from = _query_param(request, "period_from", "")
    period_to = _query_param(request, "period_to", "")
    ordering_raw = _query_param(request, "ordering", "id")
    allowed_ordering = {
        "id": "id",
        "name": "fio",
        "phone": "phone",
        "telegram_user": "telegram_user",
        "telegram_status": "telegram_status",
        "contract": "has_contract",
        "building": "apartment__building__number",
        "balance": "balance",
        "created_at": "created_at",
        "last_payment": "last_payment_at",
        "apartment": ("apartment__building__number", "apartment__number"),
        "complex": "apartment__building__complex__title",
    }
    queryset = Owner.objects.select_related(
        "apartment",
        "apartment__section",
        "apartment__building",
        "apartment__building__complex",
    ).annotate(
        last_payment_at=Max(
            "apartment__transactions__created_at", filter=incoming_payment_q("apartment__transactions__")
        )
    )
    if owner_id_value:
        owner_id_digits = re.sub(r"[^\d]", "", owner_id_value)
        if owner_id_digits:
            queryset = queryset.filter(id=int(owner_id_digits))
    if search_value:
        # The fields the command search matches on the page: name, phone, apartment, house, sector.
        queryset = queryset.filter(
            Q(fio__icontains=search_value)
            | Q(phone__icontains=search_value)
            | Q(apartment__number__icontains=search_value)
            | Q(apartment__building__number__icontains=search_value)
            | Q(apartment__building__complex__title__icontains=search_value)
        )
    if name_value:
        queryset = queryset.filter(fio__icontains=name_value)
    if phone_value:
        queryset = queryset.filter(phone__icontains=phone_value)
    if telegram_user_value:
        queryset = queryset.filter(telegram_user__icontains=telegram_user_value)
    if status_value == "debtor":
        queryset = queryset.filter(balance__lt=0)
    elif status_value == "paid":
        queryset = queryset.filter(balance__gte=0)
    if telegram_value in {"connected", "true", "yes"}:
        queryset = queryset.filter(telegram_status=Owner.TELEGRAM_CONNECTED)
    elif telegram_value in {"not_linked", "offline", "false", "no", "pending", "review"}:
        queryset = queryset.exclude(telegram_status=Owner.TELEGRAM_CONNECTED)
    if contract_value == "true":
        queryset = queryset.filter(has_contract=True)
    elif contract_value == "false":
        queryset = queryset.filter(Q(has_contract=False) | Q(has_contract__isnull=True))
    if building_value:
        queryset = queryset.filter(
            Q(apartment__building__number__icontains=building_value)
            | Q(apartment__building__address__icontains=building_value)
            | Q(apartment__building__complex__title__icontains=building_value)
        )
    if apartment_value:
        queryset = queryset.filter(apartment__number__icontains=apartment_value)
    queryset = _apply_related_district_filter(
        queryset,
        district_value,
        "apartment__building__complex__title",
        "apartment__building__complex__address",
    )
    queryset = _apply_period_filter(queryset, "created_at", period_value, period_from, period_to)
    complex_id = _query_int(request, "complex_id", 0)
    building_id = _query_int(request, "building_id", 0)
    apartment_id = _query_int(request, "apartment_id", 0)
    if complex_id:
        queryset = queryset.filter(apartment__building__complex_id=complex_id)
    if building_id:
        queryset = queryset.filter(apartment__building_id=building_id)
    if apartment_id:
        queryset = queryset.filter(apartment_id=apartment_id)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "id")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "id"), page, page_size)
    results = [serialize_resident(owner.apartment, owner, owner.last_payment_at) for owner in page_obj.object_list]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_list_transactions(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    status_value = _query_param(request, "status", "").lower()
    payment_type = _query_param(request, "payment_type", "").lower()
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    period_from = _query_param(request, "period_from", "")
    period_to = _query_param(request, "period_to", "")
    ordering_raw = _query_param(request, "ordering", "-created_at")
    allowed_ordering = {
        "id": "id",
        "created_at": "created_at",
        "resident": "apartment__owner__fio",
        "operator": "created_by",
        "method": "payment_type",
        "type": "payment_type",
        "amount": "amount",
        "balance": "balance_after",
        "status": "balance_status_rank",
    }
    queryset = Transaction.objects.filter(apartment__isnull=False).select_related(
        "apartment",
        "apartment__owner",
        "apartment__building",
        "apartment__building__complex",
    ).annotate(
        status_rank=Case(
            When(amount__gt=0, then=Value(2)),
            default=Value(1),
            output_field=IntegerField(),
        ),
        balance_status_rank=Case(
            When(balance_after__lt=0, then=Value(2)),
            default=Value(1),
            output_field=IntegerField(),
        )
    )
    if search:
        queryset = queryset.filter(
            Q(apartment__owner__fio__icontains=search)
            | Q(apartment__owner__phone__icontains=search)
            | Q(description__icontains=search)
            | Q(external_id__icontains=search)
            | Q(apartment__number__icontains=search)
            | Q(apartment__building__number__icontains=search)
            | Q(apartment__building__complex__title__icontains=search)
        )
    owner_id = _query_int(request, "owner_id", 0)
    complex_id = _query_int(request, "complex_id", 0)
    building_id = _query_int(request, "building_id", 0)
    apartment_id = _query_int(request, "apartment_id", 0)
    if owner_id:
        queryset = queryset.filter(apartment__owner__id=owner_id)
    if complex_id:
        queryset = queryset.filter(apartment__building__complex_id=complex_id)
    if building_id:
        queryset = queryset.filter(apartment__building_id=building_id)
    if apartment_id:
        queryset = queryset.filter(apartment_id=apartment_id)
    if payment_type:
        queryset = queryset.filter(payment_type=payment_type)
    queryset = _apply_related_district_filter(
        queryset,
        district_value,
        "apartment__building__complex__title",
        "apartment__building__complex__address",
    )
    queryset = _apply_period_filter(queryset, "created_at", period_value, period_from, period_to)
    if status_value in {"success", "paid"}:
        queryset = queryset.filter(balance_after__gte=0)
    elif status_value in {"pending", "overdue", "debt", "debtor"}:
        queryset = queryset.filter(balance_after__lt=0)
    elif status_value:
        override_ids = PortalStatusOverride.objects.filter(
            context=PortalStatusOverride.CONTEXT_TRANSACTIONS,
            target_type=PortalStatusOverride.TARGET_TRANSACTION,
            status_value__iexact=status_value,
        ).values_list("target_id", flat=True)
        queryset = queryset.filter(pk__in=override_ids)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "-created_at")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "-id"), page, page_size)
    overrides = transaction_override_map([item.id for item in page_obj.object_list])
    labels = _payment_type_labels()
    results = [
        serialize_transaction(item, item.apartment, getattr(item.apartment, "owner", None), labels, overrides.get(item.id))
        for item in page_obj.object_list
    ]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_list_alerts(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    severity = _query_param(request, "severity", "").lower()
    status_value = _query_param(request, "status", "").lower()
    if status_value == "resolved":
        status_value = PortalNotification.STATUS_ARCHIVED
    pinned = _query_bool(request, "pinned", None)
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    period_from = _query_param(request, "period_from", "")
    period_to = _query_param(request, "period_to", "")
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
    )
    if status_value == PortalNotification.STATUS_ARCHIVED:
        queryset = queryset.filter(status=PortalNotification.STATUS_ARCHIVED)
    else:
        queryset = queryset.exclude(status=PortalNotification.STATUS_ARCHIVED)
    queryset = queryset.annotate(
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
    queryset = _apply_period_filter(queryset, "event_at", period_value, period_from, period_to)
    ordering = _normalize_ordering(ordering_raw, allowed_ordering, "-pinned")
    page_obj = _paginate_queryset(queryset.order_by(*ordering, "-id"), page, page_size)
    page_items = list(page_obj.object_list)
    alert_map = {}
    notification_ids = [item.id for item in page_items]
    if notification_ids:
        for alert in SystemAlert.objects.filter(metadata__notification_id__in=notification_ids).exclude(status=SystemAlert.STATUS_RESOLVED).order_by("-detected_at", "-id"):
            notification_id = int((alert.metadata or {}).get("notification_id") or 0)
            if notification_id and notification_id not in alert_map:
                alert_map[notification_id] = alert.id
    results = [serialize_notification(item, alert_map.get(item.id, "")) for item in page_items]
    return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_list_audit(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    event_type = _query_param(request, "type", "").lower()
    actor = _query_param(request, "actor", "")
    district_value = _query_param(request, "district", "")
    period_value = _query_param(request, "period", "all").lower()
    period_from = _query_param(request, "period_from", "")
    period_to = _query_param(request, "period_to", "")
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
        queryset = _apply_period_filter(queryset, "created_at", period_value, period_from, period_to)
        page_obj = _paginate_queryset(queryset.order_by(*ordering, "-id"), page, page_size)
        results = [serialize_audit_event(item) for item in page_obj.object_list]
        return _paginated_response(results, page_obj.number, page_size, queryset.count(), ordering_raw)
    except (DatabaseError, OperationalError):
        # Fresh DB can open the portal before portal migrations are applied.
        # Keep API contract stable instead of returning HTTP 500.
        return _paginated_response([], page, page_size, 0, ordering_raw)


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_export_audit(request):
    payload = _json_payload(request)
    language = str(payload.get("language") or "en").strip().lower()
    lang = language if language in {"en", "ru", "uz"} else "en"
    headers = {
        "en": ["Audit ID", "Date and time", "Event type", "Title", "Message", "Actor", "Sector", "House", "Apartment", "Resident", "Admin link"],
        "ru": ["ID аудита", "Дата и время", "Тип события", "Заголовок", "Сообщение", "Исполнитель", "Сектор", "Дом", "Квартира", "Абонент", "Ссылка admin"],
        "uz": ["Audit ID", "Sana va vaqt", "Hodisa turi", "Sarlavha", "Xabar", "Ijrochi", "Sektor", "Uy", "Xonadon", "Abonent", "Admin havolasi"],
    }
    title = {"en": "Audit Log", "ru": "Журнал аудита", "uz": "Audit jurnali"}[lang]
    search = str(payload.get("search") or "").strip()
    event_type = str(payload.get("type") or "").strip().lower()
    district_value = str(payload.get("district") or "").strip()
    period_value = str(payload.get("period") or "all").strip().lower()
    period_from = str(payload.get("period_from") or "").strip()
    period_to = str(payload.get("period_to") or "").strip()
    try:
        queryset = AuditEvent.objects.select_related("complex", "building", "apartment", "owner")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(message__icontains=search)
                | Q(actor__icontains=search)
                | Q(owner__fio__icontains=search)
                | Q(complex__title__icontains=search)
                | Q(building__number__icontains=search)
                | Q(apartment__number__icontains=search)
            )
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        queryset = _apply_related_district_filter(queryset, district_value, "complex__title", "complex__address", "message")
        queryset = _apply_period_filter(queryset, "created_at", period_value, period_from, period_to)
        rows = []
        for event in queryset.order_by("-created_at", "-id")[:1000]:
            rows.append([
                event.id,
                _datetime(event.created_at),
                event.get_event_type_display(),
                event.title,
                event.message,
                event.actor,
                event.complex.title if event.complex_id and event.complex else "",
                event.building.number if event.building_id and event.building else "",
                event.apartment.number if event.apartment_id and event.apartment else "",
                event.owner.fio if event.owner_id and event.owner else "",
                f"/admin/portal/auditevent/{event.id}/change/",
            ])
    except (DatabaseError, OperationalError):
        rows = []
    generated = build_table_export(title, headers[lang], rows, "XLSX", f"audit-log-{timezone.localtime():%Y%m%d-%H%M}", lang)
    download = _encode_download(generated["filename"], generated["mime"], generated["content"])
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_EXPORT,
        title="Audit log exported",
        message=f"XLSX audit log exported with {len(rows)} rows.",
        actor=_actor(request),
        metadata={"source": "portal_audit_export", "format": "XLSX", "rowCount": len(rows), "language": lang},
    )
    return JsonResponse({"ok": True, "download": download, "portalData": safe_portal_data(request)})


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_list_complexes(request):
    page, page_size = _page_params(request)
    search = _query_param(request, "search", "")
    debt_status = _query_param(request, "debt_status", "").lower()
    district_value = _query_param(request, "district", "")
    ordering_raw = _query_param(request, "ordering", "complex")
    apartment_queryset = Apartment.objects.select_related("section", "owner").order_by("number")
    building_queryset = Building.objects.prefetch_related(
        Prefetch("apartments", queryset=apartment_queryset),
        "sections",
    ).order_by("number")
    queryset = Complex.objects.prefetch_related(Prefetch("buildings", queryset=building_queryset))
    if district_value and district_value.lower() != "all":
        queryset = queryset.filter(Q(title__icontains=district_value) | Q(address__icontains=district_value))
    override_maps = residential_override_maps()
    hot_water_by_complex = hot_water_totals_by_complex()
    payment_totals = account_payment_totals()
    all_results = []
    for complex_obj in queryset:
        row, _residents = serialize_complex(
            complex_obj,
            owner_for=lambda apartment: getattr(apartment, "owner", None),
            payment_totals_for=lambda apartment: payment_totals.get(apartment.id, (0.0, None)),
            override_maps=override_maps,
            hot_water_by_complex=hot_water_by_complex,
        )
        # List-only aliases kept for API stability (sorting below uses them too).
        row["debt"] = row["extraDebt"]
        row["finances"] = row["health"]
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
        "systems": lambda item: (-float(item.get("totalArea", 0) or 0), str(item.get("name", "")).lower()),
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
    parsed_data = getattr(request, "data", None)
    if parsed_data is not None:
        if hasattr(parsed_data, "dict"):
            return parsed_data.dict()
        if isinstance(parsed_data, dict):
            return dict(parsed_data)
        return parsed_data
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except (RawPostDataException, UnicodeDecodeError, json.JSONDecodeError):
        return {}


def _decimal_or_zero(value):
    try:
        return Decimal(str(value or "0").replace(",", "").strip() or "0")
    except (InvalidOperation, ValueError):
        return Decimal("0")


def _to_bool(value):
    if isinstance(value, bool):
        return value
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _actor(request):
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        return user.get_username()
    return "Portal"



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


def _portal_payment_description(operation: str, channel: str) -> str:
    if operation == "credit" and channel in {"card", "terminal"}:
        return "[portal:card-credit] Portal credit via card."
    if operation == "credit" and channel == "transfer":
        return "[portal:transfer-credit] Portal credit via card transfer."
    if operation == "credit":
        return "[portal:cash-credit] Portal credit via cash."
    return "[portal:balance-debit] Portal manual balance subtraction."



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


def _backend_id_set(value):
    return {int(item) for item in _unique_ints(value)}


def _export_range_start(value):
    parsed = parse_datetime(str(value or "").strip()) if value else None
    if not parsed:
        return None
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    return timezone.localtime(parsed)


def _export_range_end(value):
    parsed = parse_datetime(str(value or "").strip()) if value else None
    if not parsed:
        return None
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    return timezone.localtime(parsed)


def _export_row_datetime(value):
    if not value:
        return None
    try:
        parsed = datetime.strptime(str(value).strip(), "%d.%m.%Y, %H:%M")
    except ValueError:
        return None
    return timezone.make_aware(parsed, timezone.get_current_timezone())


def _export_transaction_items(transaction_ids, owner_ids, apartment_ids, building_ids, complex_ids, date_from, date_to):
    """Serialized ledger rows for a table export, read from the database (the snapshot holds only recent rows).

    The query narrows by ids and a slightly wider date window; the caller still applies the exact
    minute-level date filter to the serialized rows, as before.
    """
    queryset = Transaction.objects.filter(apartment__isnull=False).select_related(
        "apartment",
        "apartment__owner",
        "apartment__building",
        "apartment__building__complex",
    )
    if transaction_ids:
        queryset = queryset.filter(id__in=transaction_ids)
    if owner_ids:
        queryset = queryset.filter(apartment__owner__id__in=owner_ids)
    if apartment_ids:
        queryset = queryset.filter(apartment_id__in=apartment_ids)
    if building_ids:
        queryset = queryset.filter(apartment__building_id__in=building_ids)
    if complex_ids:
        queryset = queryset.filter(apartment__building__complex_id__in=complex_ids)
    if date_from:
        queryset = queryset.filter(created_at__gte=date_from - timedelta(minutes=1))
    if date_to:
        queryset = queryset.filter(created_at__lt=date_to + timedelta(minutes=1))
    labels = _payment_type_labels()
    overrides = transaction_override_map()
    current_tz = timezone.get_current_timezone()
    for item in queryset.order_by("-created_at", "-id").iterator(chunk_size=2000):
        yield serialize_transaction(
            item, item.apartment, getattr(item.apartment, "owner", None), labels, overrides.get(item.id), current_tz
        )


def _portal_export_rows(portal_data, context, filters=None):
    filters = filters or {}
    complex_ids = _backend_id_set(filters.get("complex_backend_ids"))
    building_ids = _backend_id_set(filters.get("building_backend_ids"))
    apartment_ids = _backend_id_set(filters.get("apartment_backend_ids"))
    transaction_ids = _backend_id_set(filters.get("transaction_backend_ids"))
    owner_ids = _backend_id_set(filters.get("owner_ids") or [filters.get("owner_id")])
    date_from = _export_range_start(filters.get("date_from"))
    date_to = _export_range_end(filters.get("date_to"))
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
        for item in _export_transaction_items(transaction_ids, owner_ids, apartment_ids, building_ids, complex_ids, date_from, date_to):
            row_datetime = _export_row_datetime(item.get("createdAt") or item.get("date"))
            if date_from and row_datetime and row_datetime < date_from:
                continue
            if date_to and row_datetime and row_datetime > date_to:
                continue
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
            # Same columns as the resident history window, plus the resident and the status.
            rows.append([
                item.get("backendId", ""),
                item.get("createdAt") or item.get("date", ""),
                item.get("residentName", item.get("residentId", "")),
                item.get("createdBy") or "System",
                item.get("method") or item.get("type", ""),
                f'{item.get("signedAmount", item.get("amount", 0)):,.0f} UZS',
                f'{item.get("balanceBefore", 0):,.0f} UZS',
                f'{item.get("balanceAfter", 0):,.0f} UZS',
                item.get("status", ""),
            ])
    return rows


def _render_export_payload(portal_data, context, export_format, source, language, filters=None, rows=None):
    titles = {
        "residential": {"en": "Residential Export", "ru": "Экспорт жилых объектов", "uz": "Turar joylar eksporti"},
        "transactions": {"en": "Transaction Export", "ru": "Экспорт транзакций", "uz": "Tranzaksiyalar eksporti"},
    }
    headers = {
        "residential": {
            "en": ["Complex", "District", "Buildings", "Units", "Risk", "Debt"],
            "ru": ["Комплекс", "Район", "Домов", "Квартир", "Статус", "Долг"],
            "uz": ["Majmua", "Tuman", "Uylar", "Xonadonlar", "Holat", "Qarz"],
        },
        "transactions": {
            "en": ["ID", "Date time", "Resident", "Operator", "Payment type", "Amount", "Balance before", "Balance after", "Status"],
            "ru": ["ID", "Дата и время", "Житель", "Оператор", "Тип оплаты", "Сумма", "Баланс до", "Баланс после", "Статус"],
            "uz": ["ID", "Sana va vaqt", "Rezident", "Operator", "To'lov turi", "Summa", "Balans oldin", "Balans keyin", "Holat"],
        },
    }
    lang = language if language in {"en", "ru", "uz"} else "en"
    if rows is None:
        rows = _portal_export_rows(portal_data, context, filters)
    header = headers.get(context, headers["residential"])[lang]
    title = titles.get(context, titles["residential"])[lang]
    filename_base = f"{context or 'export'}-{timezone.localtime():%Y%m%d-%H%M}"

    generated = build_table_export(title, header, rows, export_format, filename_base, lang)
    return _encode_download(generated["filename"], generated["mime"], generated["content"])


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_checklist_item(request):
    payload = _json_payload(request)
    mode = str(payload.get("mode") or "toggle").strip().lower()

    if mode == "toggle":
        item = _optional_instance(ChecklistItem, payload.get("item_id"))
        if not item:
            return JsonResponse({"ok": False, "error": "Checklist item was not found."}, status=404)
        item.done = not item.done
        item.save(update_fields=["done"])
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_NOTE,
            title="Checklist item updated",
            message=f"{item.title}: {'done' if item.done else 'open'}",
            actor=_actor(request),
            metadata={"source": "portal_checklist_item", "itemId": item.id, "done": item.done},
        )
        return JsonResponse({"ok": True, "itemId": item.id, "done": item.done, "portalData": safe_portal_data(request)})

    if mode == "complete_visible":
        raw_ids = payload.get("item_ids") or []
        backend_ids = [int(str(item_id)) for item_id in raw_ids if str(item_id).isdigit()]
        if backend_ids:
            ChecklistItem.objects.filter(id__in=backend_ids).update(done=True)
            AuditEvent.objects.create(
                event_type=AuditEvent.TYPE_NOTE,
                title="Checklist items completed",
                message=f"{len(backend_ids)} checklist items marked complete.",
                actor=_actor(request),
                metadata={"source": "portal_checklist_item", "itemIds": backend_ids, "mode": mode},
            )
        return JsonResponse({"ok": True, "count": len(backend_ids), "portalData": safe_portal_data(request)})

    if mode == "reset_all":
        ChecklistItem.objects.update(done=False)
        ChecklistNote.objects.update(done=False)
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_NOTE,
            title="Checklist reset",
            message="Checklist items and notes were reset from the portal.",
            actor=_actor(request),
            metadata={"source": "portal_checklist_item", "mode": mode},
        )
        return JsonResponse({"ok": True, "portalData": safe_portal_data(request)})

    if mode == "mark_reviewed":
        item_count = ChecklistItem.objects.filter(is_active=True, done=False).update(done=True)
        note_count = ChecklistNote.objects.filter(done=False).update(done=True)
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_NOTE,
            title="Checklist reviewed",
            message=f"Checklist reviewed: {item_count} tasks and {note_count} notes marked complete.",
            actor=_actor(request),
            metadata={
                "source": "portal_checklist_item",
                "mode": mode,
                "itemCount": item_count,
                "noteCount": note_count,
            },
        )
        return JsonResponse(
            {
                "ok": True,
                "itemCount": item_count,
                "noteCount": note_count,
                "portalData": safe_portal_data(request),
            }
        )

    return JsonResponse({"ok": False, "error": "Unknown checklist item mode."}, status=400)


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
@permission_classes([AllowAny])
def api_logout(request):
    # Public so an already-expired session still gets the redirect target.
    logout(request)
    return JsonResponse({"ok": True, "redirectUrl": resolve_url(settings.LOGOUT_REDIRECT_URL)})


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_create_complex(request):
    return JsonResponse(
        {
            "ok": False,
            "error": "Sector creation is disabled. This project uses one fixed sector.",
        },
        status=410,
    )


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_create_apartment(request):
    payload = _json_payload(request)
    building_id = payload.get("building_id")
    number = str(payload.get("number") or "").strip()
    area_raw = payload.get("area")

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

    duplicate_qs = Apartment.objects.filter(building=building, number__iexact=number)
    if duplicate_qs.exists():
        return JsonResponse(
            {"ok": False, "error": "This apartment already exists in the selected house."},
            status=409,
        )

    apartment = Apartment.objects.create(
        building=building,
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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
        # Telegram starts as not connected; the bot connects the resident when they register there.
        # No opening balance: the resident takes over the apartment account, which changes only
        # through ledger transactions (Add payment).
        owner = Owner.objects.create(
            fio=fio,
            phone=phone[:20],
            apartment=apartment,
            has_contract=_to_bool(payload.get("has_contract")),
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


def _notice_owner(owner_id_value):
    owner_id = re.sub(r"\D", "", str(owner_id_value or ""))
    if not owner_id:
        return None
    return (
        Owner.objects.select_related("apartment", "apartment__building", "apartment__building__complex")
        .filter(pk=int(owner_id))
        .first()
    )


def _notice_for(request, owner, language):
    """The payment notice for the resident; the operator issuing it is the signed-in user."""
    return build_debt_notice(owner, language, _display_name(request.user))


def _log_notice(request, owner, title, channel):
    apartment = owner.apartment
    debt = debt_of(owner)
    AuditEvent.objects.create(
        event_type=AuditEvent.TYPE_REMINDER,
        title=title,
        message=f"Payment notice for {debt:,.2f} UZS ({channel}) for {owner.fio}.",
        actor=_actor(request),
        complex=apartment.building.complex,
        building=apartment.building,
        apartment=apartment,
        owner=owner,
        metadata={"channel": channel, "debt": str(debt)},
    )


@extend_schema(responses=OpenApiTypes.OBJECT)
@api_view(["GET"])
def api_billing_notice_preview(request):
    """The payment notice of one resident, as shown in the portal window (?owner_id=&language=uz|ru)."""
    owner = _notice_owner(request.GET.get("owner_id"))
    if owner is None:
        return JsonResponse({"ok": False, "error": "Resident was not found."}, status=404)
    return JsonResponse({"ok": True, "notice": _notice_for(request, owner, request.GET.get("language"))})


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_billing_notice_pdf(request):
    """The payment notice of one resident as a PDF download (same text as the preview)."""
    payload = _json_payload(request)
    owner = _notice_owner(payload.get("owner_id"))
    if owner is None:
        return JsonResponse({"ok": False, "error": "Resident was not found."}, status=404)
    if debt_of(owner) <= 0:
        return JsonResponse({"ok": False, "error": "The resident has no debt."}, status=409)

    notice = _notice_for(request, owner, payload.get("language"))
    filename = f"notice-{owner.apartment.building.number}-{owner.apartment.number}-{timezone.localdate():%Y%m%d}.pdf"
    _log_notice(request, owner, "Payment notice downloaded as PDF", "pdf")
    return JsonResponse({
        "ok": True,
        "download": {
            "filename": re.sub(r"[^\w.-]", "_", filename),
            "mime": "application/pdf",
            "content": base64.b64encode(notice_pdf(notice)).decode("ascii"),
        },
    })


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_billing_notice_telegram(request):
    """Send the selected resident's payment notice to their Telegram through the residents' bot."""
    payload = _json_payload(request)
    owner = _notice_owner(payload.get("owner_id"))
    if owner is None:
        return JsonResponse({"ok": False, "error": "Resident was not found."}, status=404)

    notice = _notice_for(request, owner, payload.get("language"))
    try:
        send_debt_notice(owner, notice_telegram_text(notice))
    except NoticeNotSent as error:
        return JsonResponse({"ok": False, "error": str(error)}, status=error.status)

    _log_notice(request, owner, "Billing notice sent to Telegram", "telegram")
    return JsonResponse({"ok": True, "sent": True, "ownerId": owner.id})


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_create_payment(request):
    payload = _json_payload(request)
    owner_id_raw = payload.get("owner_id")
    operation = str(payload.get("operation") or "credit").strip().lower()
    channel = str(payload.get("channel") or "cash").strip().lower()
    amount = _decimal_or_zero(payload.get("amount"))

    owner_id_digits = re.sub(r"[^\d]", "", str(owner_id_raw or ""))
    if not owner_id_digits:
        return JsonResponse({"ok": False, "error": "Resident ID is required."}, status=400)
    if amount <= 0:
        return JsonResponse({"ok": False, "error": "Amount must be greater than zero."}, status=400)
    if operation not in {"credit", "debit"}:
        return JsonResponse({"ok": False, "error": "Unknown payment operation."}, status=400)
    # Operators take cash, a card via the terminal, or a transfer to the company card made at the
    # office; Payme and Click payments arrive from those services' own integrations, never by hand.
    if operation == "credit" and channel not in {"cash", "card", "terminal", "transfer"}:
        return JsonResponse({"ok": False, "error": "Payment channel must be cash, card or card transfer."}, status=400)

    try:
        owner = Owner.objects.select_related(
            "apartment",
            "apartment__building",
            "apartment__building__complex",
        ).get(pk=int(owner_id_digits))
    except (Owner.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"ok": False, "error": "Resident was not found."}, status=404)

    apartment = owner.apartment
    building = apartment.building if apartment else None
    complex_obj = building.complex if building else None
    signed_amount = amount if operation == "credit" else -amount

    payment_type = Transaction.TYPE_CASH if operation == "credit" and channel == "cash" else Transaction.TYPE_MANUAL

    description = _portal_payment_description(operation, channel)
    actor = _actor(request)

    with transaction.atomic():
        transaction_row = apply_balance_change(
            owner.id,
            signed_amount,
            payment_type,
            description=description,
            created_by=actor,
        )
        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_BALANCE,
            title="Resident balance updated",
            message=(
                f"{owner.fio}: {'credit' if operation == 'credit' else 'debit'} "
                f"{amount} UZS via {channel if operation == 'credit' else 'adjustment'}."
            ),
            actor=actor,
            complex=complex_obj,
            building=building,
            apartment=apartment,
            owner=owner,
            metadata={
                "source": "portal_add_payment_modal",
                "transaction_id": transaction_row.id,
                "operation": operation,
                "channel": channel if operation == "credit" else "adjustment",
                "amount": str(amount),
                "balance_before": str(transaction_row.balance_before),
                "balance_after": str(transaction_row.balance_after),
            },
        )

    return JsonResponse(
        {
            "ok": True,
            "transactionId": transaction_row.id,
            "ownerId": owner.id,
            "balance": float(transaction_row.balance_after),
            "portalData": safe_portal_data(request),
        }
    )


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_usage_report_export(request):
    payload = _json_payload(request)
    export_format = str(payload.get("format") or "XLSX").strip().upper()
    if export_format not in {"XLSX", "PDF"}:
        export_format = "XLSX"
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_system_alerts_configure(request):
    payload = _json_payload(request)
    mode = str(payload.get("mode") or "create").strip().lower()
    alert = _optional_instance(SystemAlert, payload.get("alert_id"))

    def portal_response(extra):
        response_payload = {"ok": True, **extra}
        try:
            response_payload["portalData"] = safe_portal_data(request)
        except Exception as exc:
            # The database write has already succeeded. Do not turn a saved
            # alert into a 500 just because the dashboard refresh snapshot failed.
            response_payload["portalData"] = None
            response_payload["warning"] = f"Portal refresh failed after saving: {exc}"
        return JsonResponse(response_payload)

    if mode in {"acknowledge", "resolve"}:
        actor_name = _actor(request)
        notification = _optional_instance(PortalNotification, payload.get("notification_id"))
        if not alert and notification:
            alert = (
                SystemAlert.objects.filter(metadata__notification_id=notification.id)
                .order_by("-detected_at", "-id")
                .first()
            )
        if not alert and not notification:
            return JsonResponse({"ok": False, "error": "System alert was not found."}, status=404)

        if alert:
            alert.status = SystemAlert.STATUS_ACKNOWLEDGED if mode == "acknowledge" else SystemAlert.STATUS_RESOLVED
            if mode == "resolve":
                alert.resolved_at = timezone.now()
            alert.save(update_fields=["status", "resolved_at"])

        if not notification and alert:
            notification_id = (alert.metadata or {}).get("notification_id")
            notification = _optional_instance(PortalNotification, notification_id)
        if notification:
            notification.status = PortalNotification.STATUS_READ if mode == "acknowledge" else PortalNotification.STATUS_ARCHIVED
            notification.action_state = "Acknowledged from dashboard" if mode == "acknowledge" else f"Resolved by {actor_name}"
            notification.save(update_fields=["status", "action_state"])

        if alert:
            AuditEvent.objects.create(
                event_type=AuditEvent.TYPE_ALERT,
                title="System alert updated",
                message=f"{alert.title} was {mode}d from the portal.",
                actor=actor_name,
                complex=alert.complex,
                building=alert.building,
                apartment=alert.apartment,
                owner=alert.owner,
                metadata={"source": "portal_system_alerts", "mode": mode, "alertId": alert.id},
            )
            return portal_response(
                {
                    "alertId": alert.id,
                    "adminUrl": f"/admin/portal/systemalert/{alert.id}/change/",
                }
            )

        AuditEvent.objects.create(
            event_type=AuditEvent.TYPE_ALERT,
            title="Notification updated",
            message=f"{notification.title} was {mode}d from the portal.",
            actor=actor_name,
            complex=notification.complex,
            building=notification.building,
            apartment=notification.apartment,
            owner=notification.owner,
            metadata={
                "source": "portal_system_alerts",
                "mode": mode,
                "notificationId": notification.id,
            },
        )
        return portal_response(
            {
                "notificationId": notification.id,
                "adminUrl": f"/admin/portal/portalnotification/{notification.id}/change/",
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
            action_state="",
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

    return portal_response(
        {
            "alertId": alert.id,
            "adminUrl": f"/admin/portal/systemalert/{alert.id}/change/",
        }
    )


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_export_report(request):
    payload = _json_payload(request)
    report_type = str(payload.get("report_type") or "").strip().lower()
    context = str(payload.get("context") or payload.get("source_context") or "residential").strip().lower()
    if context not in {"residential", "transactions"}:
        source = str(payload.get("source") or "").lower()
        context = "transactions" if "transaction" in source else "residential"

    export_format = str(payload.get("format") or "XLSX").strip().upper()
    if export_format not in {"XLSX", "PDF"}:
        export_format = "XLSX"

    language = str(payload.get("language") or "en").strip().lower()
    source = str(payload.get("source") or "Current page").strip() or "Current page"
    if report_type in ALLOWED_REPORT_TYPES:
        generated = build_report_payload(payload, language, export_format)
        download = _encode_download(generated["filename"], generated["mime"], generated["content"])
        row_count = generated.get("row_count", 0)
        context = report_type
    else:
        portal_data = safe_portal_data(request)
        rows = _portal_export_rows(portal_data, context, payload)
        download = _render_export_payload(portal_data, context, export_format, source, language, payload, rows=rows)
        row_count = len(rows)

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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_assign_technician(request):
    payload = _json_payload(request)
    technician = str(payload.get("technician") or "Field Team A").strip() or "Field Team A"
    note = str(payload.get("note") or "").strip()

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


@extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
@api_view(["POST"])
def api_assign_status(request):
    payload = _json_payload(request)
    context = str(payload.get("context") or "").strip().lower()
    status_value = str(payload.get("status") or "").strip()
    selected = payload.get("selected") or []
    if context not in {
        PortalStatusOverride.CONTEXT_RESIDENTIAL,
        PortalStatusOverride.CONTEXT_TRANSACTIONS,
    }:
        return JsonResponse({"ok": False, "error": "Unknown status context."}, status=400)
    if not status_value or not selected:
        return JsonResponse({"ok": False, "error": "Status value and selected rows are required."}, status=400)

    updated = 0
    user = _current_user_or_none(request)

    with transaction.atomic():
        for item in selected:
            target_type = str(item.get("target_type") or "").strip().lower()
            target_id = item.get("target_id")
            try:
                target_id = int(target_id)
            except (TypeError, ValueError):
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

