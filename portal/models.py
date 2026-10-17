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
    workspace_name = models.CharField(max_length=120, default="Mirabad Avenue")
    organization = models.CharField(max_length=180, default="Mirabad Avenue")
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
    # The operator's Telegram chat, linked through the bot (/start op_<token> from the portal profile);
    # alerts assigned to the operator are delivered there.
    telegram_chat_id = models.BigIntegerField(null=True, blank=True, unique=True)
    telegram_username = models.CharField(max_length=64, blank=True)
    telegram_language = models.CharField(max_length=2, default="uz")
    telegram_linked_at = models.DateTimeField(null=True, blank=True)
    # One-time token of the pending link; cleared when the bot uses it.
    telegram_link_token = models.CharField(max_length=48, blank=True, db_index=True)
    telegram_link_requested_at = models.DateTimeField(null=True, blank=True)
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
    # An alert set for an operator works like a task: everyone sees it, only the assignee resolves it.
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_portal_notifications",
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_portal_notifications",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    TELEGRAM_SENT = "sent"
    TELEGRAM_NOT_LINKED = "not_linked"
    TELEGRAM_FAILED = "failed"
    TELEGRAM_STATUS_CHOICES = [
        (TELEGRAM_SENT, "Sent"),
        (TELEGRAM_NOT_LINKED, "Assignee has no Telegram"),
        (TELEGRAM_FAILED, "Not delivered"),
    ]
    # Delivery of the alert to the assignee's Telegram; blank when there is no assignee.
    telegram_status = models.CharField(max_length=16, choices=TELEGRAM_STATUS_CHOICES, blank=True)
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
    done = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name = "Checklist item"
        verbose_name_plural = "Checklist items"

    def __str__(self):
        return self.title


class ChecklistNote(models.Model):
    """Persistent checklist note created from the portal UI."""

    text = models.TextField()
    template_key = models.CharField(max_length=120, blank=True)
    scope = models.CharField(max_length=120, blank=True, default="Operations")
    done = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="checklist_notes",
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Checklist note"
        verbose_name_plural = "Checklist notes"

    def __str__(self):
        return self.text[:72]


class AuditEvent(models.Model):
    """Operator activity log: who did what, when and from where, across the portal and Django admin.

    Rows are append-only. They are written through ``portal.audit.record_event`` (and the signals
    in ``portal.signals``) and are read-only in admin; only users with ``portal.view_auditevent``
    (superusers have it) can read them.
    """

    TYPE_EXPORT = "export"
    TYPE_REMINDER = "reminder"
    TYPE_ALERT = "alert"
    TYPE_BALANCE = "balance"
    TYPE_NOTE = "note"
    TYPE_STATUS = "status"
    TYPE_SYSTEM = "system"
    TYPE_BILLING = "billing"
    TYPE_ADMIN = "admin"
    TYPE_AUTH = "auth"
    TYPE_CHOICES = [
        (TYPE_EXPORT, "Export"),
        (TYPE_REMINDER, "Reminder"),
        (TYPE_ALERT, "Alert"),
        (TYPE_BALANCE, "Balance"),
        (TYPE_NOTE, "Note"),
        (TYPE_STATUS, "Status"),
        (TYPE_SYSTEM, "System"),
        (TYPE_BILLING, "Billing"),
        (TYPE_ADMIN, "Admin change"),
        (TYPE_AUTH, "Sign-in"),
    ]

    event_type = models.CharField(max_length=24, choices=TYPE_CHOICES, default=TYPE_SYSTEM)
    title = models.CharField(max_length=180)
    message = models.TextField()
    # The operator account. Kept as SET_NULL so deleting a user never deletes their history;
    # ``actor`` keeps the username as it was at the time.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
        verbose_name="Operator",
    )
    actor = models.CharField(max_length=120, blank=True, default="System")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP address")
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"], name="audit_created_idx"),
            models.Index(fields=["user", "-created_at"], name="audit_user_created_idx"),
        ]
        verbose_name = "Audit event"
        verbose_name_plural = "Audit events"

    def __str__(self):
        return f"{self.get_event_type_display()} | {self.title}"


class PortalStatusOverride(models.Model):
    """Persistent portal-side status override for UI tables without native status fields."""

    CONTEXT_RESIDENTIAL = "residential"
    CONTEXT_TRANSACTIONS = "transactions"
    CONTEXT_CHOICES = [
        (CONTEXT_RESIDENTIAL, "Residential"),
        (CONTEXT_TRANSACTIONS, "Transactions"),
    ]

    TARGET_COMPLEX = "complex"
    TARGET_BUILDING = "building"
    TARGET_APARTMENT = "apartment"
    TARGET_TRANSACTION = "transaction"
    TARGET_CHOICES = [
        (TARGET_COMPLEX, "Complex"),
        (TARGET_BUILDING, "Building"),
        (TARGET_APARTMENT, "Apartment"),
        (TARGET_TRANSACTION, "Transaction"),
    ]

    context = models.CharField(max_length=24, choices=CONTEXT_CHOICES)
    target_type = models.CharField(max_length=24, choices=TARGET_CHOICES)
    target_id = models.PositiveIntegerField()
    status_value = models.CharField(max_length=80)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="portal_status_overrides",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ("context", "target_type", "target_id")
        verbose_name = "Portal status override"
        verbose_name_plural = "Portal status overrides"

    def __str__(self):
        return f"{self.context}:{self.target_type}:{self.target_id} -> {self.status_value}"


class SupportTicket(models.Model):
    """Lightweight helpdesk ticket for the portal support drawer."""

    CATEGORY_UI = "ui"
    CATEGORY_DATA = "data"
    CATEGORY_ACCESS = "access"
    CATEGORY_OTHER = "other"
    CATEGORY_CHOICES = [
        (CATEGORY_UI, "UI"),
        (CATEGORY_DATA, "Data"),
        (CATEGORY_ACCESS, "Access"),
        (CATEGORY_OTHER, "Other"),
    ]

    PRIORITY_HIGH = "high"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_LOW = "low"
    PRIORITY_CHOICES = [
        (PRIORITY_HIGH, "High"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_LOW, "Low"),
    ]

    STATUS_OPEN = "open"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_RESOLVED = "resolved"
    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_RESOLVED, "Resolved"),
    ]

    title = models.CharField(max_length=180)
    message = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=CATEGORY_OTHER)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default=STATUS_OPEN)
    source = models.CharField(max_length=120, blank=True, default="portal")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
    )
    complex = models.ForeignKey(Complex, on_delete=models.SET_NULL, null=True, blank=True, related_name="support_tickets")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="support_tickets")
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, blank=True, related_name="support_tickets")
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="support_tickets")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["status", "-updated_at"]
        verbose_name = "Support ticket"
        verbose_name_plural = "Support tickets"

    def __str__(self):
        return self.title
