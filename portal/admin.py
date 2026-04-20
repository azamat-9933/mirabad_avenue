from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import (
    AuditEvent,
    ChecklistItem,
    MaintenanceTask,
    PortalNotification,
    SystemAlert,
    TelemetryNode,
    TelemetrySample,
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


@admin.register(SystemAlert)
class SystemAlertAdmin(SeverityBadgeMixin, admin.ModelAdmin):
    list_display = ("title", "severity_badge", "category", "status", "detected_at", "assigned_to", "complex", "building")
    list_filter = ("severity", "category", "status", "complex", "building")
    search_fields = ("title", "message", "assigned_to", "complex__title", "building__number", "owner__fio")
    list_editable = ("status",)
    date_hierarchy = "detected_at"
    autocomplete_fields = ("complex", "building", "apartment", "owner")
    fieldsets = (
        ("Alert", {"fields": ("title", "message", "category", "severity", "status")}),
        ("Ownership", {"fields": ("assigned_to", "action_label")}),
        ("Timeline", {"fields": ("detected_at", "resolved_at")}),
        ("Relations", {"fields": ("complex", "building", "apartment", "owner")}),
        ("Metadata", {"fields": ("metadata",), "classes": ("collapse",)}),
    )

    @admin.action(description="Mark selected alerts resolved")
    def mark_resolved(self, request, queryset):
        queryset.update(status=SystemAlert.STATUS_RESOLVED, resolved_at=timezone.now())

    actions = ("mark_resolved",)


@admin.register(MaintenanceTask)
class MaintenanceTaskAdmin(admin.ModelAdmin):
    list_display = ("title", "priority_badge", "status", "scheduled_at", "assigned_to", "complex", "building")
    list_filter = ("priority", "status", "complex", "building")
    search_fields = ("title", "location", "assigned_to", "complex__title", "building__number")
    list_editable = ("status",)
    date_hierarchy = "scheduled_at"
    autocomplete_fields = ("complex", "building")
    fieldsets = (
        ("Task", {"fields": ("title", "location", "priority", "status", "icon", "action_label")}),
        ("Schedule", {"fields": ("scheduled_at", "completed_at", "assigned_to")}),
        ("Relations", {"fields": ("complex", "building")}),
        ("Details", {"fields": ("notes", "metadata"), "classes": ("collapse",)}),
    )

    @admin.display(description="Priority")
    def priority_badge(self, obj):
        colors = {
            "high": ("#F75F5F", "rgba(247,95,95,.14)"),
            "medium": ("#F5A623", "rgba(245,166,35,.16)"),
            "low": ("#3DD68C", "rgba(61,214,140,.14)"),
        }
        fg, bg = colors.get(obj.priority, ("#8B90A0", "rgba(139,144,160,.14)"))
        return format_html(
            '<span style="padding:3px 10px;border-radius:999px;background:{};color:{};'
            'font-weight:700;font-size:11px;text-transform:uppercase;">{}</span>',
            bg,
            fg,
            obj.get_priority_display(),
        )


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ("title", "scope", "tag", "sort_order", "is_active")
    list_filter = ("scope", "tag", "is_active")
    list_editable = ("sort_order", "is_active")
    search_fields = ("title", "detail", "tag")


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


class TelemetrySampleInline(admin.TabularInline):
    model = TelemetrySample
    extra = 0
    fields = ("measured_at", "pressure_psi", "flow_liters_day", "uptime_percent", "issue_state")
    ordering = ("-measured_at",)


@admin.register(TelemetryNode)
class TelemetryNodeAdmin(admin.ModelAdmin):
    list_display = ("title", "status_badge", "pressure_psi", "flow_liters_day", "uptime_percent", "updated_at", "complex", "building")
    list_filter = ("status", "complex", "building")
    search_fields = ("title", "subtitle", "complex__title", "building__number")
    autocomplete_fields = ("complex", "building")
    inlines = (TelemetrySampleInline,)
    fieldsets = (
        ("Node", {"fields": ("title", "subtitle", "status", "icon", "complex", "building")}),
        ("Map position", {"fields": ("map_x", "map_y")}),
        ("Live telemetry", {"fields": ("pressure_psi", "flow_liters_day", "latency_ms", "uptime_percent", "updated_at")}),
        ("Metadata", {"fields": ("metadata",), "classes": ("collapse",)}),
    )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colors = {
            "online": ("#3DD68C", "rgba(61,214,140,.14)"),
            "warning": ("#F5A623", "rgba(245,166,35,.16)"),
            "issue": ("#F75F5F", "rgba(247,95,95,.14)"),
            "offline": ("#8B90A0", "rgba(139,144,160,.14)"),
        }
        fg, bg = colors.get(obj.status, ("#8B90A0", "rgba(139,144,160,.14)"))
        return format_html(
            '<span style="padding:3px 10px;border-radius:999px;background:{};color:{};'
            'font-weight:700;font-size:11px;text-transform:uppercase;">{}</span>',
            bg,
            fg,
            obj.get_status_display(),
        )


@admin.register(TelemetrySample)
class TelemetrySampleAdmin(admin.ModelAdmin):
    list_display = ("node", "measured_at", "pressure_psi", "flow_liters_day", "uptime_percent", "issue_state")
    list_filter = ("issue_state", "node")
    search_fields = ("node__title",)
    date_hierarchy = "measured_at"
    autocomplete_fields = ("node",)
