from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0004_checklistnote_supportticket"),
    ]

    operations = [
        migrations.AddField(
            model_name="checklistitem",
            name="done",
            field=models.BooleanField(default=False),
        ),
    ]
