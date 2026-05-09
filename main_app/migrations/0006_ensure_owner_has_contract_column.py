from django.db import migrations


def ensure_owner_has_contract_column(apps, schema_editor):
    connection = schema_editor.connection
    table_name = "main_app_owner"
    column_name = "has_contract"
    quote_name = connection.ops.quote_name

    with connection.cursor() as cursor:
        columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table_name)
        }
        if column_name in columns:
            return

        if connection.vendor == "postgresql":
            cursor.execute(
                f"ALTER TABLE {quote_name(table_name)} "
                f"ADD COLUMN {quote_name(column_name)} boolean NOT NULL DEFAULT false"
            )
            return

        if connection.vendor == "sqlite":
            cursor.execute(
                f"ALTER TABLE {quote_name(table_name)} "
                f"ADD COLUMN {quote_name(column_name)} bool NOT NULL DEFAULT 0"
            )
            return

        cursor.execute(
            f"ALTER TABLE {quote_name(table_name)} "
            f"ADD COLUMN {quote_name(column_name)} boolean NOT NULL DEFAULT 0"
        )


class Migration(migrations.Migration):
    dependencies = [
        ("main_app", "0005_consolidate_single_sector"),
    ]

    operations = [
        migrations.RunPython(ensure_owner_has_contract_column, migrations.RunPython.noop),
    ]
