from aiogram.fsm.state import State, StatesGroup


class RegistrationStatesGroup(StatesGroup):
    wait_language = State()
    wait_full_name = State()
    wait_phone_number = State()
    wait_for_submit = State()


class ChangeLanguageStatesGroup(StatesGroup):
    wait_language = State()
