import os
import socket
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

from .jazz_sett import JAZZ_SETTINGS, JAZZ_UI_TWEAKS

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# The project's own .env is the only file source; real environment variables win over it.
load_dotenv(BASE_DIR / ".env", override=False)


def env_bool(name, default=False):
    value = os.getenv(name)
    # An empty value (e.g. "DEBUG=" in .env) means "not set", not False.
    if value is None or not value.strip():
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name, default=None):
    value = os.getenv(name)
    if not value:
        return default or []
    return [item.strip() for item in value.split(",") if item.strip()]


def build_allowed_hosts():
    hosts = set(env_list("ALLOWED_HOSTS", []))
    hosts.update({"localhost", "127.0.0.1", "testserver", "0.0.0.0", "[::1]"})

    try:
        hostname = socket.gethostname()
        if hostname:
            hosts.add(hostname)
        _resolved_host, _aliases, resolved_ips = socket.gethostbyname_ex(hostname)
        hosts.update(ip for ip in resolved_ips if ip)
    except OSError:
        pass

    if DEBUG:
        hosts.add("*")

    return sorted(hosts)


# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# Production is the default: local development opts in with DEBUG=True in .env.
DEBUG = env_bool("DEBUG", False)

DEV_SECRET_KEY = "django-insecure-local-hydroflow-prototype"
# Keys that are public (committed or documented) and must never sign production sessions.
KNOWN_INSECURE_SECRET_KEYS = {"", DEV_SECRET_KEY, "replace-with-a-long-random-secret-key"}

SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
if SECRET_KEY in KNOWN_INSECURE_SECRET_KEYS:
    if not DEBUG:
        raise ImproperlyConfigured(
            "SECRET_KEY is missing or uses a public placeholder. Set a long random SECRET_KEY "
            "in .env (see .env.example), or set DEBUG=True for local development."
        )
    SECRET_KEY = DEV_SECRET_KEY

ALLOWED_HOSTS = build_allowed_hosts()

# HTTPS hardening. Cookies are HTTPS-only outside DEBUG; set SECURE_COOKIES=False only for a plain-HTTP deployment.
SESSION_COOKIE_SECURE = env_bool("SECURE_COOKIES", not DEBUG)
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE
# Full origins (https://host) allowed to send POSTs, needed when TLS ends at a proxy in front of Django.
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", [])
if env_bool("USE_X_FORWARDED_PROTO", False):
    # Only behind a proxy that overwrites X-Forwarded-Proto; otherwise clients could spoof HTTPS.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# Only behind a proxy that appends X-Forwarded-For; the activity log then records the client IP
# instead of the proxy's. Without such a proxy clients could forge it, so it is off by default.
TRUST_X_FORWARDED_FOR = env_bool("TRUST_X_FORWARDED_FOR", False)
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "0") or 0)


# Application definition

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'portal',
    'properties',
    'main_app',
    'billing',
    'payments',
    'telegram_bot',
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
]

MIDDLEWARE = [
    # First, so it compresses the final body; page/API snapshots are large, repetitive JSON.
    # Includes Django's BREACH mitigation; harmless if a proxy also compresses.
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # Every non-DRF view requires a session unless marked with @login_not_required.
    'django.contrib.auth.middleware.LoginRequiredMiddleware',
    # Lets signal handlers attribute admin edits and sign-ins to the request (IP address).
    'portal.audit.AuditRequestMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

if os.getenv("DB_ENGINE"):
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE'),
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Tashkent'

USE_I18N = True

USE_TZ = True

# A billing period page posts every apartment's hot water reading at once (hundreds of rows).
DATA_UPLOAD_MAX_NUMBER_FIELDS = 20000


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'static_collected'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

LOGIN_URL = 'portal:login'
LOGIN_REDIRECT_URL = 'portal:dashboard'
LOGOUT_REDIRECT_URL = 'portal:login'

# The portal is same-origin; CORS is opt-in for a separate frontend only.
CORS_ALLOW_ALL_ORIGINS = env_bool("CORS_ALLOW_ALL_ORIGINS", False)
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", [])
CORS_ALLOW_CREDENTIALS = env_bool("CORS_ALLOW_CREDENTIALS", False)

JAZZMIN_SETTINGS = JAZZ_SETTINGS
JAZZMIN_UI_TWEAKS = JAZZ_UI_TWEAKS

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # DRF views are exempt from LoginRequiredMiddleware, so the API enforces auth itself.
    'DEFAULT_AUTHENTICATION_CLASSES': ['portal.authentication.PortalSessionAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'HydroFlow Billing API',
    'DESCRIPTION': 'Operational data API backed by the Mirabad Avenue billing database.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAuthenticated'],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'displayOperationId': False,
        'defaultModelsExpandDepth': -1,
        'defaultModelExpandDepth': 1,
        'docExpansion': 'none',
        'filter': True,
        'showExtensions': False,
        'showCommonExtensions': False,
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Residents' Telegram bot (python manage.py run_telegram_bot); token from @BotFather.
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '').strip()
# Optional: the bot's @username for operators' t.me links; asked from Telegram (getMe) when empty.
TELEGRAM_BOT_USERNAME = os.getenv('TELEGRAM_BOT_USERNAME', '').strip()

# Payment (debt) notice: the company and the director signing it (portal/billing_notice.py).
BILLING_NOTICE_COMPANY = os.getenv('BILLING_NOTICE_COMPANY', 'MIRABAD AVENUE SERVICE MCHJ').strip()
BILLING_NOTICE_DIRECTOR = os.getenv('BILLING_NOTICE_DIRECTOR', "ERGASHEV DILSHOD TURAVOY O'G'LI").strip()
