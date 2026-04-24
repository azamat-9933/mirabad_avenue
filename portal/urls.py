from django.urls import path

from . import views

app_name = "portal"

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard"),
    path("residential/", views.ResidentialView.as_view(), name="residential"),
    path("system-health/", views.SystemHealthView.as_view(), name="system_health"),
    path("billing/", views.BillingView.as_view(), name="billing"),
    path("billing/periods/create", views.BillingPeriodCreateView.as_view(), name="billing_period_create"),
    path("analytics/", views.AnalyticsView.as_view(), name="analytics"),
    path("api/health/", views.api_health, name="api_health"),
    path("api/portal-data/", views.api_portal_data, name="api_portal_data"),
    path("api/lists/residents/", views.api_list_residents, name="api_list_residents"),
    path("api/lists/transactions/", views.api_list_transactions, name="api_list_transactions"),
    path("api/lists/maintenance/", views.api_list_maintenance, name="api_list_maintenance"),
    path("api/lists/alerts/", views.api_list_alerts, name="api_list_alerts"),
    path("api/lists/audit/", views.api_list_audit, name="api_list_audit"),
    path("api/lists/complexes/", views.api_list_complexes, name="api_list_complexes"),
    path("api/audit/note/", views.api_audit_note, name="api_audit_note"),
    path("api/checklist/note/", views.api_checklist_note, name="api_checklist_note"),
    path("api/support/ticket/", views.api_support_ticket, name="api_support_ticket"),
    path("api/logout/", views.api_logout, name="api_logout"),
    path("api/complexes/create/", views.api_create_complex, name="api_create_complex"),
    path("api/buildings/create/", views.api_create_building, name="api_create_building"),
    path("api/apartments/create/", views.api_create_apartment, name="api_create_apartment"),
    path("api/residents/create/", views.api_create_resident, name="api_create_resident"),
    path("api/resident-kit/action/", views.api_resident_kit_action, name="api_resident_kit_action"),
    path("api/maintenance/deploy/", views.api_deploy_maintenance, name="api_deploy_maintenance"),
    path("api/usage-report/export/", views.api_usage_report_export, name="api_usage_report_export"),
    path("api/system-alerts/configure/", views.api_system_alerts_configure, name="api_system_alerts_configure"),
    path("api/export/report/", views.api_export_report, name="api_export_report"),
    path("api/reminders/send/", views.api_send_reminder, name="api_send_reminder"),
    path("api/technicians/assign/", views.api_assign_technician, name="api_assign_technician"),
    path("api/status/assign/", views.api_assign_status, name="api_assign_status"),
]
