from django.conf import settings
from django.db import models
from django.utils import timezone

from main_app.models import Apartment, Building, Complex, Owner


class WorkspaceProfile(models.Model):
    """Admin-controlled profile data shown in the portal account drawer."""

    STATUS_ACTIVE = "active"
    STATUS_INACTIVE = "inactive"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_INACTIVE, "Inactive"),
    ]

    SESSION_ACTIVE = "active"
    SESSION_EXPIRED = "expired"
    SESSION_CHOICES = [
        (SESSION_ACTIVE, "Active"),
        (SESSION_EXPIRED, "Expired"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workspace_profile",
    )
    workspace_name = models.CharField(max_length=120, default="HydroFlow")
    organization = models.CharField(max_length=180, default="HydroFlow Utility Management")
    access_level = models.CharField(max_length=180, default="Full operations access")
    role_label = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    timezone_name = models.CharField(max_length=80, default="Asia/Tashkent")
    two_factor_enabled = models.BooleanField(default=True)
    session_status = models.CharField(max_length=20, choices=SESSION_CHOICES, default=SESSION_ACTIVE)
    note = models.CharField(
        max_length=240,
        default="Profile data is loaded from Django admin and the active backend session.",
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Workspace profile"
        verbose_name_plural = "Workspace profiles"

    def __str__(self):
        return f"{self.user.get_username()} | {self.workspace_name}"


class PortalNotification(models.Model):
    """Operational notification shown in the HydroFlow notifications center."""

    SEVERITY_CRITICAL = "critical"
    SEVERITY_WARNING = "warning"
    SEVERITY_INFO = "info"
    SEVERITY_CHOICES = [
        (SEVERITY_CRITICAL, "Critical"),
        (SEVERITY_WARNING, "Warning"),
        (SEVERITY_INFO, "Info"),
    ]

    STATUS_UNREAD = "unread"
    STATUS_READ = "read"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = [
        (STATUS_UNREAD, "Unread"),
        (STATUS_READ, "Read"),
        (STATUS_ARCHIVED, "Archived"),
    ]

    title = models.CharField(max_length=180)
    message = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default=SEVERITY_INFO)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_UNREAD)
    pinned = models.BooleanField(default=False)
    event_at = models.DateTimeField(default=timezone.now)
    action_primary = models.CharField(max_length=80, blank=True)
    action_secondary = models.CharField(max_length=80, blank=True)
    action_state = models.CharField(max_length=160, blank=True)
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="portal_notifications")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="portal_notifications")
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, blank=True, related_name="portal_notifications")
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="portal_notifications")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="portal_notifications",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-pinned", "-event_at"]
        verbose_name = "Portal notification"
        verbose_name_plural = "Portal notifications"

    def __str__(self):
        return f"{self.get_severity_display()} | {self.title}"


class SystemAlert(models.Model):
    """System alert used by dashboard, system health and recent alerts panels."""

    SEVERITY_CRITICAL = "critical"
    SEVERITY_WARNING = "warning"
    SEVERITY_INFO = "info"
    SEVERITY_CHOICES = PortalNotification.SEVERITY_CHOICES

    STATUS_ACTIVE = "active"
    STATUS_ACKNOWLEDGED = "acknowledged"
    STATUS_RESOLVED = "resolved"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_ACKNOWLEDGED, "Acknowledged"),
        (STATUS_RESOLVED, "Resolved"),
    ]

    CATEGORY_PRESSURE = "pressure"
    CATEGORY_WATER = "water"
    CATEGORY_HEATING = "heating"
    CATEGORY_PAYMENT = "payment"
    CATEGORY_SECURITY = "security"
    CATEGORY_OTHER = "other"
    CATEGORY_CHOICES = [
        (CATEGORY_PRESSURE, "Pressure"),
        (CATEGORY_WATER, "Water"),
        (CATEGORY_HEATING, "Heating"),
        (CATEGORY_PAYMENT, "Payment"),
        (CATEGORY_SECURITY, "Security"),
        (CATEGORY_OTHER, "Other"),
    ]

    title = models.CharField(max_length=180)
    message = models.TextField(blank=True)
    category = models.CharField(max_length=24, choices=CATEGORY_CHOICES, default=CATEGORY_OTHER)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default=SEVERITY_WARNING)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="system_alerts")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="system_alerts")
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, blank=True, related_name="system_alerts")
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="system_alerts")
    detected_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.CharField(max_length=120, blank=True)
    action_label = models.CharField(max_length=80, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-detected_at"]
        verbose_name = "System alert"
        verbose_name_plural = "System alerts"

    def __str__(self):
        return f"{self.get_severity_display()} | {self.title}"


class MaintenanceTask(models.Model):
    """Upcoming and historical maintenance work item."""

    PRIORITY_HIGH = "high"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_LOW = "low"
    PRIORITY_CHOICES = [
        (PRIORITY_HIGH, "High"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_LOW, "Low"),
    ]

    STATUS_PLANNED = "planned"
    STATUS_SCHEDULED = "scheduled"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_COMPLETED = "completed"
    STATUS_DEFERRED = "deferred"
    STATUS_CHOICES = [
        (STATUS_PLANNED, "Planned"),
        (STATUS_SCHEDULED, "Scheduled"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_DEFERRED, "Deferred"),
    ]

    title = models.CharField(max_length=180)
    location = models.CharField(max_length=220, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_LOW)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default=STATUS_PLANNED)
    scheduled_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.CharField(max_length=120, blank=True)
    action_label = models.CharField(max_length=80, blank=True, default="Open checklist")
    icon = models.CharField(max_length=80, blank=True, default="fact_check")
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="maintenance_tasks")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="maintenance_tasks")
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at", "-priority"]
        verbose_name = "Maintenance task"
        verbose_name_plural = "Maintenance tasks"

    def __str__(self):
        return self.title


class ChecklistItem(models.Model):
    """Backend-defined checklist item for the operations drawer."""

    SCOPE_GLOBAL = "global"
    SCOPE_BILLING = "billing"
    SCOPE_RESIDENTIAL = "residential"
    SCOPE_SYSTEM = "system"
    SCOPE_ANALYTICS = "analytics"
    SCOPE_CHOICES = [
        (SCOPE_GLOBAL, "Global"),
        (SCOPE_BILLING, "Billing"),
        (SCOPE_RESIDENTIAL, "Residential"),
        (SCOPE_SYSTEM, "System"),
        (SCOPE_ANALYTICS, "Analytics"),
    ]

    title = models.CharField(max_length=180)
    detail = models.TextField(blank=True)
    tag = models.CharField(max_length=60, blank=True, default="Operations")
    icon = models.CharField(max_length=80, blank=True, default="fact_check")
    scope = models.CharField(max_length=24, choices=SCOPE_CHOICES, default=SCOPE_GLOBAL)
    sort_order = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name = "Checklist item"
        verbose_name_plural = "Checklist items"

    def __str__(self):
        return self.title


class AuditEvent(models.Model):
    """Backend audit timeline entry for admin and portal actions."""

    TYPE_EXPORT = "export"
    TYPE_REMINDER = "reminder"
    TYPE_ALERT = "alert"
    TYPE_BALANCE = "balance"
    TYPE_NOTE = "note"
    TYPE_STATUS = "status"
    TYPE_SYSTEM = "system"
    TYPE_CHOICES = [
        (TYPE_EXPORT, "Export"),
        (TYPE_REMINDER, "Reminder"),
        (TYPE_ALERT, "Alert"),
        (TYPE_BALANCE, "Balance"),
        (TYPE_NOTE, "Note"),
        (TYPE_STATUS, "Status"),
        (TYPE_SYSTEM, "System"),
    ]

    event_type = models.CharField(max_length=24, choices=TYPE_CHOICES, default=TYPE_SYSTEM)
    title = models.CharField(max_length=180)
    message = models.TextField()
    actor = models.CharField(max_length=120, blank=True, default="System")
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Audit event"
        verbose_name_plural = "Audit events"

    def __str__(self):
        return f"{self.get_event_type_display()} | {self.title}"


class TelemetryNode(models.Model):
    """Live network node used by the map and telemetry panels."""

    STATUS_ONLINE = "online"
    STATUS_WARNING = "warning"
    STATUS_ISSUE = "issue"
    STATUS_OFFLINE = "offline"
    STATUS_CHOICES = [
        (STATUS_ONLINE, "Online"),
        (STATUS_WARNING, "Warning"),
        (STATUS_ISSUE, "Issue"),
        (STATUS_OFFLINE, "Offline"),
    ]

    title = models.CharField(max_length=180)
    subtitle = models.CharField(max_length=220, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ONLINE)
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="telemetry_nodes")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="telemetry_nodes")
    icon = models.CharField(max_length=80, blank=True, default="apartment")
    map_x = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    map_y = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    pressure_psi = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    flow_liters_day = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    latency_ms = models.PositiveIntegerField(default=0)
    uptime_percent = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    updated_at = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["title"]
        verbose_name = "Telemetry node"
        verbose_name_plural = "Telemetry nodes"

    def __str__(self):
        return self.title


class TelemetrySample(models.Model):
    """Time-series sample for pressure/flow charts."""

    node = models.ForeignKey(TelemetryNode, on_delete=models.CASCADE, related_name="samples")
    measured_at = models.DateTimeField(default=timezone.now)
    pressure_psi = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    flow_liters_day = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    uptime_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    issue_state = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-measured_at"]
        verbose_name = "Telemetry sample"
        verbose_name_plural = "Telemetry samples"

    def __str__(self):
        return f"{self.node} | {timezone.localtime(self.measured_at):%d.%m.%Y %H:%M}"
