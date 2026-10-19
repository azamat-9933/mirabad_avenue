"""What a billing period charges, worked out from what operators enter for it.

Heating: the costs of a boiler room (or of the whole building when it has no boiler rooms) are
spread over area × heated days of the apartments heated in the period (HeatingRecord dates, entered
for every period since heating changes from month to month). Hot water: the costs of a
building are spread over its apartments' meter consumption. A meter's start reading defaults to its
reading at the end of the previous period. The admin preview and closing use the same plan, so the
preview shows exactly what closing posts; errors name the house and apartment to fix.
"""
from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal

ZERO = Decimal("0")


def group_thousands(number) -> str:
    """1234567.5 -> "1 234 567,5": digits in groups of three, a decimal comma only when needed."""
    number = Decimal(str(number))
    sign = "-" if number < 0 else ""
    integer, _, fraction = f"{abs(number):f}".partition(".")
    fraction = fraction.rstrip("0")
    grouped = f"{int(integer):,}".replace(",", " ")
    return f"{sign}{grouped}{',' + fraction if fraction else ''}"


def _natural_key(number) -> tuple:
    match = re.match(r"\s*(\d+)(.*)", str(number))
    return (int(match.group(1)), match.group(2)) if match else (float("inf"), str(number))


def _parse_day(value):
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def _heated_range(period, heated_from, heated_until):
    """(first, last) heated day within the period, or None when there is none."""
    if not heated_from or not period.start_date or not period.end_date:
        return None
    first = max(period.start_date, heated_from)
    last = min(period.end_date, heated_until) if heated_until else period.end_date
    return (first, last) if first <= last else None


def heating_range_days(period, heated_from, heated_until=None) -> int:
    """Days from heated_from to heated_until (both inclusive; no end means the period's end) within the period."""
    heated = _heated_range(period, heated_from, heated_until)
    return (heated[1] - heated[0]).days + 1 if heated else 0


def heated_days(period, heated_from, heated_until=None, excluded_dates=(), days_given=None) -> int:
    """Days of the period an apartment was heated.

    The operator's days_given when entered (never more than the range), otherwise the days from
    heated_from to heated_until minus the dates heating was off. Without heated_from the apartment
    was not heated.
    """
    heated = _heated_range(period, heated_from, heated_until)
    if not heated:
        return 0
    first, last = heated
    range_days = (last - first).days + 1
    if days_given is not None:
        return max(0, min(int(days_given), range_days))
    off = {day for day in map(_parse_day, excluded_dates or ()) if day and first <= day <= last}
    return range_days - len(off)


def previous_heating(apartment_ids, period) -> dict:
    """Each apartment's heating in its latest period before this one: (heated_from, heated_until, period end)."""
    from .models import HeatingRecord

    rows = (
        HeatingRecord.objects.filter(apartment_id__in=list(apartment_ids), period__start_date__lt=period.start_date)
        .order_by("apartment_id", "-period__start_date", "-pk")
        .values_list("apartment_id", "heated_from", "heated_until", "period__end_date")
    )
    result = {}
    for apartment_id, heated_from, heated_until, period_end in rows:
        result.setdefault(apartment_id, (heated_from, heated_until, period_end))
    return result


def previous_hot_water_readings(apartment_ids, period) -> dict:
    """Each apartment's last known hot water reading before the period: the end reading, else the start."""
    from .models import HotWaterMeterReading

    rows = (
        HotWaterMeterReading.objects.filter(apartment_id__in=list(apartment_ids), period__start_date__lt=period.start_date)
        .exclude(start_reading__isnull=True, end_reading__isnull=True)
        .order_by("apartment_id", "-period__start_date", "-pk")
        .values_list("apartment_id", "start_reading", "end_reading")
    )
    result = {}
    for apartment_id, start, end in rows:
        if apartment_id not in result:
            result[apartment_id] = end if end is not None else start
    return result


@dataclass
class Row:
    apartment: object
    volume: Decimal
    days: int | None = None
    start: Decimal | None = None
    end: Decimal | None = None
    amount: Decimal = ZERO

    @property
    def owner_name(self) -> str:
        owner = getattr(self.apartment, "owner", None)
        return owner.fio if owner else ""


@dataclass
class Zone:
    """One tariff: a boiler room (or building) for heating, a building for hot water."""

    service_type: str
    building: object
    boiler_room: object | None = None
    costs: list = field(default_factory=list)  # (title, amount)
    rows: list = field(default_factory=list)
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    has_inputs: bool = False  # expense or gas rows were entered for it

    @property
    def key(self) -> tuple:
        return (self.building.pk, self.boiler_room.pk if self.boiler_room else None, self.service_type)

    @property
    def is_heating(self) -> bool:
        from .models import SERVICE_HEATING

        return self.service_type == SERVICE_HEATING

    @property
    def label(self) -> str:
        place = f"{self.building.number} uy"
        if self.boiler_room:
            place += f", {self.boiler_room.name} qozonxona"
        return f"{place} — {'isitish' if self.is_heating else 'issiq suv'}"

    @property
    def total_cost(self) -> Decimal:
        return sum((amount for _, amount in self.costs), ZERO)

    @property
    def total_volume(self) -> Decimal:
        return sum((row.volume for row in self.rows), ZERO)

    @property
    def billable(self) -> bool:
        return self.total_cost > 0

    @property
    def tariff(self) -> Decimal:
        """Cost per m²·day (heating) or per m³ (hot water), unrounded."""
        return self.total_cost / self.total_volume if self.total_volume > 0 else ZERO


@dataclass
class Plan:
    zones: list
    errors: list
    warnings: list

    @property
    def billable_zones(self) -> list:
        return [zone for zone in self.zones if zone.billable]


def _numbers(apartments) -> str:
    return ", ".join(str(apartment.number) for apartment in apartments)


def build_plan(period) -> Plan:
    """Work out every tariff and apartment amount of the period from its entered data."""
    from properties.models import Apartment, Building

    from .models import (
        SERVICE_HEATING,
        SERVICE_HOT_WATER,
        BoilerRoom,
        HeatingRecord,
        HotWaterMeterReading,
        money,
        volume,
    )

    errors: list[str] = []
    building_ids = period._building_ids_for_period()
    buildings = sorted(Building.objects.filter(pk__in=building_ids), key=lambda b: _natural_key(b.number))
    apartments_by_building = defaultdict(list)
    for apartment in Apartment.objects.filter(building_id__in=building_ids).select_related("owner"):
        apartments_by_building[apartment.building_id].append(apartment)
    for rows in apartments_by_building.values():
        rows.sort(key=lambda apartment: _natural_key(apartment.number))
    rooms_by_building = defaultdict(list)
    for room in BoilerRoom.objects.filter(building_id__in=building_ids).prefetch_related("sections").order_by("name"):
        rooms_by_building[room.building_id].append(room)

    def resolve_room(building, room, what):
        """The boiler room a heating cost belongs to, or False with an error."""
        rooms = rooms_by_building.get(building.pk, [])
        if room is not None:
            if room.building_id != building.pk:
                errors.append(f"{building.number} uy, {what}: «{room.name}» qozonxona boshqa uyga tegishli.")
                return False
            return room
        if len(rooms) > 1:
            errors.append(
                f"{building.number} uy, {what}: qaysi qozonxonaga tegishli ekani ko'rsatilmagan "
                f"(uyda {len(rooms)} ta qozonxona bor)."
            )
            return False
        return rooms[0] if rooms else None

    def gas_line(reading):
        """(title, amount) of a gas meter, or None with an error."""
        what = f"gaz hisoblagich ({'isitish' if reading.service_type == SERVICE_HEATING else 'issiq suv'})"
        start = reading.effective_start_reading()
        end = reading.end_reading
        if start is None:
            errors.append(
                f"{reading.building.number} uy, {what}: boshlang'ich ko'rsatkich yo'q va o'tgan oyda ham kiritilmagan."
            )
            return None
        if end < start:
            errors.append(
                f"{reading.building.number} uy, {what}: oxirgi ko'rsatkich ({group_thousands(end)}) "
                f"boshlang'ichdan ({group_thousands(start)}) kichik."
            )
            return None
        consumption = end - start
        room = f" ({reading.boiler_room.name})" if reading.boiler_room_id else ""
        title = f"Gaz{room}: {group_thousands(consumption)} m³ × {group_thousands(reading.price_per_m3)} so'm"
        return title[:255], money(consumption * reading.price_per_m3)

    # ── Costs ──
    costs = defaultdict(list)
    has_inputs = set()
    for expense in period.expenses.select_related("building", "boiler_room").order_by("pk"):
        room = None
        if expense.service_type == SERVICE_HEATING:
            room = resolve_room(expense.building, expense.boiler_room, f"isitish xarajati «{expense.name}»")
            if room is False:
                continue
        key = (expense.building_id, room.pk if room else None, expense.service_type)
        costs[key].append(((expense.name or "Xarajat")[:255], money(expense.amount)))
        has_inputs.add(key)
    for reading in period.gas_meter_readings.select_related("building", "boiler_room").order_by("pk"):
        room = None
        if reading.service_type == SERVICE_HEATING:
            room = resolve_room(reading.building, reading.boiler_room, "gaz hisoblagich (isitish)")
            if room is False:
                continue
        key = (reading.building_id, room.pk if room else None, reading.service_type)
        has_inputs.add(key)
        line = gas_line(reading)
        if line:
            costs[key].append(line)

    zones = []
    heating = {record.apartment_id: record for record in HeatingRecord.objects.filter(period=period)}
    readings = {
        reading.apartment_id: reading
        for reading in HotWaterMeterReading.objects.filter(period=period, apartment__building_id__in=building_ids)
    }
    all_apartment_ids = {apartment.pk for rows in apartments_by_building.values() for apartment in rows}
    previous = previous_hot_water_readings(all_apartment_ids, period)

    for building in buildings:
        apartments = apartments_by_building.get(building.pk, [])

        # ── Heating: per boiler room over the heated apartments' area × days ──
        rooms = rooms_by_building.get(building.pk, [])
        heating_zones = {
            room.pk if room else None: Zone(SERVICE_HEATING, building, room)
            for room in (rooms or [None])
        }
        room_by_section = {section.pk: room for room in rooms for section in room.sections.all()}
        unassigned = []
        for apartment in apartments:
            record = heating.get(apartment.pk)
            days = record.heated_days_in(period) if record else 0
            if days <= 0:
                continue
            if len(rooms) > 1:
                room = room_by_section.get(apartment.section_id)
                if room is None:
                    unassigned.append(apartment)
                    continue
            else:
                room = rooms[0] if rooms else None
            zone = heating_zones[room.pk if room else None]
            zone.rows.append(Row(apartment, volume(apartment.area * days), days=days))
        for zone in heating_zones.values():
            zone.costs = costs.get(zone.key, [])
            zone.has_inputs = zone.key in has_inputs
            if zone.billable and zone.total_volume <= 0:
                zone.errors.append(
                    f"{zone.label}: xarajat {group_thousands(zone.total_cost)} so'm, lekin bu davrda isitilgan kvartira yo'q. "
                    "Davrning «Isitish» jadvalida kvartiralarga sanalar va berilgan kunlarni kiriting."
                )
            zones.append(zone)
        if unassigned and any(zone.billable for zone in heating_zones.values()):
            errors.append(
                f"{building.number} uy, isitish: kv {_numbers(unassigned)} qaysi qozonxonaga tegishli ekani aniqlanmadi — "
                "kvartira seksiyasini qozonxonaga biriktiring."
            )

        # ── Hot water: per building over meter consumption ──
        zone = Zone(SERVICE_HOT_WATER, building)
        zone.costs = costs.get(zone.key, [])
        zone.has_inputs = zone.key in has_inputs
        missing_end, missing_start = [], []
        for apartment in apartments:
            reading = readings.get(apartment.pk)
            end = reading.end_reading if reading else None
            start = reading.start_reading if reading and reading.start_reading is not None else previous.get(apartment.pk)
            if end is None:
                if start is not None:
                    missing_end.append(apartment)
                continue
            if start is None:
                missing_start.append(apartment)
                continue
            if end < start:
                zone.errors.append(
                    f"{zone.label}, kv {apartment.number}: oxirgi ko'rsatkich ({group_thousands(end)}) "
                    f"boshlang'ichdan ({group_thousands(start)}) kichik. Hisoblagich almashtirilgan bo'lsa, "
                    "boshlang'ich ko'rsatkichni tuzating."
                )
                continue
            zone.rows.append(Row(apartment, volume(end - start), start=start, end=end))
        if missing_start:
            zone.errors.append(
                f"{zone.label}: kv {_numbers(missing_start)} — boshlang'ich ko'rsatkich yo'q va o'tgan oyda ham "
                "kiritilmagan. Yangi hisoblagich bo'lsa, boshlang'ichga 0 yozing."
            )
        if missing_end:
            zone.warnings.append(
                f"{zone.label}: kv {_numbers(missing_end)} — oxirgi ko'rsatkich kiritilmagan, bu oy hisoblanmaydi "
                "(sarf keyingi oyda hisoblanadi)."
            )
        if zone.billable and not zone.errors and zone.total_volume <= 0:
            zone.errors.append(
                f"{zone.label}: xarajat {group_thousands(zone.total_cost)} so'm, lekin kvartiralar sarfi 0 m³. "
                "Davr sahifasidagi «GVS hisoblagich ko'rsatkichlari»ga oxirgi ko'rsatkichlarni kiriting."
            )
        zones.append(zone)

    for zone in zones:
        if zone.billable and zone.total_volume > 0:
            for row in zone.rows:
                row.amount = money(row.volume * zone.total_cost / zone.total_volume)
        if zone.billable:
            errors.extend(zone.errors)
    warnings = [warning for zone in zones if zone.billable for warning in zone.warnings]
    return Plan(zones=zones, errors=errors, warnings=warnings)
