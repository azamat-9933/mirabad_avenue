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
        "registration_intro": "Botdan foydalanish uchun ro'yxatdan o'ting. Bu bir daqiqa vaqt oladi 😄",
        "ask_full_name": "To'liq ismingizni yozing (familiya, ism, otasining ismi):",
        "full_name_invalid": "Iltimos, to'liq ismingizni matn ko'rinishida yozing.",
        "ask_phone": "Telefon raqamingizni pastdagi «📲 Kontaktni yuborish» tugmasi orqali yuboring.",
        "phone_use_button": (
            "Raqamni faqat «📲 Kontaktni yuborish» tugmasi orqali yuborish mumkin: "
            "shunda Telegram raqam sizniki ekanini tasdiqlaydi."
        ),
        "confirm_data": "Ma'lumotlaringizni tasdiqlang:\n\nF.I.Sh.: {full_name}\nTelefon raqam: {phone}",
        "choose_button": "Iltimos, quyidagi tugmalardan birini tanlang:",
        "rejected": "❌ Ma'lumotlar rad etildi. Ro'yxatdan qaytadan o'tamiz.",
        "registered": "✅ Rahmat! Siz ro'yxatdan muvaffaqiyatli o'tdingiz va rezident hisobingizga ulandingiz.",
        "not_found": (
            "😔 {phone} raqami bilan rezident topilmadi.\n\n"
            "Raqamingiz boshqaruv kompaniyasida yozilgan raqam bilan bir xil ekanini tekshiring "
            "yoki ma'muriyatga murojaat qiling. Keyin «🔄 Qaytadan urinish» tugmasini bosing."
        ),
        "main_menu": "🏠 Asosiy menyu",
        "accounts_title": "Sizning kvartiralaringiz:",
        "account_line": "• Uy {house}, kvartira {apartment} — {balance}",
        "debt": "qarz {amount} so'm",
        "credit": "ortiqcha to'lov {amount} so'm",
        "no_debt": "qarz yo'q",
        "language_saved": "✅ Til o'zgartirildi.",
        "start_hint": "Ro'yxatdan o'tish uchun /start buyrug'ini yuboring.",
        "button_send_contact": "📲 Kontaktni yuborish",
        "button_confirm": "✅ Tasdiqlash",
        "button_reject": "❌ Rad etish",
        "button_balance": "💰 Balans",
        "button_language": "🌐 Tilni o'zgartirish",
        "button_retry": "🔄 Qaytadan urinish",
    },
    "ru": {
        "welcome": "Здравствуйте! Добро пожаловать в бот резидентов Mirabad Avenue 😊",
        "registration_intro": "Чтобы пользоваться ботом, пройдите регистрацию. Это займёт минуту 😄",
        "ask_full_name": "Напишите ваше Ф.И.О. полностью:",
        "full_name_invalid": "Пожалуйста, напишите Ф.И.О. текстом.",
        "ask_phone": "Отправьте номер телефона кнопкой «📲 Отправить контакт» ниже.",
        "phone_use_button": (
            "Номер можно отправить только кнопкой «📲 Отправить контакт»: "
            "так Telegram подтверждает, что номер ваш."
        ),
        "confirm_data": "Проверьте ваши данные:\n\nФ.И.О.: {full_name}\nНомер телефона: {phone}",
        "choose_button": "Пожалуйста, выберите одну из кнопок ниже:",
        "rejected": "❌ Данные отклонены. Пройдём регистрацию заново.",
        "registered": "✅ Спасибо! Вы успешно зарегистрировались и подключены к своему лицевому счёту.",
        "not_found": (
            "😔 Резидент с номером {phone} не найден.\n\n"
            "Проверьте, что это тот же номер, который записан в управляющей компании, "
            "или обратитесь в администрацию. Затем нажмите «🔄 Попробовать снова»."
        ),
        "main_menu": "🏠 Главное меню",
        "accounts_title": "Ваши квартиры:",
        "account_line": "• Дом {house}, кв. {apartment} — {balance}",
        "debt": "долг {amount} сум",
        "credit": "переплата {amount} сум",
        "no_debt": "долга нет",
        "language_saved": "✅ Язык изменён.",
        "start_hint": "Чтобы зарегистрироваться, отправьте команду /start.",
        "button_send_contact": "📲 Отправить контакт",
        "button_confirm": "✅ Подтвердить",
        "button_reject": "❌ Отклонить",
        "button_balance": "💰 Баланс",
        "button_language": "🌐 Сменить язык",
        "button_retry": "🔄 Попробовать снова",
    },
    "en": {
        "welcome": "Hello! Welcome to the Mirabad Avenue residents bot 😊",
        "registration_intro": "To use the bot, please register. It takes a minute 😄",
        "ask_full_name": "Enter your full name:",
        "full_name_invalid": "Please type your full name as text.",
        "ask_phone": "Send your phone number with the «📲 Share contact» button below.",
        "phone_use_button": (
            "The number can only be sent with the «📲 Share contact» button: "
            "this way Telegram confirms the number is yours."
        ),
        "confirm_data": "Please confirm your details:\n\nFull name: {full_name}\nPhone number: {phone}",
        "choose_button": "Please choose one of the buttons below:",
        "rejected": "❌ Details rejected. Let's register again.",
        "registered": "✅ Thank you! You are registered and connected to your resident account.",
        "not_found": (
            "😔 No resident with the number {phone} was found.\n\n"
            "Check that it is the same number the management company has on file, "
            "or contact the administration. Then press «🔄 Try again»."
        ),
        "main_menu": "🏠 Main menu",
        "accounts_title": "Your apartments:",
        "account_line": "• House {house}, apt {apartment} — {balance}",
        "debt": "debt {amount} UZS",
        "credit": "credit {amount} UZS",
        "no_debt": "no debt",
        "language_saved": "✅ Language changed.",
        "start_hint": "Send /start to register.",
        "button_send_contact": "📲 Share contact",
        "button_confirm": "✅ Confirm",
        "button_reject": "❌ Reject",
        "button_balance": "💰 Balance",
        "button_language": "🌐 Change language",
        "button_retry": "🔄 Try again",
    },
}

# Reply buttons arrive as plain text; this maps any language's label back to its action.
BUTTON_ACTIONS = ("confirm", "reject", "balance", "language", "retry")
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


def format_balance(balance: Decimal, language) -> str:
    if balance < 0:
        return t(language, "debt", amount=format_amount(balance))
    if balance > 0:
        return t(language, "credit", amount=format_amount(balance))
    return t(language, "no_debt")


def format_accounts(accounts, language) -> str:
    template = t(language, "account_line")
    lines = [t(language, "accounts_title")]
    for account in accounts:
        lines.append(
            template.format(
                house=_html(account.house),
                apartment=_html(account.apartment),
                balance=format_balance(account.balance, language),  # already escaped
            )
        )
    return "\n".join(lines)
