import json
from datetime import date, timedelta
from decimal import Decimal

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from billing.models import BillingPeriod, BuildingService, HeatingApartmentUsage, ServiceExpense
from main_app.models import Apartment, Building, Complex, Owner
from payments import click
from payments.models import ClickTransaction, Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change, apply_balance_change
from portal.backend_data import build_portal_data
from portal.models import AuditEvent


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


CLICK_TEST_SETTINGS = {
    "CLICK_SECRET_KEY": "test-secret",
    "CLICK_SERVICE_ID": "31",
    "CLICK_ALLOWED_IPS": [],
    "CLICK_MIN_AMOUNT": "1000",
    "CLICK_MAX_AMOUNT": "100000000",
    "CLICK_ACCOUNT_PARAM": "account",
}
SIGN_TIME = "2026-10-20 12:00:00"


@override_settings(**CLICK_TEST_SETTINGS)
class ClickAdvancedShopTests(TestCase):
    """Advanced Shop: the payer types the personal account, sees the balance, pays; the money lands once."""

    @classmethod
    def setUpTestData(cls):
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        cls.building = Building.objects.create(number="60V", complex=complex_obj, author="test")
        cls.apartment = Apartment.objects.create(
            number="1", area=Decimal("187.01"), building=cls.building, personal_account="1391549302", author="test"
        )
        cls.owner = Owner.objects.create(fio="KORMILITSIN ANDREY YUREVICH", phone="", apartment=cls.apartment)
        apply_account_change(cls.apartment.pk, Decimal("-150000"), Transaction.TYPE_CHARGE, description="December")

    def _post(self, payload, **extra):
        return self.client.post(
            reverse("payments:click_advanced"), data=json.dumps(payload), content_type="application/json", **extra
        ).json()

    def _signed(self, action, params, *, paydoc=101, attempt=1, prepare_id=None, secret="test-secret", **fields):
        payload = {
            "action": action,
            "click_paydoc_id": paydoc,
            "attempt_trans_id": attempt,
            "service_id": 31,
            "sign_time": SIGN_TIME,
            "params": params,
            **fields,
        }
        if prepare_id is not None:
            payload["merchant_prepare_id"] = prepare_id
        payload["sign_string"] = click.signature(paydoc, attempt, 31, secret, *params.values(), action, SIGN_TIME)
        return self._post(payload)

    def _prepare(self, amount=200000, account="1391549302", **kwargs):
        return self._signed(1, {"account": account, "amount": amount}, **kwargs)

    def _complete(self, prepare_id, amount=200000, **kwargs):
        return self._signed(2, {"account": "1391549302", "amount": amount}, prepare_id=prepare_id, **kwargs)

    def _balance(self):
        self.apartment.refresh_from_db()
        return self.apartment.balance

    def test_get_info_shows_whose_account_it_is_and_the_debt(self):
        answer = self._post({"action": 0, "service_id": 31, "params": {"account": "1391549302"}})

        self.assertEqual(answer["error"], 0)
        self.assertEqual(answer["params"], {
            "account": "1391549302",
            "full_name": "KORMILITSIN A. Y.",
            "house_num": "60V",
            "apart_num": "1",
            "balance": "-150000.00",
            "debt": "150000.00",
        })

    def test_get_info_finds_the_apartment_by_house_and_number_too(self):
        answer = self._post({"action": 0, "service_id": 31, "params": {"house_num": "60 в", "apart_num": "1"}})

        self.assertEqual((answer["error"], answer["params"]["account"]), (0, "1391549302"))

    def test_get_info_for_an_unknown_account(self):
        answer = self._post({"action": 0, "service_id": 31, "params": {"account": "1111111111"}})

        self.assertEqual((answer["error"], answer["error_note"]), (-5, "User does not exist"))

    def test_prepare_and_complete_put_the_money_on_the_account_once(self):
        prepared = self._prepare()
        self.assertEqual(prepared["error"], 0, prepared)
        self.assertEqual(prepared["params"]["debt"], "150000.00")
        self.assertEqual(self._prepare()["merchant_prepare_id"], prepared["merchant_prepare_id"])
        self.assertEqual(self._balance(), Decimal("-150000"))

        completed = self._complete(prepared["merchant_prepare_id"])

        self.assertEqual(completed["error"], 0, completed)
        self.assertEqual(self._balance(), Decimal("50000"))
        ledger = Transaction.objects.get(payment_type=Transaction.TYPE_CLICK)
        self.assertEqual((ledger.amount, ledger.external_id, ledger.owner), (Decimal("200000"), "click:101", self.owner))
        self.assertEqual(completed["merchant_confirm_id"], str(ledger.pk))
        self.assertEqual(completed["params"]["balance"], "50000.00")
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal("50000"))
        self.assertTrue(AuditEvent.objects.filter(title="Click payment received", owner=self.owner).exists())

        again = self._complete(prepared["merchant_prepare_id"])
        self.assertEqual((again["error"], again["merchant_confirm_id"]), (-4, str(ledger.pk)))
        # Another attempt of the paid Click payment is refused, and nothing is credited twice.
        self.assertEqual(self._prepare(attempt=2)["error"], -4)
        self.assertEqual(Transaction.objects.filter(payment_type=Transaction.TYPE_CLICK).count(), 1)
        self.assertEqual(self._balance(), Decimal("50000"))

    def test_signature_is_required(self):
        self.assertEqual(self._prepare(secret="wrong")["error"], -1)
        with self.settings(CLICK_SECRET_KEY=""):
            self.assertEqual(self._prepare(secret="")["error"], -1)
        self.assertFalse(ClickTransaction.objects.exists())

    def test_prepare_refuses_unknown_accounts_and_bad_sums(self):
        self.assertEqual(self._prepare(account="1111111111")["error"], -5)
        self.assertEqual(self._prepare(amount=999)["error"], -2)
        self.assertEqual(self._prepare(amount="1000.123")["error"], -2)
        self.assertEqual(self._prepare(amount=100000001)["error"], -2)
        self.assertFalse(ClickTransaction.objects.exists())

    def test_click_error_on_complete_cancels_the_attempt(self):
        prepared = self._prepare()

        answer = self._complete(prepared["merchant_prepare_id"], error=-5017, error_note="Insufficient funds")

        self.assertEqual(answer["error"], -9)
        held = ClickTransaction.objects.get()
        self.assertEqual((held.state, held.error_note), (ClickTransaction.STATE_CANCELLED, "Insufficient funds"))
        self.assertEqual(self._complete(prepared["merchant_prepare_id"])["error"], -9)
        self.assertEqual(self._balance(), Decimal("-150000"))

    def test_complete_checks_the_prepared_attempt(self):
        prepared = self._prepare()

        self.assertEqual(self._complete("999999")["error"], -6)
        self.assertEqual(self._complete(prepared["merchant_prepare_id"], paydoc=202)["error"], -6)
        self.assertEqual(self._complete(prepared["merchant_prepare_id"], amount=150000)["error"], -2)
        self.assertEqual(self._balance(), Decimal("-150000"))

    def test_check_reports_the_attempt_state(self):
        def check(prepare_id, **kwargs):
            return self._signed(3, {"account": "1391549302", "amount": 200000}, prepare_id=prepare_id, **kwargs)

        prepared = self._prepare()
        self.assertEqual(check(prepared["merchant_prepare_id"])["status"], 0)
        completed = self._complete(prepared["merchant_prepare_id"])
        answer = check(prepared["merchant_prepare_id"])
        self.assertEqual((answer["status"], answer["merchant_confirm_id"]), (2, completed["merchant_confirm_id"]))

        other = self._prepare(paydoc=303, attempt=7)
        self._complete(other["merchant_prepare_id"], paydoc=303, attempt=7, error=-1)
        self.assertEqual(check(other["merchant_prepare_id"], paydoc=303, attempt=7)["status"], 1)
        self.assertEqual(check("999999")["error"], -6)

    def test_compare_lists_the_confirmed_payments_of_the_period(self):
        prepared = self._prepare()
        self._complete(prepared["merchant_prepare_id"])
        self._prepare(paydoc=404, attempt=9)  # held, never completed
        today = timezone.localdate()

        answer = self._post({
            "action": 4,
            "service_id": 31,
            "from_date": f"{today:%Y-%m-%d} 00:00:00",
            "till_date": f"{today + timedelta(days=1):%Y-%m-%d} 00:00:00",
        })

        self.assertEqual(answer["error"], 0)
        self.assertEqual(answer["requests"], {
            "101": {"click_paydoc_id": 101, "params": {"account": "1391549302", "amount": "200000.00"}},
        })
        earlier = self._post(
            {"action": 4, "service_id": 31, "from_date": "2020-01-01 00:00:00", "till_date": "2020-01-02 00:00:00"}
        )
        self.assertEqual(earlier["requests"], {})
        self.assertEqual(self._post({"action": 4, "service_id": 31, "from_date": "yesterday", "till_date": ""})["error"], -8)

    def test_malformed_requests(self):
        self.assertEqual(self._post({"action": 9, "service_id": 31})["error"], -3)
        self.assertEqual(self._post({"action": 0, "service_id": 99, "params": {"account": "1391549302"}})["error"], -8)
        broken = self.client.post(reverse("payments:click_advanced"), data="{", content_type="application/json").json()
        self.assertEqual(broken["error"], -8)
        self.assertEqual(self.client.get(reverse("payments:click_advanced")).status_code, 405)

    def test_only_click_addresses_when_listed(self):
        with self.settings(CLICK_ALLOWED_IPS=["185.8.212.184"]):
            response = self.client.post(
                reverse("payments:click_advanced"),
                data=json.dumps({"action": 0, "service_id": 31, "params": {"account": "1391549302"}}),
                content_type="application/json",
            )
            self.assertEqual(response.status_code, 403)
            allowed = self._post(
                {"action": 0, "service_id": 31, "params": {"account": "1391549302"}}, REMOTE_ADDR="185.8.212.184"
            )
            self.assertEqual(allowed["error"], 0)


@override_settings(**CLICK_TEST_SETTINGS)
class ClickShopApiTests(TestCase):
    """SHOP API (form-encoded): merchant_trans_id is the personal account."""

    @classmethod
    def setUpTestData(cls):
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="62", complex=complex_obj, author="test")
        cls.apartment = Apartment.objects.create(
            number="24A", area=Decimal("64.07"), building=building, personal_account="1391864577", author="test"
        )
        Owner.objects.create(fio="ERKINOV FARRUX NAVRUZOVICH", phone="", apartment=cls.apartment)

    def _post(self, action, *, click_trans_id=5001, account="1391864577", amount="75000.00", prepare_id=None,
              error="0", secret="test-secret"):
        data = {
            "click_trans_id": str(click_trans_id),
            "service_id": "31",
            "click_paydoc_id": "9001",
            "merchant_trans_id": account,
            "amount": amount,
            "action": str(action),
            "error": error,
            "error_note": "Success" if error == "0" else "Cancelled",
            "sign_time": SIGN_TIME,
        }
        signed = [data["click_trans_id"], "31", secret, account]
        if prepare_id is not None:
            data["merchant_prepare_id"] = str(prepare_id)
            signed.append(str(prepare_id))
        signed += [amount, str(action), SIGN_TIME]
        data["sign_string"] = click.signature(*signed)
        return self.client.post(reverse("payments:click_shop"), data).json()

    def test_prepare_then_complete(self):
        prepared = self._post(0)
        self.assertEqual((prepared["error"], prepared["merchant_trans_id"]), (0, "1391864577"), prepared)

        completed = self._post(1, prepare_id=prepared["merchant_prepare_id"])

        self.assertEqual(completed["error"], 0, completed)
        self.apartment.refresh_from_db()
        self.assertEqual(self.apartment.balance, Decimal("75000"))
        self.assertEqual(completed["merchant_confirm_id"], Transaction.objects.get(payment_type="click").pk)
        self.assertEqual(self._post(1, prepare_id=prepared["merchant_prepare_id"])["error"], -4)

    def test_refusals(self):
        self.assertEqual(self._post(0, secret="wrong")["error"], -1)
        self.assertEqual(self._post(0, account="0000000000")["error"], -5)
        self.assertEqual(self._post(0, amount="10.00")["error"], -2)
        self.assertEqual(self._post(5)["error"], -3)
        prepared = self._post(0)
        self.assertEqual(self._post(1, prepare_id=prepared["merchant_prepare_id"], account="1391351087")["error"], -5)
        self.assertEqual(self._post(1, prepare_id=prepared["merchant_prepare_id"], error="-5017")["error"], -9)
        self.assertEqual(ClickTransaction.objects.get().state, ClickTransaction.STATE_CANCELLED)
        self.apartment.refresh_from_db()
        self.assertEqual(self.apartment.balance, Decimal("0"))

    def test_masked_name_keeps_company_names(self):
        self.assertEqual(click.masked_name("TO‘RAYEV LAZIZBEK KAMOLIDDIN O‘G‘LI"), "TO‘RAYEV L. K.")
        self.assertEqual(click.masked_name('ООО "BAYCE TRADE"'), 'ООО "BAYCE TRADE"')
