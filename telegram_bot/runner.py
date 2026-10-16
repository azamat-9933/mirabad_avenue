from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand
from asgiref.sync import sync_to_async
from django.db import close_old_connections

from .handlers import build_router


async def close_db_connections(handler, event, data):
    """Drop stale database connections around each update, as Django does around each request.

    The bot runs for days; without this a database restart or timeout would leave it with a
    dead connection.
    """
    await sync_to_async(close_old_connections)()
    try:
        return await handler(event, data)
    finally:
        await sync_to_async(close_old_connections)()


def create_bot(token, session=None) -> Bot:
    return Bot(token, session=session, default=DefaultBotProperties(parse_mode=ParseMode.HTML))


def create_dispatcher() -> Dispatcher:
    # Conversation state lives in memory: after a restart an unfinished registration starts over.
    dispatcher = Dispatcher(storage=MemoryStorage())
    dispatcher.include_router(build_router())
    return dispatcher


async def run_polling(token):
    bot = create_bot(token)
    dispatcher = create_dispatcher()
    dispatcher.update.outer_middleware(close_db_connections)
    await bot.set_my_commands([BotCommand(command="start", description="Start / Boshlash / Начать")])
    await dispatcher.start_polling(bot)
