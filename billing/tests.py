from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from billing.models import (
    BillingPeriod,
    BuildingService,
    Charge,
    HeatingApartmentUsage,
    HotWaterReading,
    Payment,
    RecalculationLog,
    ServiceExpense,
)
from properties.models import Apartment, Building, Complex, Owner


class BillingCoreModelTests(TestCase):
    def setUp(self):
        self.complex = Complex.objects.create(
            title="Skyline Residential North",
            address="North Sector",
            author="test",
        )
        self.building = Building.objects.create(
            number="A",
            address="North Sector",
            complex=self.complex,
            author="test",
        )
        self.apartment_1 = Apartment.objects.create(
            number="101",
            area=Decimal("80.00"),
            building=self.building,
            author="test",
        )
        self.apartment_2 = Apartment.objects.create(
            number="102",
            area=Decimal("45.50"),
            building=self.building,
            author="test",
        )
        self.owner_1 = Owner.objects.create(
            fio="Sarah Jenkins",
            phone="+998901234567",
            apartment=self.apartment_1,
            balance=Decimal("0.00"),
        )
        self.owner_2 = Owner.objects.create(
            fio="Marcus Aurelius",
            phone="+998901234568",
            apartment=self.apartment_2,
            balance=Decimal("150000.00"),
        )
        self.period = BillingPeriod.objects.create(
            name="April 2026",
            start_date=date(2026, 4, 1),
            end_date=date(2026, 4, 30),
        )
        self.period.buildings.add(self.building)

    def test_period_rejects_invalid_dates(self):
        invalid_period = BillingPeriod(
            name="Broken",
            start_date=date(2026, 4, 30),
            end_date=date(2026, 4, 1),
        )
        with self.assertRaises(ValidationError):
            invalid_period.full_clean()

    def test_days_count_is_inclusive(self):
        self.assertEqual(self.period.days_count(), 30)
        self.assertEqual(self.period.total_days, 30)

    def test_building_service_unique_constraint(self):
        BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")

    def test_gas_consumption_and_expense(self):
        service = BuildingService.objects.create(
            period=self.period,
            building=self.building,
            service_type="heating",
            gas_start=Decimal("100.0000"),
            gas_end=Decimal("130.5000"),
            gas_price=Decimal("1200.0000"),
        )
        self.assertEqual(service.gas_consumption(), Decimal("30.5000"))
        self.assertEqual(service.gas_expense(), Decimal("36600.00"))

    def test_heating_usage_defaults_and_validates(self):
        heating_service = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        usage = HeatingApartmentUsage.objects.create(service=heating_service, apartment=self.apartment_1)
        usage.refresh_from_db()
        self.assertEqual(usage.days_provided, 30)
        self.assertEqual(usage.heated_area, Decimal("2400.0000"))

        bad_service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        usage = HeatingApartmentUsage(service=bad_service, apartment=self.apartment_1, days_provided=1)
        with self.assertRaises(ValidationError):
            usage.full_clean()

        usage = HeatingApartmentUsage(service=heating_service, apartment=self.apartment_1, days_provided=-1)
        with self.assertRaises(ValidationError):
            usage.full_clean()

        usage = HeatingApartmentUsage(service=heating_service, apartment=self.apartment_1, days_provided=31)
        with self.assertRaises(ValidationError):
            usage.full_clean()

    def test_hot_water_reading_validates_and_calculates(self):
        hot_service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        reading = HotWaterReading.objects.create(
            service=hot_service,
            apartment=self.apartment_1,
            start_value=Decimal("10.0000"),
            end_value=Decimal("16.2500"),
        )
        self.assertEqual(reading.consumption, Decimal("6.2500"))

        bad_service = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        bad_reading = HotWaterReading(service=bad_service, apartment=self.apartment_1, start_value=1, end_value=2)
        with self.assertRaises(ValidationError):
            bad_reading.full_clean()

        bad_reading = HotWaterReading(service=hot_service, apartment=self.apartment_2, start_value=5, end_value=4)
        with self.assertRaises(ValidationError):
            bad_reading.full_clean()

    def test_service_calculates_total_volume_and_tariff_for_heating(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        ServiceExpense.objects.create(service=service, title="Boiler", amount=Decimal("9000.00"))
        HeatingApartmentUsage.objects.create(service=service, apartment=self.apartment_1, days_provided=30)
        HeatingApartmentUsage.objects.create(service=service, apartment=self.apartment_2, days_provided=15)

        service.calculate()
        self.assertEqual(service.total_volume, Decimal("3082.5000"))
        self.assertEqual(service.total_expense, Decimal("9000.00"))
        self.assertEqual(service.tariff, Decimal("2.9197"))

    def test_service_calculates_total_volume_and_tariff_for_hot_water(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        ServiceExpense.objects.create(service=service, title="Pump", amount=Decimal("500.00"))
        HotWaterReading.objects.create(service=service, apartment=self.apartment_1, start_value=10, end_value=15)
        HotWaterReading.objects.create(service=service, apartment=self.apartment_2, start_value=5, end_value=7.5)

        service.calculate()
        self.assertEqual(service.total_volume, Decimal("7.5000"))
        self.assertEqual(service.tariff, Decimal("66.6667"))

    def test_tariff_calculation_fails_on_zero_volume(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        ServiceExpense.objects.create(service=service, title="Pump", amount=Decimal("500.00"))
        with self.assertRaises(ValidationError):
            service.calculate()

    def test_close_period_creates_charges_and_updates_balances(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        ServiceExpense.objects.create(service=service, title="Boiler", amount=Decimal("4900.00"))
        HeatingApartmentUsage.objects.create(service=service, apartment=self.apartment_1, days_provided=10)
        HeatingApartmentUsage.objects.create(service=service, apartment=self.apartment_2, days_provided=10)

        self.period.close_period()
        self.period.refresh_from_db()
        self.owner_1.refresh_from_db()
        self.owner_2.refresh_from_db()

        self.assertEqual(self.period.status, BillingPeriod.STATUS_CLOSED)
        self.assertEqual(Charge.objects.filter(period=self.period, is_cancelled=False).count(), 2)
        self.assertEqual(self.owner_1.balance, Decimal("-3123.52"))
        self.assertEqual(self.owner_2.balance, Decimal("148223.50"))

    def test_reopen_period_only_from_closed(self):
        with self.assertRaises(ValidationError):
            self.period.reopen_period()
        self.period.status = BillingPeriod.STATUS_CLOSED
        self.period.save(update_fields=["status"])
        self.period.reopen_period()
        self.period.refresh_from_db()
        self.assertEqual(self.period.status, BillingPeriod.STATUS_REOPENED)

    def test_recalculate_cancels_old_charges_and_applies_delta(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        ServiceExpense.objects.create(service=service, title="Pump", amount=Decimal("750.00"))
        HotWaterReading.objects.create(service=service, apartment=self.apartment_1, start_value=0, end_value=5)
        HotWaterReading.objects.create(service=service, apartment=self.apartment_2, start_value=0, end_value=5)
        self.period.close_period()
        original_balances = {
            self.owner_1.pk: Owner.objects.get(pk=self.owner_1.pk).balance,
            self.owner_2.pk: Owner.objects.get(pk=self.owner_2.pk).balance,
        }

        ServiceExpense.objects.filter(service=service).update(amount=Decimal("500.00"))
        self.period.reopen_period()
        user = get_user_model().objects.create_user(username="billing-admin", password="testpass")
        self.period.recalculate(reason="Adjusted source expense", author=user)

        active = Charge.objects.filter(period=self.period, is_cancelled=False)
        cancelled = Charge.objects.filter(period=self.period, is_cancelled=True)
        self.assertEqual(active.count(), 2)
        self.assertEqual(cancelled.count(), 2)
        self.assertTrue(RecalculationLog.objects.filter(period=self.period).exists())

        self.owner_1.refresh_from_db()
        self.owner_2.refresh_from_db()
        self.assertEqual(self.owner_1.balance, original_balances[self.owner_1.pk] + Decimal("125.00"))
        self.assertEqual(self.owner_2.balance, original_balances[self.owner_2.pk] + Decimal("125.00"))

    def test_payment_apply_updates_balance_and_cannot_apply_twice(self):
        payment = Payment.objects.create(owner=self.owner_1, amount=Decimal("250.00"), method=Payment.METHOD_MANUAL)
        payment.apply()
        self.owner_1.refresh_from_db()
        self.assertEqual(self.owner_1.balance, Decimal("250.00"))
        self.assertTrue(payment.is_applied)
        self.assertIsNotNone(payment.applied_at)
        with self.assertRaises(ValidationError):
            payment.apply()

    def test_payment_requires_positive_amount(self):
        payment = Payment(owner=self.owner_1, amount=Decimal("0.00"))
        with self.assertRaises(ValidationError):
            payment.full_clean()

    def test_legacy_imports_and_portal_imports_resolve(self):
        from billing.models import HotWaterMeterReading, Invoice  # noqa: F401
        from payments.models import Transaction  # noqa: F401
        from portal.backend_data import build_portal_data  # noqa: F401
        self.assertTrue(True)
