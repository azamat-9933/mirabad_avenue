from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html

from .click import PaymentNotCancellable, cancel_confirmed_payment
from .models import ClickTransaction, PaymeTransaction, Transaction
from .services import OPENING_BALANCE_TAG, incoming_payment_q, is_incoming_payment


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


# How each ledger entry came in: the payment type, and for manual entries the tag the portal or
# admin wrote into the description.
ENTRY_KINDS = (
    ("[portal:card-credit]", "Card (terminal)"),
    ("[portal:terminal-credit]", "Card (terminal)"),
    ("[portal:transfer-credit]", "Card transfer"),
    ("[portal:balance-debit]", "Subtraction"),
    ("[billing:recalculation]", "Recalculation"),
    (OPENING_BALANCE_TAG, "Opening balance"),
)
TYPE_KINDS = {
    Transaction.TYPE_CASH: "Cash",
    Transaction.TYPE_CLICK: "Click",
    Transaction.TYPE_PAYME: "Payme",
    Transaction.TYPE_CHARGE: "Charge",
    Transaction.TYPE_MANUAL: "Manual",
}


def entry_kind(row) -> str:
    description = row.description or ""
    for tag, label in ENTRY_KINDS:
        if tag in description:
            return label
    return TYPE_KINDS.get(row.payment_type, row.payment_type)


class EntryKindFilter(admin.SimpleListFilter):
    title = "Entry kind"
    parameter_name = "kind"
    FILTERS = {
        "payments": ("Payments received", incoming_payment_q()),
        "opening": ("Opening balances", Q(description__contains=OPENING_BALANCE_TAG)),
        "subtractions": ("Subtractions", Q(description__contains="[portal:balance-debit]")),
        "charges": ("Charges (billing)", Q(payment_type=Transaction.TYPE_CHARGE)),
    }

    def lookups(self, request, model_admin):
        return [(key, label) for key, (label, _q) in self.FILTERS.items()]

    def queryset(self, request, queryset):
        entry = self.FILTERS.get(self.value())
        return queryset.filter(entry[1]) if entry else queryset


class OperatorFilter(admin.SimpleListFilter):
    """Who entered the row: an operator's username, Click, or System (billing)."""

    title = "Operator"
    parameter_name = "operator"

    def lookups(self, request, model_admin):
        names = (
            Transaction.objects.exclude(created_by="").order_by("created_by").values_list("created_by", flat=True).distinct()
        )
        return [(name, name) for name in names]

    def queryset(self, request, queryset):
        return queryset.filter(created_by=self.value()) if self.value() else queryset


# The ledger: every change of an apartment account, read-only. Who took how much from which resident
# and when — filter by operator, kind and date.
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "house_apartment",
        "personal_account",
        "owner_name",
        "kind",
        "amount_display",
        "balance_after_display",
        "operator",
    )
    list_filter = (EntryKindFilter, OperatorFilter, "payment_type", "apartment__building")
    search_fields = (
        "apartment__personal_account",
        "owner__fio",
        "owner__phone",
        "apartment__number",
        "created_by",
        "external_id",
        "description",
    )
    date_hierarchy = "created_at"
    list_select_related = ("apartment__building", "owner")
    list_per_page = 100
    ordering = ("-created_at", "-id")
    fields = (
        "created_at",
        "created_by",
        "apartment",
        "owner",
        "payment_type",
        "amount",
        "balance_before",
        "balance_after",
        "description",
        "external_id",
        "invoice",
    )

    def get_readonly_fields(self, request, obj=None):
        return self.fields

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="House / apartment", ordering="apartment__building__number")
    def house_apartment(self, obj):
        if not obj.apartment_id:
            return "—"
        return f"{obj.apartment.building.number} / {obj.apartment.number}"

    @admin.display(description="Personal account", ordering="apartment__personal_account")
    def personal_account(self, obj):
        return (obj.apartment.personal_account if obj.apartment_id else "") or "—"

    @admin.display(description="Resident", ordering="owner__fio")
    def owner_name(self, obj):
        return obj.owner.fio if obj.owner_id else "—"

    @admin.display(description="Kind")
    def kind(self, obj):
        return entry_kind(obj)

    @admin.display(description="Amount (UZS)", ordering="amount")
    def amount_display(self, obj):
        # Money received in green; charges and subtractions in red.
        color = "#27ae60" if is_incoming_payment(obj) else ("#e74c3c" if obj.amount < 0 else "#7f8c8d")
        sign = "+" if obj.amount > 0 else ""
        return format_html('<span style="color:{};font-weight:600;">{}{}</span>', color, sign, admin_number(obj.amount))

    @admin.display(description="Balance after (UZS)", ordering="balance_after")
    def balance_after_display(self, obj):
        return admin_number(obj.balance_after)

    @admin.display(description="Operator", ordering="created_by")
    def operator(self, obj):
        return obj.created_by or "—"


# Payme's transactions (Merchant API): created, then performed (the money is the ledger entry) or
# cancelled; Payme itself cancels a performed one (state -2), which takes the money back.
@admin.register(PaymeTransaction)
class PaymeTransactionAdmin(admin.ModelAdmin):
    list_display  = (
        "payme_id",
        "account_id",
        "apartment",
        "amount_sum_display",
        "state_badge",
        "created_at",
        "performed_at",
        "cancelled_at",
    )
    list_filter   = ("state",)
    search_fields = ("payme_id", "account_id", "apartment__personal_account")
    date_hierarchy = "created_at"
    list_select_related = ("apartment__building",)
    readonly_fields = (
        "payme_id", "payme_time", "account_id", "apartment",
        "amount_tiyin", "state", "reason",
        "raw_payload",
        "created_at", "performed_at", "cancelled_at",
        "transaction",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Summa")
    def amount_sum_display(self, obj):
        sum_uzs = obj.amount_tiyin / 100
        return format_html(
            '<span style="font-weight:600;">{} so\'m</span>', admin_number(sum_uzs)
        )

    @admin.display(description="Holat")
    def state_badge(self, obj):
        states = {
            1:  ("#f39c12", "Yangi"),
            2:  ("#27ae60", "Tasdiqlandi"),
            -1: ("#e74c3c", "Bekor"),
            -2: ("#c0392b", "Qaytarildi"),
        }
        color, label = states.get(obj.state, ("#95a5a6", str(obj.state)))
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:8px;font-size:12px;">{}</span>',
            color,
            label,
        )


# Click's attempts: Prepare holds one, Complete confirms it (the money is the ledger entry) or cancels it.
@admin.register(ClickTransaction)
class ClickTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "click_paydoc_id",
        "account",
        "apartment",
        "amount_display",
        "state_badge",
        "protocol",
        "created_at",
        "confirmed_at",
    )
    list_filter = ("state", "protocol")
    search_fields = ("click_paydoc_id", "click_trans_id", "account", "apartment__personal_account")
    date_hierarchy = "created_at"
    list_select_related = ("apartment__building",)
    ordering = ("-created_at",)

    def get_readonly_fields(self, request, obj=None):
        fields = [field.name for field in self.model._meta.fields]
        # The cancel button right under the state.
        fields.insert(fields.index("state") + 1, "cancel_action")
        return fields

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @staticmethod
    def _can_cancel(request):
        # Taking money off an account is a ledger entry.
        return request.user.has_perm("payments.add_transaction")

    def get_urls(self):
        return [
            path(
                "<path:object_id>/cancel-payment/",
                self.admin_site.admin_view(self.cancel_payment_view),
                name="payments_clicktransaction_cancel",
            ),
        ] + super().get_urls()

    def cancel_payment_view(self, request, object_id):
        """Click sends nothing when it cancels a paid payment: the operator takes the money back here."""
        if not self._can_cancel(request):
            raise PermissionDenied
        held = get_object_or_404(ClickTransaction.objects.select_related("apartment__building"), pk=object_id)
        change_url = reverse("admin:payments_clicktransaction_change", args=[held.pk])
        if request.method == "POST":
            try:
                cancel_confirmed_payment(held.pk, user=request.user, reason=request.POST.get("reason"))
            except PaymentNotCancellable as error:
                messages.error(request, str(error))
                return redirect(request.path if held.state == ClickTransaction.STATE_CONFIRMED else change_url)
            messages.success(request, "The Click payment was cancelled and its amount was taken off the balance.")
            return redirect(change_url)
        if held.state != ClickTransaction.STATE_CONFIRMED:
            messages.error(request, "Only a confirmed Click payment can be cancelled.")
            return redirect(change_url)
        balance = held.apartment.balance
        context = {
            **self.admin_site.each_context(request),
            "opts": self.model._meta,
            "object": held,
            "title": "Cancel Click payment",
            "owner": getattr(held.apartment, "owner", None),
            "amount": admin_number(held.amount),
            "balance": admin_number(balance),
            "balance_after": admin_number(balance - held.amount),
            "change_url": change_url,
        }
        return TemplateResponse(request, "admin/payments/clicktransaction/cancel_payment.html", context)

    @admin.display(description="Cancellation")
    def cancel_action(self, obj):
        if obj is None or obj.state != ClickTransaction.STATE_CONFIRMED:
            return "—"
        return format_html(
            '<a class="btn btn-sm btn-danger" href="{}">{}</a>',
            reverse("admin:payments_clicktransaction_cancel", args=[obj.pk]),
            "Cancel the payment",
        )

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Summa", ordering="amount")
    def amount_display(self, obj):
        return format_html("<span style=\"font-weight:600;\">{} so'm</span>", admin_number(obj.amount))

    @admin.display(description="Holat", ordering="state")
    def state_badge(self, obj):
        states = {
            ClickTransaction.STATE_PREPARED: ("#f39c12", "Kutilmoqda"),
            ClickTransaction.STATE_CONFIRMED: ("#27ae60", "Tasdiqlandi"),
            ClickTransaction.STATE_CANCELLED: ("#e74c3c", "Bekor"),
        }
        color, label = states.get(obj.state, ("#95a5a6", obj.state))
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:8px;font-size:12px;">{}</span>',
            color,
            label,
        )
