"""Conversation of the residents' bot.

/start -> language -> full name -> phone (own contact) -> confirm or reject.
Confirm connects the Telegram account to the resident(s) with that phone; reject starts the
registration over. A registered user gets the main menu with their apartments and balances.
"""
from aiogram import F, Router
from aiogram.enums import ChatType
from aiogram.filters import CommandStart, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, ReplyKeyboardRemove
from asgiref.sync import sync_to_async

from . import services
from .keyboards import (
    generate_language_buttons,
    generate_main_menu_buttons,
    generate_retry_button,
    generate_send_contact_button,
    generate_submitting_keyboards,
)
from .states import ChangeLanguageStatesGroup, RegistrationStatesGroup
from .texts import CHOOSE_LANGUAGE, DEFAULT_LANGUAGE, button_action, format_accounts, language_from_button, t

FULL_NAME_MAX_LENGTH = 255


def bold(text):
    return f"<b>{text}</b>"


async def check_user_registered(telegram_id):
    """(language, accounts); accounts is empty while the user is not registered."""
    return await sync_to_async(services.registration)(telegram_id)


async def start(message: Message, state: FSMContext):
    await state.clear()
    language, accounts = await check_user_registered(message.from_user.id)
    if accounts:
        await show_main_menu(message, language or DEFAULT_LANGUAGE, accounts)
        return
    await message.answer(bold(CHOOSE_LANGUAGE), reply_markup=generate_language_buttons())
    await state.set_state(RegistrationStatesGroup.wait_language)


async def start_registration(message: Message, state: FSMContext):
    language = language_from_button(message.text)
    if language is None:
        await message.answer(bold(CHOOSE_LANGUAGE), reply_markup=generate_language_buttons())
        return
    await state.update_data(language=language)
    await message.answer(bold(f"{t(language, 'welcome')}\n\n{t(language, 'registration_intro')}"))
    await ask_user_full_name(message, state, language)


async def ask_user_full_name(message: Message, state: FSMContext, language):
    await message.answer(bold(t(language, "ask_full_name")), reply_markup=ReplyKeyboardRemove())
    await state.set_state(RegistrationStatesGroup.wait_full_name)


async def ask_user_phone_number(message: Message, state: FSMContext):
    language = (await state.get_data()).get("language", DEFAULT_LANGUAGE)
    full_name = " ".join((message.text or "").split())
    if len(full_name) < 3 or len(full_name) > FULL_NAME_MAX_LENGTH or full_name.startswith("/"):
        await message.answer(t(language, "full_name_invalid"))
        return
    await state.update_data(full_name=full_name)
    await message.answer(bold(t(language, "ask_phone")), reply_markup=generate_send_contact_button(language))
    await state.set_state(RegistrationStatesGroup.wait_phone_number)


async def ask_for_submit(message: Message, state: FSMContext):
    data = await state.get_data()
    language = data.get("language", DEFAULT_LANGUAGE)
    contact = message.contact
    # Only the user's own contact: Telegram has verified that this number belongs to the account,
    # so nobody can connect to someone else's apartment by typing their number.
    if contact is None or contact.user_id != message.from_user.id:
        await message.answer(t(language, "phone_use_button"), reply_markup=generate_send_contact_button(language))
        return
    phone = contact.phone_number if contact.phone_number.startswith("+") else f"+{contact.phone_number}"
    await state.update_data(phone_number=phone)
    await message.answer(
        bold(t(language, "confirm_data", full_name=data["full_name"], phone=phone)),
        reply_markup=generate_submitting_keyboards(language),
    )
    await state.set_state(RegistrationStatesGroup.wait_for_submit)


async def submit_registration(message: Message, state: FSMContext):
    data = await state.get_data()
    language = data.get("language", DEFAULT_LANGUAGE)
    action = button_action(message.text)

    if action == "reject":
        await message.answer(bold(t(language, "rejected")), reply_markup=ReplyKeyboardRemove())
        await ask_user_full_name(message, state, language)
        return
    if action != "confirm":
        await message.answer(t(language, "choose_button"), reply_markup=generate_submitting_keyboards(language))
        return

    accounts = await sync_to_async(services.link_by_phone)(
        telegram_id=message.from_user.id,
        username=message.from_user.username or "",
        phone=data["phone_number"],
        full_name=data["full_name"],
        language=language,
    )
    await state.clear()
    if not accounts:
        # Keep the language so "Try again" can restart the registration in it.
        await state.set_data({"language": language})
        await message.answer(
            bold(t(language, "not_found", phone=data["phone_number"])),
            reply_markup=generate_retry_button(language),
        )
        return
    await message.answer(bold(t(language, "registered")), reply_markup=ReplyKeyboardRemove())
    await show_main_menu(message, language, accounts)


async def show_main_menu(message: Message, language, accounts):
    await message.answer(
        f"{bold(t(language, 'main_menu'))}\n\n{format_accounts(accounts, language)}",
        reply_markup=generate_main_menu_buttons(language),
    )


async def change_language(message: Message, state: FSMContext):
    language = language_from_button(message.text)
    if language is None:
        await message.answer(bold(CHOOSE_LANGUAGE), reply_markup=generate_language_buttons())
        return
    await sync_to_async(services.set_language)(message.from_user.id, language)
    await state.clear()
    _, accounts = await check_user_registered(message.from_user.id)
    await message.answer(t(language, "language_saved"))
    await show_main_menu(message, language, accounts)


async def other_messages(message: Message, state: FSMContext):
    """Main-menu buttons of a registered user; a hint to /start for everyone else."""
    action = button_action(message.text)
    language, accounts = await check_user_registered(message.from_user.id)
    if accounts:
        language = language or DEFAULT_LANGUAGE
        if action == "language":
            await message.answer(bold(CHOOSE_LANGUAGE), reply_markup=generate_language_buttons())
            await state.set_state(ChangeLanguageStatesGroup.wait_language)
            return
        # The balance button, and anything else: the apartments with fresh balances.
        await show_main_menu(message, language, accounts)
        return

    language = (await state.get_data()).get("language")
    if action == "retry" and language:
        await ask_user_full_name(message, state, language)
        return
    await message.answer(t(language or DEFAULT_LANGUAGE, "start_hint"), reply_markup=ReplyKeyboardRemove())


def build_router() -> Router:
    """A fresh router with the bot's handlers (a router can be attached to one dispatcher only)."""
    user_router = Router(name="residents")
    user_router.message.filter(F.chat.type == ChatType.PRIVATE)
    user_router.message.register(start, CommandStart())
    user_router.message.register(start_registration, RegistrationStatesGroup.wait_language)
    user_router.message.register(ask_user_phone_number, RegistrationStatesGroup.wait_full_name)
    user_router.message.register(ask_for_submit, RegistrationStatesGroup.wait_phone_number)
    user_router.message.register(submit_registration, RegistrationStatesGroup.wait_for_submit)
    user_router.message.register(change_language, ChangeLanguageStatesGroup.wait_language)
    user_router.message.register(other_messages, StateFilter(None))
    return user_router
