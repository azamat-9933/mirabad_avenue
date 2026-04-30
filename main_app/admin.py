from django import forms
from django.contrib import admin
from django.db.models import Count, Q, Sum
from django.urls import reverse
from django.utils.html import format_html

from .models import DEFAULT_SECTOR_NAME, Apartment, Building, BuildingSection, Complex, Owner


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


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
    list_display  = ("title", "buildings_count", "author", "created_at")
    search_fields = ("title",)
    readonly_fields = ("created_at",)
    inlines       = [BuildingInline]
    fields = ("title", "author", "created_at")

    def get_readonly_fields(self, request, obj=None):
        return ("created_at",) if obj else ()

    def save_model(self, request, obj, form, change):
        obj.address = DEFAULT_SECTOR_NAME
        super().save_model(request, obj, form, change)

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

    def get_readonly_fields(self, request, obj=None):
        return ("created_at", "total_area_display") if obj else ()

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

    def get_readonly_fields(self, request, obj=None):
        return ("created_at",) if obj else ()

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


class ApartmentSelect(forms.Select):
    def create_option(self, name, value, label, selected, index, subindex=None, attrs=None):
        option = super().create_option(name, value, label, selected, index, subindex, attrs)
        pk = getattr(value, "value", value)
        if pk:
            apartment = (
                Apartment.objects.select_related("building", "building__complex", "section")
                .filter(pk=pk)
                .first()
            )
            if apartment:
                option["attrs"].update(
                    {
                        "data-complex": str(apartment.building.complex_id),
                        "data-building": str(apartment.building_id),
                        "data-section": str(apartment.section_id or ""),
                    }
                )
        return option


class BuildingSelect(forms.Select):
    def create_option(self, name, value, label, selected, index, subindex=None, attrs=None):
        option = super().create_option(name, value, label, selected, index, subindex, attrs)
        pk = getattr(value, "value", value)
        if pk:
            building = Building.objects.filter(pk=pk).only("complex_id").first()
            if building:
                option["attrs"]["data-complex"] = str(building.complex_id)
        return option


class SectionSelect(forms.Select):
    def create_option(self, name, value, label, selected, index, subindex=None, attrs=None):
        option = super().create_option(name, value, label, selected, index, subindex, attrs)
        pk = getattr(value, "value", value)
        if pk:
            section = BuildingSection.objects.select_related("building").filter(pk=pk).first()
            if section:
                option["attrs"].update(
                    {
                        "data-complex": str(section.building.complex_id),
                        "data-building": str(section.building_id),
                    }
                )
        return option


class OwnerAdminForm(forms.ModelForm):
    complex_selector = forms.ModelChoiceField(
        label="Complex",
        queryset=Complex.objects.none(),
        required=False,
        help_text="Optional helper filter for selecting the apartment.",
    )
    building_selector = forms.ModelChoiceField(
        label="Building",
        queryset=Building.objects.none(),
        required=False,
        help_text="Optional helper filter for selecting the apartment.",
    )
    section_selector = forms.ModelChoiceField(
        label="Section",
        queryset=BuildingSection.objects.none(),
        required=False,
        help_text="Optional helper filter for selecting the apartment.",
    )

    class Meta:
        model = Owner
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = self.instance if self.instance and self.instance.pk else None

        apartment_qs = Apartment.objects.select_related(
            "building",
            "building__complex",
            "section",
        ).order_by("building__complex__title", "building__number", "section__name", "number")
        if instance:
            apartment_qs = apartment_qs.filter(Q(owner__isnull=True) | Q(pk=instance.apartment_id))
            apartment = instance.apartment
            self.fields["complex_selector"].initial = apartment.building.complex
            self.fields["building_selector"].initial = apartment.building
            self.fields["section_selector"].initial = apartment.section
        else:
            apartment_qs = apartment_qs.filter(owner__isnull=True)

        complex_ids = apartment_qs.values_list("building__complex_id", flat=True).distinct()
        building_ids = apartment_qs.values_list("building_id", flat=True).distinct()
        section_ids = apartment_qs.exclude(section__isnull=True).values_list("section_id", flat=True).distinct()

        self.fields["complex_selector"].queryset = Complex.objects.filter(pk__in=complex_ids).order_by("title")
        self.fields["building_selector"].queryset = Building.objects.filter(pk__in=building_ids).select_related(
            "complex"
        ).order_by("complex__title", "number")
        self.fields["building_selector"].widget = BuildingSelect(attrs=self.fields["building_selector"].widget.attrs)
        self.fields["building_selector"].widget.choices = self.fields["building_selector"].choices
        self.fields["section_selector"].queryset = BuildingSection.objects.filter(pk__in=section_ids).select_related(
            "building",
            "building__complex",
        ).order_by("building__complex__title", "building__number", "name")
        self.fields["section_selector"].widget = SectionSelect(attrs=self.fields["section_selector"].widget.attrs)
        self.fields["section_selector"].widget.choices = self.fields["section_selector"].choices

        self.fields["apartment"].queryset = apartment_qs
        self.fields["apartment"].help_text = (
            "Only apartments without an assigned owner are shown. "
            "To change an occupied apartment, edit the existing owner."
        )

        def apartment_label(apartment):
            section = apartment.section.name if apartment.section else "No section"
            return (
                f"{apartment.building.complex.title} / "
                f"{apartment.building.number} / {section} / Apt. {apartment.number}"
            )

        self.fields["apartment"].label_from_instance = apartment_label
        self.fields["apartment"].widget = ApartmentSelect(attrs=self.fields["apartment"].widget.attrs)
        self.fields["apartment"].widget.choices = self.fields["apartment"].choices

    def clean(self):
        cleaned = super().clean()
        apartment = cleaned.get("apartment")
        complex_obj = cleaned.get("complex_selector")
        building = cleaned.get("building_selector")
        section = cleaned.get("section_selector")
        if not apartment:
            return cleaned
        if complex_obj and apartment.building.complex_id != complex_obj.pk:
            self.add_error("apartment", "Selected apartment does not belong to this complex.")
        if building and apartment.building_id != building.pk:
            self.add_error("apartment", "Selected apartment does not belong to this building.")
        if section and apartment.section_id != section.pk:
            self.add_error("apartment", "Selected apartment does not belong to this section.")
        return cleaned


@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    form = OwnerAdminForm
    list_display  = (
        "id", "fio", "phone",
        "apartment_link",
        "has_contract",
        "balance_display",
        "telegram_status",
        "created_at",
    )
    list_filter   = ("apartment__building__complex", "apartment__building")
    search_fields = ("fio", "phone", "telegram_user", "apartment__number")
    readonly_fields = (
        "created_at",
        "balance_display",
    )
    fieldsets = (
        (
            "Personal data",
            {"fields": ("fio", "phone", "apartment")},
        ),
        (
            "Balance",
            {
                "fields": ("balance", "balance_display"),
                "description": (
                    "Positive balance means credit. "
                    "Negative balance means debt."
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

    def get_readonly_fields(self, request, obj=None):
        return ("created_at", "balance_display") if obj else ("created_at_note", "balance_display")

    def get_fieldsets(self, request, obj=None):
        fieldsets = [
            (
                "Personal data",
                {
                    "fields": (
                        "fio",
                        "phone",
                        "has_contract",
                        "complex_selector",
                        "building_selector",
                        "section_selector",
                        "apartment",
                    ),
                    "description": "Use complex, building and section as helpers, then select the exact apartment.",
                },
            ),
            (
                "Balance",
                {
                    "fields": ("balance", "balance_display"),
                    "description": (
                        "Positive balance means credit. "
                        "Negative balance means debt."
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
        ]
        fieldsets.append(
            (
                "System",
                {
                    "fields": ("created_at",) if obj else ("created_at_note",),
                    "classes": ("collapse",),
                },
            )
        )
        return tuple(fieldsets)

    @admin.display(description="Created at")
    def created_at_note(self, obj):
        return "Generated automatically after save."

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
        balance = getattr(obj, "balance", 0) or 0
        if balance > 0:
            color, icon = "#27ae60", "▲"
        elif balance < 0:
            color, icon = "#e74c3c", "▼"
        else:
            color, icon = "#7f8c8d", "●"

        return format_html(
            '<span style="color:{};font-weight:600;">{} {} UZS</span>',
            color,
            icon,
            admin_number(balance),
        )
