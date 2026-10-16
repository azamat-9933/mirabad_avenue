from decimal import Decimal
from importlib import import_module

from django.apps import apps as django_apps
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change

from .admin import save_apartment
from .models import Apartment, Building, Complex, Owner


class BuildingApartmentOwnerInlineTests(TestCase):
    """House page in admin: apartments and their owners are entered in one table."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_superuser(username="house-admin", password="unused-password")
        cls.complex = Complex.objects.create(title="Mirabad Avenue", address="", author="test")

    def setUp(self):
        self.client.force_login(self.user)

    def _post_house(self, url, rows, initial_rows=0, number="64"):
        data = {
            "number": number,
            "address": "",
            "apartments-TOTAL_FORMS": str(len(rows)),
            "apartments-INITIAL_FORMS": str(initial_rows),
            "apartments-MIN_NUM_FORMS": "0",
            "apartments-MAX_NUM_FORMS": "1000",
            "_continue": "Save",
        }
        for index, row in enumerate(rows):
            for key, value in row.items():
                data[f"apartments-{index}-{key}"] = value
        return self.client.post(url, data)

    def _house_with_apartment(self, balance=Decimal("0")):
        building = Building.objects.create(number="64", complex=self.complex, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("50.00"), building=building, author="test")
        if balance:
            apply_account_change(apartment.pk, balance, Transaction.TYPE_MANUAL, description="carried over")
        return building, apartment

    def _existing_row(self, apartment, **owner):
        row = {
            "id": str(apartment.pk),
            "building": str(apartment.building_id),
            "number": apartment.number,
            "area": str(apartment.area),
        }
        row.update(owner)
        return row

    def test_add_page_shows_owner_columns(self):
        response = self.client.get(reverse("admin:main_app_building_add"))

        self.assertEqual(response.status_code, 200)
        for name in ("number", "area", "owner_fio", "owner_phone", "owner_has_contract", "opening_balance"):
            self.assertContains(response, f'name="apartments-0-{name}"')

    def test_new_house_creates_apartments_owners_and_opening_balances(self):
        response = self._post_house(
            reverse("admin:main_app_building_add"),
            [
                {
                    "number": "1",
                    "area": "55.50",
                    "owner_fio": "  Aziz Karimov ",
                    "owner_phone": "+998901112233",
                    "owner_has_contract": "on",
                    "opening_balance": "-150000",
                },
                {"number": "2", "area": "40", "opening_balance": "-20000"},
            ],
        )

        self.assertEqual(response.status_code, 302)
        building = Building.objects.get(number="64")
        occupied = building.apartments.get(number="1")
        owner = Owner.objects.get(apartment=occupied)
        self.assertEqual((owner.fio, owner.phone, owner.has_contract), ("Aziz Karimov", "+998901112233", True))
        self.assertEqual(occupied.balance, Decimal("-150000"))
        self.assertEqual(owner.balance, Decimal("-150000"))
        opening = Transaction.objects.get(apartment=occupied)
        self.assertEqual(opening.payment_type, Transaction.TYPE_MANUAL)
        self.assertEqual(opening.owner, owner)
        self.assertIn(OPENING_BALANCE_TAG, opening.description)
        self.assertEqual(opening.created_by, "house-admin")

        vacant = building.apartments.get(number="2")
        self.assertFalse(Owner.objects.filter(apartment=vacant).exists())
        self.assertEqual(vacant.balance, Decimal("-20000"))
        self.assertIsNone(Transaction.objects.get(apartment=vacant).owner)

    def test_owner_added_later_takes_over_the_apartment_debt(self):
        building, apartment = self._house_with_apartment(balance=Decimal("-30000"))

        response = self._post_house(
            reverse("admin:main_app_building_change", args=[building.pk]),
            # The balance column is read-only for an existing apartment: a posted value is ignored.
            [self._existing_row(apartment, owner_fio="New Owner", owner_phone="+998907778899", opening_balance="999")],
            initial_rows=1,
        )

        self.assertEqual(response.status_code, 302)
        owner = Owner.objects.get(apartment=apartment)
        self.assertEqual(owner.balance, Decimal("-30000"))
        apartment.refresh_from_db()
        self.assertEqual(apartment.balance, Decimal("-30000"))
        self.assertEqual(Transaction.objects.filter(apartment=apartment).count(), 1)

    def test_existing_owner_is_updated_in_place(self):
        building, apartment = self._house_with_apartment()
        owner = Owner.objects.create(fio="Old Name", phone="+998900000000", apartment=apartment)

        response = self._post_house(
            reverse("admin:main_app_building_change", args=[building.pk]),
            [
                self._existing_row(
                    apartment, owner_fio="Old Name", owner_phone="+998935556677", owner_has_contract="on"
                )
            ],
            initial_rows=1,
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(Owner.objects.count(), 1)
        owner.refresh_from_db()
        self.assertEqual((owner.phone, owner.has_contract), ("+998935556677", True))

    def test_owner_needs_both_name_and_phone(self):
        response = self._post_house(
            reverse("admin:main_app_building_add"),
            [{"number": "1", "area": "50", "owner_fio": "Aziz Karimov"}],
        )

        self.assertEqual(response.status_code, 200)
        row_errors = response.context["inline_admin_formsets"][0].formset.errors[0]
        self.assertEqual(row_errors["owner_phone"], ["Enter the owner's phone."])
        self.assertFalse(Building.objects.exists())
        self.assertFalse(Owner.objects.exists())

    def test_clearing_the_owner_columns_does_not_remove_the_owner(self):
        building, apartment = self._house_with_apartment()
        Owner.objects.create(fio="Aziz Karimov", phone="+998901112233", apartment=apartment)

        response = self._post_house(
            reverse("admin:main_app_building_change", args=[building.pk]),
            [self._existing_row(apartment, owner_fio="", owner_phone="")],
            initial_rows=1,
        )

        self.assertEqual(response.status_code, 200)
        row = response.context["inline_admin_formsets"][0].formset.forms[0]
        self.assertIn("The owner can't be removed here.", row.non_field_errors()[0])
        self.assertTrue(Owner.objects.filter(apartment=apartment, fio="Aziz Karimov").exists())

    def test_saving_an_apartment_keeps_a_balance_posted_meanwhile(self):
        _, apartment = self._house_with_apartment()
        # A payment lands after the admin form loaded the apartment.
        Apartment.objects.filter(pk=apartment.pk).update(balance=Decimal("500"))

        apartment.area = Decimal("60.00")
        save_apartment(apartment)

        apartment.refresh_from_db()
        self.assertEqual(apartment.area, Decimal("60.00"))
        self.assertEqual(apartment.balance, Decimal("500"))


class TelegramStatusMigrationTests(TestCase):
    """0003 folds the old free-form Telegram statuses into connected / not connected."""

    def test_old_statuses_become_connected_or_not_connected(self):
        normalize = import_module("main_app.migrations.0003_normalize_telegram_status").normalize_telegram_statuses
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="64", complex=complex_obj, author="test")
        legacy = {
            # (telegram_status, telegram_id, telegram_user): expected status
            ("connected", None, None): Owner.TELEGRAM_CONNECTED,
            ("linked", None, None): Owner.TELEGRAM_CONNECTED,
            ("pending", "12345", None): Owner.TELEGRAM_CONNECTED,
            ("review", None, "aziz"): Owner.TELEGRAM_CONNECTED,
            ("pending", None, None): Owner.TELEGRAM_NOT_CONNECTED,
            ("review", "", ""): Owner.TELEGRAM_NOT_CONNECTED,
            ("", None, None): Owner.TELEGRAM_NOT_CONNECTED,
        }
        owners = {}
        for number, (values, expected) in enumerate(legacy.items(), start=1):
            apartment = Apartment.objects.create(number=str(number), area=Decimal("40"), building=building, author="t")
            owner = Owner.objects.create(fio=f"Owner {number}", phone="+998900000000", apartment=apartment)
            status, telegram_id, telegram_user = values
            Owner.objects.filter(pk=owner.pk).update(
                telegram_status=status, telegram_id=telegram_id, telegram_user=telegram_user
            )
            owners[owner.pk] = (values, expected)

        normalize(django_apps, None)

        for pk, (values, expected) in owners.items():
            with self.subTest(values=values):
                self.assertEqual(Owner.objects.get(pk=pk).telegram_status, expected)


class OwnerTelegramAdminTests(TestCase):
    def test_disconnect_telegram_action_unlinks_the_selected_residents(self):
        user = get_user_model().objects.create_superuser(username="owner-admin", password="unused-password")
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="64", complex=complex_obj, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("40"), building=building, author="test")
        owner = Owner.objects.create(
            fio="Aziz Karimov",
            phone="+998901112233",
            apartment=apartment,
            telegram_id="555",
            telegram_user="aziz_k",
            telegram_status=Owner.TELEGRAM_CONNECTED,
            telegram_language="ru",
        )
        self.client.force_login(user)

        response = self.client.post(
            reverse("admin:main_app_owner_changelist"),
            {"action": "disconnect_telegram", "_selected_action": [owner.pk]},
        )

        self.assertEqual(response.status_code, 302)
        owner.refresh_from_db()
        self.assertEqual(
            (owner.telegram_id, owner.telegram_user, owner.telegram_language, owner.telegram_status),
            (None, None, "", Owner.TELEGRAM_NOT_CONNECTED),
        )
