from django.db import migrations


class Migration(migrations.Migration):
    """Building sections only grouped apartments for boiler rooms; billing is per house."""

    dependencies = [
        ("main_app", "0008_apartment_personal_account"),
        ("billing", "0006_remove_unused_models"),
        ("properties", "0002_remove_building_section"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="apartment",
            name="section",
        ),
        migrations.DeleteModel(
            name="BuildingSection",
        ),
    ]
