from decimal import Decimal
from importlib import import_module
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory

from django.apps import apps as django_apps
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from django.urls import reverse
from openpyxl import Workbook

from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change, is_incoming_payment
from portal.models import AuditEvent

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
        for name in ("number", "area", "owner_fio", "owner_phone", "owner_has_contract", "balance"):
            self.assertContains(response, f'name="apartments-0-{name}"')

    def test_new_house_creates_apartments_and_owners_without_touching_balances(self):
        response = self._post_house(
            reverse("admin:main_app_building_add"),
            [
                {
                    "number": "1",
                    "area": "55.50",
                    "owner_fio": "  Aziz Karimov ",
                    "owner_phone": "+998901112233",
                    "owner_has_contract": "on",
                    # Posted by an old form: ignored.
                    "opening_balance": "-150000",
                },
                {"number": "2", "area": "40"},
            ],
        )

        self.assertEqual(response.status_code, 302)
        building = Building.objects.get(number="64")
        occupied = building.apartments.get(number="1")
        owner = Owner.objects.get(apartment=occupied)
        self.assertEqual((owner.fio, owner.phone, owner.has_contract), ("Aziz Karimov", "+998901112233", True))
        self.assertEqual((occupied.balance, owner.balance), (Decimal("0"), Decimal("0")))

        vacant = building.apartments.get(number="2")
        self.assertFalse(Owner.objects.filter(apartment=vacant).exists())
        self.assertFalse(Transaction.objects.exists())

    def test_apartment_page_adds_the_resident_with_the_apartment(self):
        building = Building.objects.create(number="64", complex=self.complex, author="test")

        response = self.client.post(
            reverse("admin:main_app_apartment_add"),
            {
                "number": "7",
                "building": str(building.pk),
                "area": "48.5",
                "owner-TOTAL_FORMS": "1",
                "owner-INITIAL_FORMS": "0",
                "owner-MIN_NUM_FORMS": "0",
                "owner-MAX_NUM_FORMS": "1",
                "owner-0-fio": "Aziz Karimov",
                "owner-0-phone": "+998901112233",
                "owner-0-has_contract": "on",
                "_continue": "Save",
            },
        )

        self.assertEqual(response.status_code, 302)
        apartment = Apartment.objects.get(number="7", building=building)
        owner = Owner.objects.get(apartment=apartment)
        self.assertEqual((owner.fio, owner.phone, owner.has_contract), ("Aziz Karimov", "+998901112233", True))
        self.assertEqual(owner.telegram_status, Owner.TELEGRAM_NOT_CONNECTED)

    def test_apartment_page_can_stay_vacant(self):
        building = Building.objects.create(number="64", complex=self.complex, author="test")

        response = self.client.post(
            reverse("admin:main_app_apartment_add"),
            {
                "number": "8",
                "building": str(building.pk),
                "area": "40",
                "owner-TOTAL_FORMS": "1",
                "owner-INITIAL_FORMS": "0",
                "owner-MIN_NUM_FORMS": "0",
                "owner-MAX_NUM_FORMS": "1",
                "_continue": "Save",
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertFalse(Owner.objects.filter(apartment__number="8").exists())

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

    def test_owner_phone_is_optional(self):
        # The abonent registry lists owners without phones.
        response = self._post_house(
            reverse("admin:main_app_building_add"),
            [{"number": "1", "personal_account": "1391677280", "area": "50", "owner_fio": "Aziz Karimov"}],
        )

        self.assertEqual(response.status_code, 302)
        owner = Owner.objects.get()
        self.assertEqual((owner.fio, owner.phone, owner.apartment.personal_account), ("Aziz Karimov", "", "1391677280"))

    def test_owner_needs_a_name(self):
        response = self._post_house(
            reverse("admin:main_app_building_add"),
            [{"number": "1", "area": "50", "owner_phone": "+998901112233"}],
        )

        self.assertEqual(response.status_code, 200)
        row_errors = response.context["inline_admin_formsets"][0].formset.errors[0]
        self.assertEqual(row_errors["owner_fio"], ["Enter the owner's full name."])
        self.assertFalse(Building.objects.exists())

    def test_house_page_saves_with_owners_imported_without_phones(self):
        building, apartment = self._house_with_apartment()
        Owner.objects.create(fio="Aziz Karimov", phone="", apartment=apartment)

        response = self._post_house(
            reverse("admin:main_app_building_change", args=[building.pk]),
            [self._existing_row(apartment, personal_account="1391677280", owner_fio="Aziz Karimov", owner_phone="")],
            initial_rows=1,
        )

        self.assertEqual(response.status_code, 302)
        apartment.refresh_from_db()
        self.assertEqual(apartment.personal_account, "1391677280")

    def test_personal_account_belongs_to_one_apartment(self):
        building, apartment = self._house_with_apartment()
        apartment.personal_account = " 1391677280 "
        apartment.save()
        self.assertEqual(Apartment.objects.get(pk=apartment.pk).personal_account, "1391677280")

        response = self._post_house(
            reverse("admin:main_app_building_change", args=[building.pk]),
            [
                self._existing_row(apartment, personal_account="1391677280"),
                {"number": "2", "personal_account": "1391677280", "area": "40"},
            ],
            initial_rows=1,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Apartment.objects.count(), 1)
        # Apartments without an account do not clash with each other.
        Apartment.objects.create(number="3", area=Decimal("40"), building=building, author="test")
        Apartment.objects.create(number="4", area=Decimal("40"), building=building, author="test")
        self.assertEqual(Apartment.objects.filter(personal_account="").count(), 2)

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


class AdminBalanceEntryTests(TestCase):
    """Temporary (October 2026): operators type the balances carried over from the old books."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_superuser(username="kassir1", password="unused-password")
        cls.complex = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        cls.building = Building.objects.create(number="64", complex=cls.complex, author="test")
        cls.apartment = Apartment.objects.create(
            number="1", area=Decimal("50.00"), building=cls.building, personal_account="1391677280", author="test"
        )
        cls.owner = Owner.objects.create(fio="Aziz Karimov", phone="", apartment=cls.apartment)

    def setUp(self):
        self.client.force_login(self.user)

    def _list_entry(self, url_name, pk, typed, shown="0.00"):
        """Save one row of an admin list with an editable balance column."""
        return self.client.post(
            reverse(url_name),
            {
                "form-TOTAL_FORMS": "1",
                "form-INITIAL_FORMS": "1",
                "form-MIN_NUM_FORMS": "0",
                "form-MAX_NUM_FORMS": "1000",
                "form-0-id": str(pk),
                "form-0-balance": typed,
                "initial-form-0-balance": shown,
                "_save": "Save",
            },
        )

    def _resident_page(self, apartment, typed, shown):
        return self.client.post(
            reverse("admin:main_app_owner_change", args=[self.owner.pk]),
            {"fio": "Aziz Karimov", "phone": "", "apartment": str(apartment.pk), "balance": typed, "initial-balance": shown, "_save": "Save"},
        )

    def test_apartment_list_entry_goes_through_the_ledger_under_the_operator(self):
        response = self._list_entry("admin:main_app_apartment_changelist", self.apartment.pk, "-150000")

        self.assertEqual(response.status_code, 302)
        self.apartment.refresh_from_db()
        self.owner.refresh_from_db()
        self.assertEqual((self.apartment.balance, self.owner.balance), (Decimal("-150000"), Decimal("-150000")))
        row = Transaction.objects.get()
        self.assertEqual(
            (row.payment_type, row.amount, row.created_by, row.owner),
            (Transaction.TYPE_MANUAL, Decimal("-150000"), "kassir1", self.owner),
        )
        # A carried-over balance, not money received.
        self.assertIn(OPENING_BALANCE_TAG, row.description)
        self.assertFalse(is_incoming_payment(row))
        event = AuditEvent.objects.get(title="Balance entered in admin")
        self.assertEqual((event.actor, event.owner, event.metadata["transaction_id"]), ("kassir1", self.owner, row.pk))
        self.assertIn("1391677280", event.message)

    def test_a_payment_that_lands_meanwhile_is_kept(self):
        # The operator saw 0 and typed the carried-over debt; a Click payment came in before they saved.
        apply_account_change(self.apartment.pk, Decimal("50000"), Transaction.TYPE_CLICK, external_id="click:1")

        self._list_entry("admin:main_app_apartment_changelist", self.apartment.pk, "-150000", shown="0.00")

        self.apartment.refresh_from_db()
        self.assertEqual(self.apartment.balance, Decimal("-100000"))

    def test_an_untouched_or_empty_balance_posts_nothing(self):
        apply_account_change(self.apartment.pk, Decimal("-20000"), Transaction.TYPE_MANUAL)

        self._list_entry("admin:main_app_apartment_changelist", self.apartment.pk, "-20000", shown="-20000.00")
        self._list_entry("admin:main_app_apartment_changelist", self.apartment.pk, "", shown="-20000.00")

        self.assertEqual(Transaction.objects.count(), 1)
        self.assertFalse(AuditEvent.objects.filter(title="Balance entered in admin").exists())

    def test_resident_list_and_page_enter_the_balance_too(self):
        self._list_entry("admin:main_app_owner_changelist", self.owner.pk, "25000")
        response = self._resident_page(self.apartment, "-5000", shown="25000.00")

        self.assertEqual(response.status_code, 302)
        self.apartment.refresh_from_db()
        self.assertEqual(self.apartment.balance, Decimal("-5000"))
        self.assertEqual([row.amount for row in Transaction.objects.order_by("id")], [Decimal("25000"), Decimal("-30000")])

    def test_moving_the_resident_does_not_enter_the_old_apartments_balance(self):
        other = Apartment.objects.create(number="2", area=Decimal("40"), building=self.building, author="test")

        response = self._resident_page(other, "-5000", shown="0.00")

        self.assertEqual(response.status_code, 302)
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.apartment, other)
        self.assertFalse(Transaction.objects.exists())

    def test_house_page_enters_balances_of_existing_and_new_apartments(self):
        response = self.client.post(
            reverse("admin:main_app_building_change", args=[self.building.pk]),
            {
                "number": "64",
                "address": "",
                "apartments-TOTAL_FORMS": "2",
                "apartments-INITIAL_FORMS": "1",
                "apartments-MIN_NUM_FORMS": "0",
                "apartments-MAX_NUM_FORMS": "1000",
                "apartments-0-id": str(self.apartment.pk),
                "apartments-0-building": str(self.building.pk),
                "apartments-0-number": "1",
                "apartments-0-personal_account": "1391677280",
                "apartments-0-area": "50.00",
                "apartments-0-owner_fio": "Aziz Karimov",
                "apartments-0-balance": "-150000",
                "initial-apartments-0-balance": "0.00",
                "apartments-1-building": str(self.building.pk),
                "apartments-1-number": "2",
                "apartments-1-area": "40",
                "apartments-1-owner_fio": "Laylo Karimova",
                "apartments-1-balance": "30000",
                "initial-apartments-1-balance": "0",
                "_continue": "Save",
            },
        )

        self.assertEqual(response.status_code, 302)
        new = Apartment.objects.get(building=self.building, number="2")
        self.assertEqual(Apartment.objects.get(pk=self.apartment.pk).balance, Decimal("-150000"))
        self.assertEqual((new.balance, Owner.objects.get(apartment=new).balance), (Decimal("30000"), Decimal("30000")))
        # Posted after the owner was created, so the entry names them.
        self.assertEqual(Transaction.objects.get(apartment=new).owner.fio, "Laylo Karimova")

    def test_logs_show_who_entered_what_and_cannot_be_edited(self):
        self._list_entry("admin:main_app_apartment_changelist", self.apartment.pk, "-150000")
        row = Transaction.objects.get()

        ledger = self.client.get(reverse("admin:payments_transaction_changelist"), {"operator": "kassir1"})
        for text in ("1391677280", "Aziz Karimov", "Opening balance", "-150,000", "kassir1"):
            self.assertContains(ledger, text)
        payments_only = self.client.get(reverse("admin:payments_transaction_changelist"), {"kind": "payments"})
        self.assertNotContains(payments_only, "1391677280")
        self.assertEqual(self.client.get(reverse("admin:payments_transaction_change", args=[row.pk])).status_code, 200)
        self.assertEqual(self.client.get(reverse("admin:payments_transaction_add")).status_code, 403)
        self.assertContains(self.client.get(reverse("admin:portal_auditevent_changelist")), "Balance entered in admin")


class ImportAbonentsCommandTests(TestCase):
    """manage.py import_abonents: one workbook per house, matched by personal account."""

    HEADER = ["Abonent turi", "Abonent raqami", "F.I.O.", "Manzil", "Kadastr raqami", "Umumiy maydon"]

    def setUp(self):
        self.folder = Path(self.enterContext(TemporaryDirectory()))

    def _workbook(self, house, rows, header=None):
        workbook = Workbook()
        sheet = workbook.active
        sheet.append(header or self.HEADER)
        sheet.append([None, None, None, None, None, 999])  # the total line under the header
        for row in rows:
            sheet.append(row)
        workbook.save(self.folder / f"{house}.xlsx")

    def _run(self, *args):
        out = StringIO()
        call_command("import_abonents", str(self.folder), *args, stdout=out)
        return out.getvalue()

    def _registry(self):
        self._workbook("60", [
            ["Turarjoy", "1391677280", "TO‘RAYEV LAZIZBEK", "ул. Миробод,  дом 60,  кв. 1", "10:05:1", 171.94],
            ["Turarjoy", "1391677278", "TO‘RAYEVA MADINA", "Hamid Sulaymon MFY, Mirobod ko'chasi, 60-uy, 2-xonadon", "10:05:2", 220.81],
            ["Noturar joy", "1391201893", "RAXIMBAYEVA LOLA", "ул. Миробод,  дом 60, неж3", "10:05:3", 296.06],
            ["Noturar joy", "1391731291", "PARPIYEV DILMURADJON", "ул. Миробод,  дом 60, неж", "10:05:4", 963.12],
        ])
        self._workbook("64V", [
            ["Noturar joy", "1383144691", "RAZAKOV MURODILLA", "ул. Миробод, 64-V, неж", "10:05:5", 341.99],
            ["Turarjoy", "1383118502", "TASHMUXAMEDOV DAVRONBEK", "ул. Миробод, 64-V, 1", "10:11:1", 94.23],
            ["Turarjoy", "1383533487", "SHADIBAYEV TIMUR", "Mirobod MFY, MIrobod ko'chasi, 64-V-uy, 21-xonadon", "10:11:2", 57.21],
            ["Noturar joy", "1383316244", "OSMANOVA DIANA", "ул. Миробод, 64-V, нежелой", "10:11:3", 614.53],
        ])
        self._workbook("62", [
            ["Turarjoy", "1391864577", "KAMOLOVA GULCHIROY", "ул. Миробод, дом 62, кв. 24а", "10:05:6", 126.41],
        ])

    def test_imports_houses_apartments_accounts_and_owners(self):
        self._registry()

        output = self._run()

        self.assertIn("apartments_created: 9", output)
        self.assertEqual(
            sorted(Building.objects.values_list("number", flat=True)), ["60", "62", "64V"]
        )
        units = {
            (apartment.building.number, apartment.number): (apartment.personal_account, apartment.area)
            for apartment in Apartment.objects.select_related("building")
        }
        self.assertEqual(units, {
            ("60", "1"): ("1391677280", Decimal("171.94")),
            ("60", "2"): ("1391677278", Decimal("220.81")),
            ("60", "неж3"): ("1391201893", Decimal("296.06")),
            # The only non-residential unit the address does not number.
            ("60", "неж"): ("1391731291", Decimal("963.12")),
            # Several unnumbered ones are numbered in the order of the file.
            ("64V", "неж1"): ("1383144691", Decimal("341.99")),
            ("64V", "неж2"): ("1383316244", Decimal("614.53")),
            ("64V", "1"): ("1383118502", Decimal("94.23")),
            ("64V", "21"): ("1383533487", Decimal("57.21")),
            ("62", "24A"): ("1391864577", Decimal("126.41")),
        })
        owner = Owner.objects.get(apartment__personal_account="1391677280")
        self.assertEqual((owner.fio, owner.phone, owner.balance), ("TO‘RAYEV LAZIZBEK", "", Decimal("0")))
        self.assertEqual(Building.objects.get(number="60").address, "ул. Миробод, дом 60")

    def test_running_again_updates_in_place_and_keeps_balances(self):
        self._registry()
        self._run()
        apartment = Apartment.objects.get(personal_account="1391677280")
        apply_account_change(apartment.pk, Decimal("-50000"), Transaction.TYPE_MANUAL, description="debt")
        Owner.objects.filter(apartment=apartment).update(phone="+998901112233")

        self._workbook("60", [
            ["Turarjoy", "1391677280", "NEW OWNER", "ул. Миробод,  дом 60,  кв. 1", "10:05:1", 172.5],
        ])
        output = self._run()

        self.assertIn("apartments_created: 0", output)
        self.assertEqual(Apartment.objects.count(), 9)
        apartment.refresh_from_db()
        owner = Owner.objects.get(apartment=apartment)
        self.assertEqual(apartment.area, Decimal("172.50"))
        self.assertEqual(apartment.balance, Decimal("-50000"))
        self.assertEqual((owner.fio, owner.phone, owner.balance), ("NEW OWNER", "+998901112233", Decimal("-50000")))

    def test_dry_run_writes_nothing(self):
        self._registry()

        output = self._run("--dry-run")

        self.assertIn("House 60: 4 units (2 apartments, 2 non-residential), area 1651.93 m²", output)
        self.assertFalse(Building.objects.exists())
        self.assertFalse(Apartment.objects.exists())

    def test_problems_stop_the_whole_import(self):
        self._registry()
        self._workbook("66", [
            # The same account as in 60.xlsx, and an address without an apartment number.
            ["", "1391677280", "SOMEONE", "ул. Миробод, дом 66, кв. 5", "", 50],
            ["", "1383364304", "OTHER", "ул. Миробод, дом 66", "", 50],
        ], header=["№", "Abonent raqami", "F.I.O.", "Manzil", "Kadastr raqami", "Umumiy maydon"])

        with self.assertRaisesMessage(CommandError, "nothing was imported") as caught:
            self._run()

        message = str(caught.exception)
        self.assertIn("personal account 1391677280 is on 60.xlsx row 3 and 66.xlsx row 3", message)
        self.assertIn("66.xlsx row 4: no apartment number", message)
        self.assertFalse(Apartment.objects.exists())
