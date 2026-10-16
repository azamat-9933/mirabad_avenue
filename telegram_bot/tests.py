from datetime import UTC, datetime
from decimal import Decimal
from unittest.mock import patch

from aiogram.client.session.base import BaseSession
from aiogram.exceptions import TelegramForbiddenError
from aiogram.methods import SendMessage
from aiogram.types import Chat, Contact, Message, Update, User
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from main_app.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from payments.services import apply_account_change
from portal.models import AuditEvent

from . import services
from .notifications import debt_notice_text
from .runner import create_bot, create_dispatcher
from .texts import BUTTON_ACTIONS, CHOOSE_LANGUAGE, LANGUAGE_BUTTONS, MESSAGES, format_accounts, format_amount, t


class ResidentsMixin:
    @classmethod
    def setUpTestData(cls):
        cls.complex = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        cls.building = Building.objects.create(number="64", complex=cls.complex, author="test")
        cls.apartment = Apartment.objects.create(number="1", area=Decimal("50"), building=cls.building, author="test")
        cls.owner = Owner.objects.create(fio="Aziz Karimov", phone="+998 90 111-22-33", apartment=cls.apartment)


class TextsTests(TestCase):
    def test_every_language_has_every_message(self):
        keys = set(MESSAGES["uz"])
        for language in ("ru", "en"):
            self.assertEqual(set(MESSAGES[language]), keys, language)

    def test_button_labels_tell_the_action_apart_in_every_language(self):
        labels = [MESSAGES[language][f"button_{action}"] for language in MESSAGES for action in BUTTON_ACTIONS]
        labels += list(LANGUAGE_BUTTONS.values())
        self.assertEqual(len(labels), len(set(labels)))

    def test_amounts_and_user_text_are_formatted_for_html(self):
        self.assertEqual(format_amount(Decimal("-150000")), "150 000")
        self.assertEqual(format_amount(Decimal("1234.5")), "1 234.50")
        self.assertIn("&lt;b&gt;", t("en", "confirm_data", full_name="<b>", phone="+1"))
        accounts = [services.Account(house="64<", apartment="1", balance=Decimal("-150000"))]
        self.assertEqual(format_accounts(accounts, "ru"), "Ваши квартиры:\n• Дом 64&lt;, кв. 1 — долг 150 000 сум")


class LinkServiceTests(ResidentsMixin, TestCase):
    def test_phone_key_ignores_formatting_and_country_code(self):
        self.assertEqual(services.phone_key("+998 (90) 111-22-33"), "901112233")
        self.assertEqual(services.phone_key("998901112233"), "901112233")
        self.assertEqual(services.phone_key("90 111 22 33"), "901112233")
        self.assertEqual(services.phone_key("12345"), "")

    def test_link_connects_every_resident_with_the_phone(self):
        second_apartment = Apartment.objects.create(number="2", area=Decimal("40"), building=self.building, author="t")
        second = Owner.objects.create(fio="Aziz Karimov", phone="998901112233", apartment=second_apartment)
        apply_account_change(self.apartment.pk, Decimal("-150000"), Transaction.TYPE_MANUAL)

        accounts = services.link_by_phone(
            telegram_id=555, username="aziz_k", phone="+998901112233", full_name="Aziz Karimov", language="ru"
        )

        self.assertEqual(
            accounts,
            [
                services.Account(house="64", apartment="1", balance=Decimal("-150000")),
                services.Account(house="64", apartment="2", balance=Decimal("0")),
            ],
        )
        for owner in (self.owner, second):
            owner.refresh_from_db()
            self.assertEqual(
                (owner.telegram_id, owner.telegram_user, owner.telegram_status, owner.telegram_language),
                ("555", "aziz_k", Owner.TELEGRAM_CONNECTED, "ru"),
            )
        self.assertEqual(AuditEvent.objects.filter(title="Telegram connected").count(), 2)
        self.assertEqual(services.registration(555), ("ru", accounts))

    def test_unknown_phone_connects_nobody(self):
        accounts = services.link_by_phone(
            telegram_id=555, username="", phone="+998935550000", full_name="Someone", language="uz"
        )

        self.assertEqual(accounts, [])
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.telegram_status, Owner.TELEGRAM_NOT_CONNECTED)
        self.assertTrue(AuditEvent.objects.filter(title="Telegram registration: phone not found").exists())
        self.assertEqual(services.registration(555), ("", []))

    def test_new_resident_starts_not_connected(self):
        self.assertEqual(self.owner.telegram_status, Owner.TELEGRAM_NOT_CONNECTED)


class RecordingSession(BaseSession):
    """Answers the bot's API calls locally and keeps the messages it sent."""

    def __init__(self):
        super().__init__()
        self.sent = []

    async def make_request(self, bot, method, timeout=None):
        if isinstance(method, SendMessage):
            self.sent.append(method)
            return Message(
                message_id=len(self.sent),
                date=datetime.now(UTC),
                chat=Chat(id=method.chat_id, type="private"),
                text=method.text,
            )
        return True

    async def stream_content(self, url, headers=None, timeout=30, chunk_size=65536, raise_for_status=True):
        yield b""

    async def close(self):
        pass


class BotConversationTests(ResidentsMixin, TestCase):
    """The whole conversation through the aiogram dispatcher, without calling Telegram."""

    USER_ID = 555

    def setUp(self):
        self.session = RecordingSession()
        self.bot = create_bot("123456:TEST-TOKEN", session=self.session)
        self.dispatcher = create_dispatcher()
        self.update_id = 0

    def send(self, text=None, contact=None):
        """Feed one user message to the bot and return the texts it answered with."""
        self.update_id += 1
        message = Message(
            message_id=self.update_id,
            date=datetime.now(UTC),
            chat=Chat(id=self.USER_ID, type="private"),
            from_user=User(id=self.USER_ID, is_bot=False, first_name="Aziz", username="aziz_k"),
            text=text,
            contact=contact,
        )
        already_sent = len(self.session.sent)
        async_to_sync(self.dispatcher.feed_update)(self.bot, Update(update_id=self.update_id, message=message))
        return [method.text for method in self.session.sent[already_sent:]]

    def own_contact(self, phone="998901112233"):
        return Contact(phone_number=phone, first_name="Aziz", user_id=self.USER_ID)

    def register_until_confirmation(self, language_button="🇷🇺 Русский"):
        self.assertEqual(self.send("/start"), [f"<b>{CHOOSE_LANGUAGE}</b>"])
        self.assertEqual(self.send(language_button)[-1], f"<b>{t('ru', 'ask_full_name')}</b>")
        self.assertEqual(self.send("  Азиз   Каримов ")[-1], f"<b>{t('ru', 'ask_phone')}</b>")
        return self.send(contact=self.own_contact())

    def test_confirmed_registration_connects_the_resident(self):
        apply_account_change(self.apartment.pk, Decimal("-150000"), Transaction.TYPE_MANUAL)

        confirmation = self.register_until_confirmation()
        self.assertEqual(
            confirmation,
            [f"<b>{t('ru', 'confirm_data', full_name='Азиз Каримов', phone='+998901112233')}</b>"],
        )
        answers = self.send(MESSAGES["ru"]["button_confirm"])

        self.assertEqual(answers[0], f"<b>{t('ru', 'registered')}</b>")
        self.assertIn("• Дом 64, кв. 1 — долг 150 000 сум", answers[1])
        self.owner.refresh_from_db()
        self.assertEqual(
            (self.owner.telegram_id, self.owner.telegram_user, self.owner.telegram_status, self.owner.telegram_language),
            ("555", "aziz_k", Owner.TELEGRAM_CONNECTED, "ru"),
        )

    def test_rejected_details_start_the_registration_over(self):
        self.register_until_confirmation()

        answers = self.send(MESSAGES["ru"]["button_reject"])

        self.assertEqual(answers, [f"<b>{t('ru', 'rejected')}</b>", f"<b>{t('ru', 'ask_full_name')}</b>"])
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.telegram_status, Owner.TELEGRAM_NOT_CONNECTED)

    def test_only_the_users_own_contact_is_accepted(self):
        self.send("/start")
        self.send("🇬🇧 English")
        self.send("Aziz Karimov")

        self.assertEqual(self.send("+998901112233"), [t("en", "phone_use_button")])
        someone_else = Contact(phone_number="998901112233", first_name="Other", user_id=999)
        self.assertEqual(self.send(contact=someone_else), [t("en", "phone_use_button")])
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.telegram_status, Owner.TELEGRAM_NOT_CONNECTED)

    def test_unknown_phone_offers_to_try_again(self):
        self.send("/start")
        self.send("🇺🇿 O'zbekcha")
        self.send("Aziz Karimov")
        self.send(contact=self.own_contact(phone="998935550000"))

        answers = self.send(MESSAGES["uz"]["button_confirm"])

        self.assertEqual(answers, [f"<b>{t('uz', 'not_found', phone='+998935550000')}</b>"])
        self.assertEqual(self.send(MESSAGES["uz"]["button_retry"]), [f"<b>{t('uz', 'ask_full_name')}</b>"])

    def test_registered_user_gets_the_main_menu_and_can_change_language(self):
        Owner.objects.filter(pk=self.owner.pk).update(
            telegram_id=str(self.USER_ID), telegram_status=Owner.TELEGRAM_CONNECTED, telegram_language="en"
        )

        self.assertIn("• House 64, apt 1 — no debt", self.send("/start")[0])
        self.assertEqual(self.send(MESSAGES["en"]["button_language"]), [f"<b>{CHOOSE_LANGUAGE}</b>"])
        answers = self.send("🇺🇿 O'zbekcha")

        self.assertEqual(answers[0], t("uz", "language_saved"))
        self.assertIn("• Uy 64, kvartira 1 — qarz yo'q", answers[1])
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.telegram_language, "uz")


class BlockedBotSession(RecordingSession):
    async def make_request(self, bot, method, timeout=None):
        raise TelegramForbiddenError(method=method, message="Forbidden: bot was blocked by the user")


@override_settings(TELEGRAM_BOT_TOKEN="123456:TEST-TOKEN")
class BillingNoticeTelegramTests(ResidentsMixin, TestCase):
    """Portal: "Notify in Telegram" in the billing notice window."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(username="billing-desk", password="unused-password")
        self.client.force_login(self.user)
        self.url = reverse("portal:api_billing_notice_telegram")
        Owner.objects.filter(pk=self.owner.pk).update(
            telegram_id="555", telegram_status=Owner.TELEGRAM_CONNECTED, telegram_language="ru"
        )
        apply_account_change(self.apartment.pk, Decimal("-150000"), Transaction.TYPE_MANUAL)
        self.session = RecordingSession()

    def post(self, owner_id, session=None):
        session = session or self.session
        with patch("telegram_bot.notifications.create_bot", lambda token: create_bot(token, session=session)):
            return self.client.post(self.url, {"owner_id": owner_id}, content_type="application/json")

    def test_sends_the_notice_in_the_residents_language_and_logs_it(self):
        response = self.post(self.owner.pk)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        [sent] = self.session.sent
        self.assertEqual(sent.chat_id, "555")
        self.owner.refresh_from_db()
        self.assertEqual(sent.text, debt_notice_text(self.owner, timezone.localdate()))
        self.assertIn("ПЛАТЁЖНОЕ УВЕДОМЛЕНИЕ", sent.text)
        self.assertIn("<b>150 000 сум</b>", sent.text)
        self.assertIn(f"ACC-{self.owner.pk}", sent.text)
        event = AuditEvent.objects.get(title="Billing notice sent to Telegram")
        self.assertEqual((event.event_type, event.owner_id, event.actor), (AuditEvent.TYPE_REMINDER, self.owner.pk, "billing-desk"))

    def test_resident_not_connected_to_telegram_is_refused(self):
        Owner.objects.filter(pk=self.owner.pk).update(telegram_status=Owner.TELEGRAM_NOT_CONNECTED)

        response = self.post(self.owner.pk)

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["error"], "The resident is not connected to Telegram.")
        self.assertEqual(self.session.sent, [])

    def test_resident_without_debt_is_refused(self):
        apply_account_change(self.apartment.pk, Decimal("150000"), Transaction.TYPE_CASH)

        response = self.post(self.owner.pk)

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["error"], "The resident has no debt.")
        self.assertEqual(self.session.sent, [])

    def test_bot_blocked_by_the_resident_is_reported(self):
        response = self.post(self.owner.pk, session=BlockedBotSession())

        self.assertEqual(response.status_code, 502)
        self.assertIn("blocked the bot", response.json()["error"])
        self.assertFalse(AuditEvent.objects.filter(title="Billing notice sent to Telegram").exists())

    @override_settings(TELEGRAM_BOT_TOKEN="")
    def test_missing_bot_token_is_reported(self):
        response = self.post(self.owner.pk)

        self.assertEqual(response.status_code, 503)
        self.assertEqual(self.session.sent, [])

    def test_unknown_resident(self):
        self.assertEqual(self.post(999999).status_code, 404)
        self.assertEqual(self.post("").status_code, 404)
