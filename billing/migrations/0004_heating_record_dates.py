from datetime import timedelta

from django.db import migrations, models


def copy_apartment_connection_dates(apps, schema_editor):
    """Heating moves from the apartment to each period: an apartment's connection dates become the
    heating dates of every period they overlap, so existing periods bill the same days."""
    Apartment = apps.get_model("main_app", "Apartment")
    BillingPeriod = apps.get_model("billing", "BillingPeriod")
    HeatingRecord = apps.get_model("billing", "HeatingRecord")

    connected = list(
        Apartment.objects.exclude(heating_connected_on=None).values_list(
            "pk", "building_id", "heating_connected_on", "heating_disconnected_on"
        )
    )
    if not connected:
        return
    for period in BillingPeriod.objects.all():
        building_ids = set(period.buildings.values_list("pk", flat=True))
        building_ids.update(period.expenses.values_list("building_id", flat=True))
        building_ids.update(period.gas_meter_readings.values_list("building_id", flat=True))
        building_ids.update(period.heating_records.values_list("apartment__building_id", flat=True))
        for apartment_id, building_id, connected_on, disconnected_on in connected:
            if building_id not in building_ids:
                continue
            first = max(period.start_date, connected_on)
            last = period.end_date
            if disconnected_on:
                last = min(last, disconnected_on - timedelta(days=1))
            if last < first:
                continue
            HeatingRecord.objects.update_or_create(
                period=period,
                apartment_id=apartment_id,
                defaults={"heated_from": first, "heated_until": last if last < period.end_date else None},
            )


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0003_boiler_rooms"),
        ("main_app", "0005_apartment_heating_connection"),
    ]

    operations = [
        migrations.AddField(
            model_name="heatingrecord",
            name="heated_from",
            field=models.DateField(
                blank=True,
                help_text="Shu kundan boshlab isitish hisoblanadi. Bo'sh — bu davrda isitilmagan.",
                null=True,
                verbose_name="Isitish boshlangan sana",
            ),
        ),
        migrations.AddField(
            model_name="heatingrecord",
            name="heated_until",
            field=models.DateField(
                blank=True,
                help_text="Isitilgan oxirgi kun. Bo'sh — davr oxirigacha.",
                null=True,
                verbose_name="Isitish tugagan sana",
            ),
        ),
        migrations.AlterField(
            model_name="heatingrecord",
            name="excluded_dates",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Masalan: ["2025-12-10", "2025-12-25"]',
                verbose_name="Qizdirilmagan kunlar",
            ),
        ),
        migrations.RunPython(copy_apartment_connection_dates, migrations.RunPython.noop),
    ]
