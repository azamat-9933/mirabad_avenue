from django.apps import AppConfig


class PortalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'portal'

    def ready(self):
        from . import accounts  # noqa: F401  (new accounts get full rights)
        from . import signals  # noqa: F401  (connects the operator activity log receivers)
