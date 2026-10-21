"""Drop what billing never used: boiler rooms, building sections, the old Payment and RecalculationLog.

Heating is billed per house, payments go through payments.Transaction, and a recalculation is in the
audit log. The constraints that name boiler_room go first: PostgreSQL drops an index together with
a column it uses, and removing it afterwards would fail.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0005_heatingrecord_days_given"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="buildingservice",
            name="uniq_building_service_period_type",
        ),
        migrations.RemoveConstraint(
            model_name="buildingservice",
            name="uniq_boiler_room_service_period_type",
        ),
        migrations.RemoveField(
            model_name="buildingservice",
            name="boiler_room",
        ),
        migrations.AddConstraint(
            model_name="buildingservice",
            constraint=models.UniqueConstraint(
                fields=("period", "building", "service_type"), name="uniq_building_service_period_type"
            ),
        ),
        migrations.RemoveField(
            model_name="expense",
            name="boiler_room",
        ),
        migrations.RemoveField(
            model_name="gasmeterreading",
            name="boiler_room",
        ),
        migrations.RemoveField(
            model_name="expense",
            name="section",
        ),
        migrations.RemoveField(
            model_name="gasmeterreading",
            name="section",
        ),
        migrations.RemoveField(
            model_name="heatingcalculationsummary",
            name="section",
        ),
        migrations.RemoveField(
            model_name="hotwatercalculationsummary",
            name="section",
        ),
        migrations.DeleteModel(
            name="BoilerRoom",
        ),
        migrations.DeleteModel(
            name="Payment",
        ),
        migrations.DeleteModel(
            name="RecalculationLog",
        ),
    ]
