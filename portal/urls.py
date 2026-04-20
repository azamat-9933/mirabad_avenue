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
]
