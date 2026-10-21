"""The activity log keeps only money, balances, billing period work and residents linking Telegram.

Old rows move to their category; sign-ins, admin edits, exports, alerts, reminders, notes and the
rest are deleted, as the log no longer keeps them.
"""
from django.db import migrations, models

PERIOD_STATUS_TITLES = {"Billing period closed", "Billing period recalculated", "Billing period reopened"}


def categorize(apps, schema_editor):
    AuditEvent = apps.get_model("portal", "AuditEvent")
    for event in AuditEvent.objects.filter(event_type__in=["balance", "billing", "status"]):
        metadata = event.metadata or {}
        if event.event_type == "balance":
            if metadata.get("source") == "click":
                event.event_type = "online_payment"
            elif metadata.get("operation") == "credit":
                event.event_type = "operator_payment"
        elif event.event_type == "billing":
            event.event_type = "period_status" if event.title in PERIOD_STATUS_TITLES else "period_edit"
        elif event.title == "Telegram connected":
            event.event_type = "telegram"
        else:
            continue
        event.save(update_fields=["event_type"])
    kept = ["online_payment", "operator_payment", "balance", "period_edit", "period_status", "telegram"]
    AuditEvent.objects.exclude(event_type__in=kept).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0006_operators_full_access"),
    ]

    operations = [
        migrations.RunPython(categorize, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="auditevent",
            name="event_type",
            field=models.CharField(
                choices=[
                    ("online_payment", "Payment: Click / Payme"),
                    ("operator_payment", "Payment: operator"),
                    ("balance", "Balance change"),
                    ("period_edit", "Billing period: edited"),
                    ("period_status", "Billing period: closed / opened"),
                    ("telegram", "Telegram connected"),
                ],
                max_length=24,
                verbose_name="Category",
            ),
        ),
    ]
