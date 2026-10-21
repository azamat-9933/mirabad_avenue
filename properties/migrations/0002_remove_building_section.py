from django.db import migrations


class Migration(migrations.Migration):
    """The section proxy goes after the billing fields that pointed to it."""

    dependencies = [
        ("properties", "0001_initial"),
        ("billing", "0006_remove_unused_models"),
    ]

    operations = [
        migrations.DeleteModel(
            name="BuildingSection",
        ),
    ]
