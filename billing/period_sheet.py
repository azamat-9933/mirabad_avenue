"""A billing period laid out as the operators kept it in Excel: one sheet per house, each with a
heating table and a hot water table.

The rows are the period's HeatingRecord / HotWaterMeterReading rows, created for every apartment of
every house when the period is made (BillingPeriod.sync_default_records). The amounts come from
calculation.build_plan, so a sheet shows exactly what closing the period will charge.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from io import BytesIO

from .calculation import _natural_key, build_plan, previous_hot_water_readings
from .models import (
    SERVICE_HEATING,
    SERVICE_HOT_WATER,
    HeatingRecord,
    HotWaterMeterReading,
    rate,
    volume,
)

ZERO = Decimal("0")
SHEETS = (SERVICE_HEATING, SERVICE_HOT_WATER)

# Labels of the period pages and of the exported workbook, by language (the portal's EN/RU/UZ switch).
LABELS = {
    "billing": {"en": "Billing", "ru": "Биллинг", "uz": "Billing"},
    "periods_title": {"en": "House Billing Periods", "ru": "Расчётные периоды", "uz": "Hisob davrlari"},
    "create": {"en": "Create", "ru": "Создать", "uz": "Yaratish"},
    "edit": {"en": "Edit", "ru": "Изменить", "uz": "Tahrirlash"},
    "id": {"en": "ID", "ru": "ID", "uz": "ID"},
    "name": {"en": "Name", "ru": "Название", "uz": "Nomi"},
    "start": {"en": "Start", "ru": "Начало", "uz": "Boshlanishi"},
    "end": {"en": "End", "ru": "Конец", "uz": "Tugashi"},
    "days": {"en": "Days", "ru": "Дней", "uz": "Kunlar"},
    "status": {"en": "Status", "ru": "Статус", "uz": "Holat"},
    "status_open": {"en": "Open", "ru": "Открыт", "uz": "Ochiq"},
    "status_closed": {"en": "Closed", "ru": "Закрыт", "uz": "Yopiq"},
    "prev": {"en": "Prev", "ru": "Назад", "uz": "Oldingi"},
    "next": {"en": "Next", "ru": "Далее", "uz": "Keyingi"},
    "page": {"en": "Page", "ru": "Страница", "uz": "Sahifa"},
    "no_periods": {
        "en": "No billing periods yet. Press Create.",
        "ru": "Расчётных периодов пока нет. Нажмите «Создать».",
        "uz": "Hali hisob davri yo'q. «Yaratish»ni bosing.",
    },
    "new_period": {"en": "New billing period", "ru": "Новый расчётный период", "uz": "Yangi hisob davri"},
    "start_date": {"en": "Start date", "ru": "Дата начала", "uz": "Boshlanish sanasi"},
    "end_date": {"en": "End date", "ru": "Дата окончания", "uz": "Tugash sanasi"},
    "houses": {"en": "Houses", "ru": "Дома", "uz": "Uylar"},
    "all_houses_note": {
        "en": "Created for every house, with a heating and a hot water table per house.",
        "ru": "Создаётся для всех домов: в каждом доме таблицы отопления и ГВС.",
        "uz": "Barcha uylar uchun yaratiladi: har bir uyda isitish va issiq suv jadvali.",
    },
    "cancel": {"en": "Cancel", "ru": "Отмена", "uz": "Bekor qilish"},
    "export": {"en": "Export", "ru": "Экспорт", "uz": "Eksport"},
    "period_house": {"en": "Period / House", "ru": "Период / Дом", "uz": "Davr / Uy"},
    "back": {"en": "All periods", "ru": "Все периоды", "uz": "Barcha davrlar"},
    "heating": {"en": "Heating", "ru": "Отопление", "uz": "Isitish"},
    "hot_water": {"en": "Hot water", "ru": "ГВС", "uz": "Issiq suv"},
    "no": {"en": "No.", "ru": "№", "uz": "№"},
    "full_name": {"en": "Full name", "ru": "Ф.И.О.", "uz": "F.I.O."},
    "apt": {"en": "Apt", "ru": "Кв", "uz": "Kv"},
    "area": {"en": "Area, m²", "ru": "Площадь, м²", "uz": "Maydon, m²"},
    "heated_from": {"en": "Start date", "ru": "Дата начала", "uz": "Boshlanish"},
    "heated_until": {"en": "End date", "ru": "Дата окончания", "uz": "Tugash"},
    "range_days": {"en": "Days", "ru": "Сутки", "uz": "Sutka"},
    "days_given": {"en": "Days heated", "ru": "Дней отопления", "uz": "Berilgan kunlar"},
    "heated_area": {"en": "Heated area", "ru": "Общ. квадрат", "uz": "Umumiy kvadrat"},
    "amount": {"en": "Amount", "ru": "Сумма", "uz": "Summa"},
    "start_reading": {"en": "Start reading", "ru": "Нач. показ. ГВС", "uz": "Boshlang'ich ko'rsatkich"},
    "end_reading": {"en": "End reading", "ru": "Кон. показ. ГВС", "uz": "Oxirgi ko'rsatkich"},
    "consumption": {"en": "Used, m³", "ru": "Расход, м³", "uz": "Sarf, m³"},
    "total": {"en": "Total", "ru": "Итого", "uz": "Jami"},
    "gas_meter": {"en": "Gas meter", "ru": "Газ счётчик", "uz": "Gaz hisoblagich"},
    "expenses": {"en": "Expenses", "ru": "Расходы", "uz": "Xarajatlar"},
    "save": {"en": "Save", "ru": "Сохранить", "uz": "Saqlash"},
    "refresh": {"en": "Refresh", "ru": "Обновить", "uz": "Yangilash"},
    "delete": {"en": "Delete", "ru": "Удалить", "uz": "O'chirish"},
    "apply": {"en": "Apply", "ru": "Применить", "uz": "Qo'llash"},
    "total_cost": {"en": "Total expenses", "ru": "Общий расход", "uz": "Jami xarajat"},
    "tariff_heating": {"en": "Rate per m²·day", "ru": "Тариф за м²·сутки", "uz": "1 m²·kun narxi"},
    "tariff_hot_water": {"en": "Rate per m³", "ru": "Тариф за м³", "uz": "1 m³ narxi"},
    "expense_name": {"en": "Expense", "ru": "Статья расхода", "uz": "Xarajat nomi"},
    "add_row": {"en": "Add row", "ru": "Добавить строку", "uz": "Qator qo'shish"},
    "remove": {"en": "Remove", "ru": "Удалить", "uz": "O'chirish"},
    "gas_start": {"en": "Start reading", "ru": "Начальное показание", "uz": "Boshlang'ich ko'rsatkich"},
    "gas_end": {"en": "End reading", "ru": "Конечное показание", "uz": "Oxirgi ko'rsatkich"},
    "gas_price": {"en": "Price per m³", "ru": "Цена за м³", "uz": "1 m³ narxi"},
    "gas_cost": {"en": "Cost", "ru": "Стоимость", "uz": "Qiymati"},
    "boiler_room": {"en": "Boiler room", "ru": "Котельная", "uz": "Qozonxona"},
    "previous_hint": {
        "en": "Empty: last month's end reading",
        "ru": "Пусто: конечное показание прошлого месяца",
        "uz": "Bo'sh: o'tgan oyning oxirgi ko'rsatkichi",
    },
    "closed_note": {
        "en": "The period is closed and billed: its tables are read-only. Set the status to Open to change them.",
        "ru": "Период закрыт и начислен: таблицы только для чтения. Чтобы изменить, переведите статус в «Открыт».",
        "uz": "Davr yopilgan va hisoblar qo'yilgan: jadvallarni faqat ko'rish mumkin. O'zgartirish uchun holatni «Ochiq» qiling.",
    },
    "delete_confirm": {
        "en": "Delete this period with all its tables?",
        "ru": "Удалить этот период со всеми таблицами?",
        "uz": "Bu davr barcha jadvallari bilan o'chirilsinmi?",
    },
    "close_confirm": {
        "en": "Close the period? Every resident's account will be charged.",
        "ru": "Закрыть период? Суммы будут списаны со счетов жильцов.",
        "uz": "Davr yopilsinmi? Har bir abonent hisobidan summa yechiladi.",
    },
    "no_apartments": {"en": "No apartments in this house.", "ru": "В доме нет квартир.", "uz": "Uyda kvartira yo'q."},
    "no_houses": {"en": "No houses yet.", "ru": "Домов пока нет.", "uz": "Hali uy yo'q."},
    "must_fix": {"en": "Fix before closing:", "ru": "Перед закрытием исправить:", "uz": "Yopishdan oldin tuzatish kerak:"},
    "note": {"en": "Note:", "ru": "Обратите внимание:", "uz": "E'tibor bering:"},
    "no_expenses": {"en": "No expenses entered.", "ru": "Расходы не внесены.", "uz": "Xarajat kiritilmagan."},
    "no_gas": {"en": "No gas meter entered.", "ru": "Газовый счётчик не внесён.", "uz": "Gaz hisoblagich kiritilmagan."},
    "house": {"en": "House", "ru": "Дом", "uz": "Uy"},
}


def label(key: str, lang: str = "ru") -> str:
    entry = LABELS.get(key, {})
    return entry.get(lang) or entry.get("en") or key


def owner_name(apartment) -> str:
    owner = getattr(apartment, "owner", None)
    return owner.fio if owner else ""


def sorted_buildings(buildings) -> list:
    return sorted(buildings, key=lambda building: _natural_key(building.number))


@dataclass
class HeatingRow:
    record: HeatingRecord
    apartment: object
    owner_name: str
    heated_from: date | None
    heated_until: date | None  # the last heated day shown (the period's end when not entered)
    range_days: int
    days: int
    heated_area: Decimal
    amount: Decimal


@dataclass
class HotWaterRow:
    reading: HotWaterMeterReading
    apartment: object
    owner_name: str
    start_reading: Decimal | None  # as entered; None takes previous_reading
    previous_reading: Decimal | None
    end_reading: Decimal | None
    consumption: Decimal | None
    amount: Decimal

    @property
    def start(self):
        return self.start_reading if self.start_reading is not None else self.previous_reading


@dataclass
class Sheet:
    """One table of a house: heating or hot water."""

    service_type: str
    rows: list
    costs: list = field(default_factory=list)  # (title, amount)
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    tariff: Decimal | None = None

    @property
    def is_heating(self) -> bool:
        return self.service_type == SERVICE_HEATING

    @property
    def total_cost(self) -> Decimal:
        return sum((amount for _, amount in self.costs), ZERO)

    @property
    def total_amount(self) -> Decimal:
        return sum((row.amount for row in self.rows), ZERO)

    @property
    def total_volume(self) -> Decimal:
        if self.is_heating:
            return sum((row.heated_area for row in self.rows), ZERO)
        return sum((row.consumption or ZERO for row in self.rows), ZERO)


def _zones(plan, building, service_type) -> list:
    return [zone for zone in plan.zones if zone.building.pk == building.pk and zone.service_type == service_type]


def _amounts(zones) -> dict:
    amounts = {}
    for zone in zones:
        if zone.billable and zone.total_volume > 0:
            for row in zone.rows:
                amounts[row.apartment.pk] = amounts.get(row.apartment.pk, ZERO) + row.amount
    return amounts


def _notes(plan, building, service_type) -> tuple[list, list]:
    """The plan's errors and warnings about this house's table."""
    marker = "isitish" if service_type == SERVICE_HEATING else "issiq suv"
    prefix = f"{building.number} uy"

    def pick(notes):
        return [note for note in notes if note.startswith(prefix) and marker in note]

    return pick(plan.errors), pick(plan.warnings)


def _with_plan(sheet: Sheet, plan, building) -> Sheet:
    zones = _zones(plan, building, sheet.service_type)
    sheet.costs = [cost for zone in zones for cost in zone.costs]
    billable = [zone for zone in zones if zone.billable and zone.total_volume > 0]
    if len(billable) == 1:
        sheet.tariff = rate(billable[0].tariff)
    sheet.errors, sheet.warnings = _notes(plan, building, sheet.service_type)
    return sheet


def heating_sheet(period, building, plan=None) -> Sheet:
    plan = plan if plan is not None else build_plan(period)
    amounts = _amounts(_zones(plan, building, SERVICE_HEATING))
    records = list(
        HeatingRecord.objects.filter(period=period, apartment__building=building).select_related("apartment", "apartment__owner")
    )
    records.sort(key=lambda record: _natural_key(record.apartment.number))
    rows = []
    for record in records:
        apartment = record.apartment
        days = record.heated_days_in(period)
        rows.append(
            HeatingRow(
                record=record,
                apartment=apartment,
                owner_name=owner_name(apartment),
                heated_from=record.heated_from,
                heated_until=record.heated_until or (period.end_date if record.heated_from else None),
                range_days=record.range_days_in(period),
                days=days,
                heated_area=volume(apartment.area * days),
                amount=amounts.get(apartment.pk, ZERO),
            )
        )
    return _with_plan(Sheet(SERVICE_HEATING, rows), plan, building)


def hot_water_sheet(period, building, plan=None) -> Sheet:
    plan = plan if plan is not None else build_plan(period)
    amounts = _amounts(_zones(plan, building, SERVICE_HOT_WATER))
    readings = list(
        HotWaterMeterReading.objects.filter(period=period, apartment__building=building).select_related(
            "apartment", "apartment__owner"
        )
    )
    readings.sort(key=lambda reading: _natural_key(reading.apartment.number))
    previous = previous_hot_water_readings([reading.apartment_id for reading in readings], period)
    rows = []
    for reading in readings:
        start = reading.start_reading if reading.start_reading is not None else previous.get(reading.apartment_id)
        end = reading.end_reading
        consumption = end - start if start is not None and end is not None and end >= start else None
        rows.append(
            HotWaterRow(
                reading=reading,
                apartment=reading.apartment,
                owner_name=owner_name(reading.apartment),
                start_reading=reading.start_reading,
                previous_reading=previous.get(reading.apartment_id),
                end_reading=end,
                consumption=consumption,
                amount=amounts.get(reading.apartment_id, ZERO),
            )
        )
    return _with_plan(Sheet(SERVICE_HOT_WATER, rows), plan, building)


def build_sheet(period, building, service_type, plan=None) -> Sheet:
    if service_type == SERVICE_HOT_WATER:
        return hot_water_sheet(period, building, plan)
    return heating_sheet(period, building, plan)


# ── Excel export: the period as one workbook, two sheets per house ─────────────────────────────

def _sheet_title(text: str, used: set) -> str:
    title = "".join(ch for ch in text if ch not in "[]:*?/\\")[:31] or "Sheet"
    base, index = title, 2
    while title in used:
        suffix = f" ({index})"
        title = f"{base[:31 - len(suffix)]}{suffix}"
        index += 1
    used.add(title)
    return title


def period_workbook(period, lang: str = "ru") -> bytes:
    """The whole period as an .xlsx: for every house a heating sheet and a hot water sheet."""
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter

    plan = build_plan(period)
    workbook = Workbook()
    workbook.remove(workbook.active)
    thin = Side(style="thin", color="B7C4CC")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    header_fill = PatternFill("solid", fgColor="DCEBF2")
    bold = Font(bold=True)
    amount_format = "#,##0.00"
    used_titles: set = set()

    def put(sheet, row, column, value, number_format=None, font=None, fill=None):
        cell = sheet.cell(row=row, column=column, value=value)
        cell.border = border
        if number_format:
            cell.number_format = number_format
        if font:
            cell.font = font
        if fill:
            cell.fill = fill
        return cell

    for building in sorted_buildings(period.buildings.all()):
        for service_type in SHEETS:
            data = build_sheet(period, building, service_type, plan)
            sheet = workbook.create_sheet(_sheet_title(f"{building.number} {label(service_type, lang)}", used_titles))
            title = f"{period.name} — {label('house', lang)} {building.number} — {label(service_type, lang)}"
            sheet.cell(row=1, column=1, value=title).font = Font(bold=True, size=13)
            sheet.cell(row=2, column=1, value=f"{period.start_date:%d.%m.%Y} – {period.end_date:%d.%m.%Y}")
            if data.is_heating:
                headers = ["no", "full_name", "apt", "area", "heated_from", "heated_until", "range_days", "days_given", "heated_area", "amount"]
                widths = [6, 34, 8, 12, 13, 13, 9, 15, 15, 16]
                volume_column = 9
            else:
                headers = ["no", "full_name", "apt", "start_reading", "end_reading", "consumption", "amount"]
                widths = [6, 34, 8, 18, 18, 13, 16]
                volume_column = 6
            header_row = 4
            for column, key in enumerate(headers, start=1):
                cell = put(sheet, header_row, column, label(key, lang), font=bold, fill=header_fill)
                cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
                sheet.column_dimensions[get_column_letter(column)].width = widths[column - 1]
            row_index = header_row
            for number, row in enumerate(data.rows, start=1):
                row_index += 1
                if data.is_heating:
                    values = [
                        number, row.owner_name, str(row.apartment.number), row.apartment.area,
                        row.heated_from, row.heated_until, row.range_days, row.days, row.heated_area, row.amount,
                    ]
                    formats = [None, None, None, "#,##0.00", "DD.MM.YYYY", "DD.MM.YYYY", None, None, "#,##0.00", amount_format]
                else:
                    values = [
                        number, row.owner_name, str(row.apartment.number), row.start, row.end_reading,
                        row.consumption, row.amount,
                    ]
                    formats = [None, None, None, "#,##0.00", "#,##0.00", "#,##0.00", amount_format]
                for column, (value, number_format) in enumerate(zip(values, formats), start=1):
                    put(sheet, row_index, column, value, number_format)
            row_index += 1
            put(sheet, row_index, 1, label("total", lang), font=bold)
            put(sheet, row_index, volume_column, data.total_volume, "#,##0.00", font=bold)
            put(sheet, row_index, len(headers), data.total_amount, amount_format, font=bold)
            row_index += 2
            put(sheet, row_index, 2, label("expenses", lang), font=bold, fill=header_fill)
            put(sheet, row_index, 3, label("amount", lang), font=bold, fill=header_fill)
            for cost_title, amount in data.costs:
                row_index += 1
                put(sheet, row_index, 2, cost_title)
                put(sheet, row_index, 3, amount, amount_format)
            row_index += 1
            put(sheet, row_index, 2, label("total_cost", lang), font=bold)
            put(sheet, row_index, 3, data.total_cost, amount_format, font=bold)
            if data.tariff is not None:
                row_index += 1
                put(sheet, row_index, 2, label("tariff_heating" if data.is_heating else "tariff_hot_water", lang), font=bold)
                put(sheet, row_index, 3, data.tariff, "#,##0.0000", font=bold)
            sheet.freeze_panes = sheet.cell(row=header_row + 1, column=1)
    if not workbook.sheetnames:
        workbook.create_sheet(label("no_houses", lang)[:31])
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()
