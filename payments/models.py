from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
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
        (TYPE_CASH, _("Cash")),
        (TYPE_MANUAL, _("Manual")),
        (TYPE_CHARGE, _("Charge")),
    ]

    owner = models.ForeignKey(
        Owner,
        on_delete=models.CASCADE,
        related_name="transactions",
        verbose_name=_("Owner"),
    )
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
        verbose_name=_("Invoice"),
        help_text=_("Optional invoice linked to this transaction."),
    )
    payment_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name=_("Payment type"),
    )
    # To'lov: musbat = balans oshdi, manfiy = echib olindi
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name=_("Amount (UZS)"),
        help_text=_("Positive = incoming, negative = outgoing."),
    )
    balance_before = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name=_("Balance before"),
    )
    balance_after = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name=_("Balance after"),
    )
    description = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Description"),
    )
    # Payme / Click uchun external ID
    external_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        verbose_name=_("External system ID (Payme/Click)"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Created by"),
        help_text=_("Administrator name or system."),
    )

    def __str__(self):
        sign = "+" if self.amount > 0 else ""
        return (
            f"{self.get_payment_type_display()} | {self.owner.fio} | "
            f"{sign}{self.amount} UZS"
        )

    class Meta:
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
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
        verbose_name=_("Account (Owner ID)"),
    )
    amount_tiyin = models.BigIntegerField(verbose_name=_("Amount (tiyin)"))
    state = models.IntegerField(default=0, verbose_name=_("State"))
    raw_payload = models.JSONField(
        default=dict,
        verbose_name=_("Raw payload from Payme"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    performed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payme {self.payme_id}"

    class Meta:
        verbose_name = _("Payme transaction")
        verbose_name_plural = _("Payme transactions")
