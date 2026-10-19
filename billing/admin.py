"""Billing in the admin: only boiler rooms. Periods, their expenses, gas meters, heating and hot water
rows, invoices and summaries are managed on the portal's billing period pages."""
from django import forms
from django.contrib import admin

from .models import BoilerRoom


class BoilerRoomForm(forms.ModelForm):
    class Meta:
        model = BoilerRoom
        fields = ("building", "name", "sections")

    def clean(self):
        cleaned = super().clean()
        building, sections = cleaned.get("building"), cleaned.get("sections")
        if building and sections:
            foreign = [section.name for section in sections if section.building_id != building.pk]
            if foreign:
                self.add_error("sections", f"Bu seksiyalar boshqa uyniki: {', '.join(foreign)}.")
            taken = BoilerRoom.objects.filter(sections__in=sections).exclude(pk=self.instance.pk).distinct()
            if taken:
                self.add_error(
                    "sections",
                    "Seksiya bitta qozonxonaga tegishli bo'ladi; band: " + ", ".join(room.name for room in taken) + ".",
                )
        return cleaned


@admin.register(BoilerRoom)
class BoilerRoomAdmin(admin.ModelAdmin):
    """Boiler rooms: a building with several is billed for heating per boiler room (its sections)."""

    form = BoilerRoomForm
    list_display = ("name", "building", "sections_list")
    list_filter = ("building",)
    search_fields = ("name", "building__number")
    filter_horizontal = ("sections",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("building").prefetch_related("sections")

    @admin.display(description="Seksiyalar")
    def sections_list(self, obj):
        return ", ".join(section.name for section in obj.sections.all()) or "—"
