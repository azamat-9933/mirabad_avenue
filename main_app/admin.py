from decimal import Decimal

from django import forms
from django.contrib import admin, messages
from django.contrib.admin.options import IS_POPUP_VAR
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.html import format_html

from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG, apply_account_change
from portal.audit import record_event
from portal.models import AuditEvent

from .models import DEFAULT_SECTOR_NAME, Apartment, Building, Complex, Owner


def admin_number(value, places=0):
    return format(value or 0, f",.{places}f")


def actor_username(request):
    return request.user.get_username() or "Admin"


# ── Balance entry (temporary) ────────────────────────────
# October 2026: operators type the balance each account carried over from the old books before the
# first billing period is closed. The owner will say when to remove this. An entry never writes the
# balance itself: the difference from the balance the operator saw goes through the ledger as an
# opening-balance adjustment under the operator's name (not counted as money received), so a payment
# that lands meanwhile is kept, and the Transactions and Audit events logs show who entered what.

BALANCE_HELP = "Debt with a minus sign (-150000), credit without it (50000). Saved in the transactions log under your name."


class BalanceEntryField(forms.DecimalField):
    """The account balance as the operator saw it (kept in a hidden field) and as they typed it."""

    def __init__(self, **kwargs):
        kwargs.setdefault("label", "Balance (UZS)")
        kwargs.setdefault("help_text", BALANCE_HELP)
        kwargs.setdefault("widget", forms.NumberInput(attrs={"step": "0.01", "style": "width: 10em"}))
        super().__init__(max_digits=14, decimal_places=2, required=False, show_hidden_initial=True, **kwargs)

    def has_changed(self, initial, data):
        # Left empty (or not sent) means "keep the balance".
        return data not in (None, "") and super().has_changed(initial, data)


def typed_balance(form, name="balance"):
    """(shown, typed) when the operator changed the balance field of a valid form, else None."""
    field = form.fields.get(name)
    if not isinstance(field, BalanceEntryField) or name not in form.changed_data:
        return None
    typed = form.cleaned_data.get(name)
    if typed is None:
        return None
    raw = field.hidden_widget().value_from_datadict(form.data, form.files, form[name].html_initial_name)
    try:
        shown = field.to_python(raw)
    except forms.ValidationError:
        shown = None
    if shown is None:
        shown = form.initial.get(name) or Decimal("0")
    return Decimal(shown), typed


def post_balance_entry(request, apartment, form, name="balance"):
    """Post the operator's balance entry for the apartment's account; None when nothing changed."""
    entry = typed_balance(form, name)
    if entry is None:
        return None
    shown, typed = entry
    if typed == shown:
        return None
    building = apartment.building
    with transaction.atomic():
        row = apply_account_change(
            apartment.pk,
            typed - shown,
            Transaction.TYPE_MANUAL,
            description=f"{OPENING_BALANCE_TAG} Balance entered in admin: {shown} → {typed} UZS.",
            created_by=actor_username(request),
        )
        owner = row.owner
        record_event(
            request,
            event_type=AuditEvent.TYPE_BALANCE,
            title="Balance entered in admin",
            message=(
                f"{owner.fio if owner else 'Vacant apartment'}, house {building.number}, apartment {apartment.number}"
                f"{f', account {apartment.personal_account}' if apartment.personal_account else ''}: "
                f"balance {row.balance_before} → {row.balance_after} UZS."
            ),
            complex=building.complex,
            building=building,
            apartment=apartment,
            owner=owner,
            metadata={
                "source": "admin_balance_entry",
                "transaction_id": row.pk,
                "shown": str(shown),
                "typed": str(typed),
                "amount": str(row.amount),
                "balance_before": str(row.balance_before),
                "balance_after": str(row.balance_after),
            },
        )
    return row


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
    still billed. A balance typed here is posted to the ledger (see post_balance_entry), never written.
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
    # Never saved as typed: the apartment is saved without it, then the entry is posted (save_formset).
    balance = BalanceEntryField()

    class Meta:
        model = Apartment
        fields = ("number", "personal_account", "area")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.is_new_apartment = self.instance._state.adding
        self.initial.setdefault("balance", Decimal("0") if self.is_new_apartment else self.instance.balance)
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
        if self.owner and not fio:
            # Emptying the columns must not silently delete a resident with their Telegram link.
            raise forms.ValidationError("The owner can't be removed here. To remove them, open the resident's page.")
        # The phone is optional: the abonent registry lists owners without one.
        if (phone or cleaned.get("owner_has_contract")) and not fio:
            self.add_error("owner_fio", "Enter the owner's full name.")
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


class ApartmentInline(admin.TabularInline):
    """Uy ichidagi kvartiralar va ularning egalari — bitta jadvalda"""
    model = Apartment
    form = ApartmentInlineForm
    fields = ("number", "personal_account", "area", "owner_fio", "owner_phone", "owner_has_contract", "balance")
    show_change_link = True
    verbose_name = "Kvartira"
    verbose_name_plural = "Kvartiralar"

    def get_extra(self, request, obj=None, **kwargs):
        # A new house starts with one empty row ready to fill in.
        return 0 if obj else 1

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("owner").order_by("pk")


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
        "house_name", "address", "operator",
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
        if db_field.name == "operator":
            # The operator looking after the house: any active portal account.
            kwargs["queryset"] = get_user_model().objects.filter(is_active=True).order_by("username")
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
                if instance._state.adding:
                    # A new account starts at zero; the typed balance is posted to the ledger below.
                    instance.balance = Decimal("0")
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
                # After the owner, so the ledger entry names the resident who holds the account.
                post_balance_entry(request, row.instance, row)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("complex", "operator").annotate(
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
        "number", "building", "personal_account", "area",
        "owner_link", "balance", "created_at",
    )
    list_display_links = ("number",)
    # Balances are typed right in the list (filter by house, or search by personal account or name).
    list_editable = ("balance",)
    list_per_page = 200
    ordering = ("building__number", "pk")
    list_filter   = ("building__complex", "building")
    search_fields = (
        "number",
        "personal_account",
        "building__number",
        "owner__fio",
        "owner__phone",
    )
    readonly_fields = ("created_at",)
    exclude = ("author",)
    # The resident is entered right on the apartment page, as on the house page.
    inlines = [OwnerInline]

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "balance":
            return BalanceEntryField()
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def get_readonly_fields(self, request, obj=None):
        return ("created_at",) if obj else ()

    def get_fields(self, request, obj=None):
        if obj:
            return ("number", "building", "personal_account", "area", "balance", "created_at")
        # A new apartment starts at zero; its balance is entered once it exists.
        return ("number", "building", "personal_account", "area")

    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = actor_username(request)
        save_apartment(obj)
        if change and form is not None:
            post_balance_entry(request, obj, form)

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

    def clean_telegram_id(self):
        value = (self.cleaned_data.get("telegram_id") or "").strip()
        if value and not value.isdigit():
            raise forms.ValidationError("Telegram ID is a number (digits only).")
        return value or None

    def clean_telegram_user(self):
        return (self.cleaned_data.get("telegram_user") or "").strip().lstrip("@") or None

    def _clean_telegram(self, cleaned):
        """Not connected, or no Telegram ID: the link is removed and every Telegram field is cleared."""
        if "telegram_status" not in self.fields:
            return
        if cleaned.get("telegram_status") != Owner.TELEGRAM_CONNECTED or not cleaned.get("telegram_id"):
            cleaned.update(
                telegram_status=Owner.TELEGRAM_NOT_CONNECTED, telegram_id=None, telegram_user=None, telegram_language=""
            )

    def clean(self):
        cleaned = super().clean()
        self._clean_telegram(cleaned)
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
        "balance",
        "telegram_status",
        "created_at",
    )
    list_display_links = ("fio",)
    # The account balance can be typed right in the list (see post_balance_entry).
    list_editable = ("balance",)
    list_per_page = 200
    list_filter   = ("apartment__building__complex", "apartment__building", "telegram_status")
    search_fields = ("fio", "phone", "telegram_user", "apartment__number", "apartment__personal_account")
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

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "balance":
            return BalanceEntryField()
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def get_readonly_fields(self, request, obj=None):
        # The bot links a resident; an operator can correct or remove the link of an existing one.
        if obj:
            return ("created_at", "balance_display")
        return ("created_at_note", "balance_display") + self.TELEGRAM_FIELDS

    def save_model(self, request, obj, form, change):
        moved = change and form is not None and "apartment" in form.changed_data
        if moved and typed_balance(form) is not None:
            # The balance the operator saw belongs to the old apartment; enter it again on the new one.
            self.message_user(
                request,
                "The balance was not changed because the apartment changed. Open the resident again to enter it.",
                messages.WARNING,
            )
            super().save_model(request, obj, form, change)
            return
        # Owner.save copies the apartment account's balance, so the typed value is never written.
        super().save_model(request, obj, form, change)
        if change and form is not None:
            post_balance_entry(request, obj.apartment, form)

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
        # A new resident takes over their apartment's account as it is; an existing one's balance can be
        # typed (posted to the ledger, see post_balance_entry).
        balance_fields = ("balance", "balance_display") if obj else ("balance_display",)
        balance_note = (
            "Positive balance means credit. Negative balance means debt. "
            "A new balance is saved in the transactions log under your name."
            if obj
            else "Positive balance means credit. Negative balance means debt. "
            "The resident takes over the apartment's balance; it can be changed after saving."
        )
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
            ("Balance", {"fields": balance_fields, "description": balance_note}),
            (
                "Telegram",
                {
                    "fields": self.TELEGRAM_FIELDS,
                    "description": (
                        "Filled in by the Telegram bot when the resident links their personal account there. "
                        "To unlink, set the status to Not connected (or clear the Telegram ID) and save: every "
                        "Telegram field is cleared and the bot asks them to register again. Several residents can "
                        "also be unlinked at once with the \"Disconnect Telegram\" action in the residents list."
                        if obj
                        else "Filled in by the Telegram bot when the resident links their personal account there."
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
