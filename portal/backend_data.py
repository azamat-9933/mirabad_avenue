from __future__ import annotations

import hashlib
import re
import threading
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Case, Count, DecimalField, F, Max, Prefetch, Q, Sum, Value, When, Window
from django.db.models.functions import RowNumber, TruncMonth
from django.urls import reverse
from django.utils import timezone

from billing.models import HotWaterMeterReading
from main_app.models import DEFAULT_SECTOR_NAME
from properties.models import Apartment, Building, Complex, Owner
from payments.models import Transaction
from payments.services import OPENING_BALANCE_TAG, incoming_payment_q, is_incoming_payment
from portal.audit import can_view_audit
from portal.models import (
    AuditEvent,
    ChecklistItem,
    ChecklistNote,
    PortalNotification,
    PortalStatusOverride,
    SupportTicket,
    SystemAlert,
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
    # Only the signed-in user is described; never fall back to another account.
    selected_user = user if getattr(user, "is_authenticated", False) else None

    profile = None
    if selected_user:
        profile = getattr(selected_user, "workspace_profile", None)

    username = selected_user.get_username() if selected_user else ""
    name = _display_name(selected_user) if selected_user else "Admin"
    role = _role_for_user(selected_user, profile)
    last_active = selected_user.last_login if selected_user else timezone.now()
    groups = list(selected_user.groups.values_list("name", flat=True)) if selected_user else []
    permission_count = len(selected_user.get_all_permissions()) if selected_user else 0
    workspace_name = (profile.workspace_name if profile else "") or "Mirabad Avenue"
    organization = (profile.organization if profile else "") or "Mirabad Avenue"
    if workspace_name.strip().lower() == "hydroflow":
        workspace_name = "Mirabad Avenue"
    if organization.strip().lower() == "hydroflow utility management":
        organization = "Mirabad Avenue"
    return {
        "id": selected_user.id if selected_user else None,
        "username": username,
        "name": name,
        "fullName": name,
        "firstName": selected_user.first_name if selected_user else "",
        "lastName": selected_user.last_name if selected_user else "",
        "initials": _initials(name),
        "email": selected_user.email if selected_user else "",
        "role": role,
        "status": profile.get_status_display() if profile else "Active",
        "statusKey": profile.status if profile else WorkspaceProfile.STATUS_ACTIVE,
        "workspace": workspace_name,
        "organization": organization,
        "accessLevel": profile.access_level if profile else "Full operations access",
        "timezone": profile.timezone_name if profile else "Asia/Tashkent",
        "lastActive": _datetime(last_active),
        "lastLogin": _datetime(selected_user.last_login) if selected_user else "",
        "dateJoined": _datetime(selected_user.date_joined) if selected_user else "",
        "profileUpdated": _datetime(profile.updated_at) if profile else "",
        "twoFactor": "Enabled" if (profile.two_factor_enabled if profile else True) else "Disabled",
        "sessionStatus": profile.get_session_status_display() if profile else "Active",
        "note": profile.note if profile else "Profile data is loaded from Django admin.",
        "adminUrl": f"/admin/portal/workspaceprofile/{profile.id}/change/" if profile else "/admin/portal/workspaceprofile/add/",
        "isAuthenticated": bool(selected_user),
        "isStaff": bool(selected_user and selected_user.is_staff),
        "isSuperuser": bool(selected_user and selected_user.is_superuser),
        "isActive": bool(selected_user and selected_user.is_active),
        "groups": groups,
        "groupsLabel": ", ".join(groups),
        "permissionsCount": permission_count,
        "backendSource": "Django User + WorkspaceProfile" if profile else "Django User",
        # Alerts assigned to this operator are also sent to this Telegram chat.
        "telegram": {
            "connected": bool(profile and profile.telegram_chat_id),
            "username": (profile.telegram_username if profile else "") or "",
            "linkedAt": _datetime(profile.telegram_linked_at) if profile and profile.telegram_linked_at else "",
        },
    }


def _serialize_operators() -> list[dict]:
    """Everyone an alert can be assigned to: every active portal account, the administrator included."""
    users = (
        get_user_model().objects.filter(is_active=True)
        .select_related("workspace_profile")
        .order_by("-is_superuser", "first_name", "last_name", "username")
    )
    rows = []
    for user in users:
        profile = getattr(user, "workspace_profile", None)
        rows.append({
            "id": user.id,
            "username": user.get_username(),
            "name": _display_name(user),
            "isSuperuser": user.is_superuser,
            "telegramConnected": bool(profile and profile.telegram_chat_id),
        })
    return rows


def _serialize_admin_users() -> list[dict]:
    User = get_user_model()
    users = User.objects.filter(is_active=True).filter(Q(is_staff=True) | Q(is_superuser=True)).order_by("username", "id")
    return [
        {
            "id": user.id,
            "username": user.get_username(),
            "name": _display_name(user),
            "isStaff": user.is_staff,
            "isSuperuser": user.is_superuser,
        }
        for user in users
        if user.get_username()
    ]


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


def _payment_type_labels() -> dict[str, str]:
    """Display labels of Transaction.payment_type, resolved once instead of per row (they are lazy translations)."""
    return {key: str(label) for key, label in Transaction.TYPE_CHOICES}


def _transaction_type(transaction: Transaction, labels: dict[str, str] | None = None) -> str:
    description = str(transaction.description or "").lower()
    if transaction.payment_type == Transaction.TYPE_CHARGE and "[billing:recalculation]" in description:
        return "Recalculation"
    if transaction.payment_type == Transaction.TYPE_MANUAL:
        if any(tag in description for tag in ("[portal:card-credit]", "[portal:terminal-credit]", "[portal:transfer-credit]")):
            return "Utility Payment"
        if "[portal:balance-debit]" in description:
            return "Manual Adjustment"
    mapping = {
        Transaction.TYPE_PAYME: "Utility Payment",
        Transaction.TYPE_CLICK: "Utility Payment",
        Transaction.TYPE_CASH: "Utility Payment",
        Transaction.TYPE_MANUAL: "Manual Adjustment",
        Transaction.TYPE_CHARGE: "Monthly Charge",
    }
    if transaction.payment_type in mapping:
        return mapping[transaction.payment_type]
    labels = labels if labels is not None else _payment_type_labels()
    return labels.get(transaction.payment_type, transaction.payment_type)


def _transaction_method_label(transaction: Transaction, labels: dict[str, str] | None = None) -> str:
    description = str(transaction.description or "").lower()
    if transaction.payment_type == Transaction.TYPE_MANUAL:
        if "[portal:card-credit]" in description or "[portal:terminal-credit]" in description:
            return "Card"
        if "[portal:transfer-credit]" in description:
            return "Card transfer"
        if "[portal:balance-debit]" in description:
            return "Adjustment"
    labels = labels if labels is not None else _payment_type_labels()
    return labels.get(transaction.payment_type, transaction.payment_type)


def _telegram_state(owner) -> tuple[str, bool]:
    """(status, connected); the Telegram bot sets the status when the resident registers."""
    connected = bool(owner and owner.telegram_status == Owner.TELEGRAM_CONNECTED)
    return (Owner.TELEGRAM_CONNECTED if connected else Owner.TELEGRAM_NOT_CONNECTED), connected


# Row serializers shared by the portal snapshot and the paginated /api/lists/* endpoints,
# so both always describe a record the same way.

def serialize_resident(apartment, owner, last_payment_at=None) -> dict:
    """Resident row for one apartment; a vacant apartment (owner=None) gets an "Unassigned owner" row.

    The balance is the apartment account's, so debt billed while the apartment was vacant shows up.
    """
    building = apartment.building
    complex_obj = building.complex
    balance = _money(apartment.balance)
    has_contract = bool(owner and owner.has_contract)
    telegram_status, telegram_connected = _telegram_state(owner)
    return {
        "id": _slug("owner", owner.id) if owner else _slug("apartment", apartment.id),
        "backendId": owner.id if owner else None,
        "ownerBackendId": owner.id if owner else None,
        "displayId": owner.id if owner else apartment.id,
        "complexId": _slug("complex", complex_obj.id),
        "complexBackendId": complex_obj.id,
        "buildingId": _slug("building", building.id),
        "buildingBackendId": building.id,
        "apartmentId": _slug("apartment", apartment.id),
        "apartmentBackendId": apartment.id,
        "adminUrl": reverse("admin:main_app_owner_change", args=[owner.id]) if owner else "",
        "name": owner.fio if owner else "Unassigned owner",
        "apartment": str(apartment.number),
        "apartmentNumber": apartment.number,
        "personalAccount": apartment.personal_account,
        "building": str(building.number),
        "complex": complex_obj.title,
        "phone": (owner.phone or "") if owner else "",
        "lastPayment": _date(last_payment_at),
        "balance": balance,
        "status": "debtor" if balance < 0 else "paid",
        "area": f"{apartment.area:g} m²",
        "contract": "True" if has_contract else "False",
        "hasContract": has_contract,
        "telegramStatus": telegram_status,
        "telegramUser": str(owner.telegram_user or "").strip() if owner else "",
        "telegramConnected": telegram_connected,
        "createdAt": _datetime(owner.created_at if owner else apartment.created_at),
    }


def serialize_transaction(transaction, apartment, owner, labels=None, status_override=None, current_tz=None) -> dict:
    """Ledger row of an apartment account; ``apartment`` comes with building and complex loaded.

    ``owner`` is the apartment's current owner (None while vacant): the whole account history is
    shown under the resident row of the apartment, whose id matches ``serialize_resident``.
    """
    building = apartment.building
    complex_obj = building.complex
    amount = _money(transaction.amount)
    created_at = timezone.localtime(transaction.created_at, current_tz)
    return {
        "id": f"trx-{transaction.id}",
        "backendId": transaction.id,
        "ownerBackendId": owner.id if owner else None,
        "apartmentBackendId": apartment.id,
        "buildingBackendId": building.id,
        "complexBackendId": complex_obj.id,
        "residentId": _slug("owner", owner.id) if owner else _slug("apartment", apartment.id),
        "residentName": owner.fio if owner else "Unassigned owner",
        "apartment": apartment.number,
        "complexId": _slug("complex", complex_obj.id),
        "buildingId": _slug("building", building.id),
        "type": _transaction_type(transaction, labels),
        "method": _transaction_method_label(transaction, labels),
        "paymentType": transaction.payment_type,
        "date": created_at.strftime("%d.%m.%Y"),
        "createdAt": created_at.strftime("%d.%m.%Y, %H:%M"),
        "amount": abs(amount),
        "signedAmount": amount,
        "balanceBefore": _money(transaction.balance_before),
        "balanceAfter": _money(transaction.balance_after),
        "status": status_override or ("Success" if is_incoming_payment(transaction) else "Pending"),
        "description": transaction.description or "",
        "createdBy": transaction.created_by or "",
        "externalId": transaction.external_id or "",
    }



def serialize_notification(item: PortalNotification, alert_backend_id="") -> dict:
    related = item.complex or (item.building.complex if item.building_id else None)
    action_state = "" if item.action_state == "Created from dashboard" else item.action_state
    resolved_by = _display_name(item.resolved_by) if item.resolved_by_id else ""
    if not resolved_by and isinstance(action_state, str) and action_state.lower().startswith("resolved by "):
        resolved_by = action_state[12:].strip()
    return {
        "id": _slug("notification", item.id),
        "backendId": item.id,
        "alertBackendId": alert_backend_id or "",
        "severity": item.severity,
        "title": item.title,
        "message": item.message,
        "section": _date_section(item.event_at),
        "read": item.status == PortalNotification.STATUS_READ,
        "pinned": item.pinned,
        "eventAt": _datetime(item.event_at),
        "actionPrimary": item.action_primary,
        "actionSecondary": item.action_secondary,
        "actionState": action_state,
        "resolvedBy": resolved_by,
        # Task fields: who set it, for whom, and who closed it when. Only the assignee resolves it.
        "createdById": item.created_by_id,
        "createdByName": _display_name(item.created_by) if item.created_by_id else "",
        "assigneeId": item.assignee_id,
        "assigneeName": _display_name(item.assignee) if item.assignee_id else "",
        "resolvedById": item.resolved_by_id,
        "resolvedAt": _datetime(item.resolved_at) if item.resolved_at else "",
        "telegramStatus": item.telegram_status,
        "complexId": _slug("complex", related.id) if related else "",
        "buildingId": _slug("building", item.building_id) if item.building_id else "",
        "ownerId": _slug("owner", item.owner_id) if item.owner_id else "",
        "status": item.status,
        "adminUrl": "",
    }


NOTIFICATION_RELATED = ("complex", "building", "building__complex", "apartment", "owner", "created_by", "assignee", "resolved_by")


def serialize_audit_event(event: AuditEvent) -> dict:
    return {
        "id": _slug("audit", event.id),
        "backendId": event.id,
        "type": event.event_type,
        "label": event.get_event_type_display(),
        "title": event.title,
        "message": event.message,
        "actor": event.actor,
        "actorId": event.user_id,
        "actorName": _display_name(event.user) if event.user_id else event.actor,
        "ipAddress": event.ip_address or "",
        "time": _datetime(event.created_at),
        "complexId": _slug("complex", event.complex_id) if event.complex_id else "",
        "buildingId": _slug("building", event.building_id) if event.building_id else "",
        "ownerId": _slug("owner", event.owner_id) if event.owner_id else "",
        "complexName": event.complex.title if event.complex_id else "",
        "buildingName": event.building.number if event.building_id else "",
        "apartmentNumber": event.apartment.number if event.apartment_id else "",
        "ownerName": event.owner.fio if event.owner_id else "",
        "adminUrl": "",
    }


def residential_override_maps() -> dict[str, dict[int, str]]:
    """Portal-assigned statuses for the residential view, keyed by target type, then target id."""
    maps = {
        PortalStatusOverride.TARGET_COMPLEX: {},
        PortalStatusOverride.TARGET_BUILDING: {},
        PortalStatusOverride.TARGET_APARTMENT: {},
    }
    for item in PortalStatusOverride.objects.filter(context=PortalStatusOverride.CONTEXT_RESIDENTIAL):
        if item.target_type in maps:
            maps[item.target_type][item.target_id] = item.status_value
    return maps


def transaction_override_map(transaction_ids=None) -> dict[int, str]:
    """Portal-assigned transaction statuses; all of them when ``transaction_ids`` is None."""
    queryset = PortalStatusOverride.objects.filter(
        context=PortalStatusOverride.CONTEXT_TRANSACTIONS,
        target_type=PortalStatusOverride.TARGET_TRANSACTION,
    )
    if transaction_ids is not None:
        queryset = queryset.filter(target_id__in=list(transaction_ids))
    return {item.target_id: item.status_value for item in queryset}


def serialize_complex(complex_obj, owner_for, payment_totals_for, override_maps, hot_water_by_complex) -> tuple[dict, list[dict]]:
    """Complex row with nested buildings/apartments, plus one resident row per apartment.

    ``complex_obj`` must have buildings and their apartments prefetched. ``owner_for(apartment)``
    returns the apartment's owner or None; ``payment_totals_for(apartment)`` returns the account's
    ``(collected, last_payment_at)`` over its whole history (see ``account_payment_totals``). Debt/collected totals and risk are computed here; portal status overrides win over
    computed risk and apartment status.
    """
    complex_overrides = override_maps[PortalStatusOverride.TARGET_COMPLEX]
    building_overrides = override_maps[PortalStatusOverride.TARGET_BUILDING]
    apartment_overrides = override_maps[PortalStatusOverride.TARGET_APARTMENT]
    building_rows = []
    resident_rows = []
    debtor_count = 0
    paid_count = 0
    debt_total = 0.0
    collected_total = 0.0
    unit_total = 0
    total_area = 0.0

    for building in complex_obj.buildings.all():
        apartment_rows = []
        building_debtors = 0
        building_paid = 0
        building_debt = 0.0
        building_collected = 0.0
        apartments = list(building.apartments.all())
        unit_total += len(apartments)
        building_total_area = sum(_money(apartment.area) for apartment in apartments)
        total_area += building_total_area

        for apartment in apartments:
            owner = owner_for(apartment)
            owner_collected, last_payment_at = payment_totals_for(apartment)
            resident = serialize_resident(apartment, owner, last_payment_at)
            balance = resident["balance"]
            is_debtor = balance < 0
            if is_debtor:
                debtor_count += 1
                building_debtors += 1
                debt_total += abs(balance)
                building_debt += abs(balance)
            else:
                paid_count += 1
                building_paid += 1
            collected_total += owner_collected
            building_collected += owner_collected

            override = apartment_overrides.get(apartment.id)
            if override:
                resident["status"] = override
            resident_rows.append(resident)
            apartment_rows.append({
                "id": resident["id"],
                "backendId": apartment.id,
                "apartmentBackendId": apartment.id,
                "ownerBackendId": resident["ownerBackendId"],
                "complexId": resident["complexId"],
                "complexBackendId": complex_obj.id,
                "buildingId": resident["buildingId"],
                "buildingBackendId": building.id,
                "unit": apartment.number,
                "personalAccount": apartment.personal_account,
                "owner": {
                    "name": resident["name"],
                    "phone": resident["phone"],
                    "email": "",
                    "photo": "",
                    "telegramUser": resident["telegramUser"],
                    "telegramConnected": resident["telegramConnected"],
                },
                "balance": balance,
                "status": override or ("Overdue" if is_debtor else "Paid"),
                "rooms": "Apartment",
                "area": resident["area"],
                "charge": "",
                "contract": resident["contract"],
                "visit": "",
                "lastPayment": resident["lastPayment"],
                "occupancy": "Resident" if owner else "Vacant",
                "isOccupied": bool(owner),
            })

        building_risk = _risk_from_split(building_debtors, building_paid, building_debt)
        building_risk = building_overrides.get(building.id, building_risk)
        building_rows.append({
            "id": _slug("building", building.id),
            "backendId": building.id,
            "complexBackendId": complex_obj.id,
            "name": f"House {building.number}",
            "number": building.number,
            "address": building.address,
            "apartments": apartment_rows,
            "units": len(apartment_rows),
            "totalArea": round(building_total_area, 2),
            "debt": building_debt,
            "collected": building_collected,
            "debtorResidents": building_debtors,
            "paidResidents": building_paid,
            # The operator looking after the house (statistics: what its residents paid).
            "operatorId": building.operator_id,
            "operatorName": _display_name(building.operator) if building.operator_id else "",
            "risk": building_risk,
            "health": _health_from_split(building_debtors, building_paid),
            "tone": _residential_status_to_tone(building_risk),
        })

    risk = _risk_from_split(debtor_count, paid_count, debt_total)
    risk = complex_overrides.get(complex_obj.id, risk)
    health = _health_from_split(debtor_count, paid_count)
    water_m3 = hot_water_by_complex.get(complex_obj.id, 0)
    complex_row = {
        "id": _slug("complex", complex_obj.id),
        "backendId": complex_obj.id,
        "name": complex_obj.title,
        "sector": DEFAULT_SECTOR_NAME,
        "prefix": complex_obj.title,
        "buildings": len(building_rows),
        "units": unit_total,
        "totalArea": round(total_area, 2),
        "health": health,
        "waterM3": round(water_m3, 2),
        "heatingM3": 0,
        "extraDebt": debt_total,
        "baselineCollected": collected_total,
        "image": "",
        "icon": "apartment",
        "risk": risk,
        "tone": _residential_status_to_tone(risk),
        "debtorResidents": debtor_count,
        "paidResidents": paid_count,
        "buildingItems": building_rows,
    }
    return complex_row, resident_rows


def snapshot_apartment_refs(complex_row) -> None:
    """In the snapshot a house lists its apartments as ``[apartmentBackendId, status]`` pairs.

    Every other field of an apartment row repeats the apartment's resident row, which made up a third
    of the snapshot; app.js (expandApartmentRows) rebuilds the rows from the residents, so a field
    added to apartment rows in serialize_complex must be added there too. /api/lists/complexes/
    keeps the full rows.
    """
    for building in complex_row["buildingItems"]:
        building["apartments"] = [[row["backendId"], row["status"]] for row in building["apartments"]]


def hot_water_totals_by_complex() -> dict[int, float]:
    """Metered hot-water consumption per complex, the same per-row rule as HotWaterMeterReading.consumption.

    Meter readings are cumulative, so summing raw end readings would count every past period again.
    """
    consumption = Case(
        When(end_reading__isnull=True, then=Value(Decimal("0"))),
        When(start_reading__isnull=True, then=F("end_reading")),
        When(end_reading__gte=F("start_reading"), then=F("end_reading") - F("start_reading")),
        default=Value(Decimal("0")),
        output_field=DecimalField(max_digits=12, decimal_places=2),
    )
    return {
        row["apartment__building__complex_id"]: _money(row["total"])
        for row in HotWaterMeterReading.objects.values("apartment__building__complex_id").annotate(total=Sum(consumption))
    }


def _serialize_notifications() -> list[dict]:
    queryset = list(PortalNotification.objects.select_related(*NOTIFICATION_RELATED)
                    .exclude(status=PortalNotification.STATUS_ARCHIVED).order_by("-pinned", "-event_at")[:80])
    notification_ids = [item.id for item in queryset]
    alert_map = {}
    if notification_ids:
        for alert in SystemAlert.objects.filter(metadata__notification_id__in=notification_ids).exclude(status=SystemAlert.STATUS_RESOLVED).order_by("-detected_at", "-id"):
            notification_id = int((alert.metadata or {}).get("notification_id") or 0)
            if notification_id and notification_id not in alert_map:
                alert_map[notification_id] = alert.id
    return [serialize_notification(item, alert_map.get(item.id, "")) for item in queryset]


def _serialize_system_alerts() -> list[dict]:
    rows = []
    queryset = SystemAlert.objects.select_related(
        "complex",
        "building",
        "apartment",
        "owner",
    ).exclude(status=SystemAlert.STATUS_RESOLVED).order_by("-detected_at")[:80]
    queryset = list(queryset)
    # The assignee lives on the alert's notification (the task): only they may resolve it.
    notification_ids = [int((alert.metadata or {}).get("notification_id") or 0) for alert in queryset]
    assignees = dict(
        PortalNotification.objects.filter(id__in=[pk for pk in notification_ids if pk]).values_list("id", "assignee_id")
    )
    for alert, notification_id in zip(queryset, notification_ids):
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
            "assigneeId": assignees.get(notification_id),
            "action": alert.action_label,
            "detectedAt": _datetime(alert.detected_at),
            "complexId": _slug("complex", related.id) if related else "",
            "buildingId": _slug("building", alert.building_id) if alert.building_id else "",
            "adminUrl": f"/admin/portal/systemalert/{alert.id}/change/",
        })
    return rows



def _serialize_audit_events(user=None) -> list[dict]:
    # The activity log is for the head administrator; operators get no audit rows in their snapshot.
    if not can_view_audit(user):
        return []
    queryset = AuditEvent.objects.select_related(
        "complex",
        "building",
        "apartment",
        "owner",
        "user",
    ).order_by("-created_at")[:120]
    return [serialize_audit_event(event) for event in queryset]


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
            "done": item.done,
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




# The snapshot carries only the latest ledger rows of each account; anything that needs the whole
# history gets it pre-aggregated (account_payment_totals, payment_summary) or from /api/lists/transactions/.
RECENT_TRANSACTIONS_PER_ACCOUNT = 5
PAYMENT_CHANNELS = ("Payme", "Click", "Cash", "Card", "Card transfer")


def account_payment_totals() -> dict[int, tuple[float, object]]:
    """``{apartment_id: (collected, last_payment_at)}`` over each account's whole payment history.

    Payments taken back (portal status "Cancelled", see payments.click.cancel_confirmed_payment) are left out.
    """
    cancelled = PortalStatusOverride.objects.filter(
        context=PortalStatusOverride.CONTEXT_TRANSACTIONS,
        target_type=PortalStatusOverride.TARGET_TRANSACTION,
        status_value=PortalStatusOverride.TRANSACTION_CANCELLED,
    ).values("target_id")
    rows = (
        Transaction.objects.filter(incoming_payment_q(), apartment__isnull=False)
        .exclude(pk__in=cancelled)
        .values("apartment_id")
        .annotate(collected=Sum("amount"), last_payment_at=Max("created_at"))
    )
    return {row["apartment_id"]: (_money(row["collected"]), row["last_payment_at"]) for row in rows}


def _payment_channel(payment_type: str, description: str) -> str:
    """Payment channel shown in statistics; same rules as the frontend used on raw rows."""
    description = (description or "").lower()
    if payment_type == Transaction.TYPE_PAYME or "[portal:payme-credit]" in description:
        return "Payme"
    if payment_type == Transaction.TYPE_CLICK or "[portal:click-credit]" in description:
        return "Click"
    if payment_type == Transaction.TYPE_CASH or "[portal:cash-credit]" in description:
        return "Cash"
    if "[portal:card-credit]" in description or "[portal:terminal-credit]" in description:
        return "Card"
    if "[portal:transfer-credit]" in description:
        return "Card transfer"
    return ""


def payment_summary(building_by_apartment: dict[int, int], status_overrides: dict[int, str]) -> dict:
    """Full-history payment figures for the statistics and payments pages.

    ``monthly`` has one row per (month, building, channel) of successful incoming payments, with the
    number of distinct accounts that paid; ``channels`` are all-time totals per channel. A row counts as
    successful the same way ``serialize_transaction`` labels it "Success" (portal overrides win).
    """
    current_tz = timezone.get_current_timezone()
    now = timezone.localtime(timezone.now(), current_tz)
    current_month = f"{now.year}-{now.month:02d}"
    # The current month is always offered, even before its first ledger entry.
    months = {current_month}
    monthly = defaultdict(lambda: [Decimal("0"), 0, set()])
    channels = {channel: [Decimal("0"), set()] for channel in PAYMENT_CHANNELS}
    current_month_payments = 0
    rows = (
        Transaction.objects.filter(apartment__isnull=False)
        .annotate(month=TruncMonth("created_at", tzinfo=current_tz))
        .values_list("id", "apartment_id", "payment_type", "amount", "description", "month")
    )
    for transaction_id, apartment_id, payment_type, amount, description, month in rows.iterator(chunk_size=5000):
        month_key = f"{month.year}-{month.month:02d}"
        months.add(month_key)
        if amount <= 0:
            continue
        override = status_overrides.get(transaction_id)
        if override == PortalStatusOverride.TRANSACTION_CANCELLED:
            continue  # taken back off the account: not a payment in any figure
        channel = _payment_channel(payment_type, description)
        if channel:
            channels[channel][0] += amount
            channels[channel][1].add(apartment_id)
        if override:
            successful = override.strip().lower() == "success"
        else:
            successful = payment_type != Transaction.TYPE_CHARGE and OPENING_BALANCE_TAG not in (description or "")
        if not successful:
            continue
        bucket = monthly[(month_key, building_by_apartment.get(apartment_id), channel)]
        bucket[0] += amount
        bucket[1] += 1
        bucket[2].add(apartment_id)
        if month_key == current_month:
            current_month_payments += 1
    return {
        "months": sorted(months),
        "monthly": [
            {
                "month": month_key,
                "buildingBackendId": building_id,
                "channel": channel,
                "amount": _money(amount),
                "count": count,
                "residents": len(accounts),
            }
            for (month_key, building_id, channel), (amount, count, accounts) in sorted(
                monthly.items(), key=lambda item: (item[0][0], item[0][1] or 0, item[0][2])
            )
        ],
        "channels": {
            channel: {"amount": _money(amount), "residents": len(accounts)}
            for channel, (amount, accounts) in channels.items()
        },
        "currentMonthPayments": current_month_payments,
    }


def balance_summary(apartments_by_id: dict, months: list[str]) -> list[dict]:
    """Debt, overpayment and debtors of each house at the end of each month (now, for the current one).

    An account's balance at the end of a month is today's balance minus every ledger entry made after
    that month, so the statistics month filter shows the debt as it stood then.
    """
    current_tz = timezone.get_current_timezone()
    entries_by_month = defaultdict(dict)
    rows = (
        Transaction.objects.filter(apartment__isnull=False)
        .annotate(month=TruncMonth("created_at", tzinfo=current_tz))
        .values("apartment_id", "month")
        .annotate(total=Sum("amount"))
        .order_by()
    )
    for row in rows:
        entries_by_month[f"{row['month'].year}-{row['month'].month:02d}"][row["apartment_id"]] = row["total"]

    balances = {apartment_id: apartment.balance or Decimal("0") for apartment_id, apartment in apartments_by_id.items()}
    summary = []
    # Newest month first: after each month its own entries are taken back out of the balances.
    for month in sorted(months, reverse=True):
        houses = defaultdict(lambda: [Decimal("0"), Decimal("0"), 0])
        for apartment_id, apartment in apartments_by_id.items():
            balance = balances[apartment_id]
            house = houses[apartment.building_id]
            if balance < 0:
                house[0] -= balance
                house[2] += 1
            elif balance > 0:
                house[1] += balance
        summary.extend(
            {"month": month, "buildingBackendId": building_id, "debt": _money(debt), "overpayment": _money(overpayment), "debtors": debtors}
            for building_id, (debt, overpayment, debtors) in sorted(houses.items())
        )
        for apartment_id, amount in entries_by_month.get(month, {}).items():
            if apartment_id in balances:
                balances[apartment_id] -= amount
    return summary


def debtors_at(month: str = "", building_id=None) -> list[dict]:
    """Debtor apartments at the end of ``month`` ("YYYY-MM"; empty or the current month: now), largest debt first.

    Same rule as ``balance_summary``: the balance then is today's balance minus the ledger entries
    made after that month, so the list matches the statistics "Debtors" card.
    """
    current_tz = timezone.get_current_timezone()
    now = timezone.localtime(timezone.now(), current_tz)
    apartments = Apartment.objects.select_related("building", "owner").order_by()
    if building_id:
        apartments = apartments.filter(building_id=building_id)
    apartments = list(apartments)
    later = {}
    match = re.fullmatch(r"(\d{4})-(\d{2})", str(month or ""))
    if match and match.group(0) != f"{now.year}-{now.month:02d}":
        year, number = int(match.group(1)), int(match.group(2))
        next_month = timezone.make_aware(datetime(year + number // 12, number % 12 + 1, 1), current_tz)
        later = dict(
            Transaction.objects.filter(apartment_id__in=[apartment.id for apartment in apartments], created_at__gte=next_month)
            .values("apartment_id")
            .annotate(total=Sum("amount"))
            .order_by()
            .values_list("apartment_id", "total")
        )
    rows = []
    for apartment in apartments:
        balance = (apartment.balance or Decimal("0")) - (later.get(apartment.id) or Decimal("0"))
        if balance >= 0:
            continue
        owner = getattr(apartment, "owner", None)
        rows.append({
            "residentId": _slug("owner", owner.id) if owner else _slug("apartment", apartment.id),
            "ownerBackendId": owner.id if owner else None,
            "apartmentBackendId": apartment.id,
            "buildingBackendId": apartment.building_id,
            "name": owner.fio if owner else "Unassigned owner",
            "phone": (owner.phone or "") if owner else "",
            "house": str(apartment.building.number),
            "apartment": str(apartment.number),
            "debt": _money(-balance),
        })
    rows.sort(key=lambda row: (-row["debt"], row["house"], row["apartment"]))
    return rows


def recent_account_transactions(limit: int = RECENT_TRANSACTIONS_PER_ACCOUNT):
    """The newest ``limit`` ledger rows of every apartment account, newest first."""
    return list(
        Transaction.objects.filter(apartment__isnull=False)
        .annotate(
            account_rank=Window(
                RowNumber(),
                partition_by=[F("apartment_id")],
                order_by=[F("created_at").desc(), F("id").desc()],
            )
        )
        .filter(account_rank__lte=limit)
        .only(
            "id",
            "apartment_id",
            "payment_type",
            "amount",
            "balance_before",
            "balance_after",
            "description",
            "external_id",
            "created_at",
        )
        .order_by("-created_at", "-id")
    )


def portal_data_version() -> str:
    """A short code that changes whenever build_portal_data would show something different.

    The pages poll it every few seconds instead of downloading the whole snapshot, and download the
    snapshot only when it changes. Ledger and log rows are never edited, so their count and last id
    are enough; residents, apartments, houses and the portal's own rows are hashed by the columns the
    portal shows. A few cheap queries instead of the ~90 of the snapshot.
    """
    digest = hashlib.sha1()
    # The snapshot also depends on the day (this month's payments, "today" in the notifications).
    digest.update(timezone.localdate().isoformat().encode())

    def feed(rows):
        for row in rows:
            digest.update(repr(tuple(row)).encode())
        digest.update(b"|")

    User = get_user_model()
    feed(Owner.objects.order_by("pk").values_list(
        "pk", "fio", "phone", "apartment_id", "has_contract", "balance",
        "telegram_id", "telegram_user", "telegram_status", "telegram_language",
    ))
    feed(Apartment.objects.order_by("pk").values_list("pk", "number", "area", "personal_account", "balance", "building_id"))
    feed(Building.objects.order_by("pk").values_list("pk", "number", "address", "operator_id", "complex_id"))
    feed(Complex.objects.order_by("pk").values_list("pk", "title", "address"))
    feed(User.objects.order_by("pk").values_list("pk", "username", "first_name", "last_name", "is_active", "is_staff", "is_superuser"))
    feed(PortalNotification.objects.order_by("pk").values_list("pk", "status", "pinned", "action_state"))
    feed(SystemAlert.objects.order_by("pk").values_list("pk", "status", "assigned_to", "resolved_at"))
    feed(ChecklistItem.objects.order_by("pk").values_list("pk", "done", "is_active", "title"))
    for model in (Transaction, AuditEvent):
        feed([tuple(model.objects.aggregate(count=Count("pk"), last=Max("pk")).values())])
    # Readings are edited in place: their totals change when a value is typed.
    feed([tuple(HotWaterMeterReading.objects.aggregate(
        count=Count("pk"), last=Max("pk"), start=Sum("start_reading"), end=Sum("end_reading")
    ).values())])
    for model in (ChecklistNote, SupportTicket, PortalStatusOverride, WorkspaceProfile):
        feed([tuple(model.objects.aggregate(count=Count("pk"), changed=Max("updated_at")).values())])
    return digest.hexdigest()[:16]


# The snapshot rows every operator sees, built once per data version in this process: a page or a
# POST answered while nothing changed reuses them instead of ~90 queries.
_shared_snapshot = {"version": None, "data": None}
_shared_snapshot_lock = threading.Lock()


def build_portal_data(user=None) -> dict:
    """Return the exact data shape consumed by the current HydroFlow UI.

    The source of truth is the Mirabad Avenue backend schema copied into this
    project: Complex, Building, Apartment, Owner, Invoice and Transaction.
    No static demo rows are produced here. The shared rows come from the cache
    while portal_data_version is unchanged; the user's profile and audit rows
    are read for every request. Callers must not modify the returned rows.
    """
    data_version = portal_data_version()
    with _shared_snapshot_lock:
        if _shared_snapshot["version"] != data_version:
            _shared_snapshot.update(version=data_version, data=_build_shared_portal_data(data_version))
        shared = _shared_snapshot["data"]
    return {**shared, "profile": _serialize_profile(user), "auditEvents": _serialize_audit_events(user)}


def _build_shared_portal_data(data_version) -> dict:
    """The snapshot rows that do not depend on who asks."""
    owners = list(
        Owner.objects.select_related(
            "apartment",
            "apartment__building",
            "apartment__building__complex",
        )
    )
    owners_by_apartment = {owner.apartment_id: owner for owner in owners}
    apartments_by_id = {
        apartment.id: apartment
        for apartment in Apartment.objects.select_related("building", "building__complex")
    }
    # Apartments above already carry building/complex; joining them per transaction
    # would build several model instances for every ledger row.
    transactions = recent_account_transactions()
    payment_type_labels = _payment_type_labels()
    payment_totals = account_payment_totals()

    buildings_qs = Building.objects.select_related("operator").prefetch_related(
        Prefetch(
            "apartments",
            queryset=Apartment.objects.order_by("number"),
        ),
    ).order_by("number")
    complexes = Complex.objects.prefetch_related(
        Prefetch("buildings", queryset=buildings_qs)
    ).order_by("title")

    override_maps = residential_override_maps()
    hot_water_by_complex = hot_water_totals_by_complex()
    complex_rows = []
    resident_rows = []
    for complex_obj in complexes:
        complex_row, complex_residents = serialize_complex(
            complex_obj,
            owner_for=lambda apartment: owners_by_apartment.get(apartment.id),
            payment_totals_for=lambda apartment: payment_totals.get(apartment.id, (0.0, None)),
            override_maps=override_maps,
            hot_water_by_complex=hot_water_by_complex,
        )
        snapshot_apartment_refs(complex_row)
        complex_rows.append(complex_row)
        resident_rows.extend(complex_residents)

    transaction_overrides = transaction_override_map()
    current_tz = timezone.get_current_timezone()
    transaction_rows = [
        serialize_transaction(
            transaction,
            apartments_by_id[transaction.apartment_id],
            owners_by_apartment.get(transaction.apartment_id),
            payment_type_labels,
            transaction_overrides.get(transaction.id),
            current_tz,
        )
        for transaction in transactions
    ]
    payments = payment_summary(
        {apartment_id: apartment.building_id for apartment_id, apartment in apartments_by_id.items()},
        transaction_overrides,
    )

    return {
        "source": "mirabad_avenue_backend",
        "generatedAt": timezone.localtime().isoformat(),
        # Taken before the rows above were read: a change made meanwhile shows on the next poll.
        "dataVersion": data_version,
        "adminUsers": _serialize_admin_users(),
        "operators": _serialize_operators(),
        "complexes": complex_rows,
        "residents": resident_rows,
        "transactions": transaction_rows,
        "paymentSummary": payments,
        # Statistics page: house balances at the end of every month it offers.
        "balanceSummary": balance_summary(apartments_by_id, payments["months"]),
        "notifications": _serialize_notifications(),
        "systemAlerts": _serialize_system_alerts(),
        "checklistItems": _serialize_checklist_items(),
        "checklistNotes": _serialize_checklist_notes(),
        "supportTickets": _serialize_support_tickets(),
        "supportSummary": _serialize_support_summary(),
    }
