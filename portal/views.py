import json

from django.core.exceptions import ImproperlyConfigured
from django.db import DatabaseError, OperationalError
from django.http import JsonResponse
from django.views.generic import TemplateView

from .backend_data import build_portal_data


def safe_portal_data():
    try:
        return build_portal_data()
    except (DatabaseError, OperationalError, ImproperlyConfigured) as exc:
        return {
            "source": "backend_unavailable",
            "error": str(exc),
            "complexes": [],
            "residents": [],
            "transactions": [],
        }


class PortalPageView(TemplateView):
    page_title = "HydroFlow Enterprise"
    active_page = ""

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["page_title"] = self.page_title
        ctx["active_page"] = self.active_page
        ctx["backend_billing_data_json"] = json.dumps(safe_portal_data(), ensure_ascii=False)
        return ctx


class DashboardView(PortalPageView):
    template_name = "portal/dashboard.html"
    page_title = "HydroFlow Enterprise | Overview Dashboard"
    active_page = "dashboard"


class ResidentialView(PortalPageView):
    template_name = "portal/residential.html"
    page_title = "Residential Units Management | HydroFlow Enterprise"
    active_page = "residential"


class SystemHealthView(PortalPageView):
    template_name = "portal/system_health.html"
    page_title = "Infrastructure & System Health | HydroFlow"
    active_page = "system_health"


class BillingView(PortalPageView):
    template_name = "portal/billing.html"
    page_title = "Residential Complex Management | HydroFlow"
    active_page = "billing"


class AnalyticsView(PortalPageView):
    template_name = "portal/analytics.html"
    page_title = "HydroFlow Enterprise | Analytics Overview"
    active_page = "analytics"


def api_health(request):
    return JsonResponse({"status": "ok"})


def api_portal_data(request):
    return JsonResponse(safe_portal_data())
