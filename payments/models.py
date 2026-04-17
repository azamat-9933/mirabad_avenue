from decimal import Decimal
from django.db import models
from main_app.models import Owner
from billing.models import Invoice


class Transaction(models.Model):
    """
    Barcha to'lovlar va balans o'zgarishlari shu erda saqlanadi.

    To'lov turlari:
      - Payme / Click orqali — avtomatik
      - Naqd pul — administrator qo'shadi
      - Sistemadan echish — invoice yopilganda

    Har bir transaction owner.balance ni o'zgartiradi.
    """
    TYPE_PAYME = "payme"
    TYPE_CLICK = "click"
    TYPE_CASH = "cash"
    TYPE_MANUAL = "manual"       # Administrator qo'shgan
    TYPE_CHARGE = "charge"       # Invoice yopilganda echish

    TYPE_CHOICES = [
        (TYPE_PAYME, "Payme"),
        (TYPE_CLICK, "Click"),
        (TYPE_CASH, "Naqd pul"),
        (TYPE_MANUAL, "Qo'lda kiritilgan"),
        (TYPE_CHARGE, "Hisobdan echish"),
    ]

    owner = models.ForeignKey(
        Owner,
        on_delete=models.CASCADE,
        related_name="transactions",
        verbose_name="Ega",
    )
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
        verbose_name="Hisob-faktura",
        help_text="Agar bu to'lov konkret invoice uchun bo'lsa",
    )
    payment_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name="To'lov turi",
    )
    # To'lov: musbat = balans oshdi, manfiy = echib olindi
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="Summa (so'm)",
        help_text="Musbat = kirim, manfiy = chiqim",
    )
    balance_before = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="To'lovdan oldingi balans",
    )
    balance_after = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="To'lovdan keyingi balans",
    )
    description = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Izoh",
    )
    # Payme / Click uchun external ID
    external_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        verbose_name="Tashqi tizim ID (Payme/Click)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Kim tomonidan",
        help_text="Administrator ismi yoki 'system'",
    )

    def __str__(self):
        sign = "+" if self.amount > 0 else ""
        return (
            f"{self.get_payment_type_display()} | {self.owner.fio} | "
            f"{sign}{self.amount} so'm"
        )

    class Meta:
        verbose_name = "To'lov tranzaksiya"
        verbose_name_plural = "To'lov tranzaksiyalari"
        ordering = ["-created_at"]


class PaymeTransaction(models.Model):
    """
    Payme to'lov tizimi bilan integratsiya uchun.
    Payme callback ma'lumotlarini saqlaydi.
    (Integrasiya keyinroq qo'shiladi)
    """
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="payme_data",
    )
    payme_id = models.CharField(max_length=255, unique=True)
    account_id = models.CharField(
        max_length=255,
        verbose_name="Account (Owner ID)",
    )
    amount_tiyin = models.BigIntegerField(verbose_name="Summa (tiyin)")
    state = models.IntegerField(default=0, verbose_name="Holat")
    raw_payload = models.JSONField(
        default=dict,
        verbose_name="Payme dan kelgan xom ma'lumot",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    performed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payme {self.payme_id}"

    class Meta:
        verbose_name = "Payme tranzaksiya"
        verbose_name_plural = "Payme tranzaksiyalari"