from django.contrib import admin
from django.db.models import Count, Sum
from django.urls import reverse
from django.utils.html import format_html

from .models import Apartment, Building, BuildingSection, Complex, Owner


# ══════════════════════════════════════════════════════
#  INLINES
# ══════════════════════════════════════════════════════

class BuildingSectionInline(admin.TabularInline):
    """Uyning seksiyalari — 66-uy: A1, A5, A7..."""
    model = BuildingSection
    extra = 1
    fields = ("name",)
    verbose_name = "Seksiya"
    verbose_name_plural = "Seksiyalar"


class ApartmentInline(admin.TabularInline):
    """Uy ichidagi kvartiralar — qisqacha ko'rinish"""
    model = Apartment
    extra = 0
    fields = ("number", "area", "section")
    show_change_link = True
    verbose_name = "Kvartira"
    verbose_name_plural = "Kvartiralar"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("section")


class BuildingInline(admin.TabularInline):
    """Turar joy majmuasi ichidagi uylar"""
    model = Building
    extra = 0
    fields = ("number", "address")
    show_change_link = True
    verbose_name = "Uy"
    verbose_name_plural = "Uylar"


# ══════════════════════════════════════════════════════
#  COMPLEX  (Turar joy majmuasi)
# ══════════════════════════════════════════════════════

@admin.register(Complex)
class ComplexAdmin(admin.ModelAdmin):
    list_display  = ("title", "address", "buildings_count", "author", "created_at")
    search_fields = ("title", "address")
    readonly_fields = ("created_at",)
    inlines       = [BuildingInline]

    # ── kastom kolonka ──────────────────────────────
    @admin.display(description="Uylar soni")
    def buildings_count(self, obj):
        count = obj.buildings.count()
        url   = (
            reverse("admin:main_app_building_changelist")
            + f"hcomplex__id__exact={obj.pk}"
        )
        return format_html(
            '<a href="{}">'
            '<span style="background:#4e73df;color:#fff;padding:2px 10px;'
            'border-radius:12px;font-size:12px;">{} ta uy</span>'
            "</a>",
            url,
            count,
        )


# ══════════════════════════════════════════════════════
#  BUILDING  (Uy / Ko'p qavatli)
# ══════════════════════════════════════════════════════

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display  = (
        "number", "complex", "address",
        "apartments_count", "total_area_display", "created_at",
    )
    list_filter   = ("complex",)
    search_fields = ("number", "address", "complex__title")
    readonly_fields = ("created_at", "total_area_display")
    inlines       = [BuildingSectionInline, ApartmentInline]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("complex").annotate(
            _apt_count=Count("apartments")
        )

    @admin.display(description="Kvartiralar soni", ordering="_apt_count")
    def apartments_count(self, obj):
        url = (
            reverse("admin:main_app_apartment_changelist")
            + f"hbuilding__id__exact={obj.pk}"
        )
        return format_html(
            '<a href="{}">{} ta</a>', url, obj._apt_count
        )

    @admin.display(description="Umumiy maydon (m²)")
    def total_area_display(self, obj):
        total = obj.apartments.aggregate(s=Sum("area"))["s"] or 0
        return f"{total:,.2f} m²"


# ══════════════════════════════════════════════════════
#  BUILDING SECTION
# ══════════════════════════════════════════════════════

@admin.register(BuildingSection)
class BuildingSectionAdmin(admin.ModelAdmin):
    list_display  = ("name", "building", "building__complex", "apartments_count")
    list_filter   = ("building__complex", "building")
    search_fields = ("name", "building__number")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "building", "building__complex"
        ).annotate(_apt_count=Count("apartments"))

    @admin.display(description="Kvartiralar soni")
    def apartments_count(self, obj):
        return obj._apt_count

    @admin.display(description="Kompleks")
    def building__complex(self, obj):
        return obj.building.complex


# ══════════════════════════════════════════════════════
#  APARTMENT  (Kvartira)
# ══════════════════════════════════════════════════════

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display  = (
        "number", "building", "section", "area",
        "owner_link", "created_at",
    )
    list_filter   = ("building__complex", "building", "section")
    search_fields = (
        "number",
        "building__number",
        "owner__fio",
        "owner__phone",
    )
    readonly_fields = ("created_at",)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("building", "building__complex", "section")
        )

    @admin.display(description="Ega")
    def owner_link(self, obj):
        try:
            owner = obj.owner
            url   = reverse("admin:main_app_owner_change", args=[owner.pk])
            return format_html('<a href="{}">{}</a>', url, owner.fio)
        except Exception:
            return format_html(
                '<span style="color:#e74c3c;font-size:12px;">Ega yo\'q</span>'
            )


# ══════════════════════════════════════════════════════
#  OWNER  (Kvartira egasi)
# ══════════════════════════════════════════════════════

@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display  = (
        "fio", "phone",
        "apartment_link",
        "balance_display",
        "telegram_status",
        "created_at",
    )
    list_filter   = ("apartment__building__complex", "apartment__building")
    search_fields = ("fio", "phone", "telegram_user", "apartment__number")
    readonly_fields = (
        "created_at",
        "balance_display",
        "telegram_id",
        "telegram_status",
        "telegram_user",
    )
    fieldsets = (
        (
            "Shaxsiy ma'lumot",
            {"fields": ("fio", "phone", "apartment")},
        ),
        (
            "Balans",
            {
                "fields": ("balance", "balance_display"),
                "description": (
                    "Musbat — ortiqcha to'lov. "
                    "Manfiy — qarz."
                ),
            },
        ),
        (
            "Telegram",
            {
                "fields": (
                    "telegram_id",
                    "telegram_user",
                    "telegram_status",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Sistema",
            {"fields": ("created_at",), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "apartment",
                "apartment__building",
                "apartment__building__complex",
            )
        )

    @admin.display(description="Kvartira")
    def apartment_link(self, obj):
        url = reverse("admin:main_app_apartment_change", args=[obj.apartment.pk])
        return format_html(
            '<a href="{}">{} / {}</a>',
            url,
            obj.apartment.building.number,
            obj.apartment.number,
        )

    @admin.display(description="Balans (so'm)")
    def balance_display(self, obj):
        balance = obj.balance or 0
        if balance > 0:
            color, icon = "#27ae60", "▲"
        elif balance < 0:
            color, icon = "#e74c3c", "▼"
        else:
            color, icon = "#7f8c8d", "●"

        return format_html(
            '<span style="color:{};font-weight:600;">{} {:,.0f} so\'m</span>',
            color,
            icon,
            balance,
        )