from datetime import date
from decimal import Decimal

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase
from django.urls import reverse

from billing.models import BillingPeriod, BuildingService, HeatingApartmentUsage, ServiceExpense
from main_app.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change, apply_balance_change
from portal.backend_data import build_portal_data


class BalanceLedgerTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_superuser(username="cashier", password="unused-password")
        cls.complex = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        cls.building = Building.objects.create(number="64", complex=cls.complex, author="test")
        cls.apartment = Apartment.objects.create(number="1", area=Decimal("50.00"), building=cls.building, author="test")
        cls.free_apartment = Apartment.objects.create(
            number="2", area=Decimal("40.00"), building=cls.building, author="test"
        )
        cls.owner = Owner.objects.create(fio="Test Owner", phone="+998901234567", apartment=cls.apartment)

    def setUp(self):
        self.client.force_login(self.user)

    def _ledger(self, owner):
        return list(Transaction.objects.filter(owner=owner).order_by("created_at", "id"))

    def _resident_row(self, owner):
        return next(row for row in build_portal_data(self.user)["residents"] if row["backendId"] == owner.id)

    def test_service_chains_balance_before_and_after(self):
        first = apply_balance_change(self.owner.id, Decimal("1000"), Transaction.TYPE_CASH)
        second = apply_balance_change(self.owner.id, Decimal("-400"), Transaction.TYPE_MANUAL)

        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal("600"))
        self.assertEqual((first.balance_before, first.balance_after), (Decimal("0"), Decimal("1000")))
        self.assertEqual((second.balance_before, second.balance_after), (Decimal("1000"), Decimal("600")))

    def test_service_reads_current_balance_not_a_stale_copy(self):
        stale = Owner.objects.get(pk=self.owner.pk)
        Apartment.objects.filter(pk=self.owner.apartment_id).update(balance=Decimal("500"))
        Owner.objects.filter(pk=self.owner.pk).update(balance=Decimal("500"))

        row = apply_balance_change(stale.pk, Decimal("100"), Transaction.TYPE_CASH)

        self.assertEqual(row.balance_before, Decimal("500"))
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal("600"))

    def test_service_rejects_zero_amount(self):
        with self.assertRaises(ValueError):
            apply_balance_change(self.owner.id, Decimal("0"), Transaction.TYPE_CASH)
        self.assertFalse(Transaction.objects.exists())

    def test_portal_payment_and_debit_go_through_the_ledger(self):
        url = reverse("portal:api_create_payment")
        credit = self.client.post(
            url,
            {"owner_id": self.owner.id, "amount": "1000", "operation": "credit", "channel": "cash"},
            content_type="application/json",
        )
        debit = self.client.post(
            url,
            {"owner_id": self.owner.id, "amount": "300", "operation": "debit"},
            content_type="application/json",
        )

        self.assertEqual(credit.status_code, 200)
        self.assertEqual(debit.status_code, 200)
        self.assertEqual(debit.json()["balance"], 700.0)
        rows = self._ledger(self.owner)
        self.assertEqual([(row.payment_type, row.amount) for row in rows], [
            (Transaction.TYPE_CASH, Decimal("1000")),
            (Transaction.TYPE_MANUAL, Decimal("-300")),
        ])
        self.assertEqual(rows[1].balance_before, rows[0].balance_after)

    def test_portal_new_resident_ignores_a_posted_balance(self):
        # A resident takes over the apartment account; balances change only through transactions.
        response = self.client.post(
            reverse("portal:api_create_resident"),
            {"fio": "New Resident", "phone": "+998900000000", "apartment_id": self.free_apartment.id, "balance": "-50000"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        owner = Owner.objects.get(pk=response.json()["ownerId"])
        self.assertEqual(owner.balance, Decimal("0"))
        self.assertEqual(self._ledger(owner), [])

    def test_portal_resident_without_opening_balance_has_empty_ledger(self):
        response = self.client.post(
            reverse("portal:api_create_resident"),
            {"fio": "New Resident", "phone": "+998900000000", "apartment_id": self.free_apartment.id},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Transaction.objects.filter(owner_id=response.json()["ownerId"]).exists())

    def test_admin_resident_form_has_no_balance_input(self):
        owner_admin = admin.site._registry[Owner]
        request = RequestFactory().get("/")
        request.user = self.user

        self.assertNotIn("balance", owner_admin.get_form(request, self.owner).base_fields)
        self.assertNotIn("balance", owner_admin.get_form(request, None).base_fields)

    def test_admin_new_resident_takes_over_the_apartment_account(self):
        apply_account_change(self.free_apartment.pk, Decimal("-25000"), Transaction.TYPE_MANUAL)
        owner_admin = admin.site._registry[Owner]
        request = RequestFactory().post("/")
        request.user = self.user
        owner = Owner(fio="Admin Resident", phone="+998", apartment=self.free_apartment, balance=Decimal("999"))

        owner_admin.save_model(request, owner, form=None, change=False)

        owner.refresh_from_db()
        self.assertEqual(owner.balance, Decimal("-25000"))
        self.assertEqual(Transaction.objects.filter(apartment=self.free_apartment).count(), 1)

    def test_charges_and_opening_balances_are_not_counted_as_payments(self):
        # A building without vacant apartments: close_period cannot bill an apartment with no owner.
        building = Building.objects.create(number="66", complex=self.complex, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("60.00"), building=building, author="test")
        owner = Owner.objects.create(fio="Billed Owner", phone="+998", apartment=apartment)
        apply_balance_change(
            owner.id, Decimal("10000"), Transaction.TYPE_MANUAL, description=f"{OPENING_BALANCE_TAG} carried over"
        )
        period = BillingPeriod.objects.create(name="May 2026", start_date=date(2026, 5, 1), end_date=date(2026, 5, 31))
        period.buildings.add(building.pk)
        service = BuildingService.objects.create(period=period, building_id=building.pk, service_type="heating")
        ServiceExpense.objects.create(service=service, title="Boiler", amount=Decimal("5000.00"))
        HeatingApartmentUsage.objects.create(service=service, apartment_id=apartment.pk, days_provided=31)
        period.close_period()

        self.assertEqual(self._resident_row(owner)["lastPayment"], "")
        portal_data = build_portal_data(self.user)
        self.assertEqual(portal_data["complexes"][0]["baselineCollected"], 0)
        self.assertEqual({row["status"] for row in portal_data["transactions"]}, {"Pending"})
        listed = self.client.get(reverse("portal:api_list_residents"), {"owner_id": owner.id}).json()
        self.assertEqual(listed["results"][0]["lastPayment"], "")

        apply_balance_change(owner.id, Decimal("2000"), Transaction.TYPE_CASH)

        self.assertNotEqual(self._resident_row(owner)["lastPayment"], "")
        self.assertEqual(build_portal_data(self.user)["complexes"][0]["baselineCollected"], 2000.0)
        listed = self.client.get(reverse("portal:api_list_residents"), {"owner_id": owner.id}).json()
        self.assertNotEqual(listed["results"][0]["lastPayment"], "")
