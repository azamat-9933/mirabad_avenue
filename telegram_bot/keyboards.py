from aiogram.utils.keyboard import ReplyKeyboardBuilder

from .texts import LANGUAGE_BUTTONS, t


def generate_language_buttons():
    builder = ReplyKeyboardBuilder()
    for label in LANGUAGE_BUTTONS.values():
        builder.button(text=label)
    builder.adjust(1)
    return builder.as_markup(resize_keyboard=True)


def generate_send_contact_button(language):
    builder = ReplyKeyboardBuilder()
    builder.button(text=t(language, "button_send_contact"), request_contact=True)
    builder.adjust(1)
    return builder.as_markup(resize_keyboard=True)


def generate_submitting_keyboards(language):
    builder = ReplyKeyboardBuilder()
    builder.button(text=t(language, "button_confirm"))
    builder.button(text=t(language, "button_reject"))
    builder.adjust(2)
    return builder.as_markup(resize_keyboard=True)


def generate_main_menu_buttons(language):
    builder = ReplyKeyboardBuilder()
    builder.button(text=t(language, "button_balance"))
    builder.button(text=t(language, "button_language"))
    builder.adjust(2)
    return builder.as_markup(resize_keyboard=True)


def generate_retry_button(language):
    builder = ReplyKeyboardBuilder()
    builder.button(text=t(language, "button_retry"))
    builder.adjust(1)
    return builder.as_markup(resize_keyboard=True)
