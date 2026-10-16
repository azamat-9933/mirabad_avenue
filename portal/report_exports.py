from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal
from io import BytesIO

from billing.models import (
    BillingPeriod,
    HeatingCalculationSummary,
    HeatingRecord,
    HotWaterCalculationSummary,
    HotWaterMeterReading,
    Invoice,
)
from django.utils import timezone
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side
from openpyxl.utils import get_column_letter
from payments.models import Transaction
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


REPORT_TYPE_HOT_WATER = "hot_water"
REPORT_TYPE_HEATING = "heating"
REPORT_TYPE_PAYMENTS = "payments"
REPORT_TYPE_ALL = "all"
EXCEL_MONEY_FORMAT = '#,##0 "UZS"'
EXCEL_DECIMAL_FORMAT = "#,##0.00"
EXCEL_INTEGER_FORMAT = "0"
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
ALLOWED_REPORT_TYPES = {
    REPORT_TYPE_HOT_WATER,
    REPORT_TYPE_HEATING,
    REPORT_TYPE_PAYMENTS,
    REPORT_TYPE_ALL,
}

REPORT_TEXT = {
    "backend_export": {"en": "Backend Export", "ru": "Backend-экспорт", "uz": "Backend eksport"},
    "backend_export_subtitle": {
        "en": "Real billing and payment rows from the database",
        "ru": "Реальные строки биллинга и платежей из базы данных",
        "uz": "Bazadan olingan haqiqiy billing va to'lov qatorlari",
    },
    "generated": {"en": "Generated", "ru": "Сформировано", "uz": "Yaratilgan"},
    "no_owner": {"en": "No owner assigned", "ru": "Владелец не назначен", "uz": "Egasi biriktirilmagan"},
    "report_type": {"en": "Report type", "ru": "Тип отчёта", "uz": "Hisobot turi"},
    "scope": {"en": "Scope", "ru": "Область", "uz": "Qamrov"},
    "sheets": {"en": "Sheets", "ru": "Листы", "uz": "Varaqlar"},
    "rows": {"en": "Rows", "ru": "Строки", "uz": "Qatorlar"},
    "no_rows": {
        "en": "No rows for current filters.",
        "ru": "Нет строк для текущих фильтров.",
        "uz": "Joriy filtrlar uchun qatorlar yo'q.",
    },
    "period": {"en": "Period", "ru": "Период", "uz": "Davr"},
    "house": {"en": "House", "ru": "Дом", "uz": "Uy"},
    "apartment": {"en": "Apartment", "ru": "Квартира", "uz": "Xonadon"},
    "resident": {"en": "Resident", "ru": "Абонент", "uz": "Abonent"},
    "address": {"en": "Address", "ru": "Адрес", "uz": "Manzil"},
    "date": {"en": "Date", "ru": "Дата", "uz": "Sana"},
    "date_from": {"en": "Date from", "ru": "Дата с", "uz": "Sana boshidan"},
    "date_to": {"en": "Date to", "ru": "Дата по", "uz": "Sana oxirigacha"},
    "start_reading": {"en": "Start reading", "ru": "Начальное показание", "uz": "Boshlang'ich ko'rsatkich"},
    "end_reading": {"en": "End reading", "ru": "Конечное показание", "uz": "Yakuniy ko'rsatkich"},
    "consumption_m3": {"en": "Consumption (m3)", "ru": "Расход (м3)", "uz": "Sarf (m3)"},
    "amount_to_pay": {"en": "Amount to pay (UZS)", "ru": "Сумма к оплате (UZS)", "uz": "To'lov summasi (UZS)"},
    "total_expenses": {"en": "Total expenses (UZS)", "ru": "Общие расходы (UZS)", "uz": "Umumiy xarajatlar (UZS)"},
    "total_consumption": {"en": "Total consumption (m3)", "ru": "Общий расход (м3)", "uz": "Umumiy sarf (m3)"},
    "tariff_m3": {"en": "Tariff per m3", "ru": "Тариф за м3", "uz": "1 m3 tarifi"},
    "area_m2": {"en": "Area (m2)", "ru": "Площадь (м2)", "uz": "Maydon (m2)"},
    "days_heated": {"en": "Days heated", "ru": "Дней отопления", "uz": "Isitilgan kunlar"},
    "heated_area": {"en": "Heated area", "ru": "Отапливаемая площадь", "uz": "Isitilgan maydon"},
    "amount": {"en": "Amount (UZS)", "ru": "Сумма (UZS)", "uz": "Summa (UZS)"},
    "total_heated_area": {"en": "Total heated area", "ru": "Общая отапливаемая площадь", "uz": "Umumiy isitilgan maydon"},
    "cost_sqm": {"en": "Cost per sqm-day", "ru": "Стоимость за м2-день", "uz": "m2-kun narxi"},
    "fio": {"en": "Resident name", "ru": "ФИО абонента", "uz": "Abonent FIO"},
    "payment_type": {"en": "Type", "ru": "Тип", "uz": "Turi"},
    "created_by": {"en": "Created by", "ru": "Создал", "uz": "Yaratgan"},
    "balance_before": {"en": "Balance before", "ru": "Баланс до", "uz": "Oldingi balans"},
    "balance_after": {"en": "Balance after", "ru": "Баланс после", "uz": "Keyingi balans"},
    "description": {"en": "Description", "ru": "Описание", "uz": "Tavsif"},
    "payment_click": {"en": "Via Click", "ru": "Через Click", "uz": "Click orqali"},
    "payment_payme": {"en": "Via Payme", "ru": "Через Payme", "uz": "Payme orqali"},
    "payment_cash": {"en": "Cash", "ru": "Наличные", "uz": "Naqd"},
    "payment_card": {"en": "By card", "ru": "Картой", "uz": "Karta orqali"},
    "payment_terminal": {"en": "Terminal", "ru": "Терминал", "uz": "Terminal"},
    "payment_transfer": {"en": "Card transfer", "ru": "Перевод на карту", "uz": "Kartaga o'tkazma"},
    "payment_manual": {"en": "Manual adjustment", "ru": "Ручная корректировка", "uz": "Qo'lda tuzatish"},
    "payment_charge": {"en": "Monthly charge", "ru": "Начисление за месяц", "uz": "Oylik hisoblash"},
    "payment_recalculation": {"en": "Recalculation", "ru": "Перерасчёт", "uz": "Qayta hisoblash"},
    "payment_balance_debit": {"en": "Balance subtraction", "ru": "Вычитание баланса", "uz": "Balansdan ayirish"},
    "payment_utility": {"en": "Utility payment", "ru": "Коммунальный платёж", "uz": "Kommunal to'lov"},
    "payment_late_penalty": {"en": "Late penalty", "ru": "Пеня за просрочку", "uz": "Kechikish jarimasi"},
    "payments_register": {"en": "Payments Register", "ru": "Реестр платежей", "uz": "To'lovlar reyestri"},
    "payments_subtitle": {
        "en": "Real payment and balance transactions from Django backend",
        "ru": "Реальные платежи и изменения баланса из Django backend",
        "uz": "Django backenddan haqiqiy to'lov va balans tranzaksiyalari",
    },
    "hot_water_summary": {"en": "Hot Water Summary", "ru": "Сводка ГВС", "uz": "Issiq suv xulosasi"},
    "hot_water_summary_subtitle": {
        "en": "Building totals, expenses and tariff per m3",
        "ru": "Итоги по домам, расходы и тариф за м3",
        "uz": "Uylar bo'yicha jami, xarajatlar va 1 m3 tarifi",
    },
    "heating_summary": {"en": "Heating Summary", "ru": "Сводка отопления", "uz": "Isitish xulosasi"},
    "heating_summary_subtitle": {
        "en": "Building totals, heated area and cost per sqm-day",
        "ru": "Итоги по домам, отапливаемая площадь и стоимость за м2-день",
        "uz": "Uylar bo'yicha jami, isitilgan maydon va m2-kun narxi",
    },
    "empty_report": {"en": "Report", "ru": "Отчёт", "uz": "Hisobot"},
}


def _lang(language: str | None) -> str:
    value = str(language or "en").strip().lower()
    return value if value in {"en", "ru", "uz"} else "en"


def _t(key: str, language: str | None) -> str:
    lang = _lang(language)
    labels = REPORT_TEXT.get(key, {})
    return labels.get(lang) or labels.get("en") or key


def _excel_number_format(cell: dict | None = None) -> str:
    style = (cell or {}).get("style")
    if style == 6:
        return EXCEL_MONEY_FORMAT
    if style == 8:
        return EXCEL_INTEGER_FORMAT
    return EXCEL_DECIMAL_FORMAT


def _money_text(value: Decimal | int | float | None) -> str:
    amount = Decimal(str(value or 0))
    return f"{amount:,.2f}".replace(",", " ")


def _number_text(value: Decimal | int | float | None, places: int = 2) -> str:
    amount = Decimal(str(value or 0))
    return f"{amount:,.{places}f}".replace(",", " ")


def _date_text(value: date | datetime | None) -> str:
    if not value:
        return ""
    if isinstance(value, datetime):
        value = timezone.localtime(value).date() if timezone.is_aware(value) else value.date()
    return value.strftime("%d.%m.%Y")


def _transaction_channel_key(transaction: Transaction) -> str:
    description = str(transaction.description or "").lower()
    if "[portal:click-credit]" in description or transaction.payment_type == Transaction.TYPE_CLICK:
        return "payment_click"
    if "[portal:payme-credit]" in description or transaction.payment_type == Transaction.TYPE_PAYME:
        return "payment_payme"
    if "[portal:cash-credit]" in description or transaction.payment_type == Transaction.TYPE_CASH:
        return "payment_cash"
    if "[portal:terminal-credit]" in description:
        return "payment_terminal"
    if "[portal:card-credit]" in description:
        return "payment_card"
    if "[portal:transfer-credit]" in description:
        return "payment_transfer"
    if "[portal:balance-debit]" in description:
        return "payment_balance_debit"
    if "[billing:recalculation]" in description:
        return "payment_recalculation"
    if transaction.payment_type == Transaction.TYPE_CHARGE:
        return "payment_charge"
    if transaction.payment_type == Transaction.TYPE_MANUAL:
        return "payment_manual"
    return ""


def _transaction_type_text(transaction: Transaction, language: str) -> str:
    key = _transaction_channel_key(transaction)
    if key:
        return _t(key, language)
    return str(transaction.get_payment_type_display() or "")


def _transaction_description_text(transaction: Transaction, language: str) -> str:
    raw = str(transaction.description or "").strip()
    normalized = raw.lower()
    key = _transaction_channel_key(transaction)
    if key:
        return _t(key, language)
    common_descriptions = {
        "monthly utility payment": "payment_utility",
        "late penalty": "payment_late_penalty",
        "portal credit via click.": "payment_click",
        "portal credit via payme.": "payment_payme",
        "portal credit via cash.": "payment_cash",
        "portal credit via card.": "payment_card",
        "portal credit via card transfer.": "payment_transfer",
        "portal manual balance subtraction.": "payment_balance_debit",
    }
    common_key = common_descriptions.get(normalized)
    if common_key:
        return _t(common_key, language)
    return raw


def _report_type_label(report_type: str, language: str) -> str:
    language = _lang(language)
    labels = {
        REPORT_TYPE_HOT_WATER: {"en": "Hot Water", "ru": "ГВС", "uz": "Issiq suv"},
        REPORT_TYPE_HEATING: {"en": "Heating", "ru": "Отопление", "uz": "Isitish"},
        REPORT_TYPE_PAYMENTS: {"en": "Payments", "ru": "Платежи", "uz": "To'lovlar"},
        REPORT_TYPE_ALL: {"en": "All reports", "ru": "Все отчёты", "uz": "Barcha hisobotlar"},
    }
    return labels.get(report_type, labels[REPORT_TYPE_ALL]).get(language, labels[report_type]["en"] if report_type in labels else "Report")


def _sheet_title(base: str, suffix: str | None = None) -> str:
    title = base if not suffix else f"{base} - {suffix}"
    title = str(title or "Sheet").strip() or "Sheet"
    invalid = '[]:*?/\\'
    for char in invalid:
        title = title.replace(char, " ")
    title = " ".join(title.split())
    return title[:31]


def _unique_ints(values) -> list[int]:
    seen = set()
    rows = []
    for value in values or []:
        try:
            item = int(value)
        except (TypeError, ValueError):
            continue
        if item and item not in seen:
            seen.add(item)
            rows.append(item)
    return rows


def _parse_datetime_local(value):
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw)
    except ValueError:
        return None
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    return timezone.localtime(parsed)


def _periods_for_range(date_from, date_to):
    queryset = BillingPeriod.objects.order_by("start_date", "id")
    start_date = date_from.date() if date_from else None
    end_date = date_to.date() if date_to else None
    if start_date:
        queryset = queryset.filter(end_date__gte=start_date)
    if end_date:
        queryset = queryset.filter(start_date__lte=end_date)
    return queryset


def _scope_text(building_ids, apartment_ids, owner_ids, language: str) -> str:
    if owner_ids:
        return {
            "en": "Filtered by resident",
            "ru": "Фильтр по резиденту",
            "uz": "Rezident bo'yicha filtr",
        }[language]
    if apartment_ids:
        return {
            "en": "Filtered by apartment",
            "ru": "Фильтр по квартире",
            "uz": "Kvartira bo'yicha filtr",
        }[language]
    if building_ids:
        return {
            "en": "Filtered by house",
            "ru": "Фильтр по дому",
            "uz": "Uy bo'yicha filtr",
        }[language]
    return {
        "en": "All available backend rows",
        "ru": "Все доступные backend-строки",
        "uz": "Barcha backend qatorlari",
    }[language]


# Shared style objects: building new Font/Border/Alignment objects for every cell made
# large exports (tens of thousands of rows) take ~30 s; reusing them gives identical files.
_BASE_BORDER = Border(
    left=Side(style="thin", color="D9D9D9"),
    right=Side(style="thin", color="D9D9D9"),
    top=Side(style="thin", color="D9D9D9"),
    bottom=Side(style="thin", color="D9D9D9"),
)
_HEADER_FONT = Font(name="Arial", size=10, bold=True, color="000000")
_HEADER_ALIGNMENT = Alignment(horizontal="center", vertical="center", wrap_text=True)
_BODY_FONT = Font(name="Arial", size=10, color="000000")
_BODY_ALIGNMENT_TEXT = Alignment(horizontal="left", vertical="center", wrap_text=True)
_BODY_ALIGNMENT_NUMBER = Alignment(horizontal="right", vertical="center", wrap_text=True)
_BODY_TEXT_STYLE = "Mirabad body text"
_BODY_NUMBER_STYLE = "Mirabad body number"


class WorkbookReportBuilder:
    def __init__(self):
        self._sheets = []

    def add_sheet(self, name: str, title: str, subtitle: str, meta_rows: list[tuple[str, str]], headers: list[str], data_rows: list[list[dict]], **options):
        sheet = {
            "name": name,
            "title": title,
            "subtitle": subtitle,
            "meta_rows": meta_rows,
            "headers": headers,
            "data_rows": data_rows,
        }
        sheet.update(options)
        self._sheets.append(sheet)

    def build(self) -> bytes:
        workbook = Workbook()
        workbook.remove(workbook.active)
        # Body cells reference these by name, which copies a prepared style instead of
        # hashing Font/Border/Alignment objects for every cell.
        for name, alignment in ((_BODY_TEXT_STYLE, _BODY_ALIGNMENT_TEXT), (_BODY_NUMBER_STYLE, _BODY_ALIGNMENT_NUMBER)):
            workbook.add_named_style(NamedStyle(name=name, font=_BODY_FONT, alignment=alignment, border=_BASE_BORDER))
        used_names = set()
        for sheet in self._sheets:
            ws = workbook.create_sheet(self._unique_sheet_name(sheet["name"], used_names))
            self._write_sheet(ws, sheet)
        output = BytesIO()
        workbook.save(output)
        return output.getvalue()

    def _unique_sheet_name(self, name: str, used_names: set[str]) -> str:
        base = _sheet_title(name)
        candidate = base
        counter = 2
        while candidate.lower() in used_names:
            suffix = f" {counter}"
            candidate = f"{base[:31 - len(suffix)]}{suffix}"
            counter += 1
        used_names.add(candidate.lower())
        return candidate

    def _write_sheet(self, ws, sheet: dict):
        template = sheet.get("template")
        if template == "hot_water":
            self._write_hot_water_sheet(ws, sheet)
            return
        if template == "hot_water_summary":
            self._write_hot_water_summary_sheet(ws, sheet)
            return
        if template == "heating":
            self._write_heating_sheet(ws, sheet)
            return
        if template == "heating_summary":
            self._write_heating_summary_sheet(ws, sheet)
            return
        if template == "plain":
            self._write_plain_table_sheet(ws, sheet)
            return

        headers = sheet["headers"]
        max_cols = max(1, len(headers))
        last_col = get_column_letter(max_cols)
        border = Border(
            left=Side(style="thin", color="D7E3F4"),
            right=Side(style="thin", color="D7E3F4"),
            top=Side(style="thin", color="D7E3F4"),
            bottom=Side(style="thin", color="D7E3F4"),
        )
        title_fill = PatternFill("solid", fgColor="F8FAFC")
        subtitle_fill = PatternFill("solid", fgColor="F8FAFC")
        meta_fill = PatternFill("solid", fgColor="E2E8F0")
        header_fill = PatternFill("solid", fgColor="0F766E")
        row_fill = PatternFill("solid", fgColor="F8FAFC")

        ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=max_cols)
        ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=max_cols)
        ws["A1"] = sheet["title"]
        ws["A1"].font = Font(name="Arial", size=18, bold=True, color="0F172A")
        ws["A1"].fill = title_fill
        ws["A2"] = sheet["subtitle"]
        ws["A2"].font = Font(name="Arial", size=10, bold=True, color="64748B")
        ws["A2"].fill = subtitle_fill

        row_idx = 4
        for label, value in sheet["meta_rows"]:
            ws.cell(row_idx, 1, label)
            ws.cell(row_idx, 2, value)
            for col_idx in range(1, 3):
                cell = ws.cell(row_idx, col_idx)
                cell.fill = meta_fill if col_idx == 1 else row_fill
                cell.border = border
                cell.font = Font(name="Arial", size=10, bold=(col_idx == 1), color="1F2937")
            row_idx += 1
        row_idx += 1

        header_row = row_idx
        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(header_row, col_idx, header)
            cell.fill = header_fill
            cell.font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = border
        row_idx += 1

        data_rows = sheet["data_rows"] or [[_text_cell(_t("no_rows", sheet.get("language", "en")))]]
        for row in data_rows:
            for col_idx, source in enumerate(row, start=1):
                cell = ws.cell(row_idx, col_idx, self._cell_value(source))
                cell.fill = row_fill
                cell.border = border
                cell.font = Font(name="Arial", size=10, color="1F2937")
                cell.alignment = Alignment(horizontal="right" if source.get("type") == "number" else "left", vertical="center")
                if source.get("type") == "number":
                    cell.number_format = _excel_number_format(source)
            row_idx += 1

        ws.freeze_panes = ws.cell(header_row + 1, 1)
        ws.auto_filter.ref = f"A{header_row}:{last_col}{max(header_row, row_idx - 1)}"
        ws.sheet_view.showGridLines = False
        ws.row_dimensions[1].height = 28
        ws.row_dimensions[2].height = 22
        self._apply_widths(ws, sheet)

    def _cell_value(self, cell: dict):
        value = cell.get("value")
        if cell.get("type") == "number":
            return float(value or 0)
        return value or ""

    def _apply_widths(self, ws, sheet: dict):
        widths = [max(12, min(38, len(str(header or "")) + 4)) for header in sheet["headers"]]
        for row in sheet["data_rows"][:300]:
            for idx, cell in enumerate(row):
                text = str(cell.get("display", cell.get("value") or ""))
                widths[idx] = max(widths[idx], min(42, len(text) + 3))
        for col_idx, width in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(col_idx)].width = width

    def _base_border(self):
        return _BASE_BORDER

    def _sample_header_style(self, cell):
        cell.font = _HEADER_FONT
        cell.alignment = _HEADER_ALIGNMENT
        cell.border = _BASE_BORDER

    def _sample_body_style(self, cell, is_number=False, source: dict | None = None):
        cell.style = _BODY_NUMBER_STYLE if is_number else _BODY_TEXT_STYLE
        if is_number:
            cell.number_format = _excel_number_format(source)

    def _write_empty_sample_row(self, ws, row_idx: int, start_col: int, end_col: int, message: str):
        ws.merge_cells(start_row=row_idx, start_column=start_col, end_row=row_idx, end_column=end_col)
        cell = ws.cell(row_idx, start_col, message)
        cell.font = Font(name="Arial", size=10, italic=True, color="666666")
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        cell.border = self._base_border()
        for col_idx in range(start_col, end_col + 1):
            ws.cell(row_idx, col_idx).border = self._base_border()

    def _write_hot_water_sheet(self, ws, sheet: dict):
        headers = sheet["headers"]
        widths = [11, 36, 18, 15, 14, 16]
        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(1, col_idx, header)
            self._sample_header_style(cell)
            ws.column_dimensions[get_column_letter(col_idx)].width = widths[col_idx - 1]
        if not sheet["data_rows"]:
            self._write_empty_sample_row(ws, 2, 1, 6, _t("no_rows", sheet.get("language")))
            ws.sheet_view.showGridLines = True
            return
        for row_idx, row in enumerate(sheet["data_rows"], start=2):
            for col_idx, source in enumerate(row, start=1):
                value = self._cell_value(source)
                if col_idx == 5:
                    value = f"=D{row_idx}-C{row_idx}"
                cell = ws.cell(row_idx, col_idx, value)
                self._sample_body_style(cell, source.get("type") == "number" or col_idx in {3, 4, 5, 6}, source)
            ws.cell(row_idx, 6, self._cell_value(row[5]))
            self._sample_body_style(ws.cell(row_idx, 6), True, row[5])
        ws.sheet_view.showGridLines = True

    def _write_hot_water_summary_sheet(self, ws, sheet: dict):
        headers = sheet["headers"]
        for col_idx, index in enumerate(range(1, len(headers) + 1), start=2):
            ws.cell(2, col_idx, index)
            self._sample_body_style(ws.cell(2, col_idx), True)
        for col_idx, header in enumerate(headers, start=2):
            cell = ws.cell(3, col_idx, header)
            self._sample_header_style(cell)
        widths = [9, 18, 27, 26, 17, 20, 25, 20, 16]
        for col_idx, width in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(col_idx)].width = width
        if not sheet["data_rows"]:
            self._write_empty_sample_row(ws, 4, 2, 9, _t("no_rows", sheet.get("language")))
            ws.sheet_view.showGridLines = True
            return
        for row_idx, row in enumerate(sheet["data_rows"], start=4):
            house = row[0].get("value")
            total_expenses = self._cell_value(row[2])
            consumption = self._cell_value(row[3])
            tariff = self._cell_value(row[4])
            values = [None, house, total_expenses, 0, "", 0, f"=C{row_idx}+D{row_idx}+F{row_idx}", consumption, tariff]
            for col_idx, value in enumerate(values, start=1):
                cell = ws.cell(row_idx, col_idx, value)
                source = row[2] if col_idx in {3, 7, 9} else row[3] if col_idx == 8 else row[4] if col_idx == 9 else None
                self._sample_body_style(cell, col_idx not in {1, 2, 5}, source)
        ws.sheet_view.showGridLines = True

    def _write_heating_sheet(self, ws, sheet: dict):
        headers = sheet["headers"]
        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(1, col_idx, header)
            self._sample_header_style(cell)
        for col_idx in [1, 2, 3, 5, 6, 7, 8, 9]:
            ws.merge_cells(start_row=1, start_column=col_idx, end_row=2, end_column=col_idx)
        ws.cell(2, 4, sheet.get("total_area") or "")
        self._sample_header_style(ws.cell(2, 4))
        widths = [7, 36, 30, 14, 15, 14, 12, 15, 15]
        for col_idx, width in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(col_idx)].width = width
        if not sheet["data_rows"]:
            self._write_empty_sample_row(ws, 3, 1, 9, _t("no_rows", sheet.get("language")))
            ws.sheet_view.showGridLines = True
            return
        for row_idx, row in enumerate(sheet["data_rows"], start=3):
            values = [self._cell_value(cell) for cell in row[:9]]
            for col_idx, value in enumerate(values, start=1):
                cell = ws.cell(row_idx, col_idx, value)
                self._sample_body_style(cell, col_idx in {1, 4, 7, 8, 9}, row[col_idx - 1] if col_idx <= len(row) else None)
                if col_idx in {5, 6}:
                    cell.number_format = "dd.mm.yyyy"
        ws.sheet_view.showGridLines = True

    def _write_heating_summary_sheet(self, ws, sheet: dict):
        ws.cell(1, 3, sheet["headers"][0] if sheet["headers"] else _t("total_expenses", sheet.get("language")))
        self._sample_header_style(ws.cell(1, 3))
        ws.column_dimensions["B"].width = 16
        ws.column_dimensions["C"].width = 21
        if not sheet["data_rows"]:
            self._write_empty_sample_row(ws, 2, 2, 3, _t("no_rows", sheet.get("language")))
            ws.sheet_view.showGridLines = True
            return
        last_row = 1
        for row_idx, row in enumerate(sheet["data_rows"], start=2):
            ws.cell(row_idx, 2, row[0].get("value"))
            ws.cell(row_idx, 3, self._cell_value(row[2]))
            self._sample_body_style(ws.cell(row_idx, 2), False)
            self._sample_body_style(ws.cell(row_idx, 3), True, row[2])
            last_row = row_idx
        if last_row >= 2:
            ws.cell(last_row + 1, 3, f"=SUM(C2:C{last_row})")
            self._sample_body_style(ws.cell(last_row + 1, 3), True, _number_cell(0, style=6))
        ws.sheet_view.showGridLines = True

    def _write_plain_table_sheet(self, ws, sheet: dict):
        for col_idx, header in enumerate(sheet["headers"], start=1):
            cell = ws.cell(1, col_idx, header)
            self._sample_header_style(cell)
        data_rows = sheet["data_rows"] or [[_text_cell(_t("no_rows", sheet.get("language", "en")))]]
        for row_idx, row in enumerate(data_rows, start=2):
            for col_idx, source in enumerate(row, start=1):
                cell = ws.cell(row_idx, col_idx, self._cell_value(source))
                self._sample_body_style(cell, source.get("type") == "number", source)
        self._apply_widths(ws, sheet)
        ws.sheet_view.showGridLines = True


def _text_cell(value, style: int = 5):
    return {"value": value, "style": style, "type": "text", "display": str(value or "")}


def _number_cell(value, style: int = 6, display: str | None = None):
    raw = Decimal(str(value or 0))
    return {"value": raw, "style": style, "type": "number", "display": display or str(raw)}


# Fonts with Cyrillic and Uzbek Latin glyphs; Helvetica (the fallback) has neither.
REPORT_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/TTF/DejaVuSans.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]


def _report_font_name() -> str:
    for path in REPORT_FONT_CANDIDATES:
        try:
            pdfmetrics.registerFont(TTFont("MirabadReport", path))
            return "MirabadReport"
        except Exception:
            continue
    return "Helvetica"


def _pdf_cell(value, style: ParagraphStyle):
    return Paragraph(str(value or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), style)


def _build_report_pdf(report_type: str, sheets: list[dict], summary_rows: list[tuple[str, str]], language: str) -> bytes:
    return _build_pdf(
        f"backend-report-{report_type}",
        _t("backend_export", language),
        f"{_report_type_label(report_type, language)} - {_t('backend_export_subtitle', language)}",
        sheets,
        summary_rows,
        language,
    )


def _build_pdf(
    document_title: str,
    heading: str,
    subheading: str,
    sheets: list[dict],
    summary_rows: list[tuple[str, str]],
    language: str,
) -> bytes:
    """Landscape A4 PDF: heading, optional summary table on its own page, then one table per sheet.

    Each sheet needs "headers" and "rows" (cells from _text_cell/_number_cell); "title" and
    "subtitle" are printed above the table when present.
    """
    font_name = _report_font_name()
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName=font_name,
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        alignment=TA_LEFT,
        spaceAfter=8,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=8,
    )
    cell_style = ParagraphStyle(
        "ReportCell",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=7,
        leading=8.5,
        textColor=colors.HexColor("#1F2937"),
    )
    header_style = ParagraphStyle(
        "ReportHeader",
        parent=cell_style,
        fontName=font_name,
        fontSize=7,
        leading=8.5,
        textColor=colors.white,
    )

    output = BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=landscape(A4),
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
        title=document_title,
    )
    story = [
        Paragraph(heading, title_style),
        Paragraph(subheading, subtitle_style),
    ]

    if summary_rows:
        summary_table = Table(
            [[_pdf_cell(label, header_style), _pdf_cell(value, cell_style)] for label, value in summary_rows],
            colWidths=[45 * mm, 120 * mm],
            repeatRows=0,
        )
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#0F766E")),
                    ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#F8FAFC")),
                    ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D7E3F4")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.extend([summary_table, PageBreak()])

    available_width = landscape(A4)[0] - 20 * mm
    for index, sheet in enumerate(sheets, start=1):
        if sheet.get("title"):
            story.append(Paragraph(sheet["title"], title_style))
        if sheet.get("subtitle"):
            story.append(Paragraph(sheet["subtitle"], subtitle_style))
        table_rows = [[_pdf_cell(header, header_style) for header in sheet["headers"]]]
        if sheet["rows"]:
            for row in sheet["rows"]:
                table_rows.append([
                    _pdf_cell(cell.get("display", cell.get("value") or ""), cell_style)
                    for cell in row
                ])
        else:
            table_rows.append([_pdf_cell(_t("no_rows", language), cell_style)] + [_pdf_cell("", cell_style) for _ in sheet["headers"][1:]])

        col_count = max(1, len(sheet["headers"]))
        table = Table(table_rows, colWidths=[available_width / col_count] * col_count, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F766E")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D7E3F4")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(table)
        if index < len(sheets):
            story.append(PageBreak())
        else:
            story.append(Spacer(1, 8))

    doc.build(story)
    return output.getvalue()


def _collect_export_filters(payload):
    return {
        "building_ids": _unique_ints(payload.get("building_backend_ids")),
        "apartment_ids": _unique_ints(payload.get("apartment_backend_ids")),
        "owner_ids": _unique_ints(payload.get("owner_ids")),
        "date_from": _parse_datetime_local(payload.get("date_from")),
        "date_to": _parse_datetime_local(payload.get("date_to")),
    }


def _filter_hot_water_queryset(queryset, filters):
    if filters["building_ids"]:
        queryset = queryset.filter(apartment__building_id__in=filters["building_ids"])
    if filters["apartment_ids"]:
        queryset = queryset.filter(apartment_id__in=filters["apartment_ids"])
    if filters["owner_ids"]:
        queryset = queryset.filter(apartment__owner__id__in=filters["owner_ids"])
    if filters["date_from"] or filters["date_to"]:
        periods = _periods_for_range(filters["date_from"], filters["date_to"])
        queryset = queryset.filter(period__in=periods)
    return queryset


def _filter_heating_queryset(queryset, filters):
    if filters["building_ids"]:
        queryset = queryset.filter(apartment__building_id__in=filters["building_ids"])
    if filters["apartment_ids"]:
        queryset = queryset.filter(apartment_id__in=filters["apartment_ids"])
    if filters["owner_ids"]:
        queryset = queryset.filter(apartment__owner__id__in=filters["owner_ids"])
    if filters["date_from"] or filters["date_to"]:
        periods = _periods_for_range(filters["date_from"], filters["date_to"])
        queryset = queryset.filter(period__in=periods)
    return queryset


def _filter_invoice_queryset(queryset, filters):
    if filters["building_ids"]:
        queryset = queryset.filter(apartment__building_id__in=filters["building_ids"])
    if filters["apartment_ids"]:
        queryset = queryset.filter(apartment_id__in=filters["apartment_ids"])
    if filters["owner_ids"]:
        queryset = queryset.filter(apartment__owner__id__in=filters["owner_ids"])
    if filters["date_from"] or filters["date_to"]:
        periods = _periods_for_range(filters["date_from"], filters["date_to"])
        queryset = queryset.filter(period__in=periods)
    return queryset


def _filter_transaction_queryset(queryset, filters):
    # Ledger rows belong to apartment accounts; a resident filter means that resident's account.
    if filters["building_ids"]:
        queryset = queryset.filter(apartment__building_id__in=filters["building_ids"])
    if filters["apartment_ids"]:
        queryset = queryset.filter(apartment_id__in=filters["apartment_ids"])
    if filters["owner_ids"]:
        queryset = queryset.filter(apartment__owner__id__in=filters["owner_ids"])
    if filters["date_from"]:
        queryset = queryset.filter(created_at__gte=filters["date_from"])
    if filters["date_to"]:
        queryset = queryset.filter(created_at__lte=filters["date_to"])
    return queryset


def _build_hot_water_report(filters, language):
    language = _lang(language)
    reading_qs = _filter_hot_water_queryset(
        HotWaterMeterReading.objects.select_related(
            "period",
            "apartment__building__complex",
            "apartment__owner",
        ).order_by("apartment__building__number", "apartment__number"),
        filters,
    )
    invoice_qs = _filter_invoice_queryset(
        Invoice.objects.select_related("period", "apartment__building"),
        filters,
    )
    invoice_map = {
        (invoice.period_id, invoice.apartment_id): invoice
        for invoice in invoice_qs
    }
    summary_qs = HotWaterCalculationSummary.objects.select_related("period", "building").order_by("building__number", "period__start_date")
    if filters["building_ids"]:
        summary_qs = summary_qs.filter(building_id__in=filters["building_ids"])
    if filters["date_from"] or filters["date_to"]:
        summary_qs = summary_qs.filter(period__in=_periods_for_range(filters["date_from"], filters["date_to"]))

    grouped = defaultdict(list)
    for reading in reading_qs:
        apartment = reading.apartment
        building = apartment.building
        owner = getattr(apartment, "owner", None)
        invoice = invoice_map.get((reading.period_id, apartment.id))
        grouped[building.id].append(
            {
                "building_name": building.number,
                "period_name": reading.period.title,
                "period": reading.period,
                "resident": owner.fio if owner else "",
                "apartment": apartment.number,
                "start": reading.start_reading or Decimal("0"),
                "end": reading.end_reading or Decimal("0"),
                "consumption": reading.consumption,
                "amount": getattr(invoice, "hot_water_amount", Decimal("0")) or Decimal("0"),
            }
        )

    hot_water_headers = [
        _t("apartment", language),
        _t("resident", language),
        _t("start_reading", language),
        _t("end_reading", language),
        _t("consumption_m3", language),
        _t("amount_to_pay", language),
    ]

    if not grouped and not summary_qs.exists():
        return [
            {
                "name": _report_type_label(REPORT_TYPE_HOT_WATER, language),
                "title": _report_type_label(REPORT_TYPE_HOT_WATER, language),
                "subtitle": _t("backend_export_subtitle", language),
                "template": "hot_water",
                "language": language,
                "section": REPORT_TYPE_HOT_WATER,
                "headers": hot_water_headers,
                "rows": [],
            }
        ]

    sheets = []
    summary_rows = []
    for summary in summary_qs:
        detail_rows = grouped.get(summary.building_id, [])
        summary_rows.append([
            _text_cell(summary.building.number),
            _text_cell(summary.period.title),
            _number_cell(summary.total_expenses, style=6, display=_money_text(summary.total_expenses)),
            _number_cell(summary.total_consumption, style=7, display=_number_text(summary.total_consumption, 4)),
            _number_cell(summary.tariff_per_m3, style=6, display=_money_text(summary.tariff_per_m3)),
            _number_cell(len(detail_rows), style=8, display=str(len(detail_rows))),
        ])
    summary_by_building = {summary.building_id: summary for summary in summary_qs}
    for building_id, rows in grouped.items():
        building_name = rows[0]["building_name"]
        period_name = rows[0]["period_name"]
        summary = summary_by_building.get(building_id)
        first_period = rows[0].get("period")
        sheets.append(
            {
                "name": f"{building_name}",
                "title": f"{_report_type_label(REPORT_TYPE_HOT_WATER, language)} - {building_name}",
                "subtitle": f"{_t('period', language)}: {period_name}",
                "template": "hot_water",
                "language": language,
                "section": REPORT_TYPE_HOT_WATER,
                "period_start": getattr(first_period, "start_date", None),
                "period_end": getattr(first_period, "end_date", None),
                "tariff": getattr(summary, "tariff_per_m3", Decimal("0")) if summary else Decimal("0"),
                "headers": hot_water_headers,
                "rows": [
                    [
                        _text_cell(item["apartment"]),
                        _text_cell(item["resident"]),
                        _number_cell(item["start"], style=7, display=_number_text(item["start"], 4)),
                        _number_cell(item["end"], style=7, display=_number_text(item["end"], 4)),
                        _number_cell(item["consumption"], style=7, display=_number_text(item["consumption"], 4)),
                        _number_cell(item["amount"], style=6, display=_money_text(item["amount"])),
                    ]
                    for item in rows
                ],
            }
        )
    if summary_rows:
        sheets.append(
            {
                "name": _t("hot_water_summary", language),
                "title": _t("hot_water_summary", language),
                "subtitle": _t("hot_water_summary_subtitle", language),
                "template": "hot_water_summary",
                "language": language,
                "section": "hot_water_summary",
                "headers": [
                    _t("house", language),
                    _t("period", language),
                    _t("total_expenses", language),
                    _t("total_consumption", language),
                    _t("tariff_m3", language),
                    _t("rows", language),
                ],
                "rows": summary_rows,
            }
        )
    return sheets


def _build_heating_report(filters, language):
    language = _lang(language)
    record_qs = _filter_heating_queryset(
        HeatingRecord.objects.select_related(
            "period",
            "apartment__building__complex",
            "apartment__owner",
        ).order_by("apartment__building__number", "apartment__number"),
        filters,
    )
    invoice_qs = _filter_invoice_queryset(
        Invoice.objects.select_related("period", "apartment__building"),
        filters,
    )
    invoice_map = {
        (invoice.period_id, invoice.apartment_id): invoice
        for invoice in invoice_qs
    }
    summary_qs = HeatingCalculationSummary.objects.select_related("period", "building").order_by("building__number", "period__start_date")
    if filters["building_ids"]:
        summary_qs = summary_qs.filter(building_id__in=filters["building_ids"])
    if filters["date_from"] or filters["date_to"]:
        summary_qs = summary_qs.filter(period__in=_periods_for_range(filters["date_from"], filters["date_to"]))

    grouped = defaultdict(list)
    for record in record_qs:
        apartment = record.apartment
        building = apartment.building
        owner = getattr(apartment, "owner", None)
        invoice = invoice_map.get((record.period_id, apartment.id))
        grouped[building.id].append(
            {
                "building_name": building.number,
                "period_name": record.period.title,
                "apartment": apartment.number,
                "resident": owner.fio if owner else "",
                "address": apartment.building.address or "",
                "area": apartment.area or Decimal("0"),
                "start": record.period.start_date,
                "end": record.period.end_date,
                "days": record.heated_days,
                "heated_area": record.heated_area,
                "amount": getattr(invoice, "heating_amount", Decimal("0")) or Decimal("0"),
            }
        )

    heating_headers = [
        "№",
        _t("fio", language),
        _t("address", language),
        _t("area_m2", language),
        _t("date_from", language),
        _t("date_to", language),
        _t("days_heated", language),
        _t("heated_area", language),
        _t("amount", language),
    ]

    if not grouped and not summary_qs.exists():
        return [
            {
                "name": _report_type_label(REPORT_TYPE_HEATING, language),
                "title": _report_type_label(REPORT_TYPE_HEATING, language),
                "subtitle": _t("backend_export_subtitle", language),
                "template": "heating",
                "language": language,
                "section": REPORT_TYPE_HEATING,
                "total_area": "",
                "headers": heating_headers,
                "rows": [],
            }
        ]

    sheets = []
    summary_rows = []
    for summary in summary_qs:
        detail_rows = grouped.get(summary.building_id, [])
        summary_rows.append([
            _text_cell(summary.building.number),
            _text_cell(summary.period.title),
            _number_cell(summary.total_expenses, style=6, display=_money_text(summary.total_expenses)),
            _number_cell(summary.total_heated_area, style=7, display=_number_text(summary.total_heated_area, 2)),
            _number_cell(summary.cost_per_sqm, style=6, display=_money_text(summary.cost_per_sqm)),
            _number_cell(len(detail_rows), style=8, display=str(len(detail_rows))),
        ])
    summary_by_building = {summary.building_id: summary for summary in summary_qs}
    for building_id, rows in grouped.items():
        building_name = rows[0]["building_name"]
        period_name = rows[0]["period_name"]
        summary = summary_by_building.get(building_id)
        sheets.append(
            {
                "name": f"{building_name}",
                "title": f"{_report_type_label(REPORT_TYPE_HEATING, language)} - {building_name}",
                "subtitle": f"{_t('period', language)}: {period_name}",
                "template": "heating",
                "language": language,
                "section": REPORT_TYPE_HEATING,
                "total_area": getattr(summary, "total_heated_area", "") if summary else "",
                "headers": heating_headers,
                "rows": [
                    [
                        _text_cell(item["apartment"]),
                        _text_cell(item["resident"]),
                        _text_cell(item["address"]),
                        _number_cell(item["area"], style=7, display=_number_text(item["area"], 2)),
                        _text_cell(_date_text(item["start"])),
                        _text_cell(_date_text(item["end"])),
                        _number_cell(item["days"], style=8, display=str(item["days"])),
                        _number_cell(item["heated_area"], style=7, display=_number_text(item["heated_area"], 2)),
                        _number_cell(item["amount"], style=6, display=_money_text(item["amount"])),
                    ]
                    for item in rows
                ],
            }
        )
    if summary_rows:
        sheets.append(
            {
                "name": _t("heating_summary", language),
                "title": _t("heating_summary", language),
                "subtitle": _t("heating_summary_subtitle", language),
                "template": "heating_summary",
                "language": language,
                "section": "heating_summary",
                "headers": [
                    _t("total_expenses", language),
                ],
                "rows": summary_rows,
            }
        )
    return sheets


def _build_payments_report(filters, language):
    language = _lang(language)
    transaction_qs = _filter_transaction_queryset(
        Transaction.objects.filter(apartment__isnull=False).select_related(
            "owner",
            "apartment__building__complex",
            "invoice__period",
        ).order_by("-created_at", "-id"),
        filters,
    )
    rows = []
    for item in transaction_qs:
        apartment = item.apartment
        building = apartment.building if apartment and apartment.building_id else None
        rows.append([
            _text_cell(_date_text(item.created_at)),
            # Who held the account when the entry was made; vacant-period charges have nobody.
            _text_cell(item.owner.fio if item.owner_id else _t("no_owner", language)),
            _text_cell(building.number if building else ""),
            _text_cell(apartment.number if apartment else ""),
            _text_cell(_transaction_type_text(item, language)),
            _text_cell(item.created_by or ""),
            _text_cell(item.invoice.period.title if item.invoice_id and item.invoice and item.invoice.period_id else ""),
            _number_cell(item.amount, style=6, display=_money_text(item.amount)),
            _number_cell(item.balance_before, style=6, display=_money_text(item.balance_before)),
            _number_cell(item.balance_after, style=6, display=_money_text(item.balance_after)),
            _text_cell(_transaction_description_text(item, language)),
        ])
    return [
        {
            "name": _report_type_label(REPORT_TYPE_PAYMENTS, language),
            "title": _t("payments_register", language),
            "subtitle": _t("payments_subtitle", language),
            "template": "plain",
            "language": language,
            "section": REPORT_TYPE_PAYMENTS,
            "headers": [
                _t("date", language),
                _t("fio", language),
                _t("house", language),
                _t("apartment", language),
                _t("payment_type", language),
                _t("created_by", language),
                _t("period", language),
                _t("amount", language),
                _t("balance_before", language),
                _t("balance_after", language),
                _t("description", language),
            ],
            "rows": rows,
        }
    ]


def build_report_payload(payload, language: str, export_format: str):
    language = _lang(language)
    filters = _collect_export_filters(payload)
    report_type = str(payload.get("report_type") or REPORT_TYPE_ALL).strip().lower()
    if report_type not in ALLOWED_REPORT_TYPES:
        report_type = REPORT_TYPE_ALL

    sheets = []
    if report_type in {REPORT_TYPE_HOT_WATER, REPORT_TYPE_ALL}:
        sheets.extend(_build_hot_water_report(filters, language))
    if report_type in {REPORT_TYPE_HEATING, REPORT_TYPE_ALL}:
        sheets.extend(_build_heating_report(filters, language))
    if report_type in {REPORT_TYPE_PAYMENTS, REPORT_TYPE_ALL}:
        sheets.extend(_build_payments_report(filters, language))
    if report_type == REPORT_TYPE_ALL:
        for sheet in sheets:
            if sheet.get("section") == REPORT_TYPE_HOT_WATER:
                label = _report_type_label(REPORT_TYPE_HOT_WATER, language)
                if label.lower() not in sheet["name"].lower():
                    sheet["name"] = f"{sheet['name']} {label}"
            elif sheet.get("section") == REPORT_TYPE_HEATING:
                label = _report_type_label(REPORT_TYPE_HEATING, language)
                if label.lower() not in sheet["name"].lower():
                    sheet["name"] = f"{sheet['name']} {label}"

    if not sheets:
        sheets.append(
            {
                "name": _t("empty_report", language),
                "title": _t("backend_export", language),
                "subtitle": _t("backend_export_subtitle", language),
                "language": language,
                "headers": [_t("scope", language), _t("rows", language)],
                "rows": [],
            }
        )

    summary_rows = []
    total_rows = sum(len(sheet["rows"]) for sheet in sheets)
    generated_at = timezone.localtime()
    summary_rows.append((_t("report_type", language), _report_type_label(report_type, language)))
    summary_rows.append((_t("generated", language), generated_at.strftime("%d.%m.%Y %H:%M")))
    summary_rows.append((_t("scope", language), _scope_text(filters["building_ids"], filters["apartment_ids"], filters["owner_ids"], language)))
    summary_rows.append((_t("sheets", language), str(len(sheets))))
    summary_rows.append((_t("rows", language), str(total_rows)))

    builder = WorkbookReportBuilder()
    for sheet in sheets:
        builder.add_sheet(
            sheet["name"],
            sheet["title"],
            sheet["subtitle"],
            summary_rows[:3],
            sheet["headers"],
            sheet["rows"],
            **{key: value for key, value in sheet.items() if key not in {"name", "title", "subtitle", "headers", "rows"}},
        )
    if export_format == "PDF":
        return {
            "filename": f"backend-report-{report_type}-{generated_at:%Y%m%d-%H%M}.pdf",
            "mime": "application/pdf",
            "content": _build_report_pdf(report_type, sheets, summary_rows, language),
            "report_type": report_type,
            "sheet_count": len(sheets),
            "row_count": total_rows,
        }
    workbook_bytes = builder.build()
    return {
        "filename": f"backend-report-{report_type}-{generated_at:%Y%m%d-%H%M}.xlsx",
        "mime": XLSX_MIME,
        "content": workbook_bytes,
        "report_type": report_type,
        "sheet_count": len(sheets) or 1,
        "row_count": total_rows,
    }


def build_table_export(title: str, headers: list[str], rows: list[list], export_format: str, filename_base: str, language: str = "en") -> dict:
    """One plain table (header row + data rows) as XLSX or PDF, rendered like the billing reports."""
    language = _lang(language)
    data_rows = [[_text_cell(value) for value in row] for row in rows]
    if export_format == "PDF":
        generated = timezone.localtime().strftime("%d.%m.%Y %H:%M")
        subheading = f"{_t('generated', language)}: {generated} · {_t('rows', language)}: {len(rows)}"
        sheet = {"headers": headers, "rows": data_rows}
        return {
            "filename": f"{filename_base}.pdf",
            "mime": "application/pdf",
            "content": _build_pdf(filename_base, title, subheading, [sheet], [], language),
        }
    builder = WorkbookReportBuilder()
    builder.add_sheet(title, title, "", [], headers, data_rows, template="plain", language=language)
    return {"filename": f"{filename_base}.xlsx", "mime": XLSX_MIME, "content": builder.build()}
