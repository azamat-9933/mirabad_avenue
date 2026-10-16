"""The payment (debt) notice for one resident.

One source for every place the notice appears: the preview in the portal window, the PDF the
operator downloads and the message the Telegram bot sends. The text is built here, on the
server, from the current account balance, so the three never differ and nobody can send a
resident a text composed in the browser.
"""
import io
from decimal import Decimal
from html import escape

from django.conf import settings
from django.utils import timezone
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .report_exports import _report_font_name

NOTICE_LANGUAGES = ("uz", "ru")
DEFAULT_NOTICE_LANGUAGE = "uz"

# Legal basis, checked against lex.uz on 16.10.2026:
# - Housing Code (lex.uz/docs/106134): art. 132 owners bear the costs of maintaining common
#   property; art. 134 payment by the 10th of the following month, daily penalty for late
#   utility payments; art. 140 housing disputes are resolved in court; art. 141 liability.
# - Law "On management of apartment buildings" No. ZRU-581 (lex.uz/docs/4586287): art. 16
#   owners pay the costs of maintaining common property every month.
# - Civil Code, part one (lex.uz/docs/111181): art. 236 obligations must be performed properly;
#   art. 237 unilateral refusal to perform is not allowed.
TEXTS = {
    "uz": {
        "title": "TO'LOV XABARNOMASI",
        "subheading": "Majburiy to'lovlar bo'yicha qarzdorlikni to'lash to'g'risida",
        "sector": "Sektor",
        "house": "Uy",
        "apartment": "Xonadon",
        "resident": "Abonent",
        "phone": "Telefon",
        "account": "Hisob raqami",
        "date": "Sana",
        "debt": "Qarz miqdori",
        "currency": "so'm",
        "greeting": "Hurmatli {name}!",
        "reminder": (
            "Sizga eslatamizki, {date} holatiga ko'ra {sector} sektori, {house}-uy, {apartment}-xonadon "
            "bo'yicha majburiy to'lovlardan {amount} miqdorida qarzdorligingiz mavjud."
        ),
        "request": "Qarzdorlikni imkon qadar qisqa muddatda to'liq so'ndirishingizni iltimos qilamiz.",
        "legal": (
            "O'zbekiston Respublikasi Uy-joy kodeksining 132-moddasi va «Ko'p kvartirali uylarni boshqarish "
            "to'g'risida»gi O'RQ-581-son Qonunning 16-moddasiga muvofiq xonadon egasi umumiy mulkni saqlash "
            "xarajatlarini har oy to'lashi shart. Uy-joy kodeksining 134-moddasiga ko'ra to'lov keyingi oyning "
            "10-sanasidan kechiktirmay amalga oshiriladi, kechiktirilgan har bir kun uchun penya hisoblanadi. "
            "O'zbekiston Respublikasi Fuqarolik kodeksining 236 va 237-moddalariga ko'ra majburiyatlar lozim "
            "darajada bajarilishi kerak, ularni bajarishdan bir tomonlama bosh tortishga yo'l qo'yilmaydi."
        ),
        "warning": (
            "Aks holda, Uy-joy kodeksining 140 va 141-moddalariga asosan qarzdorlikni undirish bo'yicha qonuniy "
            "choralar ko'riladi va ishingiz sudga oshiriladi. Bunda penya va sud xarajatlari qonunchilikda "
            "belgilangan tartibda sizning zimmangizga yuklanishi mumkin."
        ),
        "director": "Korxona rahbari",
        "operator": "Mas'ul xodim",
    },
    "ru": {
        "title": "ПЛАТЁЖНОЕ УВЕДОМЛЕНИЕ",
        "subheading": "О погашении задолженности по обязательным платежам",
        "sector": "Сектор",
        "house": "Дом",
        "apartment": "Квартира",
        "resident": "Абонент",
        "phone": "Телефон",
        "account": "Лицевой счёт",
        "date": "Дата",
        "debt": "Сумма долга",
        "currency": "сум",
        "greeting": "Уважаемый(ая) {name}!",
        "reminder": (
            "Напоминаем, что по состоянию на {date} по сектору {sector}, дом {house}, квартира {apartment} "
            "за вами числится задолженность по обязательным платежам в размере {amount}."
        ),
        "request": "Просим вас погасить задолженность в полном объёме в кратчайший срок.",
        "legal": (
            "В соответствии со статьёй 132 Жилищного кодекса Республики Узбекистан и статьёй 16 Закона "
            "«Об управлении многоквартирными домами» № ЗРУ-581 собственник помещения обязан ежемесячно "
            "оплачивать расходы по содержанию общего имущества. Согласно статье 134 Жилищного кодекса оплата "
            "производится не позднее 10-го числа следующего месяца, за каждый день просрочки начисляется пеня. "
            "Согласно статьям 236 и 237 Гражданского кодекса Республики Узбекистан обязательства должны "
            "исполняться надлежащим образом, односторонний отказ от их исполнения не допускается."
        ),
        "warning": (
            "В противном случае на основании статей 140 и 141 Жилищного кодекса будут приняты законные меры "
            "по взысканию задолженности, и дело будет передано в суд. При этом пеня и судебные расходы могут "
            "быть возложены на вас в порядке, установленном законодательством."
        ),
        "director": "Руководитель предприятия",
        "operator": "Ответственный сотрудник",
    },
}


def notice_language(value) -> str:
    return value if value in NOTICE_LANGUAGES else DEFAULT_NOTICE_LANGUAGE


def debt_of(owner) -> Decimal:
    """What the resident owes: the negative part of their apartment account."""
    return max(-owner.apartment.balance, Decimal("0"))


def format_sum(value: Decimal) -> str:
    """150000 -> "150 000", 1234.5 -> "1 234,50" (Uzbek and Russian: space groups, decimal comma)."""
    text = f"{abs(Decimal(value)):,.2f}".replace(",", " ").replace(".", ",")
    return text[:-3] if text.endswith(",00") else text


def build_debt_notice(owner, language, operator, as_of=None) -> dict:
    """The notice as plain data: header, labelled facts, paragraphs and signatures."""
    language = notice_language(language)
    texts = TEXTS[language]
    apartment = owner.apartment
    building = apartment.building
    date = (as_of or timezone.localdate()).strftime("%d.%m.%Y")
    debt = debt_of(owner)
    amount = f"{format_sum(debt)} {texts['currency']}"
    values = {
        "name": owner.fio,
        "sector": building.complex.title,
        "house": building.number,
        "apartment": apartment.number,
        "date": date,
        "amount": amount,
    }
    fields = [
        ("sector", values["sector"]),
        ("house", values["house"]),
        ("apartment", values["apartment"]),
        ("resident", owner.fio),
        ("phone", owner.phone),
        ("account", f"ACC-{owner.pk}"),
        ("date", date),
        ("debt", amount),
    ]
    return {
        "language": language,
        "title": texts["title"],
        "subheading": texts["subheading"],
        "company": settings.BILLING_NOTICE_COMPANY,
        "date": date,
        "amount": amount,
        "hasDebt": debt > 0,
        "fields": [{"key": key, "label": texts[key], "value": str(value)} for key, value in fields],
        "paragraphs": [
            texts["greeting"].format(**values),
            texts["reminder"].format(**values),
            texts["request"],
            texts["legal"],
            texts["warning"],
        ],
        "signatures": [
            {"key": "director", "label": texts["director"], "value": settings.BILLING_NOTICE_DIRECTOR},
            {"key": "operator", "label": texts["operator"], "value": operator},
        ],
    }


def notice_telegram_text(notice) -> str:
    """The notice as a Telegram message (HTML parse mode; every value is escaped)."""
    lines = [f"📄 <b>{escape(notice['title'])}</b>", escape(notice["company"]), ""]
    for field in notice["fields"]:
        value = escape(field["value"])
        if field["key"] == "debt":
            value = f"<b>{value}</b>"
        lines.append(f"{escape(field['label'])}: {value}")
    lines.append("")
    for paragraph in notice["paragraphs"]:
        lines.extend([escape(paragraph), ""])
    for signature in notice["signatures"]:
        lines.append(f"{escape(signature['label'])}: {escape(signature['value'])}")
    return "\n".join(lines)


BOLD_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]


def _bold_font_name(regular: str) -> str:
    for path in BOLD_FONT_CANDIDATES:
        try:
            pdfmetrics.registerFont(TTFont("MirabadNoticeBold", path))
            return "MirabadNoticeBold"
        except Exception:
            continue
    return regular


def notice_pdf(notice) -> bytes:
    """The notice as a one-page A4 PDF (fonts with Cyrillic and Uzbek Latin glyphs)."""
    regular = _report_font_name()
    bold = _bold_font_name(regular)
    styles = {
        "company": ParagraphStyle("company", fontName=regular, fontSize=9, leading=12, textColor="#475569"),
        "title": ParagraphStyle("title", fontName=bold, fontSize=18, leading=23, alignment=TA_CENTER, spaceAfter=2),
        "subheading": ParagraphStyle("subheading", fontName=regular, fontSize=10.5, leading=14, alignment=TA_CENTER, textColor="#475569"),
        "label": ParagraphStyle("label", fontName=bold, fontSize=10, leading=13),
        "value": ParagraphStyle("value", fontName=regular, fontSize=10, leading=13),
        "body": ParagraphStyle("body", fontName=regular, fontSize=10.5, leading=15, spaceAfter=7),
    }

    def text(value):
        return escape(str(value or ""))

    story = [
        Paragraph(f"{text(notice['company'])} · {text(notice['date'])}", styles["company"]),
        Spacer(1, 8 * mm),
        Paragraph(text(notice["title"]), styles["title"]),
        Paragraph(text(notice["subheading"]), styles["subheading"]),
        Spacer(1, 7 * mm),
    ]
    rows = [
        [Paragraph(text(field["label"]), styles["label"]), Paragraph(text(field["value"]), styles["value"])]
        for field in notice["fields"]
    ]
    facts = Table(rows, colWidths=[45 * mm, 125 * mm])
    facts.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, "#e2e8f0"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TEXTCOLOR", (1, len(rows) - 1), (1, len(rows) - 1), "#b42318"),
    ]))
    story.extend([facts, Spacer(1, 7 * mm)])
    story.extend(Paragraph(text(paragraph), styles["body"]) for paragraph in notice["paragraphs"])
    story.append(Spacer(1, 10 * mm))
    signatures = Table(
        [[Paragraph(text(item["label"]), styles["label"]), Paragraph(text(item["value"]), styles["value"])]
         for item in notice["signatures"]],
        colWidths=[55 * mm, 115 * mm],
    )
    signatures.setStyle(TableStyle([("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story.append(signatures)

    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=notice["title"],
        author=notice["company"],
    )
    document.build(story)
    return buffer.getvalue()
