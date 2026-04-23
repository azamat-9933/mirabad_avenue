from django.db import migrations


DEFAULT_SECTOR_NAME = "Mirabad Avenue"


def force_single_sector(apps, schema_editor):
    Complex = apps.get_model("main_app", "Complex")
    Complex.objects.exclude(address=DEFAULT_SECTOR_NAME).update(address=DEFAULT_SECTOR_NAME)


class Migration(migrations.Migration):

    dependencies = [
        ("main_app", "0002_alter_apartment_area"),
    ]

    operations = [
        migrations.RunPython(force_single_sector, migrations.RunPython.noop),
    ]
