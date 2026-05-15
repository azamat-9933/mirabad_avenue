from django.contrib import admin
from django.utils.html import format_html

from .models import (
    AuditEvent,
    ChecklistItem,
    ChecklistNote,
    PortalNotification,
    PortalStatusOverride,
    WorkspaceProfile,
)


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
    list_display = ("user", "workspace_name", "role_label", "status", "organization", "updated_at")
    list_filter = ("status", "session_status", "two_factor_enabled", "workspace_name")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "workspace_name", "organization")
    autocomplete_fields = ("user",)
    fieldsets = (
        ("User", {"fields": ("user", "role_label", "status")}),
        ("Workspace", {"fields": ("workspace_name", "organization", "access_level", "timezone_name")}),
        ("Security", {"fields": ("two_factor_enabled", "session_status")}),
        ("Portal note", {"fields": ("note",)}),
    )


@admin.register(PortalNotification)
class PortalNotificationAdmin(SeverityBadgeMixin, admin.ModelAdmin):
    list_display = ("title", "severity_badge", "status", "pinned", "event_at", "complex", "building")
    list_filter = ("severity", "status", "pinned", "complex", "building")
    search_fields = ("title", "message", "complex__title", "building__number", "owner__fio")
    list_editable = ("status", "pinned")
    date_hierarchy = "event_at"
    autocomplete_fields = ("complex", "building", "apartment", "owner", "created_by")
    fieldsets = (
        ("Content", {"fields": ("title", "message", "severity", "status", "pinned", "event_at")}),
        ("Actions", {"fields": ("action_primary", "action_secondary", "action_state")}),
        ("Relations", {"fields": ("complex", "building", "apartment", "owner", "created_by")}),
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
    list_display = ("created_at", "event_type", "title", "actor", "complex", "building")
    list_filter = ("event_type", "complex", "building")
    search_fields = ("title", "message", "actor", "complex__title", "building__number", "owner__fio")
    date_hierarchy = "created_at"
    autocomplete_fields = ("complex", "building", "apartment", "owner")
    fieldsets = (
        ("Event", {"fields": ("event_type", "title", "message", "actor", "created_at")}),
        ("Relations", {"fields": ("complex", "building", "apartment", "owner")}),
        ("Metadata", {"fields": ("metadata",), "classes": ("collapse",)}),
    )


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

