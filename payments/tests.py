import base64
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
from payments.models import ClickTransaction, PaymeTransaction, Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change, apply_balance_change
from portal.backend_data import build_portal_data
from portal.models import AuditEvent, PortalStatusOverride


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

    def test_admin_balance_input_only_for_an_existing_resident(self):
        owner_admin = admin.site._registry[Owner]
        request = RequestFactory().get("/")
        request.user = self.user

        # Temporary balance entry (main_app.admin.post_balance_entry); a new resident takes over the account.
        self.assertIn("balance", owner_admin.get_form(request, self.owner).base_fields)
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
        event = AuditEvent.objects.get(title="Click payment received", owner=self.owner)
        self.assertEqual(event.event_type, AuditEvent.TYPE_ONLINE_PAYMENT)

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

    def test_operator_cancels_a_paid_payment_in_admin(self):
        operator = get_user_model().objects.create_superuser("kassir", password="unused-password")
        prepared = self._prepare()
        self._complete(prepared["merchant_prepare_id"])
        held = ClickTransaction.objects.get(click_paydoc_id=101)
        paid = held.transaction
        change_url = reverse("admin:payments_clicktransaction_change", args=[held.pk])
        cancel_url = reverse("admin:payments_clicktransaction_cancel", args=[held.pk])

        self.assertEqual(self.client.post(cancel_url, {"reason": "x"}).status_code, 302)  # to the login page
        self.client.force_login(operator)
        self.assertContains(self.client.get(change_url), cancel_url)
        page = self.client.get(cancel_url)
        self.assertContains(page, "Cancel Click payment")
        self.assertContains(page, "<strong>-150,000</strong>", html=False)  # the balance after cancelling
        self.assertRedirects(self.client.post(cancel_url, {"reason": "  "}), cancel_url)
        self.assertEqual(self._balance(), Decimal("50000"))

        response = self.client.post(cancel_url, {"reason": "Click cancelled it in the cabinet"})

        self.assertRedirects(response, change_url)
        self.assertEqual(self._balance(), Decimal("-150000"))
        held.refresh_from_db()
        self.assertEqual(held.state, ClickTransaction.STATE_CANCELLED)
        self.assertIsNotNone(held.cancelled_at)
        self.assertEqual(held.error_note, "Cancelled by kassir: Click cancelled it in the cabinet")
        self.assertEqual(held.transaction, paid)
        debit = Transaction.objects.get(external_id="click-cancel:101")
        self.assertEqual(
            (debit.amount, debit.payment_type, debit.created_by, debit.owner, debit.balance_after),
            (Decimal("-200000"), Transaction.TYPE_CLICK, "kassir", self.owner, Decimal("-150000")),
        )
        override = PortalStatusOverride.objects.get(
            context=PortalStatusOverride.CONTEXT_TRANSACTIONS, target_type=PortalStatusOverride.TARGET_TRANSACTION, target_id=paid.pk
        )
        self.assertEqual((override.status_value, override.created_by), ("Cancelled", operator))
        event = AuditEvent.objects.get(title="Click payment cancelled")
        self.assertEqual((event.event_type, event.user, event.owner), (AuditEvent.TYPE_ONLINE_PAYMENT, operator, self.owner))
        self.assertEqual(event.metadata["amount"], "-200000.00")

        # Click's own view stays consistent: Check says failed, Compare leaves the payment out.
        check = self._signed(3, {"account": "1391549302", "amount": 200000}, prepare_id=prepared["merchant_prepare_id"])
        self.assertEqual(check["status"], 1)
        today = timezone.localdate()
        compare = self._post({
            "action": 4,
            "service_id": 31,
            "from_date": f"{today:%Y-%m-%d} 00:00:00",
            "till_date": f"{today + timedelta(days=1):%Y-%m-%d} 00:00:00",
        })
        self.assertEqual(compare["requests"], {})
        # And the payment no longer counts as one: not in the figures, not as the resident's last payment.
        data = build_portal_data(operator)
        self.assertEqual(data["paymentSummary"]["channels"]["Click"]["amount"], 0)
        self.assertEqual([row for row in data["paymentSummary"]["monthly"] if row["channel"] == "Click"], [])
        self.assertEqual(data["residents"][0]["lastPayment"], "")
        listed = {row["backendId"]: row["status"] for row in data["transactions"]}
        self.assertEqual((listed[paid.pk], listed[debit.pk]), ("Cancelled", "Cancelled"))

        # Once is all: the second try changes nothing.
        self.assertRedirects(self.client.post(cancel_url, {"reason": "again"}), change_url)
        self.assertEqual(Transaction.objects.filter(payment_type=Transaction.TYPE_CLICK).count(), 2)
        self.assertEqual(self._balance(), Decimal("-150000"))
        self.assertNotContains(self.client.get(change_url), cancel_url)

    def test_only_a_paid_payment_can_be_cancelled(self):
        operator = get_user_model().objects.create_superuser("kassir", password="unused-password")
        self.client.force_login(operator)
        held = ClickTransaction.objects.get(pk=self._prepare()["merchant_prepare_id"])
        change_url = reverse("admin:payments_clicktransaction_change", args=[held.pk])
        cancel_url = reverse("admin:payments_clicktransaction_cancel", args=[held.pk])

        self.assertRedirects(self.client.get(cancel_url), change_url)
        self.assertRedirects(self.client.post(cancel_url, {"reason": "by mistake"}), change_url)
        held.refresh_from_db()
        self.assertEqual(held.state, ClickTransaction.STATE_PREPARED)
        self.assertEqual(self._balance(), Decimal("-150000"))
        self.assertFalse(Transaction.objects.filter(payment_type=Transaction.TYPE_CLICK).exists())
        with self.assertRaises(click.PaymentNotCancellable):
            click.cancel_confirmed_payment(held.pk, user=operator, reason="by mistake")

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


PAYME_TEST_SETTINGS = {
    "PAYME_KEY": "test-key",
    "PAYME_ACCOUNT_FIELD": "account",
    "PAYME_MIN_AMOUNT": "1000",
    "PAYME_MAX_AMOUNT": "100000000",
    "PAYME_FISCAL_IKPU": "",
}
PAYME_TIME = 1761110400000  # Payme's clock (ms) when it created the transaction


@override_settings(**PAYME_TEST_SETTINGS)
class PaymeMerchantApiTests(TestCase):
    """Payme Merchant API: the payer types the personal account, sees whose it is and the debt, pays; Payme
    may cancel before or after paying, and a cancelled payment is taken back off the account."""

    @classmethod
    def setUpTestData(cls):
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        cls.building = Building.objects.create(number="60V", complex=complex_obj, author="test")
        cls.apartment = Apartment.objects.create(
            number="1", area=Decimal("187.01"), building=cls.building, personal_account="1391549302", author="test"
        )
        cls.owner = Owner.objects.create(fio="KORMILITSIN ANDREY YUREVICH", phone="", apartment=cls.apartment)
        apply_account_change(cls.apartment.pk, Decimal("-150000"), Transaction.TYPE_CHARGE, description="December")

    def _call(self, method, params, key="test-key", request_id=7):
        token = base64.b64encode(f"Paycom:{key}".encode()).decode()
        response = self.client.post(
            reverse("payments:payme"),
            data=json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Basic {token}",
        )
        self.assertEqual(response.status_code, 200)
        answer = response.json()
        self.assertEqual(answer["id"], request_id)
        return answer

    def _create(self, payme_id="6718a1b2c3d4e5f607182930", amount=20_000_000, account="1391549302", time=PAYME_TIME):
        return self._call(
            "CreateTransaction", {"id": payme_id, "time": time, "amount": amount, "account": {"account": account}}
        )

    def _perform(self, payme_id="6718a1b2c3d4e5f607182930"):
        return self._call("PerformTransaction", {"id": payme_id})

    def _cancel(self, payme_id="6718a1b2c3d4e5f607182930", reason=5):
        return self._call("CancelTransaction", {"id": payme_id, "reason": reason})

    def _balance(self):
        self.apartment.refresh_from_db()
        return self.apartment.balance

    def test_requests_need_the_key_and_a_proper_body(self):
        self.assertEqual(self._call("CheckTransaction", {"id": "x"}, key="wrong")["error"]["code"], -32504)
        with self.settings(PAYME_KEY=""):
            self.assertEqual(self._call("CheckTransaction", {"id": "x"}, key="")["error"]["code"], -32504)
        url = reverse("payments:payme")
        no_header = self.client.post(url, data=json.dumps({"id": 1, "method": "CheckTransaction", "params": {}}),
                                     content_type="application/json").json()
        self.assertEqual(no_header["error"]["code"], -32504)
        not_post = self.client.get(url)
        self.assertEqual((not_post.status_code, not_post.json()["error"]["code"]), (200, -32300))
        self.assertEqual(self.client.post(url, data="{", content_type="application/json").json()["error"]["code"], -32700)
        unknown = self._call("ChargeEverything", {})
        self.assertEqual((unknown["error"]["code"], unknown["error"]["data"]), (-32601, "ChargeEverything"))
        self.assertEqual(self._call("CheckTransaction", None)["error"]["code"], -32600)

    def test_check_perform_shows_whose_account_it_is_and_the_debt(self):
        answer = self._call("CheckPerformTransaction", {"amount": 20_000_000, "account": {"account": "1391549302"}})

        self.assertEqual(answer["result"], {
            "allow": True,
            "additional": {
                "account": "1391549302",
                "full_name": "KORMILITSIN A. Y.",
                "house_num": "60V",
                "apart_num": "1",
                "balance": "-150000.00",
                "debt": "150000.00",
            },
        })
        unknown = self._call("CheckPerformTransaction", {"amount": 20_000_000, "account": {"account": "1"}})
        self.assertEqual(unknown["error"]["code"], -31050)
        self.assertEqual(unknown["error"]["data"], "account")
        self.assertEqual(set(unknown["error"]["message"]), {"ru", "uz", "en"})
        # Less than 1 000 UZS, a fraction of a tiyin, no sum: refused.
        for amount in (99_900, 1.5, None):
            answer = self._call("CheckPerformTransaction", {"amount": amount, "account": {"account": "1391549302"}})
            self.assertEqual(answer["error"]["code"], -31001, amount)

    def test_check_perform_sends_the_receipt_once_the_ikpu_is_set(self):
        with self.settings(PAYME_FISCAL_IKPU="10305008002000000", PAYME_FISCAL_PACKAGE_CODE="1545643"):
            answer = self._call("CheckPerformTransaction", {"amount": 500_000, "account": {"account": "1391549302"}})
        self.assertEqual(answer["result"]["detail"], {
            "receipt_type": 0,
            "items": [{
                "title": "Коммунальные услуги",
                "price": 500_000,
                "count": 1,
                "code": "10305008002000000",
                "package_code": "1545643",
                "vat_percent": 0,
            }],
        })

    def test_create_and_perform_put_the_money_on_the_account_once(self):
        created = self._create()["result"]
        self.assertEqual(created["state"], 1)
        self.assertEqual(self._create()["result"], created)  # Payme may repeat the call
        self.assertEqual(self._balance(), Decimal("-150000"))

        performed = self._perform()["result"]

        self.assertEqual((performed["state"], performed["transaction"]), (2, created["transaction"]))
        self.assertEqual(self._balance(), Decimal("50000"))
        ledger = Transaction.objects.get(payment_type=Transaction.TYPE_PAYME)
        self.assertEqual(
            (ledger.amount, ledger.external_id, ledger.owner, ledger.created_by),
            (Decimal("200000"), "payme:6718a1b2c3d4e5f607182930", self.owner, "Payme"),
        )
        event = AuditEvent.objects.get(title="Payme payment received")
        self.assertEqual((event.event_type, event.owner), (AuditEvent.TYPE_ONLINE_PAYMENT, self.owner))
        self.assertEqual(self._perform()["result"], performed)
        self.assertEqual(Transaction.objects.filter(payment_type=Transaction.TYPE_PAYME).count(), 1)
        self.assertEqual(self._create()["error"]["code"], -31008)
        checked = self._call("CheckTransaction", {"id": "6718a1b2c3d4e5f607182930"})["result"]
        self.assertEqual(checked, {
            "create_time": created["create_time"],
            "perform_time": performed["perform_time"],
            "cancel_time": 0,
            "transaction": created["transaction"],
            "state": 2,
            "reason": None,
        })
        # The payment shows on the statistics under Payme.
        channels = build_portal_data(None)["paymentSummary"]["channels"]
        self.assertEqual(channels["Payme"]["amount"], 200000)

    def test_an_account_takes_several_payments_at_once(self):
        first = self._create(payme_id="6718a1b2c3d4e5f600000001", amount=100_000)["result"]
        second = self._create(payme_id="6718a1b2c3d4e5f600000002", amount=100_000)["result"]
        self.assertEqual((first["state"], second["state"]), (1, 1))
        self.assertNotEqual(first["transaction"], second["transaction"])

    def test_create_refuses_unknown_accounts_and_bad_sums(self):
        self.assertEqual(self._create(account="0000000000")["error"]["code"], -31050)
        self.assertEqual(self._create(amount=50_000)["error"]["code"], -31001)
        self.assertFalse(PaymeTransaction.objects.exists())

    def test_cancel_before_perform_holds_no_money(self):
        self._create()
        cancelled = self._cancel(reason=3)["result"]

        self.assertEqual(cancelled["state"], -1)
        self.assertGreater(cancelled["cancel_time"], 0)
        self.assertEqual(self._cancel(reason=3)["result"], cancelled)
        self.assertEqual(self._perform()["error"]["code"], -31008)
        self.assertEqual(self._balance(), Decimal("-150000"))
        self.assertFalse(Transaction.objects.filter(payment_type=Transaction.TYPE_PAYME).exists())
        held = PaymeTransaction.objects.get()
        self.assertEqual((held.state, held.reason), (-1, 3))

    def test_cancel_after_perform_takes_the_money_back(self):
        self._create()
        self._perform()
        paid = Transaction.objects.get(external_id="payme:6718a1b2c3d4e5f607182930")

        cancelled = self._cancel(reason=5)["result"]

        self.assertEqual(cancelled["state"], -2)
        self.assertEqual(self._balance(), Decimal("-150000"))
        debit = Transaction.objects.get(external_id="payme-cancel:6718a1b2c3d4e5f607182930")
        self.assertEqual((debit.amount, debit.payment_type, debit.created_by), (Decimal("-200000"), Transaction.TYPE_PAYME, "Payme"))
        statuses = set(
            PortalStatusOverride.objects.filter(target_id__in=[paid.pk, debit.pk]).values_list("status_value", flat=True)
        )
        self.assertEqual(statuses, {"Cancelled"})
        event = AuditEvent.objects.get(title="Payme payment cancelled")
        self.assertEqual(event.metadata["amount"], "-200000.00")
        # Once is all, and the payment no longer counts as one.
        self.assertEqual(self._cancel(reason=5)["result"], cancelled)
        self.assertEqual(Transaction.objects.filter(payment_type=Transaction.TYPE_PAYME).count(), 2)
        self.assertEqual(self._perform()["error"]["code"], -31008)
        self.assertEqual(build_portal_data(None)["paymentSummary"]["channels"]["Payme"]["amount"], 0)
        checked = self._call("CheckTransaction", {"id": "6718a1b2c3d4e5f607182930"})["result"]
        self.assertEqual((checked["state"], checked["reason"], checked["cancel_time"]), (-2, 5, cancelled["cancel_time"]))

    def test_a_transaction_not_performed_in_12_hours_is_cancelled(self):
        self._create()
        PaymeTransaction.objects.update(created_at=timezone.now() - timedelta(hours=12, minutes=1))

        self.assertEqual(self._perform()["error"]["code"], -31008)
        held = PaymeTransaction.objects.get()
        self.assertEqual((held.state, held.reason), (-1, 4))
        self.assertEqual(self._create()["error"]["code"], -31008)
        self.assertEqual(self._balance(), Decimal("-150000"))

    def test_unknown_transactions(self):
        for method in ("PerformTransaction", "CheckTransaction"):
            self.assertEqual(self._call(method, {"id": "000000000000000000000000"})["error"]["code"], -31003)
        self.assertEqual(self._cancel(payme_id="000000000000000000000000")["error"]["code"], -31003)

    def test_statement_lists_the_transactions_created_in_the_period(self):
        self._create(payme_id="6718a1b2c3d4e5f600000001", time=PAYME_TIME)
        self._perform(payme_id="6718a1b2c3d4e5f600000001")
        self._create(payme_id="6718a1b2c3d4e5f600000002", time=PAYME_TIME + 60_000)

        answer = self._call("GetStatement", {"from": PAYME_TIME, "to": PAYME_TIME + 1})["result"]

        self.assertEqual(len(answer["transactions"]), 1)
        row = answer["transactions"][0]
        self.assertEqual(
            (row["id"], row["time"], row["amount"], row["account"], row["state"]),
            ("6718a1b2c3d4e5f600000001", PAYME_TIME, 20_000_000, {"account": "1391549302"}, 2),
        )
        self.assertEqual(len(self._call("GetStatement", {"from": PAYME_TIME, "to": PAYME_TIME + 60_000})["result"]["transactions"]), 2)
        self.assertEqual(self._call("GetStatement", {"from": 0, "to": 1})["result"], {"transactions": []})

    def test_fiscal_data_is_kept_with_the_transaction(self):
        self._create()
        fiscal = {"receipt_id": 121, "status_code": 0, "fiscal_sign": "800031554082", "qr_code_url": "https://ofd.example/1"}

        answer = self._call("SetFiscalData", {"id": "6718a1b2c3d4e5f607182930", "type": "PERFORM", "fiscal_data": fiscal})

        self.assertEqual(answer["result"], {"success": True})
        self.assertEqual(PaymeTransaction.objects.get().raw_payload["fiscal_perform"], fiscal)
        missing = self._call("SetFiscalData", {"id": "000000000000000000000000", "type": "PERFORM", "fiscal_data": fiscal})
        self.assertEqual(missing["error"]["code"], -32001)
        wrong = self._call("SetFiscalData", {"id": "6718a1b2c3d4e5f607182930", "type": "REFUND", "fiscal_data": fiscal})
        self.assertEqual(wrong["error"]["code"], -32602)
