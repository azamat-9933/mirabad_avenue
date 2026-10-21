from django.conf import settings
from django.db import migrations


def give_operators_full_rights(apps, schema_editor):
    """Only operators use the platform: every active account becomes staff and superuser."""
    app_label, model_name = settings.AUTH_USER_MODEL.split(".")
    User = apps.get_model(app_label, model_name)
    User.objects.filter(is_active=True).update(is_staff=True, is_superuser=True)


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0005_operator_alerts"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Going back leaves the rights as they are: there is no record of who had less.
        migrations.RunPython(give_operators_full_rights, migrations.RunPython.noop),
    ]
