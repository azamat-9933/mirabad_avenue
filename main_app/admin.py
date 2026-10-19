from django import forms
from django.contrib import admin
from django.contrib.admin.options import IS_POPUP_VAR
from django.db.models import Count, Q, Sum
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.html import format_html

from .models import DEFAULT_SECTOR_NAME, Apartment, Building, Complex, Owner


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


def actor_username(request):
    return request.user.get_username() or "Admin"


def get_or_create_default_complex(request):
    sector = Complex.objects.order_by("pk").first()
    if sector:
        return sector
    return Complex.objects.create(
        title=DEFAULT_SECTOR_NAME,
        address=DEFAULT_SECTOR_NAME,
        author=actor_username(request),
    )


def save_apartment(apartment):
    """Save an apartment edited in admin without writing its balance.

    The account changes only through the ledger; writing back the copy loaded with the form
    would overwrite a payment posted while the admin form was being saved.
    """
    if apartment._state.adding:
        apartment.save()
        return
    apartment.save(
        update_fields=[
            field.name
            for field in Apartment._meta.concrete_fields
            if not field.primary_key and field.name != "balance"
        ]
    )


# ══════════════════════════════════════════════════════
#  INLINES
# ══════════════════════════════════════════════════════

class ApartmentInlineForm(forms.ModelForm):
    """One apartment row of the house page, together with the apartment's owner.

    Filling the owner columns creates the resident (or updates the existing one), so a new house
    can be set up from one page. Owner columns left empty keep the apartment vacant; its account is
    still billed. The balance is shown read-only: it changes only through ledger transactions.
    """

    owner_fio = forms.CharField(
        label="Owner full name",
        max_length=Owner._meta.get_field("fio").max_length,
        required=False,
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "Empty if vacant"}),
    )
    owner_phone = forms.CharField(
        label="Phone",
        max_length=Owner._meta.get_field("phone").max_length,
        required=False,
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "+998"}),
    )
    owner_has_contract = forms.BooleanField(label="Has contract", required=False)

    class Meta:
        model = Apartment
        fields = ("number", "area")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.is_new_apartment = self.instance._state.adding
        self.owner = None if self.is_new_apartment else getattr(self.instance, "owner", None)
        if self.owner:
            self.fields["owner_fio"].initial = self.owner.fio
            self.fields["owner_phone"].initial = self.owner.phone
            self.fields["owner_has_contract"].initial = self.owner.has_contract

    def clean(self):
        cleaned = super().clean()
        fio = (cleaned.get("owner_fio") or "").strip()
        phone = (cleaned.get("owner_phone") or "").strip()
        cleaned["owner_fio"], cleaned["owner_phone"] = fio, phone
        if self.owner and not (fio and phone):
            # Emptying the columns must not silently delete a resident with their Telegram link.
            raise forms.ValidationError("The owner can't be removed here. To remove them, open the resident's page.")
        if fio or phone or cleaned.get("owner_has_contract"):
            if not fio:
                self.add_error("owner_fio", "Enter the owner's full name.")
            if not phone:
                self.add_error("owner_phone", "Enter the owner's phone.")
        return cleaned

    def save_owner(self):
        """Create or update the owner from the row; the apartment is already saved."""
        apartment = self.instance
        fio = self.cleaned_data["owner_fio"]
        values = {
            "fio": fio,
            "phone": self.cleaned_data["owner_phone"],
            "has_contract": self.cleaned_data.get("owner_has_contract", False),
        }
        if self.owner:
            changed = [name for name, value in values.items() if getattr(self.owner, name) != value]
            for name in changed:
                setattr(self.owner, name, values[name])
            if changed:
                self.owner.save(update_fields=changed)
        elif fio:
            # A new owner takes over the apartment account as it is (Owner.save copies the balance).
            self.owner = Owner.objects.create(apartment=apartment, **values)


def balance_text(balance):
    return f"{admin_number(balance)} UZS"


class ApartmentInline(admin.TabularInline):
    """Uy ichidagi kvartiralar va ularning egalari — bitta jadvalda"""
    model = Apartment
    form = ApartmentInlineForm
    fields = ("number", "area", "owner_fio", "owner_phone", "owner_has_contract", "account_balance")
    readonly_fields = ("account_balance",)
    show_change_link = True
    verbose_name = "Kvartira"
    verbose_name_plural = "Kvartiralar"

    def get_extra(self, request, obj=None, **kwargs):
        # A new house starts with one empty row ready to fill in.
        return 0 if obj else 1

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("owner").order_by("pk")

    @admin.display(description="Balans (so'm)")
    def account_balance(self, obj):
        # Read-only: the account changes only through ledger transactions (payments, billing).
        return balance_text(obj.balance) if obj and obj.pk else "—"


class OwnerInline(admin.TabularInline):
    """The apartment's resident, added together with the apartment on its admin page."""
    model = Owner
    fields = ("fio", "phone", "has_contract", "telegram_status")
    readonly_fields = ("telegram_status",)
    # Removing a resident (and their Telegram link) is done on the resident's own page.
    can_delete = False
    max_num = 1
    verbose_name = "Resident"
    verbose_name_plural = "Resident"

    def get_extra(self, request, obj=None, **kwargs):
        # One empty row for a new or vacant apartment; none when it already has a resident.
        return 0 if obj is not None and Owner.objects.filter(apartment=obj).exists() else 1


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
    fields = ("title", "author", "created_at")

    def get_readonly_fields(self, request, obj=None):
        return ("created_at",) if obj else ()

    def save_model(self, request, obj, form, change):
        obj.address = DEFAULT_SECTOR_NAME
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, Building) and not instance.author:
                instance.author = actor_username(request)
            instance.save()
        formset.save_m2m()
        for instance in formset.deleted_objects:
            instance.delete()

    def response_add(self, request, obj, post_url_continue=None):
        if any(key in request.POST for key in ("_continue", "_addanother", IS_POPUP_VAR)):
            return super().response_add(request, obj, post_url_continue)
        return HttpResponseRedirect(reverse("admin_sector_redirect"))

    def response_change(self, request, obj):
        if any(key in request.POST for key in ("_continue", "_addanother", IS_POPUP_VAR)):
            return super().response_change(request, obj)
        return HttpResponseRedirect(reverse("admin_sector_redirect"))

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
        "house_name", "address",
        "apartments_count", "total_area_display", "created_at",
    )
    search_fields = ("number", "address", "complex__title")
    readonly_fields = ("created_at", "total_area_display")
    exclude = ("complex", "author")
    inlines       = [ApartmentInline]

    def get_readonly_fields(self, request, obj=None):
        return ("created_at", "total_area_display") if obj else ()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "complex":
            sector = get_or_create_default_complex(request)
            queryset = Complex.objects.filter(pk=sector.pk)
            kwargs.setdefault("initial", sector.pk)
            kwargs["queryset"] = queryset
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        obj.complex = get_or_create_default_complex(request)
        if not obj.author:
            obj.author = actor_username(request)
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        actor = actor_username(request)
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, Apartment):
                if not instance.author:
                    instance.author = actor
                save_apartment(instance)
            else:
                instance.save()
        formset.save_m2m()
        for instance in formset.deleted_objects:
            instance.delete()
        # Owners need the saved apartments; admin runs the whole save in one database transaction.
        deleted = formset.deleted_forms
        for row in formset.forms:
            if isinstance(row, ApartmentInlineForm) and row.instance.pk and row.has_changed() and row not in deleted:
                row.save_owner()

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("complex").annotate(
            _apt_count=Count("apartments")
        )

    @admin.display(description="Название дома", ordering="number")
    def house_name(self, obj):
        return obj.number

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
#  APARTMENT  (Kvartira)
# ══════════════════════════════════════════════════════

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    # Heating is not set here: it changes every month, so its dates are entered on the billing
    # period page ("Isitish sanalari").
    list_display  = (
        "number", "building", "area",
        "owner_link", "balance", "created_at",
    )
    list_display_links = ("number",)
    list_filter   = ("building__complex", "building")
    search_fields = (
        "number",
        "building__number",
        "owner__fio",
        "owner__phone",
    )
    readonly_fields = ("created_at",)
    exclude = ("author",)
    # The resident is entered right on the apartment page, as on the house page.
    inlines = [OwnerInline]

    def get_readonly_fields(self, request, obj=None):
        # The account balance changes only through the Transaction ledger.
        return ("balance", "created_at") if obj else ()

    def get_fields(self, request, obj=None):
        # The section decides which boiler room heats the apartment in a house with several.
        if obj:
            return ("number", "building", "section", "area", "balance", "created_at")
        return ("number", "building", "section", "area")

    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = actor_username(request)
        save_apartment(obj)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("building", "building__complex")
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
                Apartment.objects.select_related("building", "building__complex")
                .filter(pk=pk)
                .first()
            )
            if apartment:
                option["attrs"].update(
                    {
                        "data-complex": str(apartment.building.complex_id),
                        "data-building": str(apartment.building_id),
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

    class Meta:
        model = Owner
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = self.instance if self.instance and self.instance.pk else None

        structure_qs = Apartment.objects.select_related(
            "building",
            "building__complex",
        ).order_by("building__complex__title", "building__number", "number")
        apartment_qs = structure_qs
        if instance:
            apartment_qs = apartment_qs.filter(Q(owner__isnull=True) | Q(pk=instance.apartment_id))
            apartment = instance.apartment
            self.fields["complex_selector"].initial = apartment.building.complex
            self.fields["building_selector"].initial = apartment.building
        else:
            apartment_qs = apartment_qs.filter(owner__isnull=True)

        complex_ids = structure_qs.values_list("building__complex_id", flat=True).distinct()
        building_ids = structure_qs.values_list("building_id", flat=True).distinct()

        self.fields["complex_selector"].queryset = Complex.objects.filter(pk__in=complex_ids).order_by("title")
        self.fields["building_selector"].queryset = Building.objects.filter(pk__in=building_ids).select_related(
            "complex"
        ).order_by("complex__title", "number")
        self.fields["building_selector"].widget = BuildingSelect(attrs=self.fields["building_selector"].widget.attrs)
        self.fields["building_selector"].widget.choices = self.fields["building_selector"].choices

        self.fields["apartment"].queryset = apartment_qs
        if apartment_qs.exists():
            self.fields["apartment"].help_text = (
                "Only apartments without an assigned owner are shown. "
                "To change an occupied apartment, edit the existing owner."
            )
        else:
            self.fields["apartment"].help_text = (
                "No free apartments are available right now. "
                "Edit an existing resident if you need to reassign an occupied apartment."
            )
            self.fields["apartment"].empty_label = "No free apartments"

        if not instance:
            sector = Complex.objects.order_by("pk").first()
            if sector and self.fields["complex_selector"].queryset.filter(pk=sector.pk).exists():
                self.fields["complex_selector"].initial = sector

        def apartment_label(apartment):
            return (
                f"{apartment.building.complex.title} / "
                f"{apartment.building.number} / Apt. {apartment.number}"
            )

        self.fields["apartment"].label_from_instance = apartment_label
        self.fields["apartment"].widget = ApartmentSelect(attrs=self.fields["apartment"].widget.attrs)
        self.fields["apartment"].widget.choices = self.fields["apartment"].choices

    def clean(self):
        cleaned = super().clean()
        apartment = cleaned.get("apartment")
        complex_obj = cleaned.get("complex_selector")
        building = cleaned.get("building_selector")
        if not apartment:
            return cleaned
        if complex_obj and apartment.building.complex_id != complex_obj.pk:
            self.add_error("apartment", "Selected apartment does not belong to this complex.")
        if building and apartment.building_id != building.pk:
            self.add_error("apartment", "Selected apartment does not belong to this building.")
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
    list_display_links = ("fio",)
    list_filter   = ("apartment__building__complex", "apartment__building", "telegram_status")
    search_fields = ("fio", "phone", "telegram_user", "apartment__number")
    actions = ("disconnect_telegram",)
    readonly_fields = (
        "created_at",
        "balance_display",
    )
    # Filled in by the Telegram bot when the resident registers there with this phone.
    TELEGRAM_FIELDS = ("telegram_status", "telegram_user", "telegram_id", "telegram_language")
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
        # After creation the balance changes only through the Transaction ledger.
        fields = ("created_at", "balance", "balance_display") if obj else ("created_at_note", "balance_display")
        return fields + self.TELEGRAM_FIELDS

    @admin.action(description="Disconnect Telegram")
    def disconnect_telegram(self, request, queryset):
        queryset.update(
            telegram_id=None,
            telegram_user=None,
            telegram_language="",
            telegram_status=Owner.TELEGRAM_NOT_CONNECTED,
        )
        self.message_user(request, "Telegram was disconnected for the selected residents.")

    def get_fieldsets(self, request, obj=None):
        # No balance input, not even when adding: the resident takes over their apartment's account,
        # which changes only through ledger transactions (payments and adjustments in the portal).
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
                        "apartment",
                    ),
                    "description": "Use complex and building as helpers, then select the exact apartment.",
                },
            ),
            (
                "Balance",
                {
                    "fields": ("balance_display",),
                    "description": (
                        "Positive balance means credit. Negative balance means debt. "
                        "To change the balance, add a payment or adjustment in the portal (Add payment)."
                    ),
                },
            ),
            (
                "Telegram",
                {
                    "fields": self.TELEGRAM_FIELDS,
                    "description": (
                        "Filled in by the Telegram bot when the resident registers there with this phone number. "
                        "To unlink, use the \"Disconnect Telegram\" action in the residents list."
                    ),
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
            '<span data-owner-balance-preview style="color:{};font-weight:600;">{} {} UZS</span>',
            color,
            icon,
            admin_number(balance),
        )
