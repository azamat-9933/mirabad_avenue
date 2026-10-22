from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from main_app.models import Apartment, Owner
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

    # The account the entry belongs to. Set on every entry; nullable only for rows older than
    # apartment accounts that could not be matched to an apartment.
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="transactions",
        verbose_name=_("Apartment"),
    )
    # Who held the account at the time; empty for charges posted while the apartment was vacant.
    owner = models.ForeignKey(
        Owner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
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
            f"{self.get_payment_type_display()} | {self.owner.fio if self.owner_id else self.apartment} | "
            f"{sign}{self.amount} UZS"
        )

    class Meta:
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
        ordering = ["-created_at"]


class PaymeTransaction(models.Model):
    """
    Payme to'lov tizimi bilan integratsiya uchun.
    One Payme Business transaction (Merchant API, payments/payme.py): created (1), then performed
    (2: the money is the ``transaction`` ledger row) or cancelled (-1; -2 after it was performed, when
    the money was taken back off the account).
    """
    STATE_CREATED = 1
    STATE_PERFORMED = 2
    STATE_CANCELLED = -1
    STATE_CANCELLED_AFTER_PERFORM = -2
    STATE_CHOICES = [
        (STATE_CREATED, _("Created")),
        (STATE_PERFORMED, _("Performed")),
        (STATE_CANCELLED, _("Cancelled")),
        (STATE_CANCELLED_AFTER_PERFORM, _("Cancelled after payment")),
    ]

    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="payme_data",
    )
    payme_id = models.CharField(max_length=255, unique=True, verbose_name=_("Payme transaction ID"))
    # When Payme created it (ms since 1970, Payme's clock): GetStatement selects by it.
    payme_time = models.BigIntegerField(default=0, db_index=True, verbose_name=_("Created in Payme (ms)"))
    account_id = models.CharField(
        max_length=255,
        verbose_name=_("Account entered in Payme"),
    )
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="payme_transactions",
        verbose_name=_("Apartment"),
    )
    amount_tiyin = models.BigIntegerField(verbose_name=_("Amount (tiyin)"))
    state = models.IntegerField(choices=STATE_CHOICES, default=STATE_CREATED, verbose_name=_("State"))
    # Payme's cancel reason: 1-3 and 10 Payme's failures, 4 timeout, 5 refund.
    reason = models.SmallIntegerField(null=True, blank=True, verbose_name=_("Cancel reason"))
    # Created while PAYME_SANDBOX was on: Payme's checks only, it never moves money.
    sandbox = models.BooleanField(default=False, verbose_name=_("Sandbox (test)"))
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


class ClickTransaction(models.Model):
    """One Click payment attempt: prepared, then confirmed (money on the apartment account) or cancelled.

    The money itself is the ``transaction`` ledger row, written once per Click payment
    (``click_paydoc_id``) however many attempts Click makes.
    """

    PROTOCOL_SHOP = "shop"            # SHOP API: Prepare / Complete, form-encoded
    PROTOCOL_ADVANCED = "advanced"    # Advanced Shop: getInfo / Prepare / Complete / Check / Compare, JSON
    PROTOCOL_CHOICES = [
        (PROTOCOL_SHOP, "SHOP API"),
        (PROTOCOL_ADVANCED, "Advanced Shop"),
    ]
    STATE_PREPARED = "prepared"
    STATE_CONFIRMED = "confirmed"
    STATE_CANCELLED = "cancelled"
    STATE_CHOICES = [
        (STATE_PREPARED, _("Prepared")),
        (STATE_CONFIRMED, _("Confirmed")),
        (STATE_CANCELLED, _("Cancelled")),
    ]

    protocol = models.CharField(max_length=10, choices=PROTOCOL_CHOICES)
    # SHOP API: click_trans_id; Advanced Shop: attempt_trans_id.
    click_trans_id = models.BigIntegerField(verbose_name=_("Click attempt ID"))
    click_paydoc_id = models.BigIntegerField(db_index=True, verbose_name=_("Click payment ID"))
    service_id = models.BigIntegerField(verbose_name=_("Click service ID"))
    account = models.CharField(max_length=64, verbose_name=_("Account entered in Click"))
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.PROTECT,
        related_name="click_transactions",
        verbose_name=_("Apartment"),
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2, verbose_name=_("Amount (UZS)"))
    state = models.CharField(max_length=12, choices=STATE_CHOICES, default=STATE_PREPARED, verbose_name=_("State"))
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="click_data",
        verbose_name=_("Ledger entry"),
    )
    error_note = models.CharField(max_length=255, blank=True, verbose_name=_("Click error note"))
    prepare_payload = models.JSONField(default=dict, verbose_name=_("Prepare request"))
    complete_payload = models.JSONField(default=dict, verbose_name=_("Complete request"))
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Click {self.click_paydoc_id} ({self.account}, {self.amount} UZS)"

    class Meta:
        verbose_name = _("Click transaction")
        verbose_name_plural = _("Click transactions")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["protocol", "click_trans_id"], name="click_transaction_attempt_unique"),
        ]
