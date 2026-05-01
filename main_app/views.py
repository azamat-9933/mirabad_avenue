from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import redirect
from django.urls import reverse

from .models import DEFAULT_SECTOR_NAME, Complex


@staff_member_required
def admin_sector_redirect(request):
    sector = Complex.objects.order_by("pk").first()
    if sector is None:
        sector = Complex.objects.create(
            title=DEFAULT_SECTOR_NAME,
            address=DEFAULT_SECTOR_NAME,
            author=request.user.get_username() or "Admin",
        )
    elif sector.address != DEFAULT_SECTOR_NAME:
        sector.address = DEFAULT_SECTOR_NAME
        sector.save(update_fields=["address"])

    return redirect(reverse("admin:main_app_complex_change", args=[sector.pk]))
