from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Sum
from django.utils import timezone

from billing.models import HotWaterMeterReading
from main_app.models import DEFAULT_SECTOR_NAME
from properties.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from portal.models import (
    AuditEvent,
    ChecklistItem,
    ChecklistNote,
    MaintenanceTask,
    PortalNotification,
    PortalStatusOverride,
    SupportTicket,
    SystemAlert,
    TelemetryNode,
    TelemetrySample,
    WorkspaceProfile,
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


def _initials(name: str) -> str:
    parts = [part for part in str(name or "").replace("_", " ").split() if part]
    if not parts:
        return "AU"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[-1][0]}".upper()


def _display_name(user) -> str:
    if not user:
        return "Admin"
    full_name = user.get_full_name().strip()
    return full_name or user.get_username()


def _role_for_user(user, profile: WorkspaceProfile | None) -> str:
    if profile and profile.role_label:
        return profile.role_label
    if user and user.is_superuser:
        return "Administrator"
    if user and user.is_staff:
        return "Staff"
    return "Operator"


def _serialize_profile(user=None) -> dict:
    User = get_user_model()
    selected_user = user if getattr(user, "is_authenticated", False) else None
    if selected_user is None:
        selected_user = (
            User.objects.filter(is_superuser=True, is_active=True).order_by("id").first()
            or User.objects.filter(is_staff=True, is_active=True).order_by("id").first()
            or User.objects.filter(is_active=True).order_by("id").first()
        )

    profile = None
    if selected_user:
        profile, _ = WorkspaceProfile.objects.get_or_create(user=selected_user)

    name = _display_name(selected_user)
    role = _role_for_user(selected_user, profile)
    last_active = selected_user.last_login if selected_user else timezone.now()
    return {
        "id": selected_user.id if selected_user else None,
        "username": selected_user.get_username() if selected_user else "",
        "name": name,
        "initials": _initials(name),
        "email": selected_user.email if selected_user else "",
        "role": role,
        "status": profile.get_status_display() if profile else "Active",
        "statusKey": profile.status if profile else WorkspaceProfile.STATUS_ACTIVE,
        "workspace": profile.workspace_name if profile else "HydroFlow",
        "organization": profile.organization if profile else "HydroFlow Utility Management",
        "accessLevel": profile.access_level if profile else "Full operations access",
        "timezone": profile.timezone_name if profile else "Asia/Tashkent",
        "lastActive": _datetime(last_active),
        "twoFactor": "Enabled" if (profile.two_factor_enabled if profile else True) else "Disabled",
        "sessionStatus": profile.get_session_status_display() if profile else "Active",
        "note": profile.note if profile else "Profile data is loaded from Django admin.",
        "adminUrl": f"/admin/portal/workspaceprofile/{profile.id}/change/" if profile else "/admin/portal/workspaceprofile/",
        "isAuthenticated": bool(selected_user),
        "isStaff": bool(selected_user and selected_user.is_staff),
        "isSuperuser": bool(selected_user and selected_user.is_superuser),
    }


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
    if not debtors or not total:
        return "Low Risk"

    debtor_share = debtors / total
    debt_per_debtor = debt_total / max(debtors, 1)

    if debtor_share >= 0.55 or debt_total >= 20_000_000 or debt_per_debtor >= 5_000_000:
        return "Critical"
    if debtor_share >= 0.30 or debt_total >= 6_000_000 or debt_per_debtor >= 1_500_000:
        return "Medium Risk"
    return "Low Risk"


def _tone_from_risk(risk: str) -> str:
    if risk == "Critical":
        return "red"
    if risk == "Medium Risk":
        return "amber"
    return "blue"


def _residential_status_to_tone(status: str) -> str:
    value = str(status or "").strip().lower()
    if value in {"critical", "критично", "kritik"}:
        return "red"
    if value in {"medium risk", "средний риск", "o'rta xavf", "maintenance", "обслуживание", "xizmat", "review", "проверка", "tekshiruv"}:
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
            "assignedTo": alert.assigned_to,
            "action": alert.action_label,
            "detectedAt": _datetime(alert.detected_at),
            "complexId": _slug("complex", related.id) if related else "",
            "buildingId": _slug("building", alert.building_id) if alert.building_id else "",
            "adminUrl": f"/admin/portal/systemalert/{alert.id}/change/",
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
            "adminUrl": f"/admin/portal/maintenancetask/{task.id}/change/",
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


def _serialize_checklist_notes() -> list[dict]:
    return [
        {
            "id": f"note-{note.id}",
            "backendId": note.id,
            "text": note.text,
            "time": _datetime(note.created_at),
            "done": note.done,
            "scope": note.scope,
            "templateKey": note.template_key,
        }
        for note in ChecklistNote.objects.order_by("-created_at")[:24]
    ]


def _serialize_support_tickets() -> list[dict]:
    rows = []
    queryset = SupportTicket.objects.select_related(
        "created_by",
        "complex",
        "building",
        "apartment",
        "owner",
    ).order_by("status", "-updated_at")[:40]
    for ticket in queryset:
        rows.append({
            "id": f"ticket-{ticket.id}",
            "backendId": ticket.id,
            "title": ticket.title,
            "message": ticket.message,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "source": ticket.source,
            "createdBy": ticket.created_by.get_username() if ticket.created_by_id else "Portal",
            "updatedAt": _datetime(ticket.updated_at),
            "adminUrl": f"/admin/portal/supportticket/{ticket.id}/change/",
        })
    return rows


def _serialize_support_summary() -> dict:
    tickets = list(SupportTicket.objects.order_by("status", "-updated_at")[:20])
    open_count = sum(1 for ticket in tickets if ticket.status == SupportTicket.STATUS_OPEN)
    in_progress_count = sum(1 for ticket in tickets if ticket.status == SupportTicket.STATUS_IN_PROGRESS)
    resolved_count = sum(1 for ticket in tickets if ticket.status == SupportTicket.STATUS_RESOLVED)
    latest = tickets[0] if tickets else None
    return {
        "helpdesk": "Connected",
        "openCount": open_count,
        "inProgressCount": in_progress_count,
        "resolvedCount": resolved_count,
        "latestUpdatedAt": _datetime(latest.updated_at) if latest else "",
        "latestTitle": latest.title if latest else "",
    }


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


def build_portal_data(user=None) -> dict:
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
    override_map = {
        (item.context, item.target_type, item.target_id): item.status_value
        for item in PortalStatusOverride.objects.all()
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
                telegram_status = str(getattr(owner, "telegram_status", "") or "").strip().lower() if owner else ""
                telegram_user = str(getattr(owner, "telegram_user", "") or "").strip() if owner else ""
                telegram_id = str(getattr(owner, "telegram_id", "") or "").strip() if owner else ""
                telegram_connected = bool(
                    telegram_user
                    or telegram_id
                    or telegram_status in {"connected", "active", "verified"}
                )
                resident = {
                    "id": resident_id,
                    "backendId": owner.id if owner else None,
                    "ownerBackendId": owner.id if owner else None,
                    "complexId": _slug("complex", complex_obj.id),
                    "complexBackendId": complex_obj.id,
                    "buildingId": _slug("building", building.id),
                    "buildingBackendId": building.id,
                    "apartmentId": _slug("apartment", apartment.id),
                    "apartmentBackendId": apartment.id,
                    "name": owner.fio if owner else "Unassigned owner",
                    "apartment": f"Apartment {apartment.number}",
                    "apartmentNumber": apartment.number,
                    "section": apartment.section.name if apartment.section else "",
                    "building": f"House {building.number}",
                    "buildingNumber": building.number,
                    "complex": complex_obj.title,
                    "complexAddress": complex_obj.address or "",
                    "phone": owner.phone if owner else "",
                    "lastPayment": _date(latest_payment.created_at) if latest_payment else "",
                    "lastPaymentAt": _datetime(latest_payment.created_at) if latest_payment else "",
                    "balance": balance,
                    "status": "debtor" if is_debtor else "paid",
                    "photo": "",
                    "area": f"{apartment.area:g} m²",
                    "rooms": "Apartment",
                    "charge": "",
                    "contract": f"APT-{apartment.id}",
                    "meter": apartment.section.name if apartment.section else "",
                    "email": "",
                    "telegramStatus": telegram_status or "not_linked",
                    "telegramUser": telegram_user,
                    "telegramId": telegram_id,
                    "telegramConnected": telegram_connected,
                    "createdAt": _datetime(owner.created_at) if owner else _datetime(apartment.created_at),
                }
                resident_rows.append(resident)

                apartment_rows.append({
                    "id": resident_id,
                    "backendId": apartment.id,
                    "apartmentBackendId": apartment.id,
                    "ownerBackendId": owner.id if owner else None,
                    "complexId": _slug("complex", complex_obj.id),
                    "complexBackendId": complex_obj.id,
                    "buildingId": _slug("building", building.id),
                    "buildingBackendId": building.id,
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
                    "isOccupied": bool(owner),
                })

            building_risk = _risk_from_split(building_debtors, building_paid, building_debt)
            building_risk = override_map.get(
                (PortalStatusOverride.CONTEXT_RESIDENTIAL, PortalStatusOverride.TARGET_BUILDING, building.id),
                building_risk,
            )
            building_rows.append({
                "id": _slug("building", building.id),
                "backendId": building.id,
                "complexBackendId": complex_obj.id,
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
                "tone": _residential_status_to_tone(building_risk),
                "floors": "",
                "entrance": "",
            })

        risk = _risk_from_split(debtor_count, paid_count, debt_total)
        risk = override_map.get(
            (PortalStatusOverride.CONTEXT_RESIDENTIAL, PortalStatusOverride.TARGET_COMPLEX, complex_obj.id),
            risk,
        )
        health = _health_from_split(debtor_count, paid_count)
        water_m3 = hot_water_by_complex.get(complex_obj.id, 0)
        complex_rows.append({
            "id": _slug("complex", complex_obj.id),
            "backendId": complex_obj.id,
            "name": complex_obj.title,
            "sector": DEFAULT_SECTOR_NAME,
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
            "tone": _residential_status_to_tone(risk),
            "debtorResidents": debtor_count,
            "paidResidents": paid_count,
            "buildingItems": building_rows,
        })

    apartment_override_map = {
        target_id: status
        for (context, target_type, target_id), status in override_map.items()
        if context == PortalStatusOverride.CONTEXT_RESIDENTIAL and target_type == PortalStatusOverride.TARGET_APARTMENT
    }
    if apartment_override_map:
        for resident in resident_rows:
            apartment_id = resident.get("apartmentBackendId")
            if apartment_id in apartment_override_map:
                resident["status"] = apartment_override_map[apartment_id]
        for complex_row in complex_rows:
            for building_row in complex_row.get("buildingItems", []):
                for apartment_row in building_row.get("apartments", []):
                    apartment_id = apartment_row.get("backendId")
                    if apartment_id in apartment_override_map:
                        apartment_row["status"] = apartment_override_map[apartment_id]

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
            "ownerBackendId": owner.id,
            "apartmentBackendId": apartment.id,
            "buildingBackendId": building.id,
            "complexBackendId": complex_obj.id,
            "residentId": _slug("owner", owner.id),
            "residentName": owner.fio,
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

    for row in transaction_rows:
        override = override_map.get(
            (PortalStatusOverride.CONTEXT_TRANSACTIONS, PortalStatusOverride.TARGET_TRANSACTION, row["backendId"])
        )
        if override:
            row["status"] = override

    return {
        "source": "mirabad_avenue_backend",
        "generatedAt": timezone.localtime().isoformat(),
        "profile": _serialize_profile(user),
        "complexes": complex_rows,
        "residents": resident_rows,
        "transactions": transaction_rows,
        "notifications": _serialize_notifications(),
        "systemAlerts": _serialize_system_alerts(),
        "maintenanceTasks": _serialize_maintenance_tasks(),
        "auditEvents": _serialize_audit_events(),
        "checklistItems": _serialize_checklist_items(),
        "checklistNotes": _serialize_checklist_notes(),
        "supportTickets": _serialize_support_tickets(),
        "supportSummary": _serialize_support_summary(),
        "telemetryNodes": _serialize_telemetry_nodes(),
        "pressureSeries": _serialize_pressure_series(),
    }
