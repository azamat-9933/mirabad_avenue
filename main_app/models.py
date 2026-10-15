from decimal import Decimal

from django.db import models


DEFAULT_SECTOR_NAME = "Mirabad Avenue"


class Complex(models.Model):
    """Turar joy majmuasi — Mirabad Avenue kabi"""
    title = models.CharField(max_length=255, verbose_name="Nomi")
    address = models.CharField(max_length=255, verbose_name="Manzili")
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.CharField(max_length=255, verbose_name="Yaratuvchi")

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.address = DEFAULT_SECTOR_NAME
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Turar joy majmuasi"
        verbose_name_plural = "Turar joy majmualari"


class Building(models.Model):
    """Ko'p qavatli uy (uy). Masalan: 64-V, 66, 60V"""
    number = models.CharField(max_length=50, verbose_name="Uy raqami")
    address = models.CharField(max_length=255, blank=True, verbose_name="Manzil")
    complex = models.ForeignKey(
        Complex,
        on_delete=models.CASCADE,
        related_name="buildings",
        verbose_name="Turar joy majmuasi",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.CharField(max_length=255, verbose_name="Yaratuvchi")

    def __str__(self):
        return f"Uy {self.number} ({self.complex.title})"

    def total_area(self):
        """Uydagi barcha kvartiralarning umumiy maydoni"""
        return sum(a.area for a in self.apartments.all())

    class Meta:
        verbose_name = "House"
        verbose_name_plural = "Houses"


class BuildingSection(models.Model):
    """
    Bir uyning seksiyasi/kirish qismi.
    Masalan: uy 66 da A1 va A5 seksiyalari alohida gaz hisoblagichlarga ega.
    Agar uyda seksiya bo'lmasa, bu model ishlatilmaydi.
    """
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="sections",
        verbose_name="Uy",
    )
    name = models.CharField(max_length=50, verbose_name="Seksiya nomi")  # A1, A5, A7...

    def __str__(self):
        return f"{self.building} — {self.name}"

    class Meta:
        verbose_name = "Seksiya"
        verbose_name_plural = "Seksiyalar"
        unique_together = ("building", "name")


class Apartment(models.Model):
    """Kvartira — har bir uydagi ayrim xona"""
    number = models.CharField(max_length=50, verbose_name="Kvartira raqami")
    area = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Maydon (m²)")
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="apartments",
        verbose_name="Uy",
    )
    section = models.ForeignKey(
        BuildingSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="apartments",
        verbose_name="Seksiya",
    )
    # The billing account belongs to the apartment: charges are posted here even while it has
    # no owner, and an owner always sees this balance. Changed only through payments.services.
    balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="Hisob balansi (so'm)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.CharField(max_length=255, verbose_name="Yaratuvchi")

    def __str__(self):
        return f"Kv. {self.number} ({self.building})"

    class Meta:
        verbose_name = "Apartment"
        verbose_name_plural = "Apartments"


class Owner(models.Model):
    """Kvartira egasi — Payme orqali to'lovni shu model qabul qiladi"""
    fio = models.CharField(max_length=255, verbose_name="FIO")
    phone = models.CharField(max_length=20, verbose_name="Telefon")
    apartment = models.OneToOneField(
        Apartment,
        on_delete=models.CASCADE,
        related_name="owner",
        verbose_name="Kvartira",
    )
    # Balans — musbat = ortiqcha to'lov, manfiy = qarz
    balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        verbose_name="Balans (so'm)",
    )
    has_contract = models.BooleanField(
        default=False,
        verbose_name="Dogovor bor",
    )
    # Payme / Click uchun unikal ID — owner.id dan foydalanamiz
    # Telegram integratsiyasi
    telegram_id = models.CharField(max_length=255, null=True, blank=True)
    telegram_status = models.CharField(max_length=50, null=True, blank=True)
    telegram_user = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.fio

    def save(self, *args, **kwargs):
        # The owner's balance mirrors the apartment account. A new owner takes over whatever the
        # apartment already owes (or has prepaid); the ledger saves balance-only updates itself.
        update_fields = kwargs.get("update_fields")
        if self.apartment_id and (update_fields is None or "apartment" in update_fields):
            self.balance = (
                Apartment.objects.filter(pk=self.apartment_id).values_list("balance", flat=True).first()
                or Decimal("0")
            )
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Resident"
        verbose_name_plural = "Residents"
