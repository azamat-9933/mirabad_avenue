from aiogram.fsm.state import State, StatesGroup


class RegistrationStatesGroup(StatesGroup):
    wait_language = State()
    # A personal account number (or, before registering, the user's own contact).
    wait_account = State()
    # The apartment found by the number, shown for the user to confirm.
    wait_account_confirm = State()


class ChangeLanguageStatesGroup(StatesGroup):
    wait_language = State()
