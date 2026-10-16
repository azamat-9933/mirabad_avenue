from django.db import migrations

# Legacy values the portal already showed as connected.
CONNECTED_VALUES = {"connected", "active", "verified", "true", "yes", "1", "linked"}


def normalize_telegram_statuses(apps, schema_editor):
    """Fold the old free-form statuses (connected/pending/review/not_linked/empty) into two.

    A resident counts as connected exactly as the portal displayed them: a Telegram id or
    username on file, or a connected-like status. Everyone else is not connected.
    """
    Owner = apps.get_model("main_app", "Owner")
    owners = Owner.objects.only("id", "telegram_id", "telegram_user", "telegram_status")
    for owner in owners.iterator():
        connected = bool(
            str(owner.telegram_status or "").strip().lower() in CONNECTED_VALUES
            or str(owner.telegram_id or "").strip()
            or str(owner.telegram_user or "").strip()
        )
        status = "connected" if connected else "not_linked"
        if owner.telegram_status != status:
            Owner.objects.filter(pk=owner.pk).update(telegram_status=status)


class Migration(migrations.Migration):

    dependencies = [
        ("main_app", "0002_apartment_accounts"),
    ]

    operations = [
        migrations.RunPython(normalize_telegram_statuses, migrations.RunPython.noop),
    ]
