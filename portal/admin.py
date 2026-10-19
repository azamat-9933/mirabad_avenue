from functools import wraps

from django.contrib import admin
from django.contrib.admin.actions import delete_selected as django_delete_selected

from .models import WorkspaceProfile
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
