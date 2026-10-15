import json
import os
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase


BASE_DIR = Path(__file__).resolve().parent.parent
DEV_SECRET_KEY = "django-insecure-local-hydroflow-prototype"
PROBE = (
    "import json, django; django.setup(); from django.conf import settings as s; "
    "print(json.dumps({'debug': s.DEBUG, 'secret_key': s.SECRET_KEY, "
    "'secure_cookies': s.SESSION_COOKIE_SECURE, 'csrf_cookie_secure': s.CSRF_COOKIE_SECURE, "
    "'cors_origins': s.CORS_ALLOWED_ORIGINS, 'cors_credentials': s.CORS_ALLOW_CREDENTIALS}))"
)


class SettingsSafetyTests(SimpleTestCase):
    """Settings are read once per process, so each case loads them in a fresh interpreter."""

    def run_probe(self, **overrides):
        env = {
            **os.environ,
            "DJANGO_SETTINGS_MODULE": "config.settings",
            # Empty values count as "not set" and keep a developer's .env from leaking in,
            # because load_dotenv never overrides variables that already exist.
            "DEBUG": "",
            "SECRET_KEY": "",
            "SECURE_COOKIES": "",
            "CORS_ALLOWED_ORIGINS": "",
            "CORS_ALLOW_CREDENTIALS": "",
            **overrides,
        }
        return subprocess.run(
            [sys.executable, "-c", PROBE],
            cwd=BASE_DIR,
            env=env,
            capture_output=True,
            text=True,
            timeout=120,
        )

    def load_settings(self, **overrides):
        result = self.run_probe(**overrides)
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout.strip().splitlines()[-1])

    def test_production_refuses_missing_secret_key(self):
        result = self.run_probe()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("SECRET_KEY is missing", result.stderr)

    def test_production_refuses_placeholder_secret_keys(self):
        for placeholder in ["replace-with-a-long-random-secret-key", DEV_SECRET_KEY]:
            with self.subTest(placeholder=placeholder):
                result = self.run_probe(SECRET_KEY=placeholder)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("SECRET_KEY is missing", result.stderr)

    def test_production_defaults_are_secure(self):
        loaded = self.load_settings(SECRET_KEY="x" * 50)
        self.assertFalse(loaded["debug"])
        self.assertTrue(loaded["secure_cookies"])
        self.assertTrue(loaded["csrf_cookie_secure"])
        self.assertEqual(loaded["cors_origins"], [])
        self.assertFalse(loaded["cors_credentials"])

    def test_debug_uses_dev_key_and_plain_http_cookies(self):
        loaded = self.load_settings(DEBUG="True")
        self.assertTrue(loaded["debug"])
        self.assertEqual(loaded["secret_key"], DEV_SECRET_KEY)
        self.assertFalse(loaded["secure_cookies"])

    def test_secure_cookies_can_be_disabled_for_plain_http(self):
        loaded = self.load_settings(SECRET_KEY="x" * 50, SECURE_COOKIES="False")
        self.assertFalse(loaded["secure_cookies"])
        self.assertFalse(loaded["csrf_cookie_secure"])
