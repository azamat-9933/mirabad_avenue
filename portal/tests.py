from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from main_app.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from portal.backend_data import build_portal_data


PORTAL_PAGES = [
    "portal:dashboard",
    "portal:residential",
    "portal:system_health",
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
