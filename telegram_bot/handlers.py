"""Conversation of the residents' bot.

/start -> language -> personal account (Лицевой счет) -> the apartment it belongs to -> confirm.
Confirm links the apartment's resident to the Telegram account; one Telegram user may add several
apartments, each with its own account and balance. Before registering, the user may instead share
their own contact: residents whose phone is on file are linked at once. A registered user gets the
main menu: balances, payment history, adding another account, language.
"""
import re
from html import escape

from aiogram import F, Router
from aiogram.enums import ChatType
from aiogram.filters import CommandObject, CommandStart, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, ReplyKeyboardRemove
from asgiref.sync import sync_to_async

from . import operators, services
from .keyboards import (
    generate_account_request_buttons,
    generate_language_buttons,
    generate_main_menu_buttons,
    generate_submitting_keyboards,
)
from .states import ChangeLanguageStatesGroup, RegistrationStatesGroup
from .texts import (
    CHOOSE_LANGUAGE,
    DEFAULT_LANGUAGE,
    button_action,
    format_accounts,
    format_history,
    language_from_button,
    t,
)

# Personal accounts are 10 digits; a little slack for older numbers, nothing that is not digits.
ACCOUNT_PATTERN = re.compile(r"\d{5,20}")

LOOKUP_REPLIES = {
    services.LOOKUP_MISSING: "account_not_found",
    services.LOOKUP_NO_RESIDENT: "account_no_resident",
    services.LOOKUP_TAKEN: "account_taken",
    services.LOOKUP_YOURS: "account_already_yours",
    services.LOOKUP_LIMITED: "too_many_attempts",
}


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


async def operator_start(message: Message, state: FSMContext, command: CommandObject):
    """/start op_<token> from an operator's portal link: connect this chat to their portal account."""
    await state.clear()
    token = (command.args or "")[len(operators.LINK_PREFIX):]
    result = await sync_to_async(operators.link_operator)(token, message.from_user.id, message.from_user.username)
    reply = operators.text(result.language, "linked").format(name=escape(result.name)) if result.linked else operators.invalid_link_text()
    await message.answer(reply, reply_markup=ReplyKeyboardRemove())


async def start_registration(message: Message, state: FSMContext):
    language = language_from_button(message.text)
    if language is None:
        await message.answer(bold(CHOOSE_LANGUAGE), reply_markup=generate_language_buttons())
        return
    await message.answer(bold(f"{t(language, 'welcome')}\n\n{t(language, 'registration_intro')}"))
    await ask_account(message, state, language, registered=False)


async def ask_account(message: Message, state: FSMContext, language, registered):
    await state.set_state(RegistrationStatesGroup.wait_account)
    await state.update_data(language=language, registered=registered)
    await message.answer(
        bold(t(language, "ask_another_account" if registered else "ask_account")),
        reply_markup=generate_account_request_buttons(language, registered),
    )


async def receive_account(message: Message, state: FSMContext):
    data = await state.get_data()
    language = data.get("language", DEFAULT_LANGUAGE)
    registered = data.get("registered", False)
    if message.contact is not None:
        await link_by_contact(message, state, language, registered)
        return
    if button_action(message.text) == "back" and registered:
        await state.clear()
        _, accounts = await check_user_registered(message.from_user.id)
        await show_main_menu(message, language, accounts)
        return

    number = re.sub(r"[\s-]", "", message.text or "")
    if not ACCOUNT_PATTERN.fullmatch(number):
        await message.answer(t(language, "account_invalid"))
        return
    lookup = await sync_to_async(services.find_account)(message.from_user.id, number)
    if lookup.status != services.LOOKUP_OK:
        await message.answer(t(language, LOOKUP_REPLIES[lookup.status], account=number))
        return
    await state.update_data(apartment_id=lookup.apartment_id)
    await state.set_state(RegistrationStatesGroup.wait_account_confirm)
    await message.answer(
        bold(t(language, "account_confirm", account=lookup.account, name=lookup.name, house=lookup.house,
               apartment=lookup.apartment)),
        reply_markup=generate_submitting_keyboards(language),
    )


async def confirm_account(message: Message, state: FSMContext):
    data = await state.get_data()
    language = data.get("language", DEFAULT_LANGUAGE)
    registered = data.get("registered", False)
    action = button_action(message.text)
    if action == "reject":
        await message.answer(t(language, "account_rejected"))
        await ask_account(message, state, language, registered)
        return
    if action != "confirm":
        await message.answer(t(language, "choose_button"), reply_markup=generate_submitting_keyboards(language))
        return

    status, accounts = await sync_to_async(services.link_by_account)(
        telegram_id=message.from_user.id,
        username=message.from_user.username or "",
        apartment_id=data.get("apartment_id"),
        language=language,
    )
    if status != services.LOOKUP_OK:
        # Someone else linked it, or the resident was removed, between the lookup and the confirmation.
        await message.answer(t(language, LOOKUP_REPLIES[status]))
        await ask_account(message, state, language, registered)
        return
    await state.clear()
    await message.answer(bold(t(language, "account_linked")))
    await show_main_menu(message, language, accounts)


async def link_by_contact(message: Message, state: FSMContext, language, registered):
    contact = message.contact
    # Only the user's own contact: Telegram has verified that this number belongs to the account,
    # so nobody can connect to someone else's apartment by typing their number.
    if contact.user_id != message.from_user.id:
        await message.answer(
            t(language, "phone_use_button"), reply_markup=generate_account_request_buttons(language, registered)
        )
        return
    phone = contact.phone_number if contact.phone_number.startswith("+") else f"+{contact.phone_number}"
    accounts = await sync_to_async(services.link_by_phone)(
        telegram_id=message.from_user.id,
        username=message.from_user.username or "",
        phone=phone,
        full_name=message.from_user.full_name,
        language=language,
    )
    if not accounts:
        # Stay on the account question: the personal account is on the payment notice.
        await message.answer(t(language, "phone_not_found", phone=phone))
        return
    await state.clear()
    await message.answer(bold(t(language, "registered")))
    await show_main_menu(message, language, accounts)


async def show_main_menu(message: Message, language, accounts):
    await message.answer(
        f"{bold(t(language, 'main_menu'))}\n\n{format_accounts(accounts, language)}",
        reply_markup=generate_main_menu_buttons(language),
    )


async def show_history(message: Message, language):
    for item in await sync_to_async(services.history)(message.from_user.id):
        await message.answer(format_history(item, language), reply_markup=generate_main_menu_buttons(language))


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
    if not accounts:
        await message.answer(t(DEFAULT_LANGUAGE, "start_hint"), reply_markup=ReplyKeyboardRemove())
        return
    language = language or DEFAULT_LANGUAGE
    if action == "language":
        await message.answer(bold(CHOOSE_LANGUAGE), reply_markup=generate_language_buttons())
        await state.set_state(ChangeLanguageStatesGroup.wait_language)
        return
    if action == "history":
        await show_history(message, language)
        return
    if action == "add_account":
        await ask_account(message, state, language, registered=True)
        return
    # The balance button, and anything else: the apartments with fresh balances.
    await show_main_menu(message, language, accounts)


def build_router() -> Router:
    """A fresh router with the bot's handlers (a router can be attached to one dispatcher only)."""
    user_router = Router(name="residents")
    user_router.message.filter(F.chat.type == ChatType.PRIVATE)
    # Operators' link first: a plain /start (or any other payload) is the residents' registration.
    user_router.message.register(
        operator_start, CommandStart(deep_link=True, magic=F.args.startswith(operators.LINK_PREFIX))
    )
    user_router.message.register(start, CommandStart())
    user_router.message.register(start_registration, RegistrationStatesGroup.wait_language)
    user_router.message.register(receive_account, RegistrationStatesGroup.wait_account)
    user_router.message.register(confirm_account, RegistrationStatesGroup.wait_account_confirm)
    user_router.message.register(change_language, ChangeLanguageStatesGroup.wait_language)
    user_router.message.register(other_messages, StateFilter(None))
    return user_router
