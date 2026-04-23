from django.urls import path

from . import views

app_name = "portal"

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard"),
    path("residential/", views.ResidentialView.as_view(), name="residential"),
    path("system-health/", views.SystemHealthView.as_view(), name="system_health"),
    path("billing/", views.BillingView.as_view(), name="billing"),
    path("analytics/", views.AnalyticsView.as_view(), name="analytics"),
    path("api/health/", views.api_health, name="api_health"),
    path("api/portal-data/", views.api_portal_data, name="api_portal_data"),
    path("api/residents/create/", views.api_create_resident, name="api_create_resident"),
    path("api/resident-kit/action/", views.api_resident_kit_action, name="api_resident_kit_action"),
    path("api/maintenance/deploy/", views.api_deploy_maintenance, name="api_deploy_maintenance"),
    path("api/usage-report/export/", views.api_usage_report_export, name="api_usage_report_export"),
    path("api/system-alerts/configure/", views.api_system_alerts_configure, name="api_system_alerts_configure"),
]
