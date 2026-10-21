from functools import wraps

from django.contrib import admin
from django.contrib.admin.actions import delete_selected as django_delete_selected

from .models import AuditEvent, WorkspaceProfile
from .signals import deletion_entry, deletions_logged_by_action, record_admin_deletion


@wraps(django_delete_selected)
def delete_selected(modeladmin, request, queryset):
    """Django's "Delete selected" for every model, plus one activity-log entry per deleted object.

    Django bulk-creates the LogEntry rows of a multi-object deletion, which sends no post_save, so the
    LogEntry receiver alone would miss them. The entries are taken before the action deletes the objects.
    """
    entries = [deletion_entry(obj) for obj in queryset]
    with deletions_logged_by_action():
        response = django_delete_selected(modeladmin, request, queryset)
    # None means the deletion was confirmed and done; a page means the confirmation or refusal page.
    if response is None:
        for entry in entries:
            record_admin_deletion(request.user, entry)
    return response


admin.site.add_action(delete_selected, "delete_selected")


# The operators' activity log, read-only: balance changes, payments, billing periods, exports,
# sign-ins and admin edits — who, when, from which address.
@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "actor", "event_type", "title", "short_message", "place", "ip_address")
    list_filter = ("event_type", ("user", admin.RelatedOnlyFieldListFilter), "building")
    search_fields = ("title", "message", "actor", "owner__fio", "apartment__personal_account", "apartment__number")
    date_hierarchy = "created_at"
    list_select_related = ("building", "apartment")
    list_per_page = 100
    ordering = ("-created_at", "-id")
    fields = (
        "created_at",
        "actor",
        "user",
        "ip_address",
        "event_type",
        "title",
        "message",
        "building",
        "apartment",
        "owner",
        "metadata",
    )

    def get_readonly_fields(self, request, obj=None):
        return self.fields

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Message")
    def short_message(self, obj):
        text = obj.message or ""
        return text if len(text) <= 140 else f"{text[:139]}…"

    @admin.display(description="House / apartment")
    def place(self, obj):
        if obj.apartment_id:
            return f"{obj.building.number if obj.building_id else '?'} / {obj.apartment.number}"
        return obj.building.number if obj.building_id else "—"


@admin.register(WorkspaceProfile)
class WorkspaceProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "workspace_name", "role_label", "status", "telegram_connected", "updated_at")
    list_filter = ("status", "session_status", "two_factor_enabled", "workspace_name")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "workspace_name", "organization", "telegram_username")
    autocomplete_fields = ("user",)
    # The operator links Telegram from the portal profile through the bot; admin can only disconnect it.
    readonly_fields = ("telegram_chat_id", "telegram_username", "telegram_language", "telegram_linked_at")
    actions = ["disconnect_telegram"]
    fieldsets = (
        ("User", {"fields": ("user", "role_label", "status")}),
        ("Workspace", {"fields": ("workspace_name", "organization", "access_level", "timezone_name")}),
        ("Security", {"fields": ("two_factor_enabled", "session_status")}),
        ("Telegram (alerts)", {"fields": ("telegram_chat_id", "telegram_username", "telegram_language", "telegram_linked_at")}),
        ("Portal note", {"fields": ("note",)}),
    )

    @admin.display(boolean=True, description="Telegram")
    def telegram_connected(self, obj):
        return bool(obj.telegram_chat_id)

    @admin.action(description="Disconnect Telegram")
    def disconnect_telegram(self, request, queryset):
        updated = queryset.update(
            telegram_chat_id=None, telegram_username="", telegram_linked_at=None,
            telegram_link_token="", telegram_link_requested_at=None,
        )
        self.message_user(request, f"Telegram disconnected for {updated} operator(s).")
