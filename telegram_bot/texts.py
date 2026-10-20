"""Messages and button labels of the residents' bot in Uzbek, Russian and English."""
from decimal import Decimal
from html import escape

DEFAULT_LANGUAGE = "uz"

# The language question comes before the user has picked a language, so it is in all three.
CHOOSE_LANGUAGE = "🇺🇿 Tilni tanlang\n🇷🇺 Выберите язык\n🇬🇧 Choose a language"
LANGUAGE_BUTTONS = {
    "uz": "🇺🇿 O'zbekcha",
    "ru": "🇷🇺 Русский",
    "en": "🇬🇧 English",
}

MESSAGES = {
    "uz": {
        "welcome": "Assalomu alaykum! Mirabad Avenue rezidentlari botiga xush kelibsiz 😊",
        "registration_intro": (
            "Botda xonadoningiz balansi va to'lovlar tarixini ko'rasiz. "
            "Buning uchun xonadoningiz hisobini ulang 😄"
        ),
        "ask_account": (
            "Xonadoningizning shaxsiy hisob raqamini (лицевой счет, 10 ta raqam) yozing. "
            "U to'lov xabarnomasida yozilgan; bilmasangiz, boshqaruv kompaniyasidan so'rang.\n\n"
            "Telefon raqamingiz boshqaruv kompaniyasida yozilgan bo'lsa, "
            "«📲 Telefon orqali ulanish» tugmasini bosishingiz ham mumkin."
        ),
        "ask_another_account": "Qo'shmoqchi bo'lgan xonadonning shaxsiy hisob raqamini (10 ta raqam) yozing.",
        "account_invalid": "Shaxsiy hisob raqami faqat raqamlardan iborat, masalan: 1391677280. Qaytadan yozing.",
        "account_not_found": (
            "😔 {account} raqamli hisob topilmadi. Raqamni tekshirib, qaytadan yozing "
            "yoki boshqaruv kompaniyasiga murojaat qiling."
        ),
        "account_confirm": (
            "Shu hisobni ulaymizmi?\n\nShaxsiy hisob: {account}\nAbonent: {name}\n"
            "Uy {house}, kvartira {apartment}"
        ),
        "account_rejected": "Hisob ulanmadi. Boshqa raqam yozishingiz mumkin.",
        "account_linked": "✅ Hisob ulandi.",
        "account_already_yours": "Bu hisob sizga allaqachon ulangan.",
        "account_taken": (
            "Bu hisob boshqa Telegram akkauntiga ulangan. Agar bu sizning hisobingiz bo'lsa, "
            "boshqaruv kompaniyasiga murojaat qiling."
        ),
        "account_no_resident": "Bu hisob bo'yicha abonent yozilmagan. Boshqaruv kompaniyasiga murojaat qiling.",
        "too_many_attempts": (
            "Urinishlar juda ko'p bo'ldi. Bir soatdan keyin qaytadan urinib ko'ring "
            "yoki boshqaruv kompaniyasiga murojaat qiling."
        ),
        "phone_use_button": (
            "Raqamni faqat «📲 Telefon orqali ulanish» tugmasi orqali yuborish mumkin: "
            "shunda Telegram raqam sizniki ekanini tasdiqlaydi."
        ),
        "registered": "✅ Rahmat! Hisobingiz ulandi.",
        "phone_not_found": (
            "😔 {phone} raqami bilan abonent topilmadi. "
            "Shaxsiy hisob raqamingizni yozing — u to'lov xabarnomasida bor."
        ),
        "choose_button": "Iltimos, quyidagi tugmalardan birini tanlang:",
        "main_menu": "🏠 Asosiy menyu",
        "accounts_title": "Sizning hisoblaringiz:",
        "account_line": "• Uy {house}, kvartira {apartment}{account} — {balance}",
        "account_part": " (hisob {account})",
        "debt": "qarz {amount} so'm",
        "credit": "ortiqcha to'lov {amount} so'm",
        "no_debt": "qarz yo'q",
        "currency": "so'm",
        "history_header": "📜 Uy {house}, kvartira {apartment}{account}",
        "history_line": "{date} — {kind}: {amount}. Balans: {balance}",
        "history_empty": "Hozircha yozuvlar yo'q.",
        "kind_click": "Click orqali to'lov",
        "kind_payme": "Payme orqali to'lov",
        "kind_cash": "Naqd to'lov",
        "kind_manual": "Tuzatish",
        "kind_charge": "Hisoblandi",
        "kind_opening": "Boshlang'ich qoldiq",
        "payment_received": (
            "✅ To'lov qabul qilindi\n🏠 Uy {house}, kvartira {apartment}{account}\n"
            "Summa: {amount} ({method})\nBalans: {balance}"
        ),
        "language_saved": "✅ Til o'zgartirildi.",
        "start_hint": "Ro'yxatdan o'tish uchun /start buyrug'ini yuboring.",
        "button_send_contact": "📲 Telefon orqali ulanish",
        "button_confirm": "✅ Tasdiqlash",
        "button_reject": "❌ Rad etish",
        "button_balance": "💰 Balans",
        "button_history": "📜 To'lovlar tarixi",
        "button_add_account": "➕ Hisob qo'shish",
        "button_language": "🌐 Tilni o'zgartirish",
        "button_back": "↩️ Orqaga",
    },
    "ru": {
        "welcome": "Здравствуйте! Добро пожаловать в бот резидентов Mirabad Avenue 😊",
        "registration_intro": (
            "В боте вы увидите баланс и историю платежей вашей квартиры. "
            "Для этого подключите лицевой счёт квартиры 😄"
        ),
        "ask_account": (
            "Напишите лицевой счёт вашей квартиры (10 цифр). Он указан в платёжном уведомлении; "
            "если не знаете, спросите в управляющей компании.\n\n"
            "Если ваш номер телефона записан в управляющей компании, можно нажать «📲 Подключить по телефону»."
        ),
        "ask_another_account": "Напишите лицевой счёт квартиры, которую хотите добавить (10 цифр).",
        "account_invalid": "Лицевой счёт состоит только из цифр, например: 1391677280. Напишите ещё раз.",
        "account_not_found": (
            "😔 Лицевой счёт {account} не найден. Проверьте номер и напишите ещё раз "
            "или обратитесь в управляющую компанию."
        ),
        "account_confirm": (
            "Подключить этот лицевой счёт?\n\nЛицевой счёт: {account}\nАбонент: {name}\n"
            "Дом {house}, кв. {apartment}"
        ),
        "account_rejected": "Лицевой счёт не подключён. Можете написать другой номер.",
        "account_linked": "✅ Лицевой счёт подключён.",
        "account_already_yours": "Этот лицевой счёт уже подключён к вам.",
        "account_taken": (
            "Этот лицевой счёт подключён к другому аккаунту Telegram. "
            "Если это ваш счёт, обратитесь в управляющую компанию."
        ),
        "account_no_resident": "По этому лицевому счёту не записан абонент. Обратитесь в управляющую компанию.",
        "too_many_attempts": "Слишком много попыток. Попробуйте через час или обратитесь в управляющую компанию.",
        "phone_use_button": (
            "Номер можно отправить только кнопкой «📲 Подключить по телефону»: "
            "так Telegram подтверждает, что номер ваш."
        ),
        "registered": "✅ Спасибо! Ваш лицевой счёт подключён.",
        "phone_not_found": (
            "😔 Абонент с номером {phone} не найден. "
            "Напишите лицевой счёт — он указан в платёжном уведомлении."
        ),
        "choose_button": "Пожалуйста, выберите одну из кнопок ниже:",
        "main_menu": "🏠 Главное меню",
        "accounts_title": "Ваши лицевые счета:",
        "account_line": "• Дом {house}, кв. {apartment}{account} — {balance}",
        "account_part": " (л/с {account})",
        "debt": "долг {amount} сум",
        "credit": "переплата {amount} сум",
        "no_debt": "долга нет",
        "currency": "сум",
        "history_header": "📜 Дом {house}, кв. {apartment}{account}",
        "history_line": "{date} — {kind}: {amount}. Баланс: {balance}",
        "history_empty": "Записей пока нет.",
        "kind_click": "Оплата через Click",
        "kind_payme": "Оплата через Payme",
        "kind_cash": "Оплата наличными",
        "kind_manual": "Корректировка",
        "kind_charge": "Начисление",
        "kind_opening": "Начальный остаток",
        "payment_received": (
            "✅ Оплата получена\n🏠 Дом {house}, кв. {apartment}{account}\n"
            "Сумма: {amount} ({method})\nБаланс: {balance}"
        ),
        "language_saved": "✅ Язык изменён.",
        "start_hint": "Чтобы зарегистрироваться, отправьте команду /start.",
        "button_send_contact": "📲 Подключить по телефону",
        "button_confirm": "✅ Подтвердить",
        "button_reject": "❌ Отклонить",
        "button_balance": "💰 Баланс",
        "button_history": "📜 История платежей",
        "button_add_account": "➕ Добавить лицевой счёт",
        "button_language": "🌐 Сменить язык",
        "button_back": "↩️ Назад",
    },
    "en": {
        "welcome": "Hello! Welcome to the Mirabad Avenue residents bot 😊",
        "registration_intro": (
            "Here you can see your apartment's balance and payment history. "
            "To start, connect your apartment's personal account 😄"
        ),
        "ask_account": (
            "Type your apartment's personal account number (10 digits). It is on the payment notice; "
            "if you don't know it, ask the management company.\n\n"
            "If the management company has your phone number, you can press «📲 Connect by phone»."
        ),
        "ask_another_account": "Type the personal account number of the apartment you want to add (10 digits).",
        "account_invalid": "A personal account number has digits only, for example: 1391677280. Please type it again.",
        "account_not_found": (
            "😔 Personal account {account} was not found. Check the number and type it again "
            "or contact the management company."
        ),
        "account_confirm": (
            "Connect this personal account?\n\nPersonal account: {account}\nResident: {name}\n"
            "House {house}, apt {apartment}"
        ),
        "account_rejected": "The account was not connected. You can type another number.",
        "account_linked": "✅ The personal account is connected.",
        "account_already_yours": "This personal account is already connected to you.",
        "account_taken": (
            "This personal account is connected to another Telegram account. "
            "If it is yours, contact the management company."
        ),
        "account_no_resident": "No resident is registered for this account. Contact the management company.",
        "too_many_attempts": "Too many attempts. Try again in an hour or contact the management company.",
        "phone_use_button": (
            "The number can only be sent with the «📲 Connect by phone» button: "
            "this way Telegram confirms the number is yours."
        ),
        "registered": "✅ Thank you! Your account is connected.",
        "phone_not_found": (
            "😔 No resident with the number {phone} was found. "
            "Type your personal account number — it is on the payment notice."
        ),
        "choose_button": "Please choose one of the buttons below:",
        "main_menu": "🏠 Main menu",
        "accounts_title": "Your accounts:",
        "account_line": "• House {house}, apt {apartment}{account} — {balance}",
        "account_part": " (acc. {account})",
        "debt": "debt {amount} UZS",
        "credit": "credit {amount} UZS",
        "no_debt": "no debt",
        "currency": "UZS",
        "history_header": "📜 House {house}, apt {apartment}{account}",
        "history_line": "{date} — {kind}: {amount}. Balance: {balance}",
        "history_empty": "No entries yet.",
        "kind_click": "Payment via Click",
        "kind_payme": "Payment via Payme",
        "kind_cash": "Cash payment",
        "kind_manual": "Adjustment",
        "kind_charge": "Charge",
        "kind_opening": "Opening balance",
        "payment_received": (
            "✅ Payment received\n🏠 House {house}, apt {apartment}{account}\n"
            "Amount: {amount} ({method})\nBalance: {balance}"
        ),
        "language_saved": "✅ Language changed.",
        "start_hint": "Send /start to register.",
        "button_send_contact": "📲 Connect by phone",
        "button_confirm": "✅ Confirm",
        "button_reject": "❌ Reject",
        "button_balance": "💰 Balance",
        "button_history": "📜 Payment history",
        "button_add_account": "➕ Add an account",
        "button_language": "🌐 Change language",
        "button_back": "↩️ Back",
    },
}

# Reply buttons arrive as plain text; this maps any language's label back to its action.
BUTTON_ACTIONS = ("confirm", "reject", "balance", "history", "add_account", "language", "back")
_ACTION_BY_LABEL = {
    MESSAGES[language][f"button_{action}"]: action for language in MESSAGES for action in BUTTON_ACTIONS
}
_LANGUAGE_BY_LABEL = {label: language for language, label in LANGUAGE_BUTTONS.items()}


def _html(value) -> str:
    return escape(str(value), quote=False)


def t(language, key, **values) -> str:
    """Message ``key`` in ``language``; values are HTML-escaped (the bot sends HTML)."""
    text = MESSAGES.get(language, MESSAGES[DEFAULT_LANGUAGE])[key]
    if not values:
        return text
    return text.format(**{name: _html(value) for name, value in values.items()})


def button_action(text) -> str | None:
    """"confirm", "reject", ... for a reply-button label in any language; None for other text."""
    return _ACTION_BY_LABEL.get((text or "").strip())


def language_from_button(text) -> str | None:
    return _LANGUAGE_BY_LABEL.get((text or "").strip())


def format_amount(value: Decimal) -> str:
    """150000 -> "150 000", 1234.5 -> "1 234.50"."""
    amount = abs(Decimal(value))
    text = f"{amount:,.2f}".replace(",", " ")
    return text[:-3] if text.endswith(".00") else text


def format_signed(value: Decimal, language) -> str:
    """+250 000 so'm for money in, −150 000 so'm for a charge."""
    sign = "−" if Decimal(value) < 0 else "+"
    return f"{sign}{format_amount(value)} {t(language, 'currency')}"


def format_balance(balance: Decimal, language) -> str:
    if balance < 0:
        return t(language, "debt", amount=format_amount(balance))
    if balance > 0:
        return t(language, "credit", amount=format_amount(balance))
    return t(language, "no_debt")


def _account_part(account, language) -> str:
    return t(language, "account_part", account=account) if account else ""


def format_accounts(accounts, language) -> str:
    template = t(language, "account_line")
    lines = [t(language, "accounts_title")]
    for account in accounts:
        lines.append(
            template.format(
                house=_html(account.house),
                apartment=_html(account.apartment),
                account=_account_part(account.account, language),  # already escaped
                balance=format_balance(account.balance, language),  # already escaped
            )
        )
    return "\n".join(lines)


def format_history(item, language) -> str:
    """One apartment's latest ledger rows (services.AccountHistory), newest first."""
    account = item.account
    lines = [
        t(language, "history_header").format(
            house=_html(account.house),
            apartment=_html(account.apartment),
            account=_account_part(account.account, language),
        )
    ]
    if not item.entries:
        lines.append(t(language, "history_empty"))
    template = t(language, "history_line")
    for entry in item.entries:
        lines.append(
            template.format(
                date=entry.date.strftime("%d.%m.%Y"),
                kind=t(language, f"kind_{entry.kind}"),
                amount=format_signed(entry.amount, language),
                balance=format_balance(entry.balance_after, language),
            )
        )
    return "\n".join(lines)


def payment_received_text(*, house, apartment, account, amount, method, balance, language) -> str:
    """The message a resident gets when a payment lands on their apartment account."""
    return t(language, "payment_received").format(
        house=_html(house),
        apartment=_html(apartment),
        account=_account_part(account, language),
        amount=format_signed(amount, language),
        method=_html(method),
        balance=format_balance(balance, language),
    )
