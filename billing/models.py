"""
billing/models.py

XISOBLASh MANTIG'I (qisqacha):

=== ISITISH ===
1. Davr yaratiladi (01.12 - 31.12)
2. Har kvartira uchun HeatingRecord yaratiladi (standart: barcha kunlar qizdirilgan)
3. Agar qandaydir kun qizdirilmagan bo'lsa — excluded_dates ga qo'shiladi
4. Xarajatlar (Expense) kiritiladi: qozonxona, gaz, sovuq suv
5. Gaz hisoblagich ko'rsatkichi (GasMeterReading) kiritiladi
6. Tugma "Davrni yopish" bosilganda:
   - total_heated_area = Σ (kvartira_maydoni × qizdirilgan_kunlar)
   - cost_per_sqm = total_expenses / total_heated_area
   - har kvartira uchun Invoice yaratiladi

=== ISSIQ SUV ===
1. Har kvartira uchun HotWaterMeterReading kiritiladi (boshlang'ich va oxirgi ko'rsatkich)
2. Xarajatlar (Expense) kiritiladi qozonxona uchun
3. total_consumption = Σ kvartiralarning sarfi (kub)
4. tariff_per_m3 = total_expenses / total_consumption
5. har kvartira uchun Invoice yaratiladi
"""

import json
from datetime import date, timedelta
from decimal import Decimal

from django.db import models

from main_app.models import Apartment, Building, BuildingSection, Owner


# ─────────────────────────────────────────────────
#  BILLING PERIOD — xisoblash davri
# ─────────────────────────────────────────────────

class BillingPeriod(models.Model):
    """
    Xisoblash davri. Masalan: 01.12.2025 — 31.12.2025.
    Bir davr bir nechta uyni qamrashi mumkin.
    """
    name = models.CharField(
        max_length=100,
        verbose_name="Davr nomi",
        help_text="Masalan: Dekabr 2025",
    )
    start_date = models.DateField(verbose_name="Boshlanish sanasi")
    end_date = models.DateField(verbose_name="Tugash sanasi")

    STATUS_OPEN = "open"
    STATUS_CLOSED = "closed"
    STATUS_CHOICES = [
        (STATUS_OPEN, "Ochiq"),
        (STATUS_CLOSED, "Yopiq"),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN,
        verbose_name="Holat",
    )

    # Bu davr qaysi uylarga taalluqli
    buildings = models.ManyToManyField(
        Building,
        related_name="billing_periods",
        verbose_name="Uylar",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name="Yopilgan vaqt")

    def __str__(self):
        return f"{self.name} ({self.start_date} — {self.end_date})"

    @property
    def total_days(self):
        """Davr ichidagi kunlar soni"""
        return (self.end_date - self.start_date).days + 1

    def all_dates(self):
        """Davr ichidagi barcha sanalarni ro'yxat qilib beradi"""
        delta = self.end_date - self.start_date
        return [self.start_date + timedelta(days=i) for i in range(delta.days + 1)]

    class Meta:
        verbose_name = "Xisoblash davri"
        verbose_name_plural = "Xisoblash davrlari"
        ordering = ["-start_date"]


# ─────────────────────────────────────────────────
#  SERVICE TYPE — xizmat turi
# ─────────────────────────────────────────────────

SERVICE_HEATING = "heating"
SERVICE_HOT_WATER = "hot_water"
SERVICE_CHOICES = [
    (SERVICE_HEATING, "Isitish"),
    (SERVICE_HOT_WATER, "Issiq suv"),
]


# ─────────────────────────────────────────────────
#  EXPENSES — uy bo'yicha umumiy xarajatlar
# ─────────────────────────────────────────────────

class Expense(models.Model):
    """
    Uy bo'yicha umumiy xarajat.
    Masalan:
      - Qozonxona xizmati: 6_940_891 so'm
      - Gaz sarfi: 25_341_820 so'm
      - Sovuq suv sarfi: 795_600 so'm

    Har bir xarajat:
      - Qaysi davr
      - Qaysi uy (yoki seksiya)
      - Qanday xizmat (isitish / GVS)
      - Xarajat nomi + summa
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="expenses",
        verbose_name="Davr",
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="expenses",
        verbose_name="Uy",
    )
    section = models.ForeignKey(
        BuildingSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
        verbose_name="Seksiya",
        help_text="Agar uyda seksiyalar bo'lsa (masalan 66-uy: A1, A5)",
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_CHOICES,
        verbose_name="Xizmat turi",
    )
    name = models.CharField(
        max_length=255,
        verbose_name="Xarajat nomi",
        help_text="Masalan: Qozonxona xizmati, Gaz sarfi...",
    )
    amount = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        verbose_name="Summa (so'm)",
    )

    def __str__(self):
        return f"{self.name} — {self.amount} so'm ({self.building})"

    class Meta:
        verbose_name = "Xarajat"
        verbose_name_plural = "Xarajatlar"


# ─────────────────────────────────────────────────
#  GAS METER READING — gaz hisoblagich ko'rsatkichi
# ─────────────────────────────────────────────────

class GasMeterReading(models.Model):
    """
    Uy (yoki seksiya) bo'yicha gaz hisoblagich ko'rsatkichi.

    Misol (64V uy, dekabr):
      start_reading = 571_124.44  (01.12 ko'rsatkich)
      end_reading   = 596_466.26  (31.12 ko'rsatkich)
      consumption   = 25_341.82   kub
      price_per_m3  = 1_000 so'm/kub
      => gas_cost   = 25_341_820 so'm  (Expense sifatida Gaz sarfi)

    Gaz xarajati avtomatik ravishda Expense orqali kiritiladi (views.py da).
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="gas_meter_readings",
        verbose_name="Davr",
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="gas_meter_readings",
        verbose_name="Uy",
    )
    section = models.ForeignKey(
        BuildingSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gas_meter_readings",
        verbose_name="Seksiya",
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_CHOICES,
        verbose_name="Xizmat turi",
        help_text="Isitish uchun yoki GVS uchun gazh",
    )
    start_reading = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Boshlang'ich ko'rsatkich (kub)",
    )
    end_reading = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Oxirgi ko'rsatkich (kub)",
    )
    price_per_m3 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="1 kub narxi (so'm)",
    )

    @property
    def consumption(self):
        """Sarflangan gaz miqdori (kub)"""
        return self.end_reading - self.start_reading

    @property
    def total_gas_cost(self):
        """Gaz uchun umumiy xarajat (so'm)"""
        return self.consumption * self.price_per_m3

    def __str__(self):
        return (
            f"{self.get_service_type_display()} — {self.building} "
            f"({self.period.name}) — {self.consumption} kub"
        )

    class Meta:
        verbose_name = "Gaz hisoblagich ko'rsatkichi"
        verbose_name_plural = "Gaz hisoblagich ko'rsatkichlari"


# ─────────────────────────────────────────────────
#  HEATING RECORD — isitish hisobi (kvartira bo'yicha)
# ─────────────────────────────────────────────────

class HeatingRecord(models.Model):
    """
    Har kvartira uchun ISITISH hisobi.

    Mantiq:
    - Davr yaratilganda har kvartira uchun avtomatik yaratiladi
    - Defolt: davr ichidagi barcha kunlar qizdirilgan
    - excluded_dates — qizdirilmagan kunlar ro'yxati (JSON)
      Masalan: ["2025-12-10", "2025-12-11"]
    - heated_days = davr_kunlari - excluded_dates.length
    - heated_area = kvartira.maydon × heated_days

    Misol (3-kvartira, 64V, dekabr):
      area = 64.08 m²
      heated_days = 30
      heated_area = 64.08 × 30 = 1922.4 m²·kun
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="heating_records",
        verbose_name="Davr",
    )
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.CASCADE,
        related_name="heating_records",
        verbose_name="Kvartira",
    )
    # Qizdirilmagan kunlar — "YYYY-MM-DD" formatidagi sanalar ro'yxati
    excluded_dates = models.JSONField(
        default=list,
        verbose_name="Qizdirilmagan kunlar",
        help_text='Masalan: ["2025-12-10", "2025-12-25"]',
    )

    @property
    def heated_days(self):
        """Real qizdirilgan kunlar soni"""
        return self.period.total_days - len(self.excluded_dates)

    @property
    def heated_area(self):
        """Kvartiraning ushbu davr uchun qizdirilgan maydoni (m²·kun)"""
        return self.apartment.area * self.heated_days

    def is_date_heated(self, check_date: date) -> bool:
        """Berilgan sanada isitish bormih"""
        return check_date.strftime("%Y-%m-%d") not in self.excluded_dates

    def add_excluded_date(self, exclude_date: date):
        """Bir kunni o'chirish (isitish bo'lmagan)"""
        date_str = exclude_date.strftime("%Y-%m-%d")
        if date_str not in self.excluded_dates:
            self.excluded_dates.append(date_str)
            self.save()

    def remove_excluded_date(self, restore_date: date):
        """Bir kunni qaytarish (isitish bor)"""
        date_str = restore_date.strftime("%Y-%m-%d")
        if date_str in self.excluded_dates:
            self.excluded_dates.remove(date_str)
            self.save()

    def __str__(self):
        return (
            f"Kv.{self.apartment.number} — {self.period.name} "
            f"({self.heated_days} kun, {self.heated_area:.2f} m²)"
        )

    class Meta:
        verbose_name = "Isitish hisobi"
        verbose_name_plural = "Isitish hisoblari"
        unique_together = ("period", "apartment")


# ─────────────────────────────────────────────────
#  HOT WATER METER READING — GVS hisoblagich (kvartira)
# ─────────────────────────────────────────────────

class HotWaterMeterReading(models.Model):
    """
    Har kvartira uchun GVS (issiq suv) hisoblagich ko'rsatkichi.

    Misol (64V uy, kv.2, oktyabr):
      start_reading = 60  (30.09.2025)
      end_reading   = 73  (30.10.2025)
      consumption   = 13 kub

    Tarif hisobi:
      total_expenses     = 13_385_561 so'm (qozonxona + gaz + elektr)
      total_consumption  = 272.1 kub (barcha kvartiralar jami)
      tariff_per_m3      = 13_385_561 / 272.1 = 49_193.54 so'm/kub
      apartment_cost     = 13 × 49_193.54 = 639_516 so'm
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="hot_water_readings",
        verbose_name="Davr",
    )
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.CASCADE,
        related_name="hot_water_readings",
        verbose_name="Kvartira",
    )
    start_reading = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Boshlang'ich ko'rsatkich (kub)",
        help_text="Davr boshidagi hisoblagich ko'rsatkichi",
    )
    end_reading = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Oxirgi ko'rsatkich (kub)",
        help_text="Davr oxiridagi hisoblagich ko'rsatkichi",
    )

    @property
    def consumption(self):
        """Sarflangan issiq suv miqdori (kub)"""
        if self.start_reading is not None and self.end_reading is not None:
            diff = self.end_reading - self.start_reading
            return max(Decimal("0"), diff)
        # Agar boshlang'ich ko\'rsatkich yo\'q bo\'lsa — oxirgi ko\'rsatkich o'zi sarf
        if self.start_reading is None and self.end_reading is not None:
            return self.end_reading
        return Decimal("0")

    def __str__(self):
        return (
            f"GVS Kv.{self.apartment.number} — {self.period.name} "
            f"({self.consumption} kub)"
        )

    class Meta:
        verbose_name = "GVS hisoblagich ko'rsatkichi"
        verbose_name_plural = "GVS hisoblagich ko'rsatkichlari"
        unique_together = ("period", "apartment")


# ─────────────────────────────────────────────────
#  INVOICE — kvartira uchun hisob-faktura
# ─────────────────────────────────────────────────

class Invoice(models.Model):
    """
    Period yopilganda har kvartira uchun yaratiladigan hisob-faktura.
    Balansdan echib olinadi.

    Misol (64V uy, kv.3, dekabr isitish):
      heated_area        = 1922.4 m²
      cost_per_sqm       = 243.39 so'm/m²
      heating_amount     = 1922.4 × 243.39 = 467_890 so'm

    Misol (64V uy, kv.2, oktyabr GVS):
      consumption        = 13 kub
      tariff_per_m3      = 49_193.54 so'm/kub
      hot_water_amount   = 639_516 so'm
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="invoices",
        verbose_name="Davr",
    )
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.CASCADE,
        related_name="invoices",
        verbose_name="Kvartira",
    )
    owner_snapshot = models.CharField(
        max_length=255,
        verbose_name="Ega (vaqt kesimi)",
        help_text="Hisob yuborilgan paytdagi ega FIO — owner o'zgarsa ham saqlanadi",
    )

    # ─── ISITISH ma'lumotlari (null bo\'lishi mumkin — GVS yoki yo'q) ───
    heated_area = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Qizdirilgan maydon (m²·kun)",
    )
    heating_cost_per_sqm = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name="1 m² uchun narx (isitish)",
    )
    heating_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Isitish summasi (so'm)",
    )

    # ─── GVS ma'lumotlari ───
    hot_water_consumption = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="GVS sarfi (kub)",
    )
    hot_water_tariff = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name="GVS tarifi (so'm/kub)",
    )
    hot_water_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="GVS summasi (so'm)",
    )

    # ─── Umumiy ─────────────────────────────────────────────────────
    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="Jami summa (so'm)",
    )

    is_recalculated = models.BooleanField(
        default=False,
        verbose_name="Qayta hisoblanganmih",
    )
    recalculated_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Qayta hisoblash vaqti",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Hisob: Kv.{self.apartment.number} — {self.period.name} "
            f"— {self.total_amount} so'm"
        )

    class Meta:
        verbose_name = "Hisob-faktura"
        verbose_name_plural = "Hisob-fakturalar"
        unique_together = ("period", "apartment")


# ─────────────────────────────────────────────────
#  HEATING CALCULATION SUMMARY — uy bo'yicha umumiy natija
# ─────────────────────────────────────────────────

class HeatingCalculationSummary(models.Model):
    """
    Uy (yoki seksiya) bo'yicha ISITISH umumiy hisoblash natijasi.
    "Davrni yopish" vaqtida yaratiladi va saqlanadi.

    Misol (64V, dekabr):
      total_expenses     = 33_078_311 so'm
      total_heated_area  = 135_907.2 m²
      cost_per_sqm       = 243.39 so'm/m²
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="heating_summaries",
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="heating_summaries",
    )
    section = models.ForeignKey(
        BuildingSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="heating_summaries",
    )
    total_expenses = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        verbose_name="Umumiy xarajatlar (so'm)",
    )
    total_heated_area = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="Umumiy qizdirilgan maydon (m²·kun)",
    )
    cost_per_sqm = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        verbose_name="1 m²·kun narxi (so'm)",
    )
    calculated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Isitish xulosa: {self.building} — {self.period.name} "
            f"({self.cost_per_sqm} so'm/m²)"
        )

    class Meta:
        verbose_name = "Isitish hisoblash xulosasi"
        verbose_name_plural = "Isitish hisoblash xulosalari"


class HotWaterCalculationSummary(models.Model):
    """
    Uy (yoki seksiya) bo'yicha GVS umumiy hisoblash natijasi.

    Misol (64V, oktyabr):
      total_expenses       = 13_385_561 so'm
      total_consumption    = 272.1 kub
      tariff_per_m3        = 49_193.54 so'm/kub
    """
    period = models.ForeignKey(
        BillingPeriod,
        on_delete=models.CASCADE,
        related_name="hot_water_summaries",
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="hot_water_summaries",
    )
    section = models.ForeignKey(
        BuildingSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hot_water_summaries",
    )
    total_expenses = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        verbose_name="Umumiy xarajatlar (so'm)",
    )
    total_consumption = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Umumiy GVS sarfi (kub)",
    )
    tariff_per_m3 = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        verbose_name="1 kub tarifi (so'm)",
    )
    calculated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"GVS xulosa: {self.building} — {self.period.name} "
            f"({self.tariff_per_m3} so'm/kub)"
        )

    class Meta:
        verbose_name = "GVS hisoblash xulosasi"
        verbose_name_plural = "GVS hisoblash xulosalari"