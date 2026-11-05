"""Billing periods in admin: a period and the tables the operators fill in on the portal.

The portal stays the place where periods are created, closed, reopened and deleted: closing posts the
charges to the accounts. Here an administrator corrects what was typed in a period that is not closed:
its name and dates, heating dates and days, hot water readings, expenses and gas meters, under the same
rules as the portal sheet. A closed period is shown read-only: reopen it on the portal first.

Operators on the portal and admins here may work on one period at once. Every edited field also sends
the value the page showed (``show_hidden_initial``), so a row nobody touched on this page is not
written, and a row someone else saved after the page was opened is refused with its current values
instead of being overwritten. The period row and the edited row are locked while a save is checked and
written, as the portal's saves do.
"""
from collections import defaultdict
from datetime import date
from decimal import Decimal

from django import forms
from django.contrib import admin
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError
from django.db import transaction
from django.db.models.functions import Length
from django.forms.models import model_to_dict
from django.urls import reverse
from django.utils.html import format_html_join

from portal.audit import record_event
from portal.models import AuditEvent
from portal.period_views import _lock_period_creation

from .calculation import heating_range_days, previous_hot_water_readings
from .models import BillingPeriod, Expense, GasMeterReading, HeatingRecord, HotWaterMeterReading

CLOSED = BillingPeriod.STATUS_CLOSED
CLOSED_MESSAGE = "Davr yopilgan: o'zgartirish uchun avval portalda «Qayta ochish» tugmasini bosing."
CONFLICT_MESSAGE = (
    "Siz sahifani ochganingizdan keyin bu qatorni boshqa foydalanuvchi saqlagan, shuning uchun o'zgarishingiz "
    "yozilmadi. Hozir: {current}. Sahifani yangilab, kerak bo'lsa qayta kiriting."
)


def plain(value) -> str:
    """A value as people read it: 25 (not 25.00), 01.10.2026, — for empty."""
    if value is None or value == "":
        return "—"
    if isinstance(value, Decimal):
        return format(value.normalize(), "f")
    if isinstance(value, date):
        return f"{value:%d.%m.%Y}"
    return str(value)


def lock_period(pk) -> BillingPeriod:
    return BillingPeriod.objects.select_for_update().get(pk=pk)


def audit(request, period, title, message, building=None, apartment=None, **metadata):
    record_event(
        request,
        event_type=AuditEvent.TYPE_PERIOD_EDIT,
        title=title,
        message=message,
        complex=building.complex if building else None,
        building=building,
        apartment=apartment,
        metadata={"source": "admin_billing_period", "periodId": period.pk, "periodTitle": period.title, **metadata},
    )


class GuardedForm(forms.ModelForm):
    """A row of a period as the page showed it (see the module docstring)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        period = self.period_of(self.instance) if self.instance.pk else None
        for field in self.fields.values():
            field.show_hidden_initial = True
            # A closed period's rows stay visible in the lists but cannot be edited there.
            if period is not None and period.status == CLOSED:
                field.disabled = True

    @staticmethod
    def period_of(instance):
        return instance.period if instance.period_id else None

    def shown(self, name):
        """What this field showed when the page was drawn."""
        field = self.fields[name]
        return field.hidden_widget().value_from_datadict(self.data, self.files, self.add_initial_prefix(name))

    def clean(self):
        cleaned = super().clean()
        instance = self.instance
        if instance.pk is None:
            period = cleaned.get("period")
            if period is not None and lock_period(period.pk).status == CLOSED:
                raise ValidationError(CLOSED_MESSAGE)
            return cleaned
        if not self.has_changed():
            return cleaned
        period = self.period_of(instance)
        if lock_period(period.pk).status == CLOSED:
            raise ValidationError(CLOSED_MESSAGE)
        model = type(instance)
        try:
            current = model._default_manager.select_for_update().get(pk=instance.pk)
        except model.DoesNotExist:
            raise ValidationError("Bu qator o'chirilgan: sahifani yangilang.")
        # The list's hidden row id is not a value the page showed.
        guarded = {name: field for name, field in self.fields.items() if name != model._meta.pk.name}
        stored = model_to_dict(current, fields=list(guarded))
        if any(field.has_changed(stored.get(name), self.shown(name)) for name, field in guarded.items()):
            now = "; ".join(f"{field.label}: {plain(getattr(current, name))}" for name, field in guarded.items())
            raise ValidationError(CONFLICT_MESSAGE.format(current=now))
        return cleaned

    def _update_errors(self, errors):
        # The model's clean() checks fields a list row does not show (excluded dates): its message
        # goes above the row instead of failing on a field the form does not have.
        if hasattr(errors, "error_dict"):
            mapped = defaultdict(list)
            for name, messages in errors.error_dict.items():
                mapped[name if name in self.fields else NON_FIELD_ERRORS].extend(messages)
            errors = ValidationError(dict(mapped))
        super()._update_errors(errors)


class PeriodRowAdmin(admin.ModelAdmin):
    """The tables of a period: edited in the list, one save for the rows changed on the page."""

    actions = None
    list_per_page = 250  # the largest house (66V) on one page
    list_max_show_all = 1000
    what = "Row"

    def get_queryset(self, request):
        # The rows a list save checks (not only the ones it shows) come with their period and house.
        return super().get_queryset(request).select_related(*self.list_select_related)

    def get_changelist_form(self, request, **kwargs):
        kwargs.setdefault("form", self.form)
        return super().get_changelist_form(request, **kwargs)

    def changelist_view(self, request, extra_context=None):
        # The rows are checked and written in one transaction, so the locks taken while checking hold
        # until the save commits.
        if request.method == "POST":
            with transaction.atomic():
                return super().changelist_view(request, extra_context)
        return super().changelist_view(request, extra_context)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        if obj is not None and obj.period.status == CLOSED:
            return False
        return super().has_change_permission(request, obj)

    def place(self, obj):
        """(building, apartment, words) of a row for the activity log."""
        apartment = obj.apartment
        return apartment.building, apartment, f"house {apartment.building.number}, apt {apartment.number}"

    def save_model(self, request, obj, form, change):
        before = {name: form.initial.get(name) for name in form.changed_data}
        super().save_model(request, obj, form, change)
        period = BillingPeriod.objects.get(pk=obj.period_id)
        period.mark_in_progress()
        building, apartment, where = self.place(obj)
        labels = {name: form.fields[name].label for name in form.changed_data}
        changes = {name: [plain(before.get(name)) if change else "—", plain(getattr(obj, name))] for name in form.changed_data}
        details = "; ".join(f"{labels[name]}: {old} → {new}" for name, (old, new) in changes.items())
        audit(
            request,
            period,
            f"{self.what} {'edited' if change else 'added'} in admin",
            f"{period.title}, {where}: {details}.",
            building=building,
            apartment=apartment,
            changes=changes,
        )

    @admin.display(description="House", ordering="apartment__building__number")
    def house(self, obj):
        return obj.apartment.building.number

    @admin.display(description="Kv", ordering="apartment__number")
    def apartment_number(self, obj):
        return obj.apartment.number

    @admin.display(description="Davr", ordering="period__start_date")
    def period_name(self, obj):
        return obj.period.name

    @admin.display(description="Owner")
    def owner_name(self, obj):
        owner = getattr(obj.apartment, "owner", None)
        return owner.fio if owner else "—"


# ── Heating ──────────────────────────────────────────────


class HeatingRecordForm(GuardedForm):
    class Meta:
        model = HeatingRecord
        fields = ("heated_from", "heated_until", "days_given", "excluded_dates")

    def clean(self):
        cleaned = super().clean()
        period = self.instance.period
        # As the portal sheet stores them: no start means not heated, an end on the period's last day
        # means "to the end", and days equal to the whole range stay automatic.
        if "heated_from" in cleaned and "heated_until" in cleaned:
            if cleaned["heated_from"] is None or cleaned["heated_until"] == period.end_date:
                cleaned["heated_until"] = None
            days = cleaned.get("days_given")
            if days is not None and cleaned["heated_from"] and days == heating_range_days(period, cleaned["heated_from"], cleaned["heated_until"]):
                cleaned["days_given"] = None
        return cleaned


@admin.register(HeatingRecord)
class HeatingRecordAdmin(PeriodRowAdmin):
    form = HeatingRecordForm
    what = "Heating row"
    list_display = ("house", "apartment_number", "owner_name", "area", "heated_from", "heated_until", "days_given", "heated_days", "period_name")
    list_display_links = ("apartment_number",)
    list_editable = ("heated_from", "heated_until", "days_given")
    list_filter = ("period", "apartment__building")
    search_fields = ("=apartment__number", "apartment__owner__fio", "=apartment__personal_account")
    list_select_related = ("period", "apartment__building", "apartment__owner")
    # Apartment numbers are text: by length first, so 2 comes before 10.
    ordering = ("-period__start_date", "apartment__building__number", Length("apartment__number"), "apartment__number")
    fields = ("period", "apartment", "heated_from", "heated_until", "days_given", "excluded_dates", "heated_days")
    readonly_fields = ("period", "apartment", "heated_days")

    @admin.display(description="Area (m²)")
    def area(self, obj):
        return plain(obj.apartment.area)

    @admin.display(description="Heated days")
    def heated_days(self, obj):
        return obj.heated_days_in(obj.period)


# ── Hot water ────────────────────────────────────────────


class HotWaterReadingForm(GuardedForm):
    class Meta:
        model = HotWaterMeterReading
        fields = ("start_reading", "end_reading")

    def clean(self):
        cleaned = super().clean()
        for name in ("start_reading", "end_reading"):
            value = cleaned.get(name)
            if value is not None and value < 0:
                self.add_error(name, "Manfiy son bo'lishi mumkin emas.")
        if self.has_changed() and not self.errors:
            reading = self.instance
            start, end = cleaned.get("start_reading"), cleaned.get("end_reading")
            if start is None:  # empty: last month's end reading is used
                start = previous_hot_water_readings([reading.apartment_id], reading.period).get(reading.apartment_id)
            if end is not None and start is not None and end < start:
                self.add_error("end_reading", f"Oxirgi ko'rsatkich ({plain(end)}) boshlang'ichdan ({plain(start)}) kichik.")
        return cleaned


@admin.register(HotWaterMeterReading)
class HotWaterMeterReadingAdmin(PeriodRowAdmin):
    form = HotWaterReadingForm
    what = "Hot water reading"
    list_display = ("house", "apartment_number", "owner_name", "start_reading", "end_reading", "start_used", "consumption_shown", "period_name")
    list_display_links = ("apartment_number",)
    list_editable = ("start_reading", "end_reading")
    list_filter = ("period", "apartment__building")
    search_fields = ("=apartment__number", "apartment__owner__fio", "=apartment__personal_account")
    list_select_related = ("period", "apartment__building", "apartment__owner")
    ordering = ("-period__start_date", "apartment__building__number", Length("apartment__number"), "apartment__number")
    fields = ("period", "apartment", "start_reading", "end_reading", "start_used", "consumption_shown")
    readonly_fields = ("period", "apartment", "start_used", "consumption_shown")

    def get_changelist_instance(self, request):
        # The start used for an empty start is last month's end reading: one query per period shown.
        changelist = super().get_changelist_instance(request)
        by_period = defaultdict(list)
        for reading in changelist.result_list:
            by_period[reading.period].append(reading)
        for period, readings in by_period.items():
            previous = previous_hot_water_readings([reading.apartment_id for reading in readings], period)
            for reading in readings:
                reading.previous_end = previous.get(reading.apartment_id)
        return changelist

    @staticmethod
    def _start(obj):
        if obj.start_reading is not None:
            return obj.start_reading
        return obj.previous_end if hasattr(obj, "previous_end") else obj.effective_start_reading()

    @admin.display(description="Start used")
    def start_used(self, obj):
        start = self._start(obj)
        if obj.start_reading is None and start is not None:
            return f"{plain(start)} (O'tgan oy)"
        return plain(start)

    @admin.display(description="Consumption")
    def consumption_shown(self, obj):
        start = self._start(obj)
        if obj.end_reading is None or start is None:
            return "—"
        return plain(max(Decimal("0"), obj.end_reading - start))


# ── Expenses and gas meters (rows can be added and removed) ─────────


class SheetRowAdmin(PeriodRowAdmin):
    """Expenses and gas meters belong to a house's sheet: added and removed like on the portal."""

    def has_add_permission(self, request):
        return admin.ModelAdmin.has_add_permission(self, request)

    def has_delete_permission(self, request, obj=None):
        if obj is not None and obj.period.status == CLOSED:
            return False
        return admin.ModelAdmin.has_delete_permission(self, request, obj)

    def get_readonly_fields(self, request, obj=None):
        # A row stays on its sheet; a new one is put on one.
        return ("period", "building", "service_type") if obj else ()

    def place(self, obj):
        return obj.building, None, f"house {obj.building.number}, {obj.get_service_type_display()}"

    def delete_model(self, request, obj):
        period = lock_period(obj.period_id)
        if period.status == CLOSED:
            raise ValidationError(CLOSED_MESSAGE)
        building, _apartment, where = self.place(obj)
        audit(request, period, f"{self.what} removed in admin", f"{period.title}, {where}: {obj} removed.", building=building)
        super().delete_model(request, obj)
        period.mark_in_progress()

    @admin.display(description="House", ordering="building__number")
    def house(self, obj):
        return obj.building.number


class SheetRowForm(GuardedForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk is None and "period" in self.fields:
            # A new row goes only into a period that can still be edited.
            self.fields["period"].queryset = BillingPeriod.objects.exclude(status=CLOSED)

    def value(self, cleaned, name):
        """The typed value, or the row's own one for a field this page does not edit."""
        return cleaned.get(name) if name in self.fields else getattr(self.instance, name)


class ExpenseForm(SheetRowForm):
    class Meta:
        model = Expense
        fields = ("period", "building", "service_type", "name", "amount")

    def clean(self):
        cleaned = super().clean()
        if "name" in cleaned:
            cleaned["name"] = cleaned["name"].strip()
            if not cleaned["name"]:
                self.add_error("name", "Xarajat nomini kiriting.")
        if "amount" in cleaned and not (cleaned["amount"] and cleaned["amount"] > 0):
            self.add_error("amount", "Summa 0 dan katta bo'lsin.")
        return cleaned


@admin.register(Expense)
class ExpenseAdmin(SheetRowAdmin):
    form = ExpenseForm
    what = "Expense"
    list_display = ("period_name", "house", "service_type", "name", "amount")
    list_display_links = ("period_name",)
    list_editable = ("name", "amount")
    list_filter = ("period", "building", "service_type")
    search_fields = ("name", "=building__number")
    list_select_related = ("period", "building")
    ordering = ("-period__start_date", "building__number", "service_type", "pk")


class GasMeterReadingForm(SheetRowForm):
    class Meta:
        model = GasMeterReading
        fields = ("period", "building", "service_type", "start_reading", "end_reading", "price_per_m3")

    def clean(self):
        cleaned = super().clean()
        for name in ("start_reading", "end_reading", "price_per_m3"):
            value = cleaned.get(name)
            if value is not None and value < 0:
                self.add_error(name, "Manfiy son bo'lishi mumkin emas.")
        if "price_per_m3" in cleaned and not cleaned["price_per_m3"]:
            self.add_error("price_per_m3", "1 m³ narxini kiriting.")
        if self.has_changed() and not self.errors:
            probe = GasMeterReading(
                period=self.value(cleaned, "period"),
                building=self.value(cleaned, "building"),
                service_type=self.value(cleaned, "service_type"),
                start_reading=self.value(cleaned, "start_reading"),
            )
            start, end = probe.effective_start_reading(), self.value(cleaned, "end_reading")
            if start is None:
                self.add_error("start_reading", "Boshlang'ich ko'rsatkich kiritilmagan va o'tgan oyda ham yo'q.")
            elif end is not None and end < start:
                self.add_error("end_reading", f"Oxirgi ko'rsatkich ({plain(end)}) boshlang'ichdan ({plain(start)}) kichik.")
        return cleaned


@admin.register(GasMeterReading)
class GasMeterReadingAdmin(SheetRowAdmin):
    form = GasMeterReadingForm
    what = "Gas meter"
    list_display = ("period_name", "house", "service_type", "start_reading", "end_reading", "price_per_m3", "consumption_shown")
    list_display_links = ("period_name",)
    list_editable = ("start_reading", "end_reading", "price_per_m3")
    list_filter = ("period", "building", "service_type")
    search_fields = ("=building__number",)
    list_select_related = ("period", "building")
    ordering = ("-period__start_date", "building__number", "service_type", "pk")

    @admin.display(description="Consumption")
    def consumption_shown(self, obj):
        return plain(obj.consumption)


# ── The period itself ─────────────────────────────────────


def moved_heating(record, period, new_start):
    """A heating row's dates once the period's dates change.

    A new period gives every apartment heating from its first day to its end, so a row starting on the
    old first day moves to the new one, and one ending on the old last day runs to the new end.
    """
    heated_from = new_start if record.heated_from == period.start_date else record.heated_from
    heated_until = None if record.heated_until == period.end_date else record.heated_until
    return heated_from, heated_until


class BillingPeriodForm(GuardedForm):
    class Meta:
        model = BillingPeriod
        fields = ("name", "start_date", "end_date")

    @staticmethod
    def period_of(instance):
        return instance

    def clean(self):
        cleaned = super().clean()
        if "name" in cleaned:
            cleaned["name"] = cleaned["name"].strip()
            if not cleaned["name"]:
                self.add_error("name", "Davr nomini kiriting.")
        start, end = cleaned.get("start_date"), cleaned.get("end_date")
        period = self.instance
        if start and end and start <= end and (start, end) != (period.start_date, period.end_date):
            self.check_dates(start, end)
        return cleaned

    def check_dates(self, start, end):
        """New dates: no other period over them, and every heating row still fits (see moved_heating)."""
        _lock_period_creation()  # as the portal's Create, so two changes cannot overlap
        period = self.instance
        other = BillingPeriod.objects.exclude(pk=period.pk).filter(start_date__lte=end, end_date__gte=start).first()
        if other:
            raise ValidationError(
                f"Sanalar «{other.name}» davri bilan ustma-ust tushadi ({other.start_date:%d.%m.%Y} – {other.end_date:%d.%m.%Y})."
            )
        probe = BillingPeriod(pk=period.pk, name=period.name, start_date=start, end_date=end)
        problems = []
        for record in period.heating_records.select_related("apartment__building"):
            record.heated_from, record.heated_until = moved_heating(record, period, start)
            record.period = probe
            try:
                record.clean()
            except ValidationError as exc:
                problems.append(f"{record.apartment.building.number} uy, kv {record.apartment.number}: {' '.join(exc.messages)}")
        if problems:
            shown = problems[:10] + ([f"… yana {len(problems) - 10} ta"] if len(problems) > 10 else [])
            raise ValidationError(
                [f"Yangi sanalarga {len(problems)} ta isitish qatori sig'maydi, avval ularni tuzating:"] + shown
            )


@admin.register(BillingPeriod)
class BillingPeriodAdmin(admin.ModelAdmin):
    form = BillingPeriodForm
    actions = None
    list_display = ("name", "start_date", "end_date", "status", "tables")
    list_filter = ("status",)
    search_fields = ("name",)
    ordering = ("-start_date",)
    fields = ("name", "start_date", "end_date", "status", "created_at", "closed_at", "tables")
    readonly_fields = ("status", "created_at", "closed_at", "tables")

    def has_add_permission(self, request):
        return False  # created on the portal, with tables for every house

    def has_delete_permission(self, request, obj=None):
        return False  # deleted on the portal, by typing its name

    def has_change_permission(self, request, obj=None):
        if obj is not None and obj.status == CLOSED:
            return False
        return super().has_change_permission(request, obj)

    @admin.display(description="Tables")
    def tables(self, obj):
        if not obj.pk:
            return "—"
        query = f"?period__id__exact={obj.pk}"
        links = [
            (reverse("admin:billing_heatingrecord_changelist") + query, "Isitish"),
            (reverse("admin:billing_hotwatermeterreading_changelist") + query, "Issiq suv"),
            (reverse("admin:billing_expense_changelist") + query, "Xarajatlar"),
            (reverse("admin:billing_gasmeterreading_changelist") + query, "Gaz hisoblagichlar"),
            (reverse("portal:billing_period_sheet", args=[obj.pk]), "Portalda ochish"),
        ]
        return format_html_join(" · ", '<a href="{}">{}</a>', links)

    def save_model(self, request, obj, form, change):
        old = BillingPeriod.objects.get(pk=obj.pk)
        super().save_model(request, obj, form, change)
        moved = 0
        if (old.start_date, old.end_date) != (obj.start_date, obj.end_date):
            for record in obj.heating_records.all():
                dates = moved_heating(record, old, obj.start_date)
                if dates != (record.heated_from, record.heated_until):
                    record.heated_from, record.heated_until = dates
                    record.save(update_fields=["heated_from", "heated_until"])
                    moved += 1
        changes = {
            name: [plain(getattr(old, name)), plain(getattr(obj, name))]
            for name in ("name", "start_date", "end_date")
            if getattr(old, name) != getattr(obj, name)
        }
        if changes:
            details = "; ".join(f"{form.fields[name].label}: {before} → {after}" for name, (before, after) in changes.items())
            audit(
                request,
                obj,
                "Billing period edited in admin",
                f"{old.title}: {details}." + (f" Heating rows moved to the new dates: {moved}." if moved else ""),
                changes=changes,
                heatingRowsMoved=moved,
            )
