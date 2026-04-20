from django.contrib import admin, messages
from django.db.models import Sum, Count
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html

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


# ══════════════════════════════════════════════════════
#  INLINES  (BillingPeriod ichiga joylashadi)
# ══════════════════════════════════════════════════════

class ExpenseInline(admin.TabularInline):
    """
    Davr ichida xarajatlarni to'g\'ridan-to\'g'ri kiritish:
      Qozonxona xizmati, Gaz sarfi, Sovuq suv sarfi...
    """
    model   = Expense
    extra   = 1
    fields  = ("building", "section", "service_type", "name", "amount")
    verbose_name        = "Xarajat"
    verbose_name_plural = "Xarajatlar"


class GasMeterReadingInline(admin.TabularInline):
    """
    Gaz hisoblagich ko'rsatkichlari — davr ichida uy/seksiya bo'yicha.
    Kiritgandan keyin consumption va cost avtomatik ko'rsatiladi.
    """
    model   = GasMeterReading
    extra   = 1
    fields  = (
        "building", "section", "service_type",
        "start_reading", "end_reading", "price_per_m3",
    )
    readonly_fields = ()
    verbose_name        = "Gaz hisoblagich"
    verbose_name_plural = "Gaz hisoblagichlar"


# ══════════════════════════════════════════════════════
#  BILLING PERIOD  (Xisoblash davri)
# ══════════════════════════════════════════════════════

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
    readonly_fields   = ("created_at", "closed_at", "total_days")
    inlines           = [ExpenseInline, GasMeterReadingInline]
    actions           = ["action_close_period", "action_reopen_period"]

    fieldsets = (
        (
            "Umumiy ma'lumot",
            {
                "fields": (
                    "name", "start_date", "end_date",
                    "total_days", "status",
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

    # ── Kastom kolonkalar ───────────────────────────

    @admin.display(description="Holat")
    def status_badge(self, obj):
        if obj.status == BillingPeriod.STATUS_CLOSED:
            return format_html(
                '<span style="background:#27ae60;color:#fff;padding:3px 12px;'
                'border-radius:12px;font-size:12px;font-weight:600;">✓ Yopiq</span>'
            )
        return format_html(
            '<span style="background:#f39c12;color:#fff;padding:3px 12px;'
            'border-radius:12px;font-size:12px;font-weight:600;">⏳ Ochiq</span>'
        )

    @admin.display(description="Uylar")
    def buildings_list(self, obj):
        buildings = obj.buildings.all()
        tags = " ".join(
            f'<span style="background:#eef2ff;color:#4e73df;padding:1px 6px;'
            f'border-radius:6px;font-size:11px;margin:1px;">{b.number}</span>'
            for b in buildings
        )
        return format_html(tags) if tags else "—"

    @admin.display(description="Umumiy xarajatlar (so'm)")
    def total_expenses_display(self, obj):
        total = obj.expenses.aggregate(s=Sum("amount"))["s"] or 0
        return format_html(
            '<span style="font-weight:600;">{:,.0f} so\'m</span>', total
        )

    # ── Deystviya ────────────────────────────────────

    @admin.action(description="✓ Tanlangan davrlarni YoPISh")
    def action_close_period(self, request, queryset):
        open_qs = queryset.filter(status=BillingPeriod.STATUS_OPEN)
        count   = open_qs.count()
        open_qs.update(
            status=BillingPeriod.STATUS_CLOSED,
            closed_at=timezone.now(),
        )
        self.message_user(
            request,
            f"{count} ta davr yopildi. "
            "Hisob-fakturalar views.py orqali yaratiladi.",
            messages.SUCCESS,
        )

    @admin.action(description="↺ Tanlangan davrlarni OChISh (pereraschyot uchun)")
    def action_reopen_period(self, request, queryset):
        closed_qs = queryset.filter(status=BillingPeriod.STATUS_CLOSED)
        count     = closed_qs.count()
        closed_qs.update(status=BillingPeriod.STATUS_OPEN, closed_at=None)
        self.message_user(
            request,
            f"{count} ta davr qayta ochildi.",
            messages.WARNING,
        )


# ══════════════════════════════════════════════════════
#  EXPENSE  (Xarajatlar)
# ══════════════════════════════════════════════════════

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display  = (
        "name", "service_type_badge",
        "building", "section",
        "amount_display", "period",
    )
    list_filter   = ("service_type", "period", "building__complex", "building")
    search_fields = ("name", "building__number", "period__name")
    readonly_fields = ()

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "building", "section"
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
            '<span style="font-weight:600;">{:,.0f} so\'m</span>', obj.amount
        )


# ══════════════════════════════════════════════════════
#  GAS METER READING  (Gaz hisoblagich)
# ══════════════════════════════════════════════════════

@admin.register(GasMeterReading)
class GasMeterReadingAdmin(admin.ModelAdmin):
    list_display  = (
        "building", "section",
        "service_type_badge",
        "start_reading", "end_reading",
        "consumption_display",
        "total_gas_cost_display",
        "period",
    )
    list_filter   = ("service_type", "period", "building__complex", "building")
    search_fields = ("building__number", "period__name")
    readonly_fields = ("consumption_display", "total_gas_cost_display")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "period", "building", "section"
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
            "<strong>{:,.2f}</strong> kub", obj.consumption
        )

    @admin.display(description="Gaz xarajati (so'm)")
    def total_gas_cost_display(self, obj):
        return format_html(
            '<span style="color:#e74c3c;font-weight:600;">{:,.0f} so\'m</span>',
            obj.total_gas_cost,
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
        "apartment__section",
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
            "<strong>{:,.2f}</strong> m²·kun", obj.heated_area
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
        "apartment__section",
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
            return format_html('<span style="color:#95a5a6;">0 kub</span>')
        return format_html(
            '<span style="color:#2980b9;font-weight:600;">{:,.2f} kub</span>', c
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
            return format_html('<span style="color:#bdc3c7;">—</span>')
        return format_html(
            '<span style="color:#e67e22;">{:,.0f} so\'m</span>',
            obj.heating_amount,
        )

    @admin.display(description="💧 GVS")
    def hot_water_amount_display(self, obj):
        if not obj.hot_water_amount:
            return format_html('<span style="color:#bdc3c7;">—</span>')
        return format_html(
            '<span style="color:#2980b9;">{:,.0f} so\'m</span>',
            obj.hot_water_amount,
        )

    @admin.display(description="Jami summa")
    def total_amount_display(self, obj):
        return format_html(
            '<span style="font-weight:700;font-size:14px;">{:,.0f} so\'m</span>',
            obj.total_amount,
        )


# ══════════════════════════════════════════════════════
#  HEATING CALCULATION SUMMARY
# ══════════════════════════════════════════════════════

@admin.register(HeatingCalculationSummary)
class HeatingCalculationSummaryAdmin(admin.ModelAdmin):
    list_display  = (
        "building", "section", "period",
        "total_expenses_display",
        "total_heated_area",
        "cost_per_sqm_display",
        "calculated_at",
    )
    list_filter   = ("period", "building__complex", "building")
    readonly_fields = (
        "period", "building", "section",
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
            '<span style="color:#e74c3c;font-weight:600;">{:,.0f} so\'m</span>',
            obj.total_expenses,
        )

    @admin.display(description="1 m²·kun narxi")
    def cost_per_sqm_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#4e73df;">{:,.4f} so\'m</span>',
            obj.cost_per_sqm,
        )


# ══════════════════════════════════════════════════════
#  HOT WATER CALCULATION SUMMARY
# ══════════════════════════════════════════════════════

@admin.register(HotWaterCalculationSummary)
class HotWaterCalculationSummaryAdmin(admin.ModelAdmin):
    list_display  = (
        "building", "section", "period",
        "total_expenses_display",
        "total_consumption",
        "tariff_per_m3_display",
        "calculated_at",
    )
    list_filter   = ("period", "building__complex", "building")
    readonly_fields = (
        "period", "building", "section",
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
            '<span style="color:#e74c3c;font-weight:600;">{:,.0f} so\'m</span>',
            obj.total_expenses,
        )

    @admin.display(description="1 kub tarifi")
    def tariff_per_m3_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#27ae60;">{:,.4f} so\'m</span>',
            obj.tariff_per_m3,
        )