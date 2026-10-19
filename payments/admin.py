from django.contrib import admin
from django.utils.html import format_html

from .models import PaymeTransaction


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


# The ledger (Transaction) is on the portal's Payments page; Payme's technical log stays here.
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
