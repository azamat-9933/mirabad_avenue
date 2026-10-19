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
    Expense,
    GasMeterReading,
    HeatingApartmentUsage,
    HeatingRecord,
    HotWaterMeterReading,
    HotWaterReading,
    Invoice,
    Payment,
    RecalculationLog,
    ServiceExpense,
    money,
)
from payments.models import Transaction
from portal.models import AuditEvent
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
            balance=Decimal("150000.00"),
        )
        self.owner_1 = Owner.objects.create(
            fio="Sarah Jenkins",
            phone="+998901234567",
            apartment=self.apartment_1,
        )
        self.owner_2 = Owner.objects.create(
            fio="Marcus Aurelius",
            phone="+998901234568",
            apartment=self.apartment_2,
        )
        self.period = BillingPeriod.objects.create(
            name="April 2026",
            start_date=date(2026, 4, 1),
            end_date=date(2026, 4, 30),
        )
        self.period.buildings.add(self.building)

    def heat_whole_period(self):
        for apartment in (self.apartment_1, self.apartment_2):
            HeatingRecord.objects.create(period=self.period, apartment=apartment, heated_from=self.period.start_date)

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

    def test_sync_default_records_creates_period_rows_for_selected_buildings(self):
        self.assertEqual(HeatingRecord.objects.filter(period=self.period).count(), 0)
        self.assertEqual(HotWaterMeterReading.objects.filter(period=self.period).count(), 0)

        created = self.period.sync_default_records()

        self.assertEqual(created["heating_created"], 2)
        self.assertEqual(created["hot_water_created"], 2)
        self.assertEqual(HeatingRecord.objects.filter(period=self.period).count(), 2)
        self.assertEqual(HotWaterMeterReading.objects.filter(period=self.period).count(), 2)
        # Like a new month's Excel sheet: every apartment is heated for the whole period until changed.
        rows = HeatingRecord.objects.filter(period=self.period)
        self.assertEqual({(row.heated_from, row.heated_until, row.days_given) for row in rows}, {(date(2026, 4, 1), None, None)})
        self.assertEqual({row.heated_days for row in rows}, {30})

        # Sync is idempotent and doesn't duplicate rows.
        created_again = self.period.sync_default_records()
        self.assertEqual(created_again["heating_created"], 0)
        self.assertEqual(created_again["hot_water_created"], 0)

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
        self.assertEqual(self.owner_1.balance, Decimal("-3123.51"))
        self.assertEqual(self.owner_2.balance, Decimal("148223.51"))
        self.assertEqual(Invoice.objects.filter(period=self.period).count(), 2)

    def test_close_period_bootstraps_core_rows_from_legacy_records(self):
        Expense.objects.create(
            period=self.period,
            building=self.building,
            service_type="heating",
            name="Legacy heating expense",
            amount=Decimal("4900.00"),
        )
        self.heat_whole_period()

        self.period.close_period()

        self.assertEqual(BuildingService.objects.filter(period=self.period, building=self.building).count(), 1)
        self.assertEqual(HeatingApartmentUsage.objects.filter(service__period=self.period).count(), 2)
        self.assertEqual(Charge.objects.filter(period=self.period, is_cancelled=False).count(), 2)
        self.assertEqual(Invoice.objects.filter(period=self.period).count(), 2)

    def test_gas_meter_cost_counts_in_total_and_charges(self):
        Expense.objects.create(
            period=self.period, building=self.building, service_type="heating", name="Boiler", amount=Decimal("4900.00"),
        )
        GasMeterReading.objects.create(
            period=self.period, building=self.building, service_type="heating",
            start_reading=Decimal("100.00"), end_reading=Decimal("110.00"), price_per_m3=Decimal("1000.00"),
        )
        self.heat_whole_period()

        self.assertEqual(self.period.total_expenses(), Decimal("14900.00"))
        self.period.close_period()

        service = BuildingService.objects.get(period=self.period, building=self.building, service_type="heating")
        self.assertEqual(service.calculate_total_expense(), Decimal("14900.00"))
        self.assertTrue(service.expense_items.filter(title__startswith="Gaz: 10 m³", amount=Decimal("10000.00")).exists())
        charged = sum(Charge.objects.filter(period=self.period, is_cancelled=False).values_list("amount", flat=True))
        # Within the tariff rounding (4 places per m²·day); without the gas it would be 4 900.
        self.assertAlmostEqual(charged, Decimal("14900.00"), delta=Decimal("1.00"))

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
        self.assertTrue(Invoice.objects.filter(period=self.period, is_recalculated=True).exists())

        self.owner_1.refresh_from_db()
        self.owner_2.refresh_from_db()
        self.assertEqual(self.owner_1.balance, original_balances[self.owner_1.pk] + Decimal("125.00"))
        self.assertEqual(self.owner_2.balance, original_balances[self.owner_2.pk] + Decimal("125.00"))

    def test_close_or_recalculate_closes_a_reopened_period_again(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        ServiceExpense.objects.create(service=service, title="Pump", amount=Decimal("750.00"))
        HotWaterReading.objects.create(service=service, apartment=self.apartment_1, start_value=0, end_value=5)
        HotWaterReading.objects.create(service=service, apartment=self.apartment_2, start_value=0, end_value=5)
        self.period.close_or_recalculate()
        balance_after_close = Owner.objects.get(pk=self.owner_1.pk).balance

        self.period.reopen_period()
        # close_period() alone refuses a reopened period: its charges are already posted.
        with self.assertRaises(ValidationError):
            self.period.close_period()
        ServiceExpense.objects.filter(service=service).update(amount=Decimal("500.00"))
        self.period.close_or_recalculate(reason="Pump invoice corrected")

        self.period.refresh_from_db()
        self.assertEqual(self.period.status, BillingPeriod.STATUS_CLOSED)
        self.assertEqual(RecalculationLog.objects.get(period=self.period).reason, "Pump invoice corrected")
        self.assertEqual(Owner.objects.get(pk=self.owner_1.pk).balance, balance_after_close + Decimal("125.00"))

    def test_heating_record_validates_excluded_dates(self):
        record = HeatingRecord(
            period=self.period, apartment=self.apartment_1, heated_from=date(2026, 4, 1), excluded_dates=["2026-05-01"]
        )
        with self.assertRaises(ValidationError):
            record.full_clean()
        record.excluded_dates = ["2026-02-30"]
        with self.assertRaises(ValidationError):
            record.full_clean()
        record.excluded_dates = ["2026-04-03", "2026-04-02", "2026-04-03"]
        record.full_clean()
        self.assertEqual(record.excluded_dates, ["2026-04-02", "2026-04-03"])
        self.assertEqual(record.heated_days, 28)

    def test_heating_record_validates_its_dates(self):
        record = HeatingRecord(period=self.period, apartment=self.apartment_1, heated_from=date(2026, 3, 31))
        with self.assertRaises(ValidationError) as caught:
            record.full_clean()
        self.assertIn("heated_from", caught.exception.message_dict)

        record.heated_from, record.heated_until = date(2026, 4, 10), date(2026, 4, 9)
        with self.assertRaises(ValidationError) as caught:
            record.full_clean()
        self.assertIn("heated_until", caught.exception.message_dict)

        record.heated_from = None
        with self.assertRaises(ValidationError) as caught:
            record.full_clean()
        self.assertIn("heated_from", caught.exception.message_dict)

        record.heated_from, record.heated_until = date(2026, 4, 10), date(2026, 4, 19)
        record.full_clean()
        self.assertEqual(record.heated_days, 10)

    def test_days_given_count_instead_of_the_whole_range(self):
        # 30 days in April, heating given for 28 of them.
        record = HeatingRecord(period=self.period, apartment=self.apartment_1, heated_from=date(2026, 4, 1), days_given=28)
        record.full_clean()
        self.assertEqual((record.range_days_in(self.period), record.heated_days), (30, 28))

        record.heated_from = date(2026, 4, 11)  # 20 days left: more days than that cannot be given
        with self.assertRaises(ValidationError) as caught:
            record.full_clean()
        self.assertIn("days_given", caught.exception.message_dict)

        record.heated_from, record.days_given = None, 5
        with self.assertRaises(ValidationError) as caught:
            record.full_clean()
        self.assertIn("heated_from", caught.exception.message_dict)

    def test_payment_apply_updates_balance_and_cannot_apply_twice(self):
        payment = Payment.objects.create(owner=self.owner_1, amount=Decimal("250.00"), method=Payment.METHOD_MANUAL)
        payment.apply()
        self.owner_1.refresh_from_db()
        self.assertEqual(self.owner_1.balance, Decimal("250.00"))
        self.assertTrue(payment.is_applied)
        self.assertIsNotNone(payment.applied_at)
        with self.assertRaises(ValidationError):
            payment.apply()

    def _assert_ledger_matches_balance(self, owner, opening_balance):
        owner.refresh_from_db()
        rows = list(Transaction.objects.filter(owner=owner).order_by("created_at", "id"))
        self.assertEqual(opening_balance + sum(row.amount for row in rows), owner.balance)
        expected_before = opening_balance
        for row in rows:
            self.assertEqual(row.balance_before, expected_before)
            self.assertEqual(row.balance_after, row.balance_before + row.amount)
            expected_before = row.balance_after
        return rows

    def test_close_period_records_charge_transactions_linked_to_invoices(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        ServiceExpense.objects.create(service=service, title="Boiler", amount=Decimal("4900.00"))
        HeatingApartmentUsage.objects.create(service=service, apartment=self.apartment_1, days_provided=10)
        HeatingApartmentUsage.objects.create(service=service, apartment=self.apartment_2, days_provided=10)

        self.period.close_period()

        rows_1 = self._assert_ledger_matches_balance(self.owner_1, Decimal("0.00"))
        rows_2 = self._assert_ledger_matches_balance(self.owner_2, Decimal("150000.00"))
        self.assertEqual([row.amount for row in rows_1], [Decimal("-3123.51")])
        self.assertEqual([row.amount for row in rows_2], [Decimal("-1776.49")])
        for row, apartment in [(rows_1[0], self.apartment_1), (rows_2[0], self.apartment_2)]:
            self.assertEqual(row.payment_type, Transaction.TYPE_CHARGE)
            self.assertEqual(row.invoice, Invoice.objects.get(period=self.period, apartment=apartment))

    def test_failed_close_period_leaves_no_ledger_rows(self):
        heating = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        ServiceExpense.objects.create(service=heating, title="Boiler", amount=Decimal("4900.00"))
        for apartment in [self.apartment_1, self.apartment_2]:
            HeatingApartmentUsage.objects.create(service=heating, apartment=apartment, days_provided=10)
        # Hot water without any reading has zero volume, so its tariff cannot be computed.
        hot_water = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        ServiceExpense.objects.create(service=hot_water, title="Pump", amount=Decimal("750.00"))

        with self.assertRaises(ValidationError):
            self.period.close_period()

        self.assertFalse(Transaction.objects.exists())
        self.assertFalse(Charge.objects.exists())
        self.owner_2.refresh_from_db()
        self.assertEqual(self.owner_2.balance, Decimal("150000.00"))

    def _assert_account_ledger(self, apartment, opening_balance):
        apartment.refresh_from_db()
        rows = list(Transaction.objects.filter(apartment=apartment).order_by("created_at", "id"))
        self.assertEqual(opening_balance + sum(row.amount for row in rows), apartment.balance)
        expected_before = opening_balance
        for row in rows:
            self.assertEqual(row.balance_before, expected_before)
            self.assertEqual(row.balance_after, row.balance_before + row.amount)
            expected_before = row.balance_after
        return rows

    def _heating_with_vacant_apartment(self):
        vacant = Apartment.objects.create(number="103", area=Decimal("30.00"), building=self.building, author="test")
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="heating")
        ServiceExpense.objects.create(service=service, title="Boiler", amount=Decimal("4900.00"))
        for apartment in [self.apartment_1, self.apartment_2, vacant]:
            HeatingApartmentUsage.objects.create(service=service, apartment=apartment, days_provided=10)
        return vacant, service

    def test_close_period_bills_vacant_apartment_to_its_account(self):
        vacant, service = self._heating_with_vacant_apartment()

        self.period.close_period()

        service.refresh_from_db()
        # The vacant apartment stays in the volume, so occupied apartments pay only their own share.
        self.assertEqual(service.total_volume, Decimal("80.00") * 10 + Decimal("45.50") * 10 + Decimal("30.00") * 10)
        charge = Charge.objects.get(apartment=vacant)
        self.assertIsNone(charge.owner)
        self.assertEqual(charge.amount, money(Decimal("300.0000") * service.total_expense / service.total_volume))
        rows = self._assert_account_ledger(vacant, Decimal("0.00"))
        self.assertEqual(len(rows), 1)
        self.assertIsNone(rows[0].owner)
        self.assertEqual(rows[0].amount, -charge.amount)
        self.assertEqual(rows[0].invoice.apartment, vacant)
        self.assertEqual(Invoice.objects.get(apartment=vacant).owner_snapshot, "Egasi biriktirilmagan")
        self._assert_ledger_matches_balance(self.owner_2, Decimal("150000.00"))

    def test_new_owner_takes_over_vacant_apartment_account(self):
        vacant, _service = self._heating_with_vacant_apartment()
        self.period.close_period()
        vacant.refresh_from_db()
        debt = vacant.balance
        self.assertLess(debt, 0)

        owner = Owner.objects.create(fio="New Resident", phone="+998901234569", apartment=vacant)
        self.assertEqual(owner.balance, debt)

        payment = Payment.objects.create(owner=owner, amount=Decimal("100.00"), method=Payment.METHOD_CASH)
        payment.apply()
        owner.refresh_from_db()
        vacant.refresh_from_db()
        self.assertEqual(owner.balance, debt + Decimal("100.00"))
        self.assertEqual(vacant.balance, owner.balance)
        rows = self._assert_account_ledger(vacant, Decimal("0.00"))
        self.assertEqual([row.owner for row in rows], [None, owner])

    def test_recalculate_adjusts_vacant_apartment_account(self):
        vacant, service = self._heating_with_vacant_apartment()
        self.period.close_period()
        ServiceExpense.objects.filter(service=service).update(amount=Decimal("2450.00"))
        self.period.reopen_period()
        user = get_user_model().objects.create_user(username="billing-admin-2", password="testpass")

        self.period.recalculate("Expense corrected", user)

        rows = self._assert_account_ledger(vacant, Decimal("0.00"))
        self.assertEqual(len(rows), 2)
        self.assertGreater(rows[1].amount, 0)
        active = Charge.objects.get(apartment=vacant, is_cancelled=False)
        vacant.refresh_from_db()
        self.assertEqual(vacant.balance, -active.amount)

    def test_recalculate_records_delta_transactions(self):
        service = BuildingService.objects.create(period=self.period, building=self.building, service_type="hot_water")
        ServiceExpense.objects.create(service=service, title="Pump", amount=Decimal("750.00"))
        HotWaterReading.objects.create(service=service, apartment=self.apartment_1, start_value=0, end_value=5)
        HotWaterReading.objects.create(service=service, apartment=self.apartment_2, start_value=0, end_value=5)
        self.period.close_period()
        ServiceExpense.objects.filter(service=service).update(amount=Decimal("500.00"))
        self.period.reopen_period()
        user = get_user_model().objects.create_user(username="billing-admin", password="testpass")

        self.period.recalculate(reason="Adjusted source expense", author=user)

        rows = self._assert_ledger_matches_balance(self.owner_1, Decimal("0.00"))
        self.assertEqual([row.amount for row in rows], [Decimal("-375.00"), Decimal("125.00")])
        self.assertIn("[billing:recalculation]", rows[1].description)
        self.assertEqual(rows[1].created_by, "billing-admin")
        self._assert_ledger_matches_balance(self.owner_2, Decimal("150000.00"))

    def test_payment_apply_records_transaction(self):
        payment = Payment.objects.create(
            owner=self.owner_1,
            amount=Decimal("250.00"),
            method=Payment.METHOD_CLICK,
            external_id="click-42",
        )
        payment.apply()

        rows = self._assert_ledger_matches_balance(self.owner_1, Decimal("0.00"))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].payment_type, Transaction.TYPE_CLICK)
        self.assertEqual(rows[0].external_id, "click-42")

        bank_payment = Payment.objects.create(owner=self.owner_1, amount=Decimal("100.00"), method=Payment.METHOD_BANK)
        bank_payment.apply()
        rows = self._assert_ledger_matches_balance(self.owner_1, Decimal("0.00"))
        self.assertEqual(rows[-1].payment_type, Transaction.TYPE_MANUAL)
        self.assertIsNone(rows[-1].external_id)

    def test_payment_requires_positive_amount(self):
        payment = Payment(owner=self.owner_1, amount=Decimal("0.00"))
        with self.assertRaises(ValidationError):
            payment.full_clean()

    def test_legacy_imports_and_portal_imports_resolve(self):
        from billing.models import HotWaterMeterReading, Invoice  # noqa: F401
        from payments.models import Transaction  # noqa: F401
        from portal.backend_data import build_portal_data  # noqa: F401
        self.assertTrue(True)


class BillingCalculationRulesTests(TestCase):
    """The billing formula: who is billed, for how many days or m³, and what blocks closing."""

    def setUp(self):
        complex_ = Complex.objects.create(title="Mirabad", address="Mirabad", author="test")
        self.building = Building.objects.create(number="60", address="Mirabad", complex=complex_, author="test")
        self.april = BillingPeriod.objects.create(name="April 2026", start_date=date(2026, 4, 1), end_date=date(2026, 4, 30))
        self.april.buildings.add(self.building)

    def flat(self, number, area="50.00", heated_from=None, heated_until=None, section=None, days_given=None):
        """An apartment of house 60 with its April heating row: heated from heated_from, or not heated."""
        apartment = Apartment.objects.create(
            number=number, area=Decimal(area), building=self.building, author="test", section=section,
        )
        Owner.objects.create(fio=f"Owner {number}", phone=f"+9989000{number:0>5}", apartment=apartment)
        HeatingRecord.objects.create(
            period=self.april, apartment=apartment, heated_from=heated_from, heated_until=heated_until, days_given=days_given
        )
        return apartment

    def cost(self, service_type, amount, period=None, room=None):
        return Expense.objects.create(
            period=period or self.april, building=self.building, service_type=service_type,
            name="Qozonxona xizmati", amount=Decimal(amount), boiler_room=room,
        )

    def charged(self, period=None):
        totals = {}
        for charge in Charge.objects.filter(period=period or self.april, is_cancelled=False).select_related("apartment"):
            totals[charge.apartment.number] = totals.get(charge.apartment.number, Decimal("0")) + charge.amount
        return totals

    def test_heating_bills_the_apartments_heated_in_the_period_from_their_start_day(self):
        self.flat("1", heated_from=date(2026, 4, 1))
        self.flat("2", heated_from=date(2026, 4, 21))  # 21–30 April: 10 days
        self.flat("3")  # not heated this period: not billed, not in the volume
        self.cost("heating", "4000")

        self.april.close_period()

        # 1: 50 m² × 30 days = 1500; 2: 50 m² × 10 days = 500 → 4000 split 3:1.
        self.assertEqual(self.charged(), {"1": Decimal("3000.00"), "2": Decimal("1000.00")})

    def test_heating_stops_after_its_last_day_and_skips_days_without_heating(self):
        first = self.flat("1", heated_from=date(2026, 4, 1), heated_until=date(2026, 4, 10))  # 1–10 April
        self.flat("2", heated_from=date(2026, 4, 1))
        HeatingRecord.objects.filter(period=self.april, apartment=first).update(excluded_dates=["2026-04-05", "2026-04-20"])
        self.cost("heating", "3900")

        self.april.close_period()

        # 20 April is after the last heated day, so only 5 April is taken off: 9 days against 30.
        usages = dict(HeatingApartmentUsage.objects.values_list("apartment__number", "days_provided"))
        self.assertEqual(usages, {"1": 9, "2": 30})
        self.assertEqual(self.charged(), {"1": Decimal("900.00"), "2": Decimal("3000.00")})

    def test_house_60_december_as_in_the_excel_sheets(self):
        """The operators' own example: house 60, December, apartment 1 of 171.94 m² heated 30 of 31 days."""
        december = BillingPeriod.objects.create(name="2025-Dekabr", start_date=date(2025, 12, 1), end_date=date(2025, 12, 31))
        december.buildings.add(self.building)
        first = self.flat("1", area="171.94")
        rest = self.flat("2", area="173021.18")  # the other apartments: 178 179.38 m²·days in all
        HeatingRecord.objects.filter(apartment__in=[first, rest]).delete()
        HeatingRecord.objects.create(period=december, apartment=first, heated_from=date(2025, 12, 1), days_given=30)
        HeatingRecord.objects.create(period=december, apartment=rest, heated_from=date(2025, 12, 1), days_given=1)
        for service_type, name, amount in [
            ("heating", "Обслуживание котельной", "5967950"),
            ("heating", "Холодная вода", "1060800"),
            ("hot_water", "Обслуживание котельной", "5967950"),
            ("hot_water", "Электроэнергия", "1500000"),
        ]:
            Expense.objects.create(period=december, building=self.building, service_type=service_type, name=name, amount=Decimal(amount))
        GasMeterReading.objects.create(
            period=december, building=self.building, service_type="heating",
            start_reading=Decimal("579702.44"), end_reading=Decimal("601719.18"), price_per_m3=Decimal("1000"),
        )
        GasMeterReading.objects.create(
            period=december, building=self.building, service_type="hot_water",
            start_reading=Decimal("1000"), end_reading=Decimal("5893"), price_per_m3=Decimal("1000"),
        )
        HotWaterMeterReading.objects.create(period=december, apartment=first, start_reading=Decimal("89.1"), end_reading=Decimal("100"))
        HotWaterMeterReading.objects.create(period=december, apartment=rest, start_reading=Decimal("0"), end_reading=Decimal("214.3"))

        december.close_period()

        heating = BuildingService.objects.get(period=december, service_type="heating")
        hot_water = BuildingService.objects.get(period=december, service_type="hot_water")
        self.assertEqual(heating.calculate_total_expense(), Decimal("29045490.00"))  # gas 22 016 740 + 5 967 950 + 1 060 800
        self.assertEqual(hot_water.calculate_total_expense(), Decimal("12360950.00"))  # 5 967 950 + 1 500 000 + gas 4 893 000
        first_charges = dict(Charge.objects.filter(period=december, apartment=first).values_list("charge_type", "amount"))
        self.assertEqual(first_charges, {"heating": Decimal("840851.77"), "hot_water": Decimal("598287.54")})
        first.refresh_from_db()
        self.assertEqual(first.balance, Decimal("-1439139.31"))

    def test_each_boiler_room_spreads_its_own_costs_over_its_sections(self):
        from billing.models import BoilerRoom
        from properties.models import BuildingSection

        a1 = BuildingSection.objects.create(building=self.building, name="A1")
        a5 = BuildingSection.objects.create(building=self.building, name="A5")
        room_a1 = BoilerRoom.objects.create(building=self.building, name="A1")
        room_a1.sections.add(a1)
        room_a5 = BoilerRoom.objects.create(building=self.building, name="A5")
        room_a5.sections.add(a5)
        self.flat("1", heated_from=date(2026, 4, 1), section=a1)
        self.flat("2", heated_from=date(2026, 4, 1), section=a1, area="150.00")
        self.flat("3", heated_from=date(2026, 4, 1), section=a5)
        self.cost("heating", "1000", room=room_a1)
        self.cost("heating", "3000", room=room_a5)

        self.april.close_period()

        self.assertEqual(self.charged(), {"1": Decimal("250.00"), "2": Decimal("750.00"), "3": Decimal("3000.00")})
        self.assertEqual(BuildingService.objects.filter(period=self.april, service_type="heating").count(), 2)

    def test_heating_cost_without_boiler_room_in_a_house_with_several_is_reported(self):
        from billing.models import BoilerRoom

        BoilerRoom.objects.create(building=self.building, name="A1")
        BoilerRoom.objects.create(building=self.building, name="A5")
        self.flat("1", heated_from=date(2026, 4, 1))
        self.cost("heating", "1000")

        with self.assertRaises(ValidationError) as caught:
            self.april.close_period()
        self.assertIn("qaysi qozonxonaga tegishli ekani ko'rsatilmagan", " ".join(caught.exception.messages))
        self.assertFalse(Charge.objects.exists())

    def test_hot_water_start_reading_comes_from_the_previous_period(self):
        march = BillingPeriod.objects.create(name="March 2026", start_date=date(2026, 3, 1), end_date=date(2026, 3, 31))
        first = self.flat("1")
        second = self.flat("2")
        HotWaterMeterReading.objects.create(period=march, apartment=first, start_reading=Decimal("2"), end_reading=Decimal("10"))
        HotWaterMeterReading.objects.create(period=march, apartment=second, start_reading=Decimal("4"))  # not read in March
        HotWaterMeterReading.objects.create(period=self.april, apartment=first, end_reading=Decimal("13"))  # 13 − 10
        HotWaterMeterReading.objects.create(period=self.april, apartment=second, end_reading=Decimal("13"))  # 13 − 4
        self.cost("hot_water", "1200")

        self.april.close_period()

        self.assertEqual(self.charged(), {"1": Decimal("300.00"), "2": Decimal("900.00")})

    def test_hot_water_reading_problems_name_the_apartments_and_block_closing(self):
        readings = {"1": (None, "5"), "2": ("9", "7"), "3": ("4", None)}
        for number, (start, end) in readings.items():
            HotWaterMeterReading.objects.create(
                period=self.april, apartment=self.flat(number),
                start_reading=Decimal(start) if start else None, end_reading=Decimal(end) if end else None,
            )
        self.cost("hot_water", "1000")

        with self.assertRaises(ValidationError) as caught:
            self.april.close_period()

        problems = caught.exception.messages
        self.assertTrue(any("kv 1" in problem and "boshlang'ich ko'rsatkich yo'q" in problem for problem in problems))
        self.assertTrue(any("kv 2" in problem and "kichik" in problem for problem in problems))
        self.assertFalse(Charge.objects.exists())
        self.assertFalse(Transaction.objects.exists())

    def test_hot_water_costs_without_any_readings_explain_what_to_enter(self):
        self.flat("1")
        self.flat("2")
        self.cost("hot_water", "6032050")
        GasMeterReading.objects.create(
            period=self.april, building=self.building, service_type="hot_water",
            start_reading=Decimal("10000"), end_reading=Decimal("14356"), price_per_m3=Decimal("1000"),
        )

        with self.assertRaises(ValidationError) as caught:
            self.april.close_period()

        self.assertEqual(
            caught.exception.messages,
            [
                "60 uy — issiq suv: xarajat 10 388 050 so'm, lekin kvartiralar sarfi 0 m³. "
                "Davr sahifasidagi «GVS hisoblagich ko'rsatkichlari»ga oxirgi ko'rsatkichlarni kiriting."
            ],
        )

    def test_gas_meter_start_reading_comes_from_the_previous_period(self):
        march = BillingPeriod.objects.create(name="March 2026", start_date=date(2026, 3, 1), end_date=date(2026, 3, 31))
        GasMeterReading.objects.create(
            period=march, building=self.building, service_type="heating",
            start_reading=Decimal("900"), end_reading=Decimal("1000"), price_per_m3=Decimal("1000"),
        )
        april_gas = GasMeterReading.objects.create(
            period=self.april, building=self.building, service_type="heating",
            end_reading=Decimal("1100"), price_per_m3=Decimal("1000"),
        )
        self.flat("1", heated_from=date(2026, 4, 1))

        self.assertEqual(april_gas.consumption, Decimal("100"))
        self.april.close_period()
        self.assertEqual(self.charged(), {"1": Decimal("100000.00")})

    def test_recalculation_stops_charging_a_removed_cost(self):
        first = self.flat("1", heated_from=date(2026, 4, 1))
        heating = self.cost("heating", "3000")
        self.cost("hot_water", "500")
        HotWaterMeterReading.objects.create(period=self.april, apartment=first, start_reading=Decimal("1"), end_reading=Decimal("3"))
        self.april.close_period()
        self.assertEqual(self.charged(), {"1": Decimal("3500.00")})

        self.april.reopen_period()
        heating.delete()
        self.april.recalculate("Heating cost was entered by mistake", author=None)

        self.assertEqual(self.charged(), {"1": Decimal("500.00")})
        first.refresh_from_db()
        self.assertEqual(first.balance, Decimal("-500.00"))
