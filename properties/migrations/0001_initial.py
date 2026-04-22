from django.db import migrations


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("main_app", "0002_alter_apartment_area"),
    ]

    operations = [
        migrations.CreateModel(
            name="Complex",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
                "verbose_name": "Turar joy majmuasi",
                "verbose_name_plural": "Turar joy majmualari",
            },
            bases=("main_app.complex",),
        ),
        migrations.CreateModel(
            name="Building",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
                "verbose_name": "Uy",
                "verbose_name_plural": "Uylar",
            },
            bases=("main_app.building",),
        ),
        migrations.CreateModel(
            name="BuildingSection",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
                "verbose_name": "Seksiya",
                "verbose_name_plural": "Seksiyalar",
            },
            bases=("main_app.buildingsection",),
        ),
        migrations.CreateModel(
            name="Apartment",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
                "verbose_name": "Kvartira",
                "verbose_name_plural": "Kvartiralar",
            },
            bases=("main_app.apartment",),
        ),
        migrations.CreateModel(
            name="Owner",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
                "verbose_name": "Ega",
                "verbose_name_plural": "Egalar",
            },
            bases=("main_app.owner",),
        ),
    ]
