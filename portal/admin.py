from functools import wraps

from django.contrib import admin
from django.contrib.admin.actions import delete_selected as django_delete_selected
from django.utils.html import format_html

from .models import (
    AuditEvent,
    ChecklistItem,
    ChecklistNote,
    PortalNotification,
    PortalStatusOverride,
    WorkspaceProfile,
)
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


class SeverityBadgeMixin:
    severity_colors = {
        "critical": ("#F75F5F", "rgba(247,95,95,.14)"),
        "warning": ("#F5A623", "rgba(245,166,35,.16)"),
        "info": ("#4F8EF7", "rgba(79,142,247,.14)"),
    }

    @admin.display(description="Severity")
    def severity_badge(self, obj):
        fg, bg = self.severity_colors.get(obj.severity, ("#8B90A0", "rgba(139,144,160,.14)"))
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;'
            'border-radius:999px;background:{};color:{};font-weight:700;font-size:11px;'
            'letter-spacing:.04em;text-transform:uppercase;">{}</span>',
            bg,
            fg,
            obj.get_severity_display(),
        )


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


@admin.register(PortalNotification)
class PortalNotificationAdmin(SeverityBadgeMixin, admin.ModelAdmin):
    list_display = ("title", "severity_badge", "status", "created_by", "assignee", "telegram_status", "event_at")
    list_filter = ("severity", "status", "pinned", "assignee", "telegram_status")
    search_fields = ("title", "message", "complex__title", "building__number", "owner__fio")
    list_editable = ("status",)
    date_hierarchy = "event_at"
    autocomplete_fields = ("complex", "building", "apartment", "owner", "created_by", "assignee")
    readonly_fields = ("resolved_by", "resolved_at", "telegram_status")
    fieldsets = (
        ("Content", {"fields": ("title", "message", "severity", "status", "pinned", "event_at")}),
        ("Task", {"fields": ("created_by", "assignee", "telegram_status", "resolved_by", "resolved_at")}),
        ("Actions", {"fields": ("action_primary", "action_secondary", "action_state")}),
        ("Relations", {"fields": ("complex", "building", "apartment", "owner")}),
    )


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ("title", "scope", "tag", "done", "sort_order", "is_active")
    list_filter = ("scope", "tag", "done", "is_active")
    list_editable = ("done", "sort_order", "is_active")
    search_fields = ("title", "detail", "tag")


@admin.register(ChecklistNote)
class ChecklistNoteAdmin(admin.ModelAdmin):
    list_display = ("created_at", "short_text", "scope", "done", "created_by")
    list_filter = ("done", "scope", "created_by")
    list_editable = ("done",)
    search_fields = ("text", "template_key", "scope", "created_by__username")
    autocomplete_fields = ("created_by",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Note", {"fields": ("text", "template_key", "scope", "done", "created_by")}),
        ("Timeline", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="Text")
    def short_text(self, obj):
        return obj.text[:90]


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    """Operator activity log for the head administrator. Append-only: nobody can add, edit or delete rows here."""

    list_display = ("created_at", "operator", "event_type", "title", "ip_address", "owner", "building")
    list_filter = ("user", "event_type", ("created_at", admin.DateFieldListFilter), "building")
    search_fields = ("title", "message", "actor", "user__username", "user__first_name", "user__last_name", "owner__fio", "building__number", "apartment__number")
    date_hierarchy = "created_at"
    list_select_related = ("user", "owner", "building")
    list_per_page = 50
    readonly_fields = ("created_at", "user", "actor", "ip_address", "event_type", "title", "message", "complex", "building", "apartment", "owner", "metadata")
    fieldsets = (
        ("Who and when", {"fields": ("created_at", "user", "actor", "ip_address")}),
        ("Event", {"fields": ("event_type", "title", "message")}),
        ("Relations", {"fields": ("complex", "building", "apartment", "owner")}),
        ("Details", {"fields": ("metadata",)}),
    )

    @admin.display(description="Operator", ordering="actor")
    def operator(self, obj):
        if obj.user_id:
            full_name = obj.user.get_full_name().strip()
            return f"{full_name} ({obj.user.get_username()})" if full_name else obj.user.get_username()
        return obj.actor

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PortalStatusOverride)
class PortalStatusOverrideAdmin(admin.ModelAdmin):
    list_display = ("context", "target_type", "target_id", "status_value", "created_by", "updated_at")
    list_filter = ("context", "target_type", "status_value")
    search_fields = ("status_value", "note")
    autocomplete_fields = ("created_by",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Target", {"fields": ("context", "target_type", "target_id", "status_value")}),
        ("Details", {"fields": ("note", "created_by")}),
        ("Timeline", {"fields": ("created_at", "updated_at")}),
    )

