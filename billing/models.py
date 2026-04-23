from __future__ import annotations

from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Sum
from django.utils import timezone

from properties.models import Apartment, Building, BuildingSection, Owner


MONEY_PLACES = Decimal("0.01")
RATE_PLACES = Decimal("0.0001")
VOLUME_PLACES = Decimal("0.0001")


def _decimal(value) -> Decimal:
    if isinstance(value, Decimal):
        return value
    if value in (None, ""):
        return Decimal("0")
    return Decimal(str(value))


def _quantize(value, places: Decimal) -> Decimal:
    return _decimal(value).quantize(places, rounding=ROUND_HALF_UP)


def money(value) -> Decimal:
    return _quantize(value, MONEY_PLACES)


def rate(value) -> Decimal:
    return _quantize(value, RATE_PLACES)


def volume(value) -> Decimal:
    return _quantize(value, VOLUME_PLACES)


SERVICE_HEATING = "heating"
SERVICE_HOT_WATER = "hot_water"
SERVICE_CHOICES = [
    (SERVICE_HEATING, "Heating"),
    (SERVICE_HOT_WATER, "Hot water"),
]


class BillingPeriod(models.Model):
    """
    Compatibility-preserving billing period.

    The legacy database column remains `name`, while the canonical contract
    exposes `title` as an alias.
    """

    STATUS_DRAFT = "draft"
    STATUS_CLOSED = "closed"
    STATUS_REOPENED = "reopened"
    STATUS_OPEN = STATUS_DRAFT
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_CLOSED, "Closed"),
        (STATUS_REOPENED, "Reopened"),
    ]

    name = models.CharField(max_length=100, verbose_name="Davr nomi", help_text="Masalan: Dekabr 2025")
    start_date = models.DateField(verbose_name="Boshlanish sanasi")
    end_date = models.DateField(verbose_name="Tugash sanasi")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, verbose_name="Holat")
    buildings = models.ManyToManyField(Building, related_name="billing_periods", blank=True, verbose_name="Uylar")
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name="Yopilgan vaqt")

    class Meta:
        verbose_name = "Xisoblash davri"
        verbose_name_plural = "Xisoblash davrlari"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.title} ({self.start_date} — {self.end_date})"

    @property
    def title(self):
        return self.name

    @title.setter
    def title(self, value):
        self.name = value

    @property
    def total_days(self):
        return self.days_count()

    def days_count(self):
        if self.end_date < self.start_date:
            return 0
        return (self.end_date - self.start_date).days + 1

    def all_dates(self):
        total = self.days_count()
        return [self.start_date + timedelta(days=index) for index in range(total)]

    def clean(self):
        super().clean()
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": "End date must be greater than or equal to start date."})

    def _active_charges(self):
        return self.charges.filter(is_cancelled=False)

    def _build_service_charges(self, service: "BuildingService"):
        service.calculate()
        if service.total_volume <= 0:
            raise ValidationError(f"{service} total volume must be greater than zero.")

        if service.service_type == SERVICE_HEATING:
            rows = service.heating_usages.select_related("apartment", "apartment__owner")
            for usage in rows:
                apartment = usage.apartment
                owner = getattr(apartment, "owner", None)
                if owner is None:
                    raise ValidationError(f"Apartment {apartment} has no owner and cannot be billed.")
                yield owner, apartment, usage.heated_area, service.tariff, money(usage.heated_area * service.tariff)
        else:
            rows = service.hot_water_readings.select_related("apartment", "apartment__owner")
            for reading in rows:
                apartment = reading.apartment
                owner = getattr(apartment, "owner", None)
                if owner is None:
                    raise ValidationError(f"Apartment {apartment} has no owner and cannot be billed.")
                yield owner, apartment, reading.consumption, service.tariff, money(reading.consumption * service.tariff)

    def close_period(self):
        with transaction.atomic():
            locked = BillingPeriod.objects.select_for_update().get(pk=self.pk)
            if locked.status == self.STATUS_CLOSED:
                raise ValidationError("Billing period is already closed.")
            if locked._active_charges().exists():
                raise ValidationError("Active charges already exist for this period.")

            services = list(locked.services.select_related("building").all())
            if not services:
                raise ValidationError("Billing period has no building services to close.")

            owner_totals: dict[int, Decimal] = {}
            charge_rows = []
            for service in services:
                for owner, apartment, row_volume, row_tariff, row_amount in locked._build_service_charges(service):
                    charge_rows.append(
                        Charge(
                            period=locked,
                            service=service,
                            owner=owner,
                            apartment=apartment,
                            charge_type=service.service_type,
                            amount=row_amount,
                            tariff=row_tariff,
                            volume=row_volume,
                        )
                    )
                    owner_totals[owner.pk] = owner_totals.get(owner.pk, Decimal("0")) + row_amount

            Charge.objects.bulk_create(charge_rows)
            for owner_id, total in owner_totals.items():
                Owner.objects.filter(pk=owner_id).update(balance=models.F("balance") - total)

            locked.status = self.STATUS_CLOSED
            locked.closed_at = timezone.now()
            locked.save(update_fields=["status", "closed_at"])
            self.status = locked.status
            self.closed_at = locked.closed_at
            return charge_rows

    def reopen_period(self):
        if self.status != self.STATUS_CLOSED:
            raise ValidationError("Only closed periods can be reopened.")
        self.status = self.STATUS_REOPENED
        self.save(update_fields=["status"])
        return self

    def recalculate(self, reason, author):
        with transaction.atomic():
            locked = BillingPeriod.objects.select_for_update().get(pk=self.pk)
            if locked.status not in {self.STATUS_CLOSED, self.STATUS_REOPENED}:
                raise ValidationError("Only closed or reopened periods can be recalculated.")

            active_charges = list(
                locked.charges.select_related("owner").filter(is_cancelled=False)
            )
            old_totals: dict[int, Decimal] = {}
            for charge in active_charges:
                old_totals[charge.owner_id] = old_totals.get(charge.owner_id, Decimal("0")) + charge.amount

            if active_charges:
                now = timezone.now()
                locked.charges.filter(pk__in=[charge.pk for charge in active_charges]).update(
                    is_cancelled=True,
                    cancelled_at=now,
                )

            new_charge_rows = []
            new_totals: dict[int, Decimal] = {}
            services = list(locked.services.select_related("building").all())
            for service in services:
                for owner, apartment, row_volume, row_tariff, row_amount in locked._build_service_charges(service):
                    new_charge_rows.append(
                        Charge(
                            period=locked,
                            service=service,
                            owner=owner,
                            apartment=apartment,
                            charge_type=service.service_type,
                            amount=row_amount,
                            tariff=row_tariff,
                            volume=row_volume,
                        )
                    )
                    new_totals[owner.pk] = new_totals.get(owner.pk, Decimal("0")) + row_amount

            Charge.objects.bulk_create(new_charge_rows)

            all_owner_ids = set(old_totals) | set(new_totals)
            for owner_id in all_owner_ids:
                delta = old_totals.get(owner_id, Decimal("0")) - new_totals.get(owner_id, Decimal("0"))
                if delta:
                    Owner.objects.filter(pk=owner_id).update(balance=models.F("balance") + delta)

            RecalculationLog.objects.create(
                period=locked,
                reason=reason,
                author=author if getattr(author, "pk", None) else None,
            )
            locked.status = self.STATUS_CLOSED
            locked.save(update_fields=["status"])
            self.status = locked.status
            return new_charge_rows


class BuildingService(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="services")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="billing_services")
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    gas_start = models.DecimalField(max_digits=14, decimal_places=4, null=True, blank=True)
    gas_end = models.DecimalField(max_digits=14, decimal_places=4, null=True, blank=True)
    gas_price = models.DecimalField(max_digits=14, decimal_places=4, null=True, blank=True)
    total_expense = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal("0.00"))
    total_volume = models.DecimalField(max_digits=16, decimal_places=4, default=Decimal("0.0000"))
    tariff = models.DecimalField(max_digits=16, decimal_places=4, default=Decimal("0.0000"))
    is_calculated = models.BooleanField(default=False)
    calculated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["period", "building", "service_type"], name="uniq_building_service_period_type")
        ]
        ordering = ["period__start_date", "building__complex__title", "building__number", "service_type"]

    def __str__(self):
        return f"{self.period.title} | {self.building} | {self.get_service_type_display()}"

    def clean(self):
        super().clean()
        gas_values = [self.gas_start, self.gas_end, self.gas_price]
        if any(value is not None for value in gas_values):
            if not all(value is not None for value in gas_values):
                raise ValidationError("Gas start, gas end and gas price must be provided together.")
            if self.gas_end < self.gas_start:
                raise ValidationError({"gas_end": "Gas end must be greater than or equal to gas start."})

    def gas_consumption(self):
        if self.gas_start is None or self.gas_end is None:
            return Decimal("0")
        return volume(self.gas_end - self.gas_start)

    def gas_expense(self):
        if self.gas_price is None:
            return Decimal("0")
        return money(self.gas_consumption() * self.gas_price)

    def calculate_total_expense(self):
        explicit_sum = self.expense_items.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        return money(explicit_sum + self.gas_expense())

    def calculate_total_volume(self):
        if self.service_type == SERVICE_HEATING:
            total = self.heating_usages.aggregate(total=Sum("heated_area"))["total"] or Decimal("0")
        else:
            total = self.hot_water_readings.aggregate(total=Sum("consumption"))["total"] or Decimal("0")
        return volume(total)

    def calculate_tariff(self):
        if self.total_volume <= 0:
            raise ValidationError("Total volume must be greater than zero.")
        return rate(self.total_expense / self.total_volume)

    def calculate(self):
        self.full_clean()
        self.total_expense = self.calculate_total_expense()
        self.total_volume = self.calculate_total_volume()
        self.tariff = self.calculate_tariff()
        self.is_calculated = True
        self.calculated_at = timezone.now()
        self.save(update_fields=["total_expense", "total_volume", "tariff", "is_calculated", "calculated_at", "updated_at"])
        return self


class ServiceExpense(models.Model):
    service = models.ForeignKey(BuildingService, on_delete=models.CASCADE, related_name="expense_items")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "pk"]

    def __str__(self):
        return f"{self.title} | {self.amount}"

    def clean(self):
        super().clean()
        if _decimal(self.amount) < 0:
            raise ValidationError({"amount": "Expense amount must be zero or greater."})


class HeatingApartmentUsage(models.Model):
    service = models.ForeignKey(BuildingService, on_delete=models.CASCADE, related_name="heating_usages")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="heating_usages")
    days_provided = models.PositiveIntegerField(blank=True, null=True)
    heated_area = models.DecimalField(max_digits=16, decimal_places=4, default=Decimal("0.0000"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["service", "apartment"], name="uniq_heating_usage_service_apartment")
        ]
        ordering = ["apartment__building__complex__title", "apartment__building__number", "apartment__number"]

    def __str__(self):
        return f"{self.service} | {self.apartment}"

    def calculate_heated_area(self):
        return volume(_decimal(self.apartment.area) * Decimal(self.days_provided or 0))

    def clean(self):
        super().clean()
        if self.service_id and self.service.service_type != SERVICE_HEATING:
            raise ValidationError({"service": "Heating usage must point to a heating service."})
        period_days = self.service.period.days_count() if self.service_id else 0
        days_value = period_days if self.days_provided in (None, "") else int(self.days_provided)
        if days_value < 0:
            raise ValidationError({"days_provided": "Days provided must be greater than or equal to zero."})
        if period_days and days_value > period_days:
            raise ValidationError({"days_provided": "Days provided cannot exceed the billing period length."})

    def save(self, *args, **kwargs):
        if self.days_provided in (None, "") and self.service_id:
            self.days_provided = self.service.period.days_count()
        self.heated_area = self.calculate_heated_area()
        self.full_clean()
        super().save(*args, **kwargs)


class HotWaterReading(models.Model):
    service = models.ForeignKey(BuildingService, on_delete=models.CASCADE, related_name="hot_water_readings")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="billing_hot_water_readings")
    start_value = models.DecimalField(max_digits=12, decimal_places=4)
    end_value = models.DecimalField(max_digits=12, decimal_places=4)
    consumption = models.DecimalField(max_digits=12, decimal_places=4, default=Decimal("0.0000"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["service", "apartment"], name="uniq_hot_water_reading_service_apartment")
        ]
        ordering = ["apartment__building__complex__title", "apartment__building__number", "apartment__number"]

    def __str__(self):
        return f"{self.service} | {self.apartment}"

    def calculate_consumption(self):
        return volume(_decimal(self.end_value) - _decimal(self.start_value))

    def clean(self):
        super().clean()
        if self.service_id and self.service.service_type != SERVICE_HOT_WATER:
            raise ValidationError({"service": "Hot water reading must point to a hot water service."})
        if self.end_value is not None and self.start_value is not None and self.end_value < self.start_value:
            raise ValidationError({"end_value": "End value must be greater than or equal to start value."})

    def save(self, *args, **kwargs):
        self.consumption = self.calculate_consumption()
        self.full_clean()
        super().save(*args, **kwargs)


class Charge(models.Model):
    TYPE_CHOICES = SERVICE_CHOICES

    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="charges")
    service = models.ForeignKey(BuildingService, on_delete=models.CASCADE, related_name="charges")
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="charges")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="charges")
    charge_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    tariff = models.DecimalField(max_digits=16, decimal_places=4)
    volume = models.DecimalField(max_digits=16, decimal_places=4)
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "owner_id"]

    def __str__(self):
        return f"{self.owner} | {self.get_charge_type_display()} | {self.amount}"


class Payment(models.Model):
    METHOD_CASH = "cash"
    METHOD_BANK = "bank"
    METHOD_PAYME = "payme"
    METHOD_CLICK = "click"
    METHOD_MANUAL = "manual"
    METHOD_CHOICES = [
        (METHOD_CASH, "Cash"),
        (METHOD_BANK, "Bank"),
        (METHOD_PAYME, "Payme"),
        (METHOD_CLICK, "Click"),
        (METHOD_MANUAL, "Manual"),
    ]

    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="billing_payments")
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default=METHOD_MANUAL)
    external_id = models.CharField(max_length=255, blank=True)
    comment = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    applied_at = models.DateTimeField(null=True, blank=True)
    is_applied = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.owner} | {self.amount} | {self.get_method_display()}"

    def clean(self):
        super().clean()
        if _decimal(self.amount) <= 0:
            raise ValidationError({"amount": "Payment amount must be greater than zero."})

    def apply(self):
        with transaction.atomic():
            locked = Payment.objects.select_for_update().get(pk=self.pk)
            if locked.is_applied:
                raise ValidationError("Payment was already applied.")
            Owner.objects.filter(pk=locked.owner_id).update(balance=models.F("balance") + locked.amount)
            locked.is_applied = True
            locked.applied_at = timezone.now()
            locked.save(update_fields=["is_applied", "applied_at"])
            self.is_applied = locked.is_applied
            self.applied_at = locked.applied_at
            return self


class RecalculationLog(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="recalculation_logs")
    reason = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.period.title} | {timezone.localtime(self.created_at):%d.%m.%Y %H:%M}"


class Expense(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="expenses", verbose_name="Davr")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="expenses", verbose_name="Uy")
    section = models.ForeignKey(
        BuildingSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
        verbose_name="Seksiya",
        help_text="Agar uyda seksiyalar bo'lsa (masalan 66-uy: A1, A5)",
    )
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES, verbose_name="Xizmat turi")
    name = models.CharField(max_length=255, verbose_name="Xarajat nomi", help_text="Masalan: Qozonxona xizmati, Gaz sarfi...")
    amount = models.DecimalField(max_digits=16, decimal_places=2, verbose_name="Summa (so'm)")

    class Meta:
        verbose_name = "Xarajat"
        verbose_name_plural = "Xarajatlar"

    def __str__(self):
        return f"{self.name} — {self.amount} so'm ({self.building})"


class GasMeterReading(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="gas_meter_readings", verbose_name="Davr")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="gas_meter_readings", verbose_name="Uy")
    section = models.ForeignKey(BuildingSection, on_delete=models.SET_NULL, null=True, blank=True, related_name="gas_meter_readings", verbose_name="Seksiya")
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES, verbose_name="Xizmat turi", help_text="Isitish uchun yoki GVS uchun gazh")
    start_reading = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Boshlang'ich ko'rsatkich (kub)")
    end_reading = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Oxirgi ko'rsatkich (kub)")
    price_per_m3 = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="1 kub narxi (so'm)")

    class Meta:
        verbose_name = "Gaz hisoblagich ko'rsatkichi"
        verbose_name_plural = "Gaz hisoblagich ko'rsatkichlari"

    @property
    def consumption(self):
        if self.start_reading is None or self.end_reading is None:
            return Decimal("0")
        return max(Decimal("0"), self.end_reading - self.start_reading)

    @property
    def total_gas_cost(self):
        if self.price_per_m3 is None:
            return Decimal("0")
        return self.consumption * self.price_per_m3

    def __str__(self):
        service_name = self.get_service_type_display() or "Gaz hisoblagich"
        building_name = self.building if self.building_id else "Yangi uy"
        period_name = self.period.title if self.period_id else "Yangi davr"
        return f"{service_name} — {building_name} ({period_name}) — {self.consumption} kub"


class HeatingRecord(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="heating_records", verbose_name="Davr")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="heating_records", verbose_name="Kvartira")
    excluded_dates = models.JSONField(default=list, verbose_name="Qizdirilmagan kunlar", help_text='Masalan: ["2025-12-10", "2025-12-25"]')

    class Meta:
        verbose_name = "Isitish hisobi"
        verbose_name_plural = "Isitish hisoblari"
        unique_together = ("period", "apartment")

    @property
    def heated_days(self):
        return self.period.total_days - len(self.excluded_dates)

    @property
    def heated_area(self):
        return _decimal(self.apartment.area) * Decimal(self.heated_days)

    def is_date_heated(self, check_date):
        return check_date.strftime("%Y-%m-%d") not in self.excluded_dates

    def add_excluded_date(self, exclude_date):
        date_str = exclude_date.strftime("%Y-%m-%d")
        if date_str not in self.excluded_dates:
            self.excluded_dates.append(date_str)
            self.save()

    def remove_excluded_date(self, restore_date):
        date_str = restore_date.strftime("%Y-%m-%d")
        if date_str in self.excluded_dates:
            self.excluded_dates.remove(date_str)
            self.save()

    def __str__(self):
        return f"Kv.{self.apartment.number} — {self.period.title} ({self.heated_days} kun, {self.heated_area:.2f} m²)"


class HotWaterMeterReading(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="hot_water_readings", verbose_name="Davr")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="hot_water_readings", verbose_name="Kvartira")
    start_reading = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Boshlang'ich ko'rsatkich (kub)", help_text="Davr boshidagi hisoblagich ko'rsatkichi")
    end_reading = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Oxirgi ko'rsatkich (kub)", help_text="Davr oxiridagi hisoblagich ko'rsatkichi")

    class Meta:
        verbose_name = "GVS hisoblagich ko'rsatkichi"
        verbose_name_plural = "GVS hisoblagich ko'rsatkichlari"
        unique_together = ("period", "apartment")

    @property
    def consumption(self):
        if self.start_reading is not None and self.end_reading is not None:
            return max(Decimal("0"), self.end_reading - self.start_reading)
        if self.start_reading is None and self.end_reading is not None:
            return self.end_reading
        return Decimal("0")

    def __str__(self):
        return f"GVS Kv.{self.apartment.number} — {self.period.title} ({self.consumption} kub)"


class Invoice(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="invoices", verbose_name="Davr")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="invoices", verbose_name="Kvartira")
    owner_snapshot = models.CharField(max_length=255, verbose_name="Ega (vaqt kesimi)", help_text="Hisob yuborilgan paytdagi ega FIO — owner o'zgarsa ham saqlanadi")
    heated_area = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Qizdirilgan maydon (m²·kun)")
    heating_cost_per_sqm = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True, verbose_name="1 m² uchun narx (isitish)")
    heating_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True, verbose_name="Isitish summasi (so'm)")
    hot_water_consumption = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="GVS sarfi (kub)")
    hot_water_tariff = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True, verbose_name="GVS tarifi (so'm/kub)")
    hot_water_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True, verbose_name="GVS summasi (so'm)")
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, verbose_name="Jami summa (so'm)")
    is_recalculated = models.BooleanField(default=False, verbose_name="Qayta hisoblanganmih")
    recalculated_at = models.DateTimeField(null=True, blank=True, verbose_name="Qayta hisoblash vaqti")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Hisob-faktura"
        verbose_name_plural = "Hisob-fakturalar"
        unique_together = ("period", "apartment")

    def __str__(self):
        return f"Hisob: Kv.{self.apartment.number} — {self.period.title} — {self.total_amount} so'm"


class HeatingCalculationSummary(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="heating_summaries")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="heating_summaries")
    section = models.ForeignKey(BuildingSection, on_delete=models.SET_NULL, null=True, blank=True, related_name="heating_summaries")
    total_expenses = models.DecimalField(max_digits=16, decimal_places=2, verbose_name="Umumiy xarajatlar (so'm)")
    total_heated_area = models.DecimalField(max_digits=14, decimal_places=2, verbose_name="Umumiy qizdirilgan maydon (m²·kun)")
    cost_per_sqm = models.DecimalField(max_digits=12, decimal_places=4, verbose_name="1 m²·kun narxi (so'm)")
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Isitish hisoblash xulosasi"
        verbose_name_plural = "Isitish hisoblash xulosalari"

    def __str__(self):
        return f"Isitish xulosa: {self.building} — {self.period.title} ({self.cost_per_sqm} so'm/m²)"


class HotWaterCalculationSummary(models.Model):
    period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE, related_name="hot_water_summaries")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="hot_water_summaries")
    section = models.ForeignKey(BuildingSection, on_delete=models.SET_NULL, null=True, blank=True, related_name="hot_water_summaries")
    total_expenses = models.DecimalField(max_digits=16, decimal_places=2, verbose_name="Umumiy xarajatlar (so'm)")
    total_consumption = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Umumiy GVS sarfi (kub)")
    tariff_per_m3 = models.DecimalField(max_digits=12, decimal_places=4, verbose_name="1 kub tarifi (so'm)")
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "GVS hisoblash xulosasi"
        verbose_name_plural = "GVS hisoblash xulosalari"

    def __str__(self):
        return f"GVS xulosa: {self.building} — {self.period.title} ({self.tariff_per_m3} so'm/kub)"
