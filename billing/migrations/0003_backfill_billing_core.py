from decimal import Decimal

from django.db import migrations
from django.db.models import Sum


def forwards(apps, schema_editor):
    BillingPeriod = apps.get_model("billing", "BillingPeriod")
    BuildingService = apps.get_model("billing", "BuildingService")
    ServiceExpense = apps.get_model("billing", "ServiceExpense")
    HeatingRecord = apps.get_model("billing", "HeatingRecord")
    HotWaterMeterReading = apps.get_model("billing", "HotWaterMeterReading")
    GasMeterReading = apps.get_model("billing", "GasMeterReading")
    Expense = apps.get_model("billing", "Expense")
    Invoice = apps.get_model("billing", "Invoice")
    HeatingApartmentUsage = apps.get_model("billing", "HeatingApartmentUsage")
    HotWaterReading = apps.get_model("billing", "HotWaterReading")
    Charge = apps.get_model("billing", "Charge")

    SERVICE_HEATING = "heating"
    SERVICE_HOT_WATER = "hot_water"
    STATUS_DRAFT = "draft"

    BillingPeriod.objects.filter(status="open").update(status=STATUS_DRAFT)

    service_map = {}

    def ensure_service(period_id, building_id, service_type):
        key = (period_id, building_id, service_type)
        service = service_map.get(key)
        if service is None:
            service, _created = BuildingService.objects.get_or_create(
                period_id=period_id,
                building_id=building_id,
                service_type=service_type,
            )
            service_map[key] = service
        return service

    for expense in Expense.objects.select_related("building", "period").iterator():
        ensure_service(expense.period_id, expense.building_id, expense.service_type)

    for reading in GasMeterReading.objects.select_related("building", "period").iterator():
        ensure_service(reading.period_id, reading.building_id, reading.service_type)

    for record in HeatingRecord.objects.select_related("apartment__building", "period").iterator():
        ensure_service(record.period_id, record.apartment.building_id, SERVICE_HEATING)

    for reading in HotWaterMeterReading.objects.select_related("apartment__building", "period").iterator():
        ensure_service(reading.period_id, reading.apartment.building_id, SERVICE_HOT_WATER)

    for invoice in Invoice.objects.select_related("apartment__building", "period").iterator():
        if invoice.heating_amount:
            ensure_service(invoice.period_id, invoice.apartment.building_id, SERVICE_HEATING)
        if invoice.hot_water_amount:
            ensure_service(invoice.period_id, invoice.apartment.building_id, SERVICE_HOT_WATER)

    existing_expense_keys = set(
        ServiceExpense.objects.values_list("service_id", "title", "amount")
    )
    for expense in Expense.objects.select_related("section").iterator():
        service = ensure_service(expense.period_id, expense.building_id, expense.service_type)
        title = expense.name
        if expense.section_id:
            title = f"{title} [{expense.section.name}]"
        key = (service.id, title, expense.amount)
        if key not in existing_expense_keys:
            ServiceExpense.objects.create(service_id=service.id, title=title, amount=expense.amount)
            existing_expense_keys.add(key)

    gas_groups = {}
    for reading in GasMeterReading.objects.select_related("section").iterator():
        service = ensure_service(reading.period_id, reading.building_id, reading.service_type)
        gas_groups.setdefault(service.id, []).append(reading)

    for service_id, readings in gas_groups.items():
        service = BuildingService.objects.get(pk=service_id)
        if len(readings) == 1 and readings[0].section_id is None:
            reading = readings[0]
            service.gas_start = reading.start_reading
            service.gas_end = reading.end_reading
            service.gas_price = reading.price_per_m3
            service.save(update_fields=["gas_start", "gas_end", "gas_price", "updated_at"])
            continue

        for reading in readings:
            amount = max(Decimal("0"), (reading.end_reading or Decimal("0")) - (reading.start_reading or Decimal("0"))) * (
                reading.price_per_m3 or Decimal("0")
            )
            if amount <= 0:
                continue
            title = "Migrated gas expense"
            if reading.section_id:
                title = f"{title} [{reading.section.name}]"
            key = (service_id, title, amount)
            if key not in existing_expense_keys:
                ServiceExpense.objects.create(service_id=service_id, title=title, amount=amount)
                existing_expense_keys.add(key)

    usage_keys = set(HeatingApartmentUsage.objects.values_list("service_id", "apartment_id"))
    for record in HeatingRecord.objects.select_related("apartment__building", "period").iterator():
        service = ensure_service(record.period_id, record.apartment.building_id, SERVICE_HEATING)
        key = (service.id, record.apartment_id)
        if key in usage_keys:
            continue
        period_days = service.period.days_count() if hasattr(service.period, "days_count") else ((service.period.end_date - service.period.start_date).days + 1)
        days = max(0, period_days - len(record.excluded_dates or []))
        HeatingApartmentUsage.objects.create(
            service_id=service.id,
            apartment_id=record.apartment_id,
            days_provided=days,
        )
        usage_keys.add(key)

    hot_water_keys = set(HotWaterReading.objects.values_list("service_id", "apartment_id"))
    for legacy_reading in HotWaterMeterReading.objects.select_related("apartment__building", "period").iterator():
        service = ensure_service(legacy_reading.period_id, legacy_reading.apartment.building_id, SERVICE_HOT_WATER)
        key = (service.id, legacy_reading.apartment_id)
        if key in hot_water_keys:
            continue
        start_value = legacy_reading.start_reading or Decimal("0")
        end_value = legacy_reading.end_reading or start_value
        if end_value < start_value:
            end_value = start_value
        HotWaterReading.objects.create(
            service_id=service.id,
            apartment_id=legacy_reading.apartment_id,
            start_value=start_value,
            end_value=end_value,
        )
        hot_water_keys.add(key)

    existing_charge_keys = set(
        Charge.objects.values_list("period_id", "service_id", "apartment_id", "charge_type", "amount", "volume")
    )
    for invoice in Invoice.objects.select_related("apartment__building", "apartment__owner", "period").iterator():
        owner = getattr(invoice.apartment, "owner", None)
        if owner is None:
            continue
        if invoice.heating_amount:
            service = ensure_service(invoice.period_id, invoice.apartment.building_id, SERVICE_HEATING)
            key = (
                invoice.period_id,
                service.id,
                invoice.apartment_id,
                SERVICE_HEATING,
                invoice.heating_amount,
                invoice.heated_area or Decimal("0"),
            )
            if key not in existing_charge_keys:
                Charge.objects.create(
                    period_id=invoice.period_id,
                    service_id=service.id,
                    owner_id=owner.id,
                    apartment_id=invoice.apartment_id,
                    charge_type=SERVICE_HEATING,
                    amount=invoice.heating_amount,
                    tariff=invoice.heating_cost_per_sqm or Decimal("0"),
                    volume=invoice.heated_area or Decimal("0"),
                )
                existing_charge_keys.add(key)
        if invoice.hot_water_amount:
            service = ensure_service(invoice.period_id, invoice.apartment.building_id, SERVICE_HOT_WATER)
            key = (
                invoice.period_id,
                service.id,
                invoice.apartment_id,
                SERVICE_HOT_WATER,
                invoice.hot_water_amount,
                invoice.hot_water_consumption or Decimal("0"),
            )
            if key not in existing_charge_keys:
                Charge.objects.create(
                    period_id=invoice.period_id,
                    service_id=service.id,
                    owner_id=owner.id,
                    apartment_id=invoice.apartment_id,
                    charge_type=SERVICE_HOT_WATER,
                    amount=invoice.hot_water_amount,
                    tariff=invoice.hot_water_tariff or Decimal("0"),
                    volume=invoice.hot_water_consumption or Decimal("0"),
                )
                existing_charge_keys.add(key)

    for service in BuildingService.objects.all():
        if service.service_type == SERVICE_HEATING:
            total_volume = (
                HeatingApartmentUsage.objects.filter(service_id=service.id).aggregate(total=Sum("heated_area"))["total"]
                or Decimal("0")
            )
        else:
            total_volume = (
                HotWaterReading.objects.filter(service_id=service.id).aggregate(total=Sum("consumption"))["total"]
                or Decimal("0")
            )
        total_expense = (
            ServiceExpense.objects.filter(service_id=service.id).aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )
        if service.gas_start is not None and service.gas_end is not None and service.gas_price is not None:
            total_expense += max(Decimal("0"), service.gas_end - service.gas_start) * service.gas_price
        tariff = Decimal("0")
        if total_volume > 0:
            tariff = total_expense / total_volume
        BuildingService.objects.filter(pk=service.id).update(
            total_expense=total_expense,
            total_volume=total_volume,
            tariff=tariff,
            is_calculated=bool(total_volume > 0),
            calculated_at=service.calculated_at or service.created_at,
        )


def backwards(apps, schema_editor):
    BuildingService = apps.get_model("billing", "BuildingService")
    ServiceExpense = apps.get_model("billing", "ServiceExpense")
    HeatingApartmentUsage = apps.get_model("billing", "HeatingApartmentUsage")
    HotWaterReading = apps.get_model("billing", "HotWaterReading")
    Charge = apps.get_model("billing", "Charge")

    Charge.objects.all().delete()
    HotWaterReading.objects.all().delete()
    HeatingApartmentUsage.objects.all().delete()
    ServiceExpense.objects.all().delete()
    BuildingService.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0002_alter_billingperiod_buildings_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
