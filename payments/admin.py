from django.contrib import admin
from django.utils.html import format_html

from .models import PaymeTransaction, Transaction


# ══════════════════════════════════════════════════════
#  TRANSACTION  (Barcha to'lov va echishlar)
# ══════════════════════════════════════════════════════

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = (
        "created_at",
        "owner_link",
        "payment_type_badge",
        "amount_display",
        "balance_before_display",
        "balance_after_display",
        "description",
        "created_by",
    )
    list_filter   = (
        "payment_type",
        "owner__apartment__building__complex",
        "owner__apartment__building",
    )
    search_fields = (
        "owner__fio",
        "owner__phone",
        "description",
        "external_id",
    )
    date_hierarchy = "created_at"
    # Tranzaksiya o'zgartirilmaydi — tarix!
    readonly_fields = (
        "owner", "invoice",
        "payment_type",
        "amount",
        "balance_before", "balance_after",
        "external_id",
        "created_at", "created_by",
    )
    fieldsets = (
        (
            "To'lov ma'lumoti",
            {
                "fields": (
                    "owner", "payment_type", "amount",
                    "description", "invoice",
                )
            },
        ),
        (
            "Balans",
            {"fields": ("balance_before", "balance_after")},
        ),
        (
            "Sistema",
            {
                "fields": ("external_id", "created_at", "created_by"),
                "classes": ("collapse",),
            },
        ),
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        # Tranzaksiya faqat views.py orqali yaratiladi
        # (naqd pul uchun — AdminCashPaymentView)
        return False

    def has_change_permission(self, request, obj=None):
        return False  # Tarix o'zgartirilmaydi

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "owner",
                "owner__apartment",
                "owner__apartment__building",
                "invoice",
            )
        )

    # ── Kastom kolonkalar ───────────────────────────

    @admin.display(description="Ega")
    def owner_link(self, obj):
        url = f"/admin/main_app/owner/{obj.owner.pk}/change/"
        return format_html(
            '<a href="{}">{}</a>', url, obj.owner.fio
        )

    @admin.display(description="To'lov turi")
    def payment_type_badge(self, obj):
        styles = {
            Transaction.TYPE_PAYME:  ("#8e44ad", "💳 Payme"),
            Transaction.TYPE_CLICK:  ("#2471a3", "💳 Click"),
            Transaction.TYPE_CASH:   ("#1e8449", "💵 Naqd"),
            Transaction.TYPE_MANUAL: ("#7f8c8d", "✏️ Qo'lda"),
            Transaction.TYPE_CHARGE: ("#c0392b", "📋 Echish"),
        }
        color, label = styles.get(
            obj.payment_type, ("#555", obj.payment_type)
        )
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:12px;font-size:12px;font-weight:600;">{}</span>',
            color,
            label,
        )

    @admin.display(description="Summa")
    def amount_display(self, obj):
        if obj.amount > 0:
            return format_html(
                '<span style="color:#27ae60;font-weight:700;">+{:,.0f}</span>',
                obj.amount,
            )
        return format_html(
            '<span style="color:#e74c3c;font-weight:700;">{:,.0f}</span>',
            obj.amount,
        )

    @admin.display(description="Balans (oldin)")
    def balance_before_display(self, obj):
        return format_html(
            '<span style="color:#7f8c8d;">{:,.0f} so\'m</span>',
            obj.balance_before,
        )

    @admin.display(description="Balans (keyin)")
    def balance_after_display(self, obj):
        color = "#27ae60" if obj.balance_after >= 0 else "#e74c3c"
        return format_html(
            '<span style="color:{};font-weight:600;">{:,.0f} so\'m</span>',
            color,
            obj.balance_after,
        )


# ══════════════════════════════════════════════════════
#  PAYME TRANSACTION  (Payme callback ma'lumotlari)
# ══════════════════════════════════════════════════════

@admin.register(PaymeTransaction)
class PaymeTransactionAdmin(admin.ModelAdmin):
    list_display  = (
        "payme_id",
        "account_id",
        "amount_sum_display",
        "state_badge",
        "created_at",
        "performed_at",
        "cancelled_at",
    )
    list_filter   = ("state",)
    search_fields = ("payme_id", "account_id")
    date_hierarchy = "created_at"
    readonly_fields = (
        "payme_id", "account_id",
        "amount_tiyin", "state",
        "raw_payload",
        "created_at", "performed_at", "cancelled_at",
        "transaction",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description="Summa")
    def amount_sum_display(self, obj):
        sum_uzs = obj.amount_tiyin / 100
        return format_html(
            '<span style="font-weight:600;">{:,.0f} so\'m</span>', sum_uzs
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