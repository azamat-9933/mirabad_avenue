from decimal import Decimal, InvalidOperation

from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.urls import reverse
from django.utils.html import format_html, format_html_join

from portal.audit import record_event
from portal.models import AuditEvent

from .models import (
    BillingPeriod,
    Expense,
    GasMeterReading,
    HeatingCalculationSummary,
    HeatingRecord,
    HotWaterCalculationSummary,
    HotWaterMeterReading,
    Invoice,
    SERVICE_HEATING,
    SERVICE_HOT_WATER,
)


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


def group_thousands(number: Decimal) -> str:
    """1234567.5 -> "1 234 567,5": digits in groups of three, a decimal comma only when needed."""
    sign = "-" if number < 0 else ""
    integer, _, fraction = f"{abs(number):f}".partition(".")
    fraction = fraction.rstrip("0")
    grouped = f"{int(integer):,}".replace(",", " ")
    return f"{sign}{grouped}{',' + fraction if fraction else ''}"


class SpacedNumberInput(forms.TextInput):
    """A number shown in groups of three (1 000 000); admin_custom.js keeps grouping while typing."""

    def __init__(self, attrs=None):
        super().__init__({"inputmode": "decimal", "autocomplete": "off", "data-thousands": "true", **(attrs or {})})

    def format_value(self, value):
        if value in (None, ""):
            return None
        try:
            return group_thousands(Decimal(str(value).replace(" ", "").replace("\xa0", "").replace(",", ".")))
        except InvalidOperation:
            return str(value)


class SpacedDecimalField(forms.DecimalField):
    """Accepts what SpacedNumberInput shows: spaces between groups, a decimal comma or point."""

    widget = SpacedNumberInput

    def to_python(self, value):
        if isinstance(value, str):
            value = value.replace(" ", "").replace("\xa0", "").replace(" ", "").replace(",", ".")
        return super().to_python(value)


# Money and meter readings are typed as 1 000 000 instead of 1000000.
SPACED_DECIMALS = {models.DecimalField: {"form_class": SpacedDecimalField}}


def period_is_closed(period) -> bool:
    return bool(period and period.pk and period.status == BillingPeriod.STATUS_CLOSED)


# ══════════════════════════════════════════════════════
#  INLINES  (BillingPeriod ichiga joylashadi)
# ══════════════════════════════════════════════════════

class ClosedPeriodReadOnlyInline:
    """A closed period's inputs are already billed: they are read-only until the period is reopened."""

    def has_add_permission(self, request, obj=None):
        return not period_is_closed(obj) and super().has_add_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        return not period_is_closed(obj) and super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return not period_is_closed(obj) and super().has_delete_permission(request, obj)


class ExpenseInline(ClosedPeriodReadOnlyInline, admin.TabularInline):
    """
    Davr ichida xarajatlarni to'g\'ridan-to\'g'ri kiritish:
      Qozonxona xizmati, Gaz sarfi, Sovuq suv sarfi...
    """
    model   = Expense
    extra   = 1
    fields  = ("building", "service_type", "name", "amount")
    formfield_overrides = SPACED_DECIMALS
    verbose_name        = "Xarajat"
    verbose_name_plural = "Xarajatlar"


class GasMeterReadingInline(ClosedPeriodReadOnlyInline, admin.TabularInline):
    """
    Gaz hisoblagich ko'rsatkichlari — davr ichida uy/seksiya bo'yicha.
    Narxi (iste'mol × 1 kub narxi) davr yopilganda xizmat xarajatiga qo'shiladi.
    """
    model   = GasMeterReading
    extra   = 1
    fields  = (
        "building", "service_type",
        "start_reading", "end_reading", "price_per_m3",
    )
    readonly_fields = ()
    formfield_overrides = SPACED_DECIMALS
    verbose_name        = "Gaz hisoblagich"
    verbose_name_plural = "Gaz hisoblagichlar"


class BillingPeriodAdminForm(forms.ModelForm):
    """The period's state as the operator sees it: open (draft or reopened) or closed.

    Choosing "closed" closes the period on save (charges posted; a reopened period is recalculated),
    after its expenses and gas meters are saved; choosing "open" for a closed period reopens it,
    which only a superuser may do.
    """

    STATE_OPEN = "open"
    STATE_CLOSED = "closed"
    # Optional: a read-only page does not send it, and no state keeps the current one.
    state = forms.ChoiceField(label="Holat", choices=[(STATE_OPEN, "Ochiq"), (STATE_CLOSED, "Yopiq")], required=False)

    class Meta:
        model = BillingPeriod
        exclude = ("status",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "state" in self.fields:
            self.fields["state"].initial = self.STATE_CLOSED if period_is_closed(self.instance) else self.STATE_OPEN


@admin.register(BillingPeriod)
class BillingPeriodAdmin(admin.ModelAdmin):
    list_display  = (
        "name",
        "start_date",
        "end_date",
        "total_days",
        "status_badge",
        "buildings_list",
        "total_expenses_display",
        "created_at",
    )
    list_filter   = ("status",)
    search_fields = ("name",)
    filter_horizontal = ("buildings",)
    form = BillingPeriodAdminForm
    # The status is set through "Holat" (open/closed), which closes or reopens the period properly;
    # the raw status field would mark a period closed without posting its charges.
    readonly_fields   = ("created_at", "closed_at", "total_days", "state_display")
    inlines           = [ExpenseInline, GasMeterReadingInline]
    actions           = ["action_close_period", "action_reopen_period"]

    fieldsets = (
        (
            "Umumiy ma'lumot",
            {
                "fields": (
                    "name", "start_date", "end_date",
                    "total_days", "state",
                )
            },
        ),
        (
            "Uylar",
            {
                "fields": ("buildings",),
                "description": "Bu davr qaysi uylarga taalluqli",
            },
        ),
        (
            "Sistema",
            {
                "fields": ("created_at", "closed_at"),
                "classes": ("collapse",),
            },
        ),
    )

    # ── Holat (ochiq / yopiq) ───────────────────────

    def has_change_permission(self, request, obj=None):
        # A closed period is already billed: only an administrator (superuser) may reopen it,
        # everyone else sees it read-only.
        if period_is_closed(obj) and not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj is None or self.has_change_permission(request, obj):
            return fieldsets
        # Read-only page: "state" is a form field, so the period's state is shown through state_display.
        return tuple(
            (name, {**options, "fields": tuple("state_display" if field == "state" else field for field in options["fields"])})
            for name, options in fieldsets
        )

    def get_readonly_fields(self, request, obj=None):
        readonly = super().get_readonly_fields(request, obj)
        if period_is_closed(obj):
            # Only the state changes on a closed period: reopen it to edit its data, then close it again.
            readonly = (*readonly, "name", "start_date", "end_date", "buildings")
        return readonly

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.is_superuser:
            actions.pop("action_reopen_period", None)
        return actions

    @admin.display(description="Holat")
    def state_display(self, obj):
        return "Yopiq" if period_is_closed(obj) else "Ochiq"

    def save_related(self, request, form, formsets, change):
        # Expenses and gas meters are saved first, so closing the period bills them too.
        super().save_related(request, form, formsets, change)
        period = form.instance
        target = form.cleaned_data.get("state")
        if period_is_closed(period):
            if target == BillingPeriodAdminForm.STATE_OPEN and self._reopen(request, period, "admin_billing_period_form"):
                self.message_user(request, f"{period.name}: davr qayta ochildi.", messages.WARNING)
            return
        created = period.sync_default_records()
        total_created = created["heating_created"] + created["hot_water_created"]
        if total_created:
            self.message_user(
                request,
                (
                    "Kvartiralar uchun davr yozuvlari yaratildi: "
                    f"isitish {created['heating_created']} ta, "
                    f"GVS {created['hot_water_created']} ta."
                ),
                messages.INFO,
            )
        if target == BillingPeriodAdminForm.STATE_CLOSED and self._close(request, period, "admin_billing_period_form"):
            self.message_user(request, f"{period.name}: davr yopildi, hisoblar yaratildi.", messages.SUCCESS)

    def _close(self, request, period, source) -> bool:
        """Close a draft period, or recalculate a reopened one; on an error nothing is billed."""
        was_reopened = period.status == BillingPeriod.STATUS_REOPENED
        try:
            with transaction.atomic():
                # A reopened period is recalculated, which closes it again with delta postings.
                charges = period.close_or_recalculate(author=request.user)
                total = sum((charge.amount for charge in charges), Decimal("0"))
                record_event(
                    request,
                    event_type=AuditEvent.TYPE_BILLING,
                    title="Billing period recalculated" if was_reopened else "Billing period closed",
                    message=(
                        f"Period {period.title} was {'recalculated and closed' if was_reopened else 'closed'} "
                        f"in admin: {len(charges)} charges, {total} UZS."
                    ),
                    metadata={
                        "source": source,
                        "periodId": period.id,
                        "fromStatus": BillingPeriod.STATUS_REOPENED if was_reopened else BillingPeriod.STATUS_DRAFT,
                        "toStatus": BillingPeriod.STATUS_CLOSED,
                        "chargeCount": len(charges),
                        "chargeTotal": str(total),
                    },
                )
        except ValidationError as exc:
            period.refresh_from_db(fields=["status", "closed_at"])
            self.message_user(request, f"{period.name}: {' '.join(exc.messages)}", messages.ERROR)
            return False
        return True

    def _reopen(self, request, period, source) -> bool:
        if not request.user.is_superuser:
            self.message_user(request, f"{period.name}: yopiq davrni faqat administrator ochishi mumkin.", messages.ERROR)
            return False
        try:
            with transaction.atomic():
                period.reopen_period()
                record_event(
                    request,
                    event_type=AuditEvent.TYPE_BILLING,
                    title="Billing period reopened",
                    message=f"Period {period.title} was reopened in admin.",
                    metadata={
                        "source": source,
                        "periodId": period.id,
                        "fromStatus": BillingPeriod.STATUS_CLOSED,
                        "toStatus": BillingPeriod.STATUS_REOPENED,
                    },
                )
        except ValidationError as exc:
            self.message_user(request, f"{period.name}: {' '.join(exc.messages)}", messages.ERROR)
            return False
        return True

    @admin.display(description="Holat")
    def status_badge(self, obj):
        badge_map = {
            BillingPeriod.STATUS_DRAFT: ("Ochiq", "#f59e0b", "#ffffff"),
            BillingPeriod.STATUS_CLOSED: ("Yopiq", "#16a34a", "#ffffff"),
            BillingPeriod.STATUS_REOPENED: ("Qayta ochilgan", "#2563eb", "#ffffff"),
        }
        label, background, color = badge_map.get(
            obj.status,
            ("Noma'lum", "#64748b", "#ffffff"),
        )
        return format_html(
            '<span style="display:inline-flex;align-items:center;justify-content:center;'
            'white-space:nowrap;min-width:84px;padding:4px 10px;border-radius:999px;'
            'background:{};color:{};font-size:12px;font-weight:700;line-height:1;">{}</span>',
            background,
            color,
            label,
        )

    @admin.display(description="Uylar")
    def buildings_list(self, obj):
        buildings = list(obj.buildings.all())
        if not buildings:
            return "—"
        return format_html_join(
            " ",
            '<span style="background:#eef2ff;color:#4e73df;padding:1px 6px;'
            'border-radius:6px;font-size:11px;margin:1px;">{}</span>',
            ((building.number,) for building in buildings),
        )

    @admin.display(description="Umumiy xarajatlar (so'm)")
    def total_expenses_display(self, obj):
        # Gas meters count too: their cost is part of what closing spreads over the residents.
        return format_html(
            '<span style="font-weight:600;">{} so\'m</span>', admin_number(obj.total_expenses())
        )

    # ── Deystviya ────────────────────────────────────

    @admin.action(description="✓ Tanlangan davrlarni YoPISh")
    def action_close_period(self, request, queryset):
        closed_count = 0
        errors_count = 0
        for period in queryset:
            if self._close(request, period, "admin_billing_period_action"):
                closed_count += 1
            else:
                errors_count += 1
        if closed_count:
            self.message_user(
                request,
                f"{closed_count} ta davr yopildi. Hisob-fakturalar va hisoblar yaratildi.",
                messages.SUCCESS,
            )
        if not closed_count and not errors_count:
            self.message_user(request, "Yopish uchun davr tanlanmadi.", messages.WARNING)

    @admin.action(description="↺ Tanlangan davrlarni OChISh (pereraschyot uchun)")
    def action_reopen_period(self, request, queryset):
        reopened_count = sum(1 for period in queryset if self._reopen(request, period, "admin_billing_period_action"))
        if reopened_count:
            self.message_user(
                request,
                f"{reopened_count} ta davr qayta ochildi.",
                messages.WARNING,
            )


# ══════════════════════════════════════════════════════
#  EXPENSE  (Xarajatlar)
# ══════════════════════════════════════════════════════

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display  = (
        "name", "service_type_badge",
        "building",
        "amount_display", "period",
    )
    list_filter   = ("service_type", "period", "building__complex", "building")
    search_fields = ("name", "building__number", "period__name")
    readonly_fields = ()
    exclude = ("section",)
    formfield_overrides = SPACED_DECIMALS

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "building"
        )

    @admin.display(description="Xizmat turi")
    def service_type_badge(self, obj):
        if obj.service_type == SERVICE_HEATING:
            return format_html(
                '<span style="background:#e8f4fd;color:#2980b9;padding:2px 8px;'
                'border-radius:8px;font-size:12px;">🔥 Isitish</span>'
            )
        return format_html(
            '<span style="background:#eafaf1;color:#27ae60;padding:2px 8px;'
            'border-radius:8px;font-size:12px;">💧 GVS</span>'
        )

    @admin.display(description="Summa")
    def amount_display(self, obj):
        return format_html(
            '<span style="font-weight:600;">{} so\'m</span>', admin_number(obj.amount)
        )


# ══════════════════════════════════════════════════════
#  GAS METER READING  (Gaz hisoblagich)
# ══════════════════════════════════════════════════════

@admin.register(GasMeterReading)
class GasMeterReadingAdmin(admin.ModelAdmin):
    list_display  = (
        "building",
        "service_type_badge",
        "start_reading", "end_reading",
        "consumption_display",
        "total_gas_cost_display",
        "period",
    )
    list_filter   = ("service_type", "period", "building__complex", "building")
    search_fields = ("building__number", "period__name")
    readonly_fields = ("consumption_display", "total_gas_cost_display")
    exclude = ("section",)
    formfield_overrides = SPACED_DECIMALS

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "building"
        )

    @admin.display(description="Xizmat turi")
    def service_type_badge(self, obj):
        if obj.service_type == SERVICE_HEATING:
            return format_html(
                '<span style="background:#e8f4fd;color:#2980b9;padding:2px 8px;'
                'border-radius:8px;font-size:12px;">🔥 Isitish</span>'
            )
        return format_html(
            '<span style="background:#eafaf1;color:#27ae60;padding:2px 8px;'
            'border-radius:8px;font-size:12px;">💧 GVS</span>'
        )

    @admin.display(description="Sarf (kub)")
    def consumption_display(self, obj):
        return format_html(
            "<strong>{}</strong> kub", admin_number(obj.consumption, 2)
        )

    @admin.display(description="Gaz xarajati (so'm)")
    def total_gas_cost_display(self, obj):
        return format_html(
            '<span style="color:#e74c3c;font-weight:600;">{} so\'m</span>',
            admin_number(obj.total_gas_cost),
        )


# ══════════════════════════════════════════════════════
#  HEATING RECORD  (Kvartira bo'yicha isitish hisobi)
# ══════════════════════════════════════════════════════

@admin.register(HeatingRecord)
class HeatingRecordAdmin(admin.ModelAdmin):
    list_display  = (
        "apartment_info",
        "period",
        "heated_days_display",
        "excluded_days_count",
        "heated_area_display",
    )
    list_filter   = (
        "period",
        "apartment__building__complex",
        "apartment__building",
    )
    search_fields = (
        "apartment__number",
        "apartment__building__number",
        "period__name",
    )
    readonly_fields = (
        "heated_days_display",
        "heated_area_display",
        "excluded_days_count",
    )
    fieldsets = (
        (
            "Kvartira va davr",
            {"fields": ("period", "apartment")},
        ),
        (
            "Isitish kunlari",
            {
                "fields": (
                    "excluded_dates",
                    "heated_days_display",
                    "excluded_days_count",
                ),
                "description": (
                    'excluded_dates ga ko\'rsatkich kunlarni kiriting. '
                    'Format: ["2025-12-10", "2025-12-11"] '
                    '— isitish berilmagan kunlar.'
                ),
            },
        ),
        (
            "Hisoblash natijasi",
            {"fields": ("heated_area_display",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "apartment", "apartment__building"
        )

    @admin.display(description="Kvartira")
    def apartment_info(self, obj):
        return format_html(
            "Uy <strong>{}</strong> / Kv. <strong>{}</strong>"
            " ({} m²)",
            obj.apartment.building.number,
            obj.apartment.number,
            obj.apartment.area,
        )

    @admin.display(description="Qizdirilgan kunlar")
    def heated_days_display(self, obj):
        days  = obj.heated_days
        total = obj.period.total_days
        color = "#27ae60" if days == total else "#e67e22"
        return format_html(
            '<span style="color:{};font-weight:600;">{} / {} kun</span>',
            color, days, total,
        )

    @admin.display(description="O'chirilgan kunlar")
    def excluded_days_count(self, obj):
        n = len(obj.excluded_dates)
        if n == 0:
            return "—"
        return format_html(
            '<span style="color:#e74c3c;">-{} kun</span>', n
        )

    @admin.display(description="Qizdirilgan maydon (m²·kun)")
    def heated_area_display(self, obj):
        return format_html(
            "<strong>{}</strong> m²·kun", admin_number(obj.heated_area, 2)
        )


# ══════════════════════════════════════════════════════
#  HOT WATER METER READING  (GVS hisoblagich — kvartira)
# ══════════════════════════════════════════════════════

@admin.register(HotWaterMeterReading)
class HotWaterMeterReadingAdmin(admin.ModelAdmin):
    list_display  = (
        "apartment_info",
        "period",
        "start_reading",
        "end_reading",
        "consumption_display",
    )
    list_filter   = (
        "period",
        "apartment__building__complex",
        "apartment__building",
    )
    search_fields = (
        "apartment__number",
        "apartment__building__number",
        "period__name",
    )
    readonly_fields = ("consumption_display",)
    fieldsets = (
        (
            "Kvartira va davr",
            {"fields": ("period", "apartment")},
        ),
        (
            "Hisoblagich ko'rsatkichlari",
            {
                "fields": (
                    "start_reading",
                    "end_reading",
                    "consumption_display",
                ),
                "description": "Davr boshida va oxirida hisoblagichdan olingan ko'rsatkichlar (kub).",
            },
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "apartment", "apartment__building"
        )

    @admin.display(description="Kvartira")
    def apartment_info(self, obj):
        return format_html(
            "Uy <strong>{}</strong> / Kv. <strong>{}</strong>",
            obj.apartment.building.number,
            obj.apartment.number,
        )

    @admin.display(description="Sarf (kub)")
    def consumption_display(self, obj):
        c = obj.consumption
        if c == 0:
            return format_html('<span style="color:#95a5a6;">{}</span>', "0 kub")
        return format_html(
            '<span style="color:#2980b9;font-weight:600;">{} kub</span>', admin_number(c, 2)
        )


# ══════════════════════════════════════════════════════
#  INVOICE  (Hisob-faktura)
# ══════════════════════════════════════════════════════

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display  = (
        "apartment_info",
        "period",
        "heating_amount_display",
        "hot_water_amount_display",
        "total_amount_display",
        "is_recalculated",
        "created_at",
    )
    list_filter   = (
        "period",
        "is_recalculated",
        "apartment__building__complex",
        "apartment__building",
    )
    search_fields = (
        "apartment__number",
        "apartment__building__number",
        "owner_snapshot",
        "period__name",
    )
    # Invoice — o'zgartirilmaydi, faqat ko'riladi
    readonly_fields = (
        "period", "apartment", "owner_snapshot",
        "heated_area", "heating_cost_per_sqm", "heating_amount",
        "hot_water_consumption", "hot_water_tariff", "hot_water_amount",
        "total_amount",
        "is_recalculated", "recalculated_at", "created_at",
    )
    fieldsets = (
        (
            "Asosiy ma'lumot",
            {"fields": ("period", "apartment", "owner_snapshot")},
        ),
        (
            "🔥 Isitish",
            {
                "fields": (
                    "heated_area",
                    "heating_cost_per_sqm",
                    "heating_amount",
                ),
            },
        ),
        (
            "💧 Issiq suv (GVS)",
            {
                "fields": (
                    "hot_water_consumption",
                    "hot_water_tariff",
                    "hot_water_amount",
                ),
            },
        ),
        (
            "Jami",
            {"fields": ("total_amount",)},
        ),
        (
            "Qayta hisoblash",
            {
                "fields": ("is_recalculated", "recalculated_at"),
                "classes": ("collapse",),
            },
        ),
        (
            "Sistema",
            {"fields": ("created_at",), "classes": ("collapse",)},
        ),
    )

    def has_add_permission(self, request):
        return False  # Invoice faqat sistema yaratadi

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "apartment", "apartment__building"
        )

    @admin.display(description="Kvartira")
    def apartment_info(self, obj):
        return format_html(
            "Uy <strong>{}</strong> / Kv. <strong>{}</strong>",
            obj.apartment.building.number,
            obj.apartment.number,
        )

    @admin.display(description="🔥 Isitish")
    def heating_amount_display(self, obj):
        if not obj.heating_amount:
            return format_html('<span style="color:#bdc3c7;">{}</span>', "—")
        return format_html(
            '<span style="color:#e67e22;">{} so\'m</span>',
            admin_number(obj.heating_amount),
        )

    @admin.display(description="💧 GVS")
    def hot_water_amount_display(self, obj):
        if not obj.hot_water_amount:
            return format_html('<span style="color:#bdc3c7;">{}</span>', "—")
        return format_html(
            '<span style="color:#2980b9;">{} so\'m</span>',
            admin_number(obj.hot_water_amount),
        )

    @admin.display(description="Jami summa")
    def total_amount_display(self, obj):
        return format_html(
            '<span style="font-weight:700;font-size:14px;">{} so\'m</span>',
            admin_number(obj.total_amount),
        )


# ══════════════════════════════════════════════════════
#  HEATING CALCULATION SUMMARY
# ══════════════════════════════════════════════════════

@admin.register(HeatingCalculationSummary)
class HeatingCalculationSummaryAdmin(admin.ModelAdmin):
    list_display  = (
        "building", "period",
        "total_expenses_display",
        "total_heated_area",
        "cost_per_sqm_display",
        "calculated_at",
    )
    list_filter   = ("period", "building__complex", "building")
    readonly_fields = (
        "period", "building",
        "total_expenses", "total_heated_area", "cost_per_sqm",
        "calculated_at",
    )

    def has_add_permission(self, request):
        return False  # Sistema yaratadi

    def has_change_permission(self, request, obj=None):
        return False  # Faqat ko'rish

    @admin.display(description="Umumiy xarajat")
    def total_expenses_display(self, obj):
        return format_html(
            '<span style="color:#e74c3c;font-weight:600;">{} so\'m</span>',
            admin_number(obj.total_expenses),
        )

    @admin.display(description="1 m²·kun narxi")
    def cost_per_sqm_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#4e73df;">{} so\'m</span>',
            admin_number(obj.cost_per_sqm, 4),
        )


# ══════════════════════════════════════════════════════
#  HOT WATER CALCULATION SUMMARY
# ══════════════════════════════════════════════════════

@admin.register(HotWaterCalculationSummary)
class HotWaterCalculationSummaryAdmin(admin.ModelAdmin):
    list_display  = (
        "building", "period",
        "total_expenses_display",
        "total_consumption",
        "tariff_per_m3_display",
        "calculated_at",
    )
    list_filter   = ("period", "building__complex", "building")
    readonly_fields = (
        "period", "building",
        "total_expenses", "total_consumption", "tariff_per_m3",
        "calculated_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description="Umumiy xarajat")
    def total_expenses_display(self, obj):
        return format_html(
            '<span style="color:#e74c3c;font-weight:600;">{} so\'m</span>',
            admin_number(obj.total_expenses),
        )

    @admin.display(description="1 kub tarifi")
    def tariff_per_m3_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#27ae60;">{} so\'m</span>',
            admin_number(obj.tariff_per_m3, 4),
        )
