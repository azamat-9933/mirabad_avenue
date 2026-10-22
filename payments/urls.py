from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    # Entered in merchant.click.uz → Services as the check (Prepare) and result (Complete) URLs.
    path("click/", views.click_advanced, name="click_advanced"),
    path("click/shop/", views.click_shop, name="click_shop"),
    # Entered in business.paycom.uz → the cash desk's settings as the endpoint (Merchant API).
    path("payme/", views.payme_merchant, name="payme"),
]
