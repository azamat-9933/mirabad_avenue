"""The billing period pages: the list of periods with the Create window, and a period's sheets.

A period is what used to be one Excel file: every house is a sheet with a heating table and a hot
water table, generated for all apartments when the period is created. Operators fill in the dates,
days and meter readings, the expenses and gas meters of each table, and close the period, which
charges every apartment account.
"""
from __future__ import annotations

import calendar
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation
from urllib.parse import urlencode

from django.contrib import messages
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils.dateparse import parse_date

from billing.calculation import group_thousands, heating_range_days, previous_hot_water_readings
from billing.models import (
    SERVICE_HEATING,
    SERVICE_HOT_WATER,
    BillingPeriod,
    BoilerRoom,
    Charge,
    Expense,
    GasMeterReading,
    HeatingRecord,
    HotWaterMeterReading,
    Invoice,
    money,
)
from billing.period_sheet import LABELS, SHEETS, build_sheet, period_workbook, sorted_buildings
from portal.audit import record_event
from portal.models import AuditEvent
from properties.models import Building

from .views import PortalPageView, _json_for_script_tag

PAGE_SIZE = 10
MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]
SERVICE_NAMES = {SERVICE_HEATING: "isitish", SERVICE_HOT_WATER: "issiq suv"}
DEFAULT_GAS_PRICE = Decimal("1000")
GAS_FIELDS = ("start", "end", "price", "room")


def default_period_name(start: date) -> str:
    return f"{start.year}-{MONTHS_UZ[start.month - 1]}"


def next_period_dates() -> tuple[date, date]:
    """The month after the latest period (or the current month): what the Create window suggests."""
    latest = BillingPeriod.objects.order_by("-end_date").first()
    start = latest.end_date + timedelta(days=1) if latest else date.today().replace(day=1)
    end = start.replace(day=calendar.monthrange(start.year, start.month)[1])
    return start, end


def is_closed(period) -> bool:
    return period.status == BillingPeriod.STATUS_CLOSED


def _number(raw, what: str) -> Decimal | None:
    """An amount or reading typed as 1 000 000,5 or 1000000.5; empty is None."""
    text = str(raw if raw is not None else "")
    text = text.replace(" ", "").replace(" ", "").replace(" ", "").replace(",", ".").strip()
    if not text:
        return None
    try:
        value = Decimal(text)
    except InvalidOperation:
        raise ValidationError(f"{what}: «{raw}» son emas.")
    if not value.is_finite() or value < 0:
        raise ValidationError(f"{what}: manfiy yoki noto'g'ri son «{raw}».")
    return value


def _day(raw, what: str) -> date | None:
    text = str(raw or "").strip()
    if not text:
        return None
    try:
        value = parse_date(text)
    except ValueError:  # well-formed but impossible, e.g. 2026-02-30
        value = None
    if value is None:
        raise ValidationError(f"{what}: noto'g'ri sana «{text}».")
    return value


def _audit(request, period, title, message, building=None, **metadata):
    record_event(
        request,
        event_type=AuditEvent.TYPE_BILLING,
        title=title,
        message=message,
        complex=building.complex if building else None,
        building=building,
        metadata={"source": "portal_billing_period", "periodId": period.pk, "periodTitle": period.title, **metadata},
    )


def _text(value) -> str:
    return "" if value is None else group_thousands(value)


def create_period(request, name: str, start_raw: str, end_raw: str) -> BillingPeriod:
    """A new open period for every house, with its heating and hot water rows for every apartment."""
    errors = []
    if not name:
        errors.append("Davr nomini kiriting.")
    elif len(name) > 100:
        errors.append("Davr nomi 100 belgidan oshmasin.")
    start = end = None
    try:
        start = _day(start_raw, "Boshlanish sanasi")
        end = _day(end_raw, "Tugash sanasi")
    except ValidationError as exc:
        errors.extend(exc.messages)
    if start is None or end is None:
        errors.append("Boshlanish va tugash sanalarini kiriting.")
    elif end < start:
        errors.append("Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas.")
    else:
        # Two periods over the same days would charge the residents twice.
        overlapping = BillingPeriod.objects.filter(start_date__lte=end, end_date__gte=start).order_by("start_date")
        if overlapping:
            names = ", ".join(f"{period.name} ({period.start_date:%d.%m.%Y}–{period.end_date:%d.%m.%Y})" for period in overlapping)
            errors.append(f"Bu sanalar boshqa davr bilan kesishadi: {names}.")
    if errors:
        raise ValidationError(list(dict.fromkeys(errors)))

    period = BillingPeriod.objects.create(name=name, start_date=start, end_date=end, status=BillingPeriod.STATUS_DRAFT)
    buildings = list(Building.objects.all())
    period.buildings.set(buildings)
    created = period.sync_default_records()
    _audit(
        request,
        period,
        "Billing period created",
        f"Period {period.title} ({start:%d.%m.%Y}–{end:%d.%m.%Y}) was created for {len(buildings)} houses: "
        f"{created['heating_created']} heating and {created['hot_water_created']} hot water rows.",
        houses=len(buildings),
        **created,
    )
    return period


def set_status(request, period, target: str):
    """Open or Closed: closing charges every apartment (a reopened period is recalculated), opening reopens."""
    if target == "closed":
        if is_closed(period):
            messages.info(request, "Davr allaqachon yopiq.")
            return
        was_reopened = period.status == BillingPeriod.STATUS_REOPENED
        charges = period.close_or_recalculate(author=request.user, reason="Portal: davr qayta yopildi.")
        total = sum((charge.amount for charge in charges), Decimal("0"))
        _audit(
            request,
            period,
            "Billing period recalculated" if was_reopened else "Billing period closed",
            f"Period {period.title} was {'recalculated and closed' if was_reopened else 'closed'}: "
            f"{len(charges)} charges, {total} UZS.",
            fromStatus=BillingPeriod.STATUS_REOPENED if was_reopened else BillingPeriod.STATUS_DRAFT,
            toStatus=BillingPeriod.STATUS_CLOSED,
            chargeCount=len(charges),
            chargeTotal=str(total),
        )
        if was_reopened:
            messages.success(request, "Davr qayta hisoblandi va yopildi, balanslar farq bo'yicha tuzatildi.")
        else:
            messages.success(request, f"Davr yopildi: {len(charges)} ta hisob abonentlarga qo'yildi.")
        return
    if target == "open":
        if not is_closed(period):
            messages.info(request, "Davr allaqachon ochiq.")
            return
        period.reopen_period()
        _audit(
            request,
            period,
            "Billing period reopened",
            f"Period {period.title} was reopened for corrections.",
            fromStatus=BillingPeriod.STATUS_CLOSED,
            toStatus=BillingPeriod.STATUS_REOPENED,
        )
        messages.warning(request, "Davr qayta ochildi. O'zgartirib, qayta yoping: balanslar farq bo'yicha tuzatiladi.")
        return
    raise ValidationError("Noto'g'ri holat.")


class BillingPeriodListView(PortalPageView):
    template_name = "portal/billing_periods.html"
    page_title = "Utility Manager | Billing Periods"
    active_page = "billing_period"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        paginator = Paginator(BillingPeriod.objects.order_by("id"), PAGE_SIZE)
        # The latest periods are on the last page, which opens by default.
        page = paginator.get_page(self.request.GET.get("page") or paginator.num_pages)
        start, end = next_period_dates()
        form = kwargs.get("form") or {
            "name": default_period_name(start),
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        }
        ctx.update(
            {
                "page": page,
                "rows": [{"period": period, "closed": is_closed(period)} for period in page.object_list],
                "form": form,
                "open_create": bool(kwargs.get("form")) or self.request.GET.get("create") == "1",
                "houses": sorted_buildings(Building.objects.all()),
                "labels_json": _json_for_script_tag(LABELS),
            }
        )
        return ctx

    def post(self, request, *args, **kwargs):
        form = {key: str(request.POST.get(key) or "").strip() for key in ("name", "start_date", "end_date")}
        try:
            with transaction.atomic():
                period = create_period(request, form["name"], form["start_date"], form["end_date"])
        except ValidationError as exc:
            for problem in exc.messages:
                messages.error(request, problem)
            return self.render_to_response(self.get_context_data(form=form))
        houses = period.buildings.count()
        messages.success(request, f"«{period.name}» davri yaratildi: {houses} ta uy uchun isitish va issiq suv jadvallari.")
        return redirect("portal:billing_periods")


class BillingPeriodSheetView(PortalPageView):
    template_name = "portal/billing_period_sheet.html"
    page_title = "Utility Manager | Billing Period"
    active_page = "billing_period"

    def dispatch(self, request, *args, **kwargs):
        self.period = get_object_or_404(BillingPeriod, pk=kwargs["pk"])
        return super().dispatch(request, *args, **kwargs)

    # ── which house and which table ──

    def _selection(self, source):
        buildings = sorted_buildings(self.period.buildings.select_related("complex"))
        try:
            building_id = int(source.get("building") or 0)
        except (TypeError, ValueError):
            building_id = 0
        building = next((item for item in buildings if item.pk == building_id), buildings[0] if buildings else None)
        sheet_type = source.get("sheet") if source.get("sheet") in SHEETS else SERVICE_HEATING
        return buildings, building, sheet_type

    def _sheet_url(self, building, sheet_type) -> str:
        query = {"building": building.pk, "sheet": sheet_type} if building else {"sheet": sheet_type}
        return f"{reverse('portal:billing_period_sheet', args=[self.period.pk])}?{urlencode(query)}"

    # ── page ──

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        buildings, building, sheet_type = self._selection(kwargs.get("source") or self.request.GET)
        typed = kwargs.get("typed")  # the submitted values, kept when saving failed
        sheet = build_sheet(self.period, building, sheet_type) if building else None

        def value(name, stored):
            return typed.get(name, "") if typed is not None else stored

        rows = []
        if sheet and sheet.is_heating:
            for number, row in enumerate(sheet.rows, start=1):
                pk = row.record.pk
                rows.append(
                    {
                        "no": number,
                        "pk": pk,
                        "apt": row.apartment.number,
                        "owner": row.owner_name,
                        "area": _text(row.apartment.area),
                        "area_raw": str(row.apartment.area),
                        "from": value(f"from-{pk}", row.heated_from.isoformat() if row.heated_from else ""),
                        "until": value(f"until-{pk}", row.heated_until.isoformat() if row.heated_until else ""),
                        "range_days": row.range_days,
                        "days": value(f"days-{pk}", str(row.days) if row.heated_from else ""),
                        "heated_area": _text(row.heated_area),
                        "amount": _text(row.amount),
                    }
                )
        elif sheet:
            for number, row in enumerate(sheet.rows, start=1):
                pk = row.reading.pk
                rows.append(
                    {
                        "no": number,
                        "pk": pk,
                        "apt": row.apartment.number,
                        "owner": row.owner_name,
                        "start": value(f"start-{pk}", _text(row.start_reading)),
                        "previous": _text(row.previous_reading),
                        "end": value(f"end-{pk}", _text(row.end_reading)),
                        "consumption": _text(row.consumption) if row.consumption is not None else "—",
                        "amount": _text(row.amount),
                    }
                )

        expenses, gas_rows, boiler_rooms = [], [], []
        gas_price_default, gas_previous_default = DEFAULT_GAS_PRICE, None
        if building:
            boiler_rooms = list(BoilerRoom.objects.filter(building=building).order_by("name"))
            for expense in self.period.expenses.filter(building=building, service_type=sheet_type).order_by("pk"):
                expenses.append(
                    {"pk": expense.pk, "name": expense.name, "amount": _text(expense.amount), "room": expense.boiler_room_id}
                )
            gas_readings = self.period.gas_meter_readings.filter(building=building, service_type=sheet_type).select_related("period")
            for reading in gas_readings.order_by("pk"):
                gas_rows.append(
                    {
                        "pk": reading.pk,
                        "start": _text(reading.start_reading),
                        "previous": _text(reading.previous_end_reading()),
                        "end": _text(reading.end_reading),
                        "price": _text(reading.price_per_m3),
                        "used": _text(reading.consumption),
                        "cost": _text(money(reading.total_gas_cost)),
                        "room": reading.boiler_room_id,
                    }
                )
            last_price = (
                GasMeterReading.objects.filter(building=building, service_type=sheet_type)
                .order_by("-period__start_date", "-pk")
                .values_list("price_per_m3", flat=True)
                .first()
            )
            gas_price_default = last_price if last_price is not None else DEFAULT_GAS_PRICE
            gas_previous_default = GasMeterReading(
                period=self.period, building=building, service_type=sheet_type
            ).previous_end_reading()

        ctx.update(
            {
                "period": self.period,
                "closed": is_closed(self.period),
                "building": building,
                "sheet_type": sheet_type,
                "sheet": sheet,
                "rows": rows,
                "total_volume": _text(sheet.total_volume) if sheet else "0",
                "total_amount": _text(sheet.total_amount) if sheet else "0",
                "total_cost": _text(sheet.total_cost) if sheet else "0",
                "tariff": _text(sheet.tariff) if sheet and sheet.tariff is not None else "",
                "costs": [(title, _text(amount)) for title, amount in sheet.costs] if sheet else [],
                "expenses": expenses,
                "gas_rows": gas_rows,
                "gas_price_default": _text(gas_price_default),
                "gas_previous_default": _text(gas_previous_default),
                "boiler_rooms": boiler_rooms if sheet_type == SERVICE_HEATING and len(boiler_rooms) > 1 else [],
                "heating_url": self._sheet_url(building, SERVICE_HEATING),
                "hot_water_url": self._sheet_url(building, SERVICE_HOT_WATER),
                "house_links": [
                    {"building": item, "url": self._sheet_url(item, sheet_type), "active": bool(building) and item.pk == building.pk}
                    for item in buildings
                ],
                "export_url": reverse("portal:billing_period_export", args=[self.period.pk]),
                "list_url": reverse("portal:billing_periods"),
                "labels_json": _json_for_script_tag(LABELS),
            }
        )
        return ctx

    # ── actions ──

    def post(self, request, *args, **kwargs):
        action = str(request.POST.get("action") or "")
        handlers = {
            "save_heating": self._save_heating,
            "save_hot_water": self._save_hot_water,
            "save_expenses": self._save_expenses,
            "save_gas": self._save_gas,
            "set_status": self._set_status,
            "refresh": self._refresh,
            "delete": self._delete,
        }
        _buildings, building, sheet_type = self._selection(request.POST)
        handler = handlers.get(action)
        if handler is None:
            messages.error(request, "Noma'lum amal.")
            return redirect(self._sheet_url(building, sheet_type))
        try:
            # The change and its activity-log entry commit together or not at all.
            with transaction.atomic():
                handler(request, building, sheet_type)
        except ValidationError as exc:
            for problem in exc.messages:
                messages.error(request, problem)
            if action in ("save_heating", "save_hot_water"):
                # Keep what was typed so it can be corrected instead of typed again.
                return self.render_to_response(self.get_context_data(source=request.POST, typed=request.POST))
        if action == "delete" and not BillingPeriod.objects.filter(pk=self.period.pk).exists():
            return redirect("portal:billing_periods")
        return redirect(self._sheet_url(building, sheet_type))

    def _ensure_editable(self, building):
        if is_closed(self.period):
            raise ValidationError("Davr yopilgan: o'zgartirish uchun avval holatni «Ochiq» qiling.")
        if building is None:
            raise ValidationError("Davrda uy yo'q.")

    @staticmethod
    def _row_ids(request) -> set:
        return {int(pk) for pk in request.POST.getlist("row") if str(pk).isdigit()}

    def _save_heating(self, request, building, sheet_type):
        self._ensure_editable(building)
        period = self.period
        records = list(
            HeatingRecord.objects.filter(period=period, apartment__building=building, pk__in=self._row_ids(request))
            .select_related("apartment")
        )
        errors = []
        for record in records:
            what = f"{building.number} uy, kv {record.apartment.number}"
            days_raw = str(request.POST.get(f"days-{record.pk}") or "").strip()
            try:
                heated_from = _day(request.POST.get(f"from-{record.pk}"), what)
                heated_until = _day(request.POST.get(f"until-{record.pk}"), what)
                if days_raw and not days_raw.isdigit():
                    raise ValidationError(f"{what}: berilgan kunlar butun son bo'lsin.")
            except ValidationError as exc:
                errors.extend(exc.messages)
                continue
            if heated_from is None or heated_until == period.end_date:
                heated_until = None  # not heated, or heated to the period's end
            days = int(days_raw) if days_raw else None
            record.period = period
            record.heated_from, record.heated_until = heated_from, heated_until
            # Days equal to the whole range stay automatic, so they follow later date changes.
            record.days_given = None if days is None or days == heating_range_days(period, heated_from, heated_until) else days
            try:
                record.clean()
            except ValidationError as exc:
                errors.extend(f"{what}: {message}" for message in exc.messages)
        if errors:
            raise ValidationError(errors)
        HeatingRecord.objects.bulk_update(records, ["heated_from", "heated_until", "days_given", "excluded_dates"])
        _audit(
            request,
            period,
            "Heating table saved",
            f"Heating table of house {building.number} saved: {len(records)} apartments.",
            building=building,
            rows=len(records),
        )
        messages.success(request, f"{building.number} uy: isitish jadvali saqlandi.")

    def _save_hot_water(self, request, building, sheet_type):
        self._ensure_editable(building)
        period = self.period
        readings = list(
            HotWaterMeterReading.objects.filter(period=period, apartment__building=building, pk__in=self._row_ids(request))
            .select_related("apartment")
        )
        previous = previous_hot_water_readings([reading.apartment_id for reading in readings], period)
        errors = []
        for reading in readings:
            what = f"{building.number} uy, kv {reading.apartment.number}"
            try:
                start = _number(request.POST.get(f"start-{reading.pk}"), what)
                end = _number(request.POST.get(f"end-{reading.pk}"), what)
            except ValidationError as exc:
                errors.extend(exc.messages)
                continue
            effective_start = start if start is not None else previous.get(reading.apartment_id)
            if end is not None and effective_start is not None and end < effective_start:
                errors.append(
                    f"{what}: oxirgi ko'rsatkich ({group_thousands(end)}) boshlang'ichdan ({group_thousands(effective_start)}) kichik."
                )
                continue
            reading.start_reading, reading.end_reading = start, end
        if errors:
            raise ValidationError(errors)
        HotWaterMeterReading.objects.bulk_update(readings, ["start_reading", "end_reading"])
        _audit(
            request,
            period,
            "Hot water table saved",
            f"Hot water table of house {building.number} saved: {len(readings)} apartments.",
            building=building,
            rows=len(readings),
        )
        messages.success(request, f"{building.number} uy: issiq suv jadvali saqlandi.")

    @staticmethod
    def _room(raw, building, sheet_type, what):
        raw = str(raw or "").strip()
        if sheet_type != SERVICE_HEATING or not raw:
            return None
        room = BoilerRoom.objects.filter(pk=raw, building=building).first() if raw.isdigit() else None
        if room is None:
            raise ValidationError(f"{what}: qozonxona bu uyga tegishli emas.")
        return room

    @staticmethod
    def _new_rows(request, prefix: str, names) -> list[dict]:
        """The rows added in a window: {name: value} per row, from the repeated new_<name> fields."""
        columns = {name: request.POST.getlist(f"{prefix}{name}") for name in names}
        count = max((len(values) for values in columns.values()), default=0)
        return [{name: (values[index] if index < len(values) else "") for name, values in columns.items()} for index in range(count)]

    def _save_expenses(self, request, building, sheet_type):
        self._ensure_editable(building)
        period = self.period
        errors, kept, removed, added = [], [], [], []

        def checked(name, raw_amount, raw_room):
            amount = _number(raw_amount, f"«{name}»")
            room = self._room(raw_room, building, sheet_type, f"«{name}»")
            if not name or not amount:
                raise ValidationError(f"«{name or raw_amount}»: xarajat nomi va 0 dan katta summa kerak.")
            return name[:255], money(amount), room

        for expense in period.expenses.filter(building=building, service_type=sheet_type):
            if request.POST.get(f"delete-{expense.pk}"):
                removed.append(expense)
                continue
            try:
                expense.name, expense.amount, expense.boiler_room = checked(
                    str(request.POST.get(f"name-{expense.pk}", expense.name) or "").strip(),
                    request.POST.get(f"amount-{expense.pk}", expense.amount),
                    request.POST.get(f"room-{expense.pk}", expense.boiler_room_id or ""),
                )
                kept.append(expense)
            except ValidationError as exc:
                errors.extend(exc.messages)
        for row in self._new_rows(request, "new_", ("name", "amount", "room")):
            name = str(row["name"]).strip()
            if not name and not str(row["amount"]).strip():
                continue  # an empty new row
            try:
                name, amount, room = checked(name, row["amount"], row["room"])
                added.append(
                    Expense(period=period, building=building, service_type=sheet_type, name=name, amount=amount, boiler_room=room)
                )
            except ValidationError as exc:
                errors.extend(exc.messages)
        if errors:
            raise ValidationError(errors)
        for expense in removed:
            expense.delete()
        Expense.objects.bulk_update(kept, ["name", "amount", "boiler_room"])
        Expense.objects.bulk_create(added)
        total = sum((expense.amount for expense in kept + added), Decimal("0"))
        _audit(
            request,
            period,
            "Expenses saved",
            f"{SERVICE_NAMES[sheet_type]} expenses of house {building.number}: {len(kept) + len(added)} rows, {total} UZS "
            f"({len(added)} added, {len(removed)} removed).",
            building=building,
            serviceType=sheet_type,
            total=str(total),
        )
        messages.success(request, f"{building.number} uy, {SERVICE_NAMES[sheet_type]}: xarajatlar saqlandi.")

    def _gas_meter(self, reading, values: dict, building, sheet_type):
        """The gas meter with the typed start, end, price and boiler room, validated."""
        what = f"{building.number} uy, gaz hisoblagich"
        start = _number(values.get("start"), what)
        end = _number(values.get("end"), what)
        price = _number(values.get("price"), what)
        room = self._room(values.get("room"), building, sheet_type, what)
        if end is None or not price:
            raise ValidationError(f"{what}: oxirgi ko'rsatkich va 1 m³ narxini kiriting.")
        reading.start_reading, reading.end_reading, reading.price_per_m3, reading.boiler_room = start, end, price, room
        effective = reading.effective_start_reading()
        if effective is None:
            raise ValidationError(f"{what}: boshlang'ich ko'rsatkich kiritilmagan va o'tgan oyda ham yo'q.")
        if end < effective:
            raise ValidationError(
                f"{what}: oxirgi ko'rsatkich ({group_thousands(end)}) boshlang'ichdan ({group_thousands(effective)}) kichik."
            )
        return reading

    def _save_gas(self, request, building, sheet_type):
        self._ensure_editable(building)
        period = self.period
        errors, kept, removed, added = [], [], [], []
        for reading in period.gas_meter_readings.filter(building=building, service_type=sheet_type).select_related("period"):
            if request.POST.get(f"gdelete-{reading.pk}"):
                removed.append(reading)
                continue
            values = {name: request.POST.get(f"g{name}-{reading.pk}") for name in GAS_FIELDS}
            try:
                kept.append(self._gas_meter(reading, values, building, sheet_type))
            except ValidationError as exc:
                errors.extend(exc.messages)
        for values in self._new_rows(request, "new_g", GAS_FIELDS):
            if not str(values["start"]).strip() and not str(values["end"]).strip():
                continue  # an empty new row
            reading = GasMeterReading(period=period, building=building, service_type=sheet_type)
            try:
                added.append(self._gas_meter(reading, values, building, sheet_type))
            except ValidationError as exc:
                errors.extend(exc.messages)
        if errors:
            raise ValidationError(errors)
        for reading in removed:
            reading.delete()
        for reading in kept + added:
            reading.save()
        _audit(
            request,
            period,
            "Gas meters saved",
            f"{SERVICE_NAMES[sheet_type]} gas meters of house {building.number}: {len(kept) + len(added)} rows "
            f"({len(added)} added, {len(removed)} removed).",
            building=building,
            serviceType=sheet_type,
        )
        messages.success(request, f"{building.number} uy, {SERVICE_NAMES[sheet_type]}: gaz hisoblagich saqlandi.")

    def _set_status(self, request, building, sheet_type):
        set_status(request, self.period, str(request.POST.get("status") or ""))

    def _refresh(self, request, building, sheet_type):
        """Bring the tables up to date with the houses and apartments added since the period was made."""
        if is_closed(self.period):
            messages.info(request, "Davr yopiq: jadvallar o'zgarmaydi.")
            return
        added_houses = list(Building.objects.exclude(pk__in=self.period.buildings.values_list("pk", flat=True)))
        if added_houses:
            self.period.buildings.add(*added_houses)
        created = self.period.sync_default_records()
        if not added_houses and not created["heating_created"]:
            messages.info(request, "Jadvallar yangi: qo'shiladigan uy yoki kvartira yo'q.")
            return
        _audit(
            request,
            self.period,
            "Billing period refreshed",
            f"Period {self.period.title} refreshed: {len(added_houses)} houses and {created['heating_created']} apartments added.",
            houses=len(added_houses),
            **created,
        )
        messages.success(
            request, f"Jadvallar yangilandi: {len(added_houses)} ta uy, {created['heating_created']} ta kvartira qo'shildi."
        )

    def _delete(self, request, building, sheet_type):
        period = self.period
        if is_closed(period) or Charge.objects.filter(period=period).exists() or Invoice.objects.filter(period=period).exists():
            raise ValidationError("Hisoblar qo'yilgan davrni o'chirib bo'lmaydi: u abonent balanslariga yozilgan.")
        _audit(
            request,
            period,
            "Billing period deleted",
            f"Period {period.title} ({period.start_date:%d.%m.%Y}–{period.end_date:%d.%m.%Y}) was deleted with its tables.",
        )
        name = period.name
        period.delete()
        messages.success(request, f"«{name}» davri o'chirildi.")


def billing_period_export(request, pk):
    period = get_object_or_404(BillingPeriod, pk=pk)
    lang = request.GET.get("lang") if request.GET.get("lang") in ("en", "ru", "uz") else "ru"
    response = HttpResponse(
        period_workbook(period, lang),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    safe_name = "".join(ch if ch.isascii() and (ch.isalnum() or ch in "-_") else "-" for ch in period.name).strip("-")
    response["Content-Disposition"] = f'attachment; filename="billing-{safe_name or period.pk}.xlsx"'
    return response
