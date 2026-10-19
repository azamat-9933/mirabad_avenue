from django.db import migrations


class Migration(migrations.Migration):
    """Heating dates are entered per billing period (billing.HeatingRecord), not on the apartment."""

    dependencies = [
        ("main_app", "0005_apartment_heating_connection"),
        # Copies the dates into each period's heating records before they are removed here.
        ("billing", "0004_heating_record_dates"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="apartment",
            name="heating_connected_on",
        ),
        migrations.RemoveField(
            model_name="apartment",
            name="heating_disconnected_on",
        ),
    ]
