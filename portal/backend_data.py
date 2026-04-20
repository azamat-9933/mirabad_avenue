from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.db.models import Prefetch, Sum
from django.utils import timezone

from billing.models import HotWaterMeterReading
from main_app.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from portal.models import (
    AuditEvent,
    ChecklistItem,
    MaintenanceTask,
    PortalNotification,
    SystemAlert,
    TelemetryNode,
    TelemetrySample,
)


def _money(value) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value or 0)


def _date(value) -> str:
    if not value:
        return ""
    if hasattr(value, "astimezone"):
        value = timezone.localtime(value)
        return value.strftime("%d.%m.%Y")
    return value.strftime("%d.%m.%Y")


def _datetime(value) -> str:
    if not value:
        return ""
    if hasattr(value, "astimezone"):
        value = timezone.localtime(value)
    return value.strftime("%d.%m.%Y, %H:%M")


def _slug(prefix: str, pk: int) -> str:
    return f"{prefix}-{pk}"


def _date_section(value) -> str:
    if not value:
        return "today"
    current = timezone.localdate()
    local_value = timezone.localtime(value).date() if hasattr(value, "astimezone") else value
    if local_value == current:
        return "today"
    if local_value == current - timedelta(days=1):
        return "yesterday"
    return "older"


def _tone_for_priority(priority: str) -> str:
    if priority == MaintenanceTask.PRIORITY_HIGH:
        return "error"
    if priority == MaintenanceTask.PRIORITY_MEDIUM:
        return "tertiary"
    return "secondary"


def _alert_icon(alert: SystemAlert) -> str:
    return {
        SystemAlert.CATEGORY_PRESSURE: "speed",
        SystemAlert.CATEGORY_WATER: "water_drop",
        SystemAlert.CATEGORY_HEATING: "device_thermostat",
        SystemAlert.CATEGORY_PAYMENT: "payments",
        SystemAlert.CATEGORY_SECURITY: "shield",
    }.get(alert.category, "warning")


def _risk_from_split(debtors: int, paid: int, debt_total: float) -> str:
    total = debtors + paid
    ratio = debtors / total if total else 0
    if debtors and (ratio >= 0.25 or debt_total >= 50_000_000):
        return "Critical"
    if debtors and (ratio >= 0.10 or debt_total > 0):
        return "Medium Risk"
    return "Low Risk"


def _tone_from_risk(risk: str) -> str:
    if risk == "Critical":
        return "red"
    if risk == "Medium Risk":
        return "amber"
    return "blue"


def _health_from_split(debtors: int, paid: int) -> float:
    total = debtors + paid
    if not total:
        return 100.0
    return round(max(40, min(100, (paid / total) * 100)), 1)


def _transaction_type(transaction: Transaction) -> str:
    mapping = {
        Transaction.TYPE_PAYME: "Utility Payment",
        Transaction.TYPE_CLICK: "Utility Payment",
        Transaction.TYPE_CASH: "Utility Payment",
        Transaction.TYPE_MANUAL: "Manual Adjustment",
        Transaction.TYPE_CHARGE: "Monthly Charge",
    }
    return mapping.get(transaction.payment_type, transaction.get_payment_type_display())


def _serialize_notifications() -> list[dict]:
    rows = []
    queryset = PortalNotification.objects.select_related(
        "complex",
        "building",
        "apartment",
        "owner",
    ).exclude(status=PortalNotification.STATUS_ARCHIVED).order_by("-pinned", "-event_at")[:80]
    for item in queryset:
        related = item.complex or (item.building.complex if item.building_id else None)
        rows.append({
            "id": _slug("notification", item.id),
            "backendId": item.id,
            "severity": item.severity,
            "title": item.title,
            "message": item.message,
            "section": _date_section(item.event_at),
            "read": item.status == PortalNotification.STATUS_READ,
            "pinned": item.pinned,
            "eventAt": _datetime(item.event_at),
            "actionPrimary": item.action_primary,
            "actionSecondary": item.action_secondary,
            "actionState": item.action_state,
            "complexId": _slug("complex", related.id) if related else "",
            "buildingId": _slug("building", item.building_id) if item.building_id else "",
            "ownerId": _slug("owner", item.owner_id) if item.owner_id else "",
        })
    return rows


def _serialize_system_alerts() -> list[dict]:
    rows = []
    queryset = SystemAlert.objects.select_related(
        "complex",
        "building",
        "apartment",
        "owner",
    ).exclude(status=SystemAlert.STATUS_RESOLVED).order_by("-detected_at")[:80]
    for alert in queryset:
        related = alert.complex or (alert.building.complex if alert.building_id else None)
        location = alert.message or ""
        if not location and related:
            location = related.title
        rows.append({
            "id": _slug("alert", alert.id),
            "backendId": alert.id,
            "severity": alert.severity,
            "category": alert.category,
            "status": alert.status,
            "icon": _alert_icon(alert),
            "title": alert.title,
            "subtitle": location,
            "message": alert.message,
            "meta": alert.assigned_to or alert.get_category_display(),
            "action": alert.action_label,
            "detectedAt": _datetime(alert.detected_at),
            "complexId": _slug("complex", related.id) if related else "",
            "buildingId": _slug("building", alert.building_id) if alert.building_id else "",
        })
    return rows


def _serialize_maintenance_tasks() -> list[dict]:
    rows = []
    queryset = MaintenanceTask.objects.select_related("complex", "building").order_by("scheduled_at")[:120]
    for task in queryset:
        scheduled = timezone.localtime(task.scheduled_at) if task.scheduled_at else None
        rows.append({
            "id": _slug("maintenance", task.id),
            "backendId": task.id,
            "task": task.title,
            "title": task.title,
            "location": task.location or task.notes or (task.complex.title if task.complex_id else ""),
            "priority": task.get_priority_display(),
            "priorityKey": task.priority,
            "status": task.get_status_display(),
            "statusKey": task.status,
            "date": scheduled.strftime("%d.%m.%Y | %H:%M") if scheduled else "",
            "day": scheduled.strftime("%d") if scheduled else "",
            "month": scheduled.strftime("%b").upper() if scheduled else "",
            "assignedTo": task.assigned_to,
            "action": task.action_label or "Open checklist",
            "icon": task.icon or "fact_check",
            "tone": _tone_for_priority(task.priority),
            "complexId": _slug("complex", task.complex_id) if task.complex_id else "",
            "buildingId": _slug("building", task.building_id) if task.building_id else "",
        })
    return rows


def _serialize_audit_events() -> list[dict]:
    rows = []
    queryset = AuditEvent.objects.select_related(
        "complex",
        "building",
        "apartment",
        "owner",
    ).order_by("-created_at")[:120]
    for event in queryset:
        rows.append({
            "id": _slug("audit", event.id),
            "backendId": event.id,
            "type": event.event_type,
            "label": event.get_event_type_display(),
            "title": event.title,
            "message": event.message,
            "actor": event.actor,
            "time": _datetime(event.created_at),
            "complexId": _slug("complex", event.complex_id) if event.complex_id else "",
            "buildingId": _slug("building", event.building_id) if event.building_id else "",
            "ownerId": _slug("owner", event.owner_id) if event.owner_id else "",
        })
    return rows


def _serialize_checklist_items() -> list[dict]:
    return [
        {
            "id": _slug("checklist", item.id),
            "backendId": item.id,
            "title": item.title,
            "detail": item.detail,
            "tag": item.tag,
            "icon": item.icon or "fact_check",
            "scope": item.scope,
            "sortOrder": item.sort_order,
        }
        for item in ChecklistItem.objects.filter(is_active=True).order_by("sort_order", "title")
    ]


def _serialize_telemetry_nodes() -> list[dict]:
    rows = []
    queryset = TelemetryNode.objects.select_related("complex", "building").order_by("title")
    for node in queryset:
        flow = _money(node.flow_liters_day)
        uptime = _money(node.uptime_percent)
        pressure = _money(node.pressure_psi)
        rows.append({
            "id": _slug("node", node.id),
            "backendId": node.id,
            "complexId": _slug("complex", node.complex_id) if node.complex_id else "",
            "buildingId": _slug("building", node.building_id) if node.building_id else "",
            "title": node.title,
            "subtitle": node.subtitle or (node.complex.title if node.complex_id else ""),
            "status": node.status,
            "icon": node.icon or "apartment",
            "x": float(node.map_x),
            "y": float(node.map_y),
            "pressurePsi": pressure,
            "pressure": f"{pressure:g} PSI" if pressure else "No pressure data",
            "flowLitersDay": flow,
            "flow": f"{flow:,.0f} L/day" if flow else "No flow data",
            "latencyMs": node.latency_ms,
            "latency": f"{node.latency_ms}ms",
            "uptimePercent": uptime,
            "uptime": f"{uptime:g}%",
            "updatedAt": _datetime(node.updated_at),
        })
    return rows


def _serialize_pressure_series() -> list[dict]:
    samples = TelemetrySample.objects.select_related("node").order_by("-measured_at")[:48]
    rows = []
    for sample in reversed(list(samples)):
        rows.append({
            "id": _slug("sample", sample.id),
            "nodeId": _slug("node", sample.node_id),
            "node": sample.node.title,
            "measuredAt": _datetime(sample.measured_at),
            "pressurePsi": _money(sample.pressure_psi),
            "flowLitersDay": _money(sample.flow_liters_day),
            "uptimePercent": _money(sample.uptime_percent),
            "issue": sample.issue_state,
        })
    return rows


def build_portal_data() -> dict:
    """Return the exact data shape consumed by the current HydroFlow UI.

    The source of truth is the Mirabad Avenue backend schema copied into this
    project: Complex, Building, Apartment, Owner, Invoice and Transaction.
    No static demo rows are produced here.
    """
    owners_by_apartment = {
        owner.apartment_id: owner
        for owner in Owner.objects.select_related(
            "apartment",
            "apartment__building",
            "apartment__building__complex",
            "apartment__section",
        )
    }
    transactions = list(
        Transaction.objects.select_related(
            "owner",
            "owner__apartment",
            "owner__apartment__building",
            "owner__apartment__building__complex",
        ).order_by("-created_at")
    )
    transactions_by_owner: dict[int, list[Transaction]] = {}
    for transaction in transactions:
        transactions_by_owner.setdefault(transaction.owner_id, []).append(transaction)

    buildings_qs = Building.objects.prefetch_related(
        Prefetch(
            "apartments",
            queryset=Apartment.objects.select_related("section").order_by("number"),
        ),
        "sections",
    ).order_by("number")
    complexes = Complex.objects.prefetch_related(
        Prefetch("buildings", queryset=buildings_qs)
    ).order_by("title")

    complex_rows = []
    resident_rows = []

    hot_water_by_complex = {
        row["apartment__building__complex_id"]: _money(row["total"])
        for row in HotWaterMeterReading.objects.values("apartment__building__complex_id").annotate(
            total=Sum("end_reading")
        )
    }

    for complex_obj in complexes:
        building_rows = []
        debtor_count = 0
        paid_count = 0
        debt_total = 0.0
        collected_total = 0.0
        unit_total = 0

        for building in complex_obj.buildings.all():
            apartment_rows = []
            building_debtors = 0
            building_paid = 0
            building_debt = 0.0
            building_collected = 0.0

            apartments = list(building.apartments.all())
            unit_total += len(apartments)

            for apartment in apartments:
                owner = owners_by_apartment.get(apartment.id)
                owner_transactions = transactions_by_owner.get(owner.id, []) if owner else []
                positive_transactions = [item for item in owner_transactions if item.amount > 0]
                latest_payment = positive_transactions[0] if positive_transactions else None
                balance = _money(owner.balance if owner else 0)
                is_debtor = balance < 0
                if is_debtor:
                    debtor_count += 1
                    building_debtors += 1
                    debt_total += abs(balance)
                    building_debt += abs(balance)
                else:
                    paid_count += 1
                    building_paid += 1

                owner_collected = sum(_money(item.amount) for item in positive_transactions)
                collected_total += owner_collected
                building_collected += owner_collected

                resident_id = _slug("owner", owner.id) if owner else _slug("apartment", apartment.id)
                resident = {
                    "id": resident_id,
                    "complexId": _slug("complex", complex_obj.id),
                    "buildingId": _slug("building", building.id),
                    "apartmentId": _slug("apartment", apartment.id),
                    "name": owner.fio if owner else "Unassigned owner",
                    "apartment": f"Apartment {apartment.number}",
                    "apartmentNumber": apartment.number,
                    "building": f"House {building.number}",
                    "phone": owner.phone if owner else "",
                    "lastPayment": _date(latest_payment.created_at) if latest_payment else "",
                    "balance": balance,
                    "status": "debtor" if is_debtor else "paid",
                    "photo": "",
                    "area": f"{apartment.area:g} m²",
                    "rooms": "Apartment",
                    "charge": "",
                    "contract": f"APT-{apartment.id}",
                    "meter": apartment.section.name if apartment.section else "",
                }
                resident_rows.append(resident)

                apartment_rows.append({
                    "id": resident_id,
                    "unit": apartment.number,
                    "owner": {
                        "name": resident["name"],
                        "phone": resident["phone"],
                        "email": "",
                        "photo": "",
                    },
                    "balance": balance,
                    "status": "Overdue" if is_debtor else "Paid",
                    "rooms": "Apartment",
                    "area": resident["area"],
                    "charge": "",
                    "meter": resident["meter"],
                    "contract": resident["contract"],
                    "visit": "",
                    "lastPayment": resident["lastPayment"],
                    "occupancy": "Resident" if owner else "Vacant",
                })

            building_risk = _risk_from_split(building_debtors, building_paid, building_debt)
            building_rows.append({
                "id": _slug("building", building.id),
                "name": f"House {building.number}",
                "number": building.number,
                "address": building.address,
                "apartments": apartment_rows,
                "units": len(apartment_rows),
                "debt": building_debt,
                "collected": building_collected,
                "debtorResidents": building_debtors,
                "paidResidents": building_paid,
                "risk": building_risk,
                "health": _health_from_split(building_debtors, building_paid),
                "tone": _tone_from_risk(building_risk),
                "floors": "",
                "entrance": "",
            })

        risk = _risk_from_split(debtor_count, paid_count, debt_total)
        health = _health_from_split(debtor_count, paid_count)
        water_m3 = hot_water_by_complex.get(complex_obj.id, 0)
        complex_rows.append({
            "id": _slug("complex", complex_obj.id),
            "backendId": complex_obj.id,
            "name": complex_obj.title,
            "sector": complex_obj.address or "Mirabad Avenue",
            "prefix": complex_obj.title,
            "buildings": len(building_rows),
            "units": unit_total,
            "water": "Optimal",
            "heating": "Optimal",
            "health": health,
            "waterM3": round(water_m3, 2),
            "heatingM3": 0,
            "pressurePsi": round(45 + (health / 100) * 15, 1),
            "extraDebt": debt_total,
            "baselineCollected": collected_total,
            "image": "",
            "icon": "apartment",
            "risk": risk,
            "tone": _tone_from_risk(risk),
            "debtorResidents": debtor_count,
            "paidResidents": paid_count,
            "buildingItems": building_rows,
        })

    transaction_rows = []
    for transaction in transactions:
        owner = transaction.owner
        apartment = owner.apartment
        building = apartment.building
        complex_obj = building.complex
        amount = _money(transaction.amount)
        transaction_rows.append({
            "id": f"trx-{transaction.id}",
            "backendId": transaction.id,
            "residentId": _slug("owner", owner.id),
            "complexId": _slug("complex", complex_obj.id),
            "buildingId": _slug("building", building.id),
            "type": _transaction_type(transaction),
            "method": transaction.get_payment_type_display(),
            "date": _date(transaction.created_at),
            "amount": abs(amount),
            "signedAmount": amount,
            "status": "Success" if amount > 0 else "Pending",
            "description": transaction.description,
        })

    return {
        "source": "mirabad_avenue_backend",
        "generatedAt": timezone.localtime().isoformat(),
        "complexes": complex_rows,
        "residents": resident_rows,
        "transactions": transaction_rows,
        "notifications": _serialize_notifications(),
        "systemAlerts": _serialize_system_alerts(),
        "maintenanceTasks": _serialize_maintenance_tasks(),
        "auditEvents": _serialize_audit_events(),
        "checklistItems": _serialize_checklist_items(),
        "telemetryNodes": _serialize_telemetry_nodes(),
        "pressureSeries": _serialize_pressure_series(),
    }
