import base64
import gzip
import io
import json
import re
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse
from openpyxl import load_workbook

from main_app.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change, apply_balance_change
from portal.backend_data import build_portal_data


PORTAL_PAGES = [
    "portal:dashboard",
    "portal:residential",
    "portal:billing",
    "portal:billing_period_create",
    "portal:analytics",
]


class PortalAuthenticationTests(TestCase):
    password = "portal-test-password"

    @classmethod
    def setUpTestData(cls):
        User = get_user_model()
        cls.user = User.objects.create_user(username="operator", password=cls.password)
        cls.superuser = User.objects.create_superuser(username="root-admin", password=cls.password)
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="64", complex=complex_obj, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("50.00"), building=building, author="test")
        cls.owner = Owner.objects.create(fio="Test Owner", phone="+998901234567", apartment=apartment)

    def _payment_payload(self):
        return {"owner_id": self.owner.id, "amount": "1000", "operation": "credit", "channel": "cash"}

    def test_portal_pages_redirect_anonymous_users_to_login(self):
        login_url = reverse("portal:login")
        for name in PORTAL_PAGES:
            with self.subTest(page=name):
                path = reverse(name)
                response = self.client.get(path)
                self.assertRedirects(response, f"{login_url}?next={path}", fetch_redirect_response=False)

    def test_api_returns_401_for_anonymous_users(self):
        for name in [
            "portal:api_root",
            "portal:api_portal_data",
            "portal:api_list_residents",
            "portal:api_list_transactions",
            "portal:api_list_audit",
        ]:
            with self.subTest(endpoint=name):
                response = self.client.get(reverse(name), HTTP_ACCEPT="application/json")
                self.assertEqual(response.status_code, 401)

    def test_anonymous_user_cannot_create_payment(self):
        response = self.client.post(
            reverse("portal:api_create_payment"),
            self._payment_payload(),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal("0"))
        self.assertFalse(Transaction.objects.exists())

    def test_health_endpoint_stays_public(self):
        response = self.client.get(reverse("portal:api_health"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_api_schema_and_docs_require_login(self):
        for path in ["/api/schema/", "/api/docs/"]:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertRedirects(
                    response,
                    f"{reverse('portal:login')}?next={path}",
                    fetch_redirect_response=False,
                )

    def test_login_page_renders_for_anonymous_users(self):
        response = self.client.get(reverse("portal:login"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "portal/login.html")

    def test_login_redirects_to_next(self):
        response = self.client.post(
            reverse("portal:login"),
            {"username": "operator", "password": self.password, "next": "/billing/"},
        )
        self.assertRedirects(response, "/billing/", fetch_redirect_response=False)

    def test_login_ignores_external_next(self):
        response = self.client.post(
            reverse("portal:login"),
            {"username": "operator", "password": self.password, "next": "https://evil.example/"},
        )
        self.assertRedirects(response, reverse("portal:dashboard"), fetch_redirect_response=False)

    def test_wrong_password_shows_error(self):
        response = self.client.post(reverse("portal:login"), {"username": "operator", "password": "wrong"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context["form"].errors)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_inactive_user_cannot_log_in(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])
        response = self.client.post(reverse("portal:login"), {"username": "operator", "password": self.password})
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_authenticated_user_can_open_pages_and_api(self):
        self.client.force_login(self.user)
        for name in PORTAL_PAGES:
            with self.subTest(page=name):
                self.assertEqual(self.client.get(reverse(name)).status_code, 200)
        response = self.client.get(reverse("portal:api_portal_data"), HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["profile"]["username"], "operator")

    def test_authenticated_post_requires_csrf_token(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.user)
        url = reverse("portal:api_create_payment")

        response = client.post(url, self._payment_payload(), content_type="application/json")
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Transaction.objects.exists())

        client.get(reverse("portal:dashboard"))
        response = client.post(
            url,
            self._payment_payload(),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
        )
        self.assertEqual(response.status_code, 200)
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal("1000"))

    def test_logout_ends_session_and_points_to_login(self):
        self.client.force_login(self.user)
        response = self.client.post(reverse("portal:api_logout"), {}, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["redirectUrl"], reverse("portal:login"))
        self.assertNotIn("_auth_user_id", self.client.session)
        response = self.client.get(reverse("portal:dashboard"))
        self.assertEqual(response.status_code, 302)

    def test_logout_no_longer_accepts_get_redirects(self):
        response = self.client.get(reverse("portal:api_logout"), {"next": "https://evil.example/"})
        self.assertEqual(response.status_code, 405)

    def test_profile_does_not_fall_back_to_another_account(self):
        profile = build_portal_data(None)["profile"]
        self.assertEqual(profile["username"], "")
        self.assertFalse(profile["isAuthenticated"])

    def test_admin_login_stays_reachable_and_admin_requires_staff(self):
        self.assertEqual(self.client.get(reverse("admin:login")).status_code, 200)
        self.client.force_login(self.user)
        response = self.client.get(reverse("admin:index"))
        self.assertRedirects(
            response,
            f"{reverse('admin:login')}?next={reverse('admin:index')}",
            fetch_redirect_response=False,
        )


class PortalSnapshotTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="operator", password="unused-password")
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="64", complex=complex_obj, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("50.00"), building=building, author="test")
        cls.owner = Owner.objects.create(
            fio="Иванов </script><script>alert(1)</script> & <b>",
            phone="+998901234567",
            apartment=apartment,
        )

    def setUp(self):
        self.client.force_login(self.user)

    def _embedded_data(self, html):
        match = re.search(r'<script id="hydroflow-backend-data" type="application/json">(.*?)</script>', html, re.S)
        self.assertIsNotNone(match)
        return match.group(1)

    def test_page_embeds_snapshot_that_cannot_close_the_script_tag(self):
        html = self.client.get(reverse("portal:dashboard")).content.decode("utf-8")
        raw = self._embedded_data(html)

        self.assertNotIn("<", raw)
        self.assertIn("Иванов", raw)  # non-ASCII stays readable instead of \u-escaped
        data = json.loads(raw)
        self.assertEqual(data["residents"][0]["name"], self.owner.fio)

    def test_responses_are_gzipped_when_the_client_accepts_it(self):
        response = self.client.get(reverse("portal:api_portal_data"), HTTP_ACCEPT_ENCODING="gzip")
        self.assertEqual(response["Content-Encoding"], "gzip")
        self.assertEqual(json.loads(gzip.decompress(response.content))["residents"][0]["backendId"], self.owner.id)

    def test_complexes_list_returns_rows(self):
        apply_balance_change(self.owner.id, Decimal("1000"), Transaction.TYPE_CASH)
        response = self.client.get(reverse("portal:api_list_complexes"))
        self.assertEqual(response.status_code, 200)
        row = response.json()["results"][0]
        self.assertEqual(row["units"], 1)
        self.assertEqual(row["baselineCollected"], 1000.0)

    def test_transaction_rows_keep_their_labels(self):
        flavours = [
            (Transaction.TYPE_CASH, "1000", "", "Utility Payment", "Cash", "Success"),
            (Transaction.TYPE_MANUAL, "500", "[portal:card-credit] Portal credit via card.", "Utility Payment", "Card", "Success"),
            (Transaction.TYPE_MANUAL, "-200", "[portal:balance-debit] x", "Manual Adjustment", "Adjustment", "Pending"),
            (Transaction.TYPE_MANUAL, "-300", f"{OPENING_BALANCE_TAG} x", "Manual Adjustment", "Manual", "Pending"),
            (Transaction.TYPE_CHARGE, "-400", "[billing:period-charge] x", "Monthly Charge", "Charge", "Pending"),
            (Transaction.TYPE_CHARGE, "100", "[billing:recalculation] x", "Recalculation", "Charge", "Pending"),
        ]
        for payment_type, amount, description, *_ in flavours:
            apply_balance_change(self.owner.id, Decimal(amount), payment_type, description=description)

        listed = self.client.get(reverse("portal:api_list_transactions"), {"page_size": 100}).json()["results"]
        rows = {row["backendId"]: row for row in listed}
        ledger = Transaction.objects.filter(owner=self.owner).order_by("id")
        for item, (_, amount, _, expected_type, expected_method, expected_status) in zip(ledger, flavours):
            with self.subTest(description=item.description):
                row = rows[item.id]
                self.assertEqual(
                    (row["type"], row["method"], row["status"], row["signedAmount"]),
                    (expected_type, expected_method, expected_status, float(amount)),
                )
                self.assertRegex(row["date"], r"^\d{2}\.\d{2}\.\d{4}$")
                self.assertRegex(row["createdAt"], r"^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$")


    def test_snapshot_and_list_endpoints_describe_rows_identically(self):
        Owner.objects.filter(pk=self.owner.pk).update(telegram_status="linked", has_contract=True)
        apply_balance_change(self.owner.id, Decimal("1000"), Transaction.TYPE_CASH, description="[portal:cash-credit] x")
        snapshot = build_portal_data(self.user)

        listed_resident = self.client.get(reverse("portal:api_list_residents"), {"owner_id": self.owner.id}).json()["results"][0]
        self.assertEqual(listed_resident, snapshot["residents"][0])
        self.assertEqual(listed_resident["telegramStatus"], "connected")

        listed_transaction = self.client.get(reverse("portal:api_list_transactions")).json()["results"][0]
        self.assertEqual(listed_transaction, snapshot["transactions"][0])

class PortalExportTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="operator", password="unused-password")
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="64", complex=complex_obj, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("50.00"), building=building, author="test")
        cls.owner = Owner.objects.create(fio="Ўринбоев Ғайрат", phone="+998901234567", apartment=apartment)
        for index in range(120):
            apply_balance_change(cls.owner.id, Decimal(1000 + index), Transaction.TYPE_CASH)

    def setUp(self):
        self.client.force_login(self.user)

    def _export(self, url, payload):
        response = self.client.post(url, payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        download = response.json()["download"]
        return download, base64.b64decode(download["content"])

    def test_transactions_xlsx_has_all_rows_and_localized_headers(self):
        download, content = self._export(
            reverse("portal:api_export_report"),
            {"context": "transactions", "format": "XLSX", "language": "ru"},
        )
        self.assertTrue(download["filename"].endswith(".xlsx"))
        sheet = load_workbook(io.BytesIO(content)).active
        rows = list(sheet.iter_rows(values_only=True))
        self.assertEqual(rows[0], ("Житель", "Тип", "Метод", "Дата", "Сумма", "Статус"))
        self.assertEqual(len(rows), 121)
        self.assertEqual(rows[1][0], "Ўринбоев Ғайрат")

    def test_pdf_export_is_not_truncated(self):
        download, content = self._export(
            reverse("portal:api_export_report"),
            {"context": "transactions", "format": "PDF", "language": "uz"},
        )
        self.assertEqual(download["mime"], "application/pdf")
        self.assertTrue(content.startswith(b"%PDF"))
        # 120 rows cannot fit on one page; the old writer silently stopped after 45 lines.
        self.assertGreater(len(re.findall(rb"/Type /Page\b", content)), 1)

    def test_residential_exports_render(self):
        for export_format in ["XLSX", "PDF"]:
            with self.subTest(export_format=export_format):
                download, content = self._export(
                    reverse("portal:api_export_report"),
                    {"context": "residential", "format": export_format},
                )
                self.assertTrue(download["filename"].startswith("residential"))
                self.assertTrue(content)

    def test_removed_maintenance_context_falls_back_to_residential(self):
        download, _content = self._export(
            reverse("portal:api_export_report"),
            {"context": "maintenance", "format": "XLSX"},
        )
        self.assertTrue(download["filename"].startswith("residential"))

    def test_audit_export_is_xlsx(self):
        download, content = self._export(reverse("portal:api_export_audit"), {"language": "uz"})
        self.assertTrue(download["filename"].startswith("audit-log-"))
        header = next(load_workbook(io.BytesIO(content)).active.iter_rows(values_only=True))
        self.assertEqual(header[:3], ("Audit ID", "Sana va vaqt", "Hodisa turi"))


DEMO_MARKERS = [
    "Harbor View",
    "Sarah Jenkins",
    "Marcus Aurelius",
    "Aziz Karimov",
    "HF-9284",
    "images.unsplash.com",
    "Balance report exported by Admin User",
    "@hydroflow.local",
]


class PortalDemoContentTests(TestCase):
    """Pages and the frontend bundle must show only backend data, never invented sample records."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="operator", password="unused-password")

    def test_pages_render_without_sample_records(self):
        self.client.force_login(self.user)
        for name in PORTAL_PAGES:
            html = self.client.get(reverse(name)).content.decode("utf-8")
            for marker in [*DEMO_MARKERS, "Skyline"]:
                with self.subTest(page=name, marker=marker):
                    self.assertFalse(marker in html, f"{marker!r} rendered on {name}")

    def test_frontend_bundle_has_no_sample_dataset(self):
        bundle = (Path(settings.BASE_DIR) / "static" / "js" / "app.js").read_text(encoding="utf-8")
        for marker in [*DEMO_MARKERS, "buildAnalyticsDemoData", "HydroFlowMockData", "Marcus"]:
            with self.subTest(marker=marker):
                self.assertFalse(marker in bundle, f"{marker!r} found in app.js")


class PortalRemovedSystemHealthTests(TestCase):
    """The System Health page and its maintenance/telemetry backend were removed and must stay gone."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="operator", password="unused-password")

    def test_system_health_urls_are_gone(self):
        self.client.force_login(self.user)
        for path in ["/system-health/", "/api/lists/maintenance/", "/api/maintenance/deploy/"]:
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)

    def test_snapshot_has_no_maintenance_or_telemetry(self):
        data = build_portal_data(self.user)
        for key in ["maintenanceTasks", "telemetryNodes", "pressureSeries"]:
            with self.subTest(key=key):
                self.assertNotIn(key, data)


class PortalApartmentAccountTests(TestCase):
    """Debt billed to a vacant apartment shows up in the portal and passes to its next owner."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="operator", password="unused-password")
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="66", complex=complex_obj, author="test")
        cls.apartment = Apartment.objects.create(number="7", area=Decimal("60.00"), building=building, author="test")
        apply_account_change(
            cls.apartment.id, Decimal("-500"), Transaction.TYPE_CHARGE, description="[billing:period-charge] x"
        )

    def setUp(self):
        self.client.force_login(self.user)

    def test_vacant_apartment_debt_is_in_the_snapshot(self):
        data = build_portal_data(self.user)
        resident = next(row for row in data["residents"] if row["apartmentBackendId"] == self.apartment.id)
        self.assertEqual(resident["name"], "Unassigned owner")
        self.assertEqual(resident["balance"], -500.0)
        self.assertEqual(resident["status"], "debtor")
        self.assertEqual(data["transactions"][0]["residentId"], resident["id"])
        self.assertIsNone(data["transactions"][0]["ownerBackendId"])

    def test_new_owner_sees_the_apartment_account_history(self):
        owner = Owner.objects.create(fio="Next Owner", phone="+998901234567", apartment=self.apartment)
        self.assertEqual(owner.balance, Decimal("-500"))

        data = build_portal_data(self.user)
        resident = next(row for row in data["residents"] if row["apartmentBackendId"] == self.apartment.id)
        self.assertEqual((resident["name"], resident["balance"]), ("Next Owner", -500.0))
        self.assertEqual(data["transactions"][0]["residentId"], resident["id"])

        rows = self.client.get(reverse("portal:api_list_transactions"), {"owner_id": owner.id}).json()["results"]
        self.assertEqual([row["signedAmount"] for row in rows], [-500.0])


class PortalBoundedSnapshotTests(TestCase):
    """The snapshot keeps a few rows per account; whole-history figures come pre-aggregated."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="operator", password="unused-password")
        complex_obj = Complex.objects.create(title="Mirabad Avenue", address="", author="test")
        building = Building.objects.create(number="64", complex=complex_obj, author="test")
        apartment = Apartment.objects.create(number="1", area=Decimal("50.00"), building=building, author="test")
        cls.owner = Owner.objects.create(fio="Long History", phone="+998901234567", apartment=apartment)
        for index in range(12):
            apply_balance_change(cls.owner.id, Decimal(1000 + index), Transaction.TYPE_PAYME)
        apply_balance_change(cls.owner.id, Decimal("-300"), Transaction.TYPE_CHARGE, description="[billing:period-charge] x")

    def setUp(self):
        self.client.force_login(self.user)

    def test_snapshot_keeps_only_the_latest_rows_of_each_account(self):
        data = build_portal_data(self.user)
        newest = list(Transaction.objects.order_by("-created_at", "-id").values_list("id", flat=True)[:5])
        self.assertEqual([row["backendId"] for row in data["transactions"]], newest)

    def test_payment_summary_covers_the_whole_history(self):
        summary = build_portal_data(self.user)["paymentSummary"]
        self.assertEqual(summary["channels"]["Payme"], {"amount": float(sum(1000 + i for i in range(12))), "residents": 1})
        self.assertEqual(sum(row["count"] for row in summary["monthly"]), 12)
        self.assertEqual({row["channel"] for row in summary["monthly"]}, {"Payme"})
        self.assertEqual(summary["currentMonthPayments"], 12)

    def test_resident_collected_total_uses_the_whole_history(self):
        complex_row = build_portal_data(self.user)["complexes"][0]
        self.assertEqual(complex_row["baselineCollected"], float(sum(1000 + i for i in range(12))))

    def test_list_endpoint_returns_the_whole_account_history(self):
        response = self.client.get(
            reverse("portal:api_list_transactions"), {"apartment_id": self.owner.apartment_id, "page_size": 100}
        )
        self.assertEqual(response.json()["total"], 13)
