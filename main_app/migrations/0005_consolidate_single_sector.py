from django.db import migrations


DEFAULT_SECTOR_NAME = "Mirabad Avenue"


def consolidate_single_sector(apps, schema_editor):
    Complex = apps.get_model("main_app", "Complex")
    Building = apps.get_model("main_app", "Building")
    PortalNotification = apps.get_model("portal", "PortalNotification")
    SystemAlert = apps.get_model("portal", "SystemAlert")
    MaintenanceTask = apps.get_model("portal", "MaintenanceTask")
    AuditEvent = apps.get_model("portal", "AuditEvent")
    SupportTicket = apps.get_model("portal", "SupportTicket")
    TelemetryNode = apps.get_model("portal", "TelemetryNode")

    sector = Complex.objects.order_by("pk").first()
    if sector is None:
        sector = Complex.objects.create(
            title=DEFAULT_SECTOR_NAME,
            address=DEFAULT_SECTOR_NAME,
            author="System",
        )

    if sector.address != DEFAULT_SECTOR_NAME:
        sector.address = DEFAULT_SECTOR_NAME
        sector.save(update_fields=["address"])

    duplicate_ids = list(
        Complex.objects.exclude(pk=sector.pk).values_list("pk", flat=True)
    )
    if not duplicate_ids:
        return

    Building.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)
    PortalNotification.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)
    SystemAlert.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)
    MaintenanceTask.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)
    AuditEvent.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)
    SupportTicket.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)
    TelemetryNode.objects.filter(complex_id__in=duplicate_ids).update(complex_id=sector.pk)

    Complex.objects.filter(pk__in=duplicate_ids).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0004_checklistnote_supportticket"),
        ("main_app", "0004_alter_apartment_options_alter_building_options_and_more"),
    ]

    operations = [
        migrations.RunPython(consolidate_single_sector, migrations.RunPython.noop),
    ]
