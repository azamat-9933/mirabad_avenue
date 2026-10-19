from decimal import Decimal, InvalidOperation

from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.urls import reverse
from django.utils.html import format_html, format_html_join
from django.utils.safestring import mark_safe

from portal.audit import record_event
from portal.models import AuditEvent

from .calculation import build_plan, group_thousands, previous_hot_water_readings
from .models import (
    BillingPeriod,
    BoilerRoom,
    Expense,
    GasMeterReading,
    HeatingCalculationSummary,
    HeatingRecord,
    HotWaterCalculationSummary,
    HotWaterMeterReading,
    Invoice,
    SERVICE_HEATING,
    SERVICE_HOT_WATER,
    money,
    rate,
)


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


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
    fields  = ("building", "service_type", "boiler_room", "name", "amount")
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
        "building", "service_type", "boiler_room",
        "start_reading", "end_reading", "price_per_m3",
    )
    readonly_fields = ()
    formfield_overrides = SPACED_DECIMALS
    verbose_name        = "Gaz hisoblagich"
    verbose_name_plural = "Gaz hisoblagichlar"


class HotWaterMeterReadingInline(ClosedPeriodReadOnlyInline, admin.TabularInline):
    """Apartment hot water meters of the period, one row per apartment of its houses (created on save).

    An empty start reading takes the apartment's last reading from the previous period.
    """
    model = HotWaterMeterReading
    extra = 0
    can_delete = False
    fields = ("apartment_label", "previous_reading", "start_reading", "end_reading", "consumption_display")
    readonly_fields = ("apartment_label", "previous_reading", "consumption_display")
    formfield_overrides = SPACED_DECIMALS
    verbose_name = "GVS hisoblagich ko'rsatkichi"
    verbose_name_plural = "GVS hisoblagich ko'rsatkichlari"

    def has_add_permission(self, request, obj=None):
        return False  # rows are created for every apartment of the period's houses

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .select_related("apartment", "apartment__building")
            .order_by("apartment__building__number", "apartment_id")
        )

    def get_formset(self, request, obj=None, **kwargs):
        # One query for every row's previous reading instead of one per row.
        self._previous = {}
        if obj is not None and obj.pk:
            self._previous = previous_hot_water_readings(obj.hot_water_readings.values_list("apartment_id", flat=True), obj)
        return super().get_formset(request, obj, **kwargs)

    def _start(self, obj):
        if obj.start_reading is not None:
            return obj.start_reading
        return getattr(self, "_previous", {}).get(obj.apartment_id)

    @admin.display(description="Kvartira")
    def apartment_label(self, obj):
        return f"{obj.apartment.building.number} — kv {obj.apartment.number}"

    @admin.display(description="O'tgan oy")
    def previous_reading(self, obj):
        value = getattr(self, "_previous", {}).get(obj.apartment_id)
        return group_thousands(value) if value is not None else "—"

    @admin.display(description="Sarf (kub)")
    def consumption_display(self, obj):
        start = self._start(obj)
        if obj.end_reading is None or start is None:
            return "—"
        return group_thousands(obj.end_reading - start)


def render_plan(plan):
    """The period's calculation as tables: what closing will charge, and what must be fixed first."""
    parts = []
    if plan.errors:
        parts.append(format_html(
            '<div class="hf-plan-note hf-plan-note--error"><strong>{}</strong><ul>{}</ul></div>',
            "Yopishdan oldin tuzatish kerak:",
            format_html_join("", "<li>{}</li>", ((error,) for error in plan.errors)),
        ))
    if plan.warnings:
        parts.append(format_html(
            '<div class="hf-plan-note hf-plan-note--warning"><strong>{}</strong><ul>{}</ul></div>',
            "E'tibor bering:",
            format_html_join("", "<li>{}</li>", ((warning,) for warning in plan.warnings)),
        ))
    zones = [zone for zone in plan.zones if zone.billable or zone.has_inputs]
    if not zones:
        parts.append(format_html('<p class="hf-plan-empty">{}</p>', "Bu davrga hali xarajat kiritilmagan."))
    for zone in zones:
        unit = "m²·kun" if zone.is_heating else "m³"
        costs = format_html_join(
            "", '<tr><td>{}</td><td class="hf-plan-num">{}</td></tr>',
            ((title, f"{group_thousands(amount)} so'm") for title, amount in zone.costs),
        )
        if zone.is_heating:
            head = format_html("<tr><th>{}</th><th>{}</th><th>{}</th><th>{}</th><th>{}</th><th>{}</th></tr>",
                               "Kv", "Ega", "Maydon (m²)", "Kun", unit, "Summa (so'm)")
            body = format_html_join("", '<tr><td>{}</td><td>{}</td><td class="hf-plan-num">{}</td><td class="hf-plan-num">{}</td>'
                                    '<td class="hf-plan-num">{}</td><td class="hf-plan-num">{}</td></tr>',
                                    ((row.apartment.number, row.owner_name or "—", group_thousands(row.apartment.area), row.days,
                                      group_thousands(row.volume), group_thousands(row.amount)) for row in zone.rows))
        else:
            head = format_html("<tr><th>{}</th><th>{}</th><th>{}</th><th>{}</th><th>{}</th><th>{}</th></tr>",
                               "Kv", "Ega", "Boshlang'ich", "Oxirgi", unit, "Summa (so'm)")
            body = format_html_join("", '<tr><td>{}</td><td>{}</td><td class="hf-plan-num">{}</td><td class="hf-plan-num">{}</td>'
                                    '<td class="hf-plan-num">{}</td><td class="hf-plan-num">{}</td></tr>',
                                    ((row.apartment.number, row.owner_name or "—", group_thousands(row.start), group_thousands(row.end),
                                      group_thousands(row.volume), group_thousands(row.amount)) for row in zone.rows))
        total_amount = sum((row.amount for row in zone.rows), Decimal("0"))
        parts.append(format_html(
            '<section class="hf-plan-zone"><h4>{}</h4>'
            '<table class="hf-plan-costs">{}<tr class="hf-plan-total"><td>{}</td><td class="hf-plan-num">{}</td></tr></table>'
            '<p class="hf-plan-summary">{}: <strong>{} {}</strong> · {}: <strong>{} so\'m / {}</strong> · {}: <strong>{} ta</strong></p>'
            '<table class="hf-plan-rows"><thead>{}</thead><tbody>{}</tbody>'
            '<tfoot><tr><td colspan="4">{}</td><td class="hf-plan-num">{}</td><td class="hf-plan-num">{}</td></tr></tfoot></table>'
            '</section>',
            zone.label, costs, "Jami xarajat", f"{group_thousands(zone.total_cost)} so'm",
            "Jami hajm", group_thousands(zone.total_volume), unit,
            "Tarif", group_thousands(rate(zone.tariff)), unit,
            "Kvartiralar", len(zone.rows),
            head, body or format_html('<tr><td colspan="6">{}</td></tr>', "Hisoblanadigan kvartira yo'q."),
            "Jami", group_thousands(zone.total_volume), group_thousands(total_amount),
        ))
    return mark_safe("".join(parts))


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
    readonly_fields   = ("created_at", "closed_at", "total_days", "state_display", "calculation_preview")
    inlines           = [ExpenseInline, GasMeterReadingInline, HotWaterMeterReadingInline]
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
            "Hisob-kitob",
            {
                "fields": ("calculation_preview",),
                "description": (
                    "Kiritilgan xarajatlar va ko'rsatkichlar bo'yicha davr yopilganda qo'yiladigan hisoblar. "
                    "Isitish faqat isitishga ulangan kvartiralarga, ulangan kundan boshlab hisoblanadi."
                ),
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

    @admin.display(description="Hisob-kitob")
    def calculation_preview(self, obj):
        if obj is None or not obj.pk:
            return "Davr saqlangandan keyin ko'rinadi."
        return render_plan(build_plan(obj))

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
            problems = exc.messages
            for problem in problems[:12]:
                self.message_user(request, f"{period.name}: {problem}", messages.ERROR)
            if len(problems) > 12:
                self.message_user(
                    request, f"{period.name}: yana {len(problems) - 12} ta muammo — «Hisob-kitob» bo'limida.", messages.ERROR
                )
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
#  BOILER ROOM  (Qozonxona)
# ══════════════════════════════════════════════════════

class BoilerRoomForm(forms.ModelForm):
    class Meta:
        model = BoilerRoom
        fields = ("building", "name", "sections")

    def clean(self):
        cleaned = super().clean()
        building, sections = cleaned.get("building"), cleaned.get("sections")
        if building and sections:
            foreign = [section.name for section in sections if section.building_id != building.pk]
            if foreign:
                self.add_error("sections", f"Bu seksiyalar boshqa uyniki: {', '.join(foreign)}.")
            taken = BoilerRoom.objects.filter(sections__in=sections).exclude(pk=self.instance.pk).distinct()
            if taken:
                self.add_error(
                    "sections",
                    "Seksiya bitta qozonxonaga tegishli bo'ladi; band: " + ", ".join(room.name for room in taken) + ".",
                )
        return cleaned


@admin.register(BoilerRoom)
class BoilerRoomAdmin(admin.ModelAdmin):
    """Boiler rooms: a building with several is billed for heating per boiler room (its sections)."""

    form = BoilerRoomForm
    list_display = ("name", "building", "sections_list")
    list_filter = ("building",)
    search_fields = ("name", "building__number")
    filter_horizontal = ("sections",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("building").prefetch_related("sections")

    @admin.display(description="Seksiyalar")
    def sections_list(self, obj):
        return ", ".join(section.name for section in obj.sections.all()) or "—"


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
