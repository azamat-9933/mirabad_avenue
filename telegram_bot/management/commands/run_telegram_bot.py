import asyncio
import logging

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from telegram_bot.runner import run_polling


class Command(BaseCommand):
    help = "Run the residents' Telegram bot (long polling). Needs TELEGRAM_BOT_TOKEN in .env or the environment."

    def handle(self, *args, **options):
        token = settings.TELEGRAM_BOT_TOKEN
        if not token:
            raise CommandError("TELEGRAM_BOT_TOKEN is not set. Add the token from @BotFather to .env.")
        logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
        asyncio.run(run_polling(token))
