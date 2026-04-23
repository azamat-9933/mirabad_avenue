from main_app.models import (
    Apartment as LegacyApartment,
    Building as LegacyBuilding,
    BuildingSection as LegacyBuildingSection,
    Complex as LegacyComplex,
    Owner as LegacyOwner,
)


class Complex(LegacyComplex):
    class Meta:
        proxy = True
        verbose_name = "Turar joy majmuasi"
        verbose_name_plural = "Turar joy majmualari"


class Building(LegacyBuilding):
    class Meta:
        proxy = True
        verbose_name = "Uy"
        verbose_name_plural = "Uylar"


class BuildingSection(LegacyBuildingSection):
    class Meta:
        proxy = True
        verbose_name = "Seksiya"
        verbose_name_plural = "Seksiyalar"


class Apartment(LegacyApartment):
    class Meta:
        proxy = True
        verbose_name = "Kvartira"
        verbose_name_plural = "Kvartiralar"


class Owner(LegacyOwner):
    class Meta:
        proxy = True
        verbose_name = "Ega"
        verbose_name_plural = "Egalar"
