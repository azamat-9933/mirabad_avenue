"""What each billing entry of an apartment account was for: the period (month) it charged, and how much
of it was heating and how much hot water.

Closing a period posts one ledger entry per apartment, the sum of its heating and hot water charges,
linked to the period's invoice; closing a reopened period again posts only the difference. The amount
of each service comes from the period's Charge rows: every batch of them is created in the same
database transaction as the ledger entry it adds up to, just before it.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from .models import SERVICE_HEATING, SERVICE_HOT_WATER, Charge, Invoice

RECALCULATION_TAG = "[billing:recalculation]"
# A batch of charges and its ledger entry are written in one transaction, seconds apart at most.
BATCH_WINDOW = timedelta(minutes=10)
ZERO = Decimal("0")


@dataclass(frozen=True)
class ChargeDetail:
    """A period's charge (or recalculation) posted to one apartment account."""

    period: str
    start: date
    end: date
    recalculation: bool
    # What the period charges the apartment for each service once this entry is posted; None when the
    # split cannot be told (entries older than the per-service charges).
    heating: Decimal | None = None
    hot_water: Decimal | None = None
    # A recalculation: what the period charged before it.
    heating_before: Decimal | None = None
    hot_water_before: Decimal | None = None


def _batch_of(entries, created_at):
    """The ledger entry a charge row belongs to: the first one written after it, within the window."""
    for entry in entries:
        if created_at <= entry.created_at <= created_at + BATCH_WINDOW:
            return entry
    return None


def charge_details(entries) -> dict[int, ChargeDetail]:
    """{ledger entry id: ChargeDetail} for the period charges and recalculations among ``entries``
    (Transaction rows, of one apartment account or several)."""
    charged = [entry for entry in entries if entry.payment_type == "charge" and entry.invoice_id]
    if not charged:
        return {}
    invoices = Invoice.objects.filter(pk__in={entry.invoice_id for entry in charged}).select_related("period")
    invoices = {invoice.pk: invoice for invoice in invoices}
    by_account = defaultdict(list)
    for entry in charged:
        invoice = invoices.get(entry.invoice_id)
        if invoice is not None:
            by_account[(invoice.period, invoice.apartment_id)].append(entry)

    details = {}
    for (period, apartment_id), posted in by_account.items():
        posted.sort(key=lambda entry: (entry.created_at, entry.pk))
        totals = {entry.pk: {SERVICE_HEATING: ZERO, SERVICE_HOT_WATER: ZERO} for entry in posted}
        rows = Charge.objects.filter(period=period, apartment_id=apartment_id).values_list("charge_type", "amount", "created_at")
        for charge_type, amount, created_at in rows:
            entry = _batch_of(posted, created_at)
            if entry is not None and charge_type in totals[entry.pk]:
                totals[entry.pk][charge_type] += amount
        before = None
        for entry in posted:
            recalculation = RECALCULATION_TAG in (entry.description or "")
            now = totals[entry.pk]
            # The split is shown only when it adds up to what the entry posted.
            if recalculation:
                fits = before is not None and sum(before.values()) - sum(now.values()) == entry.amount
            else:
                fits = -sum(now.values()) == entry.amount
            details[entry.pk] = ChargeDetail(
                period=period.name,
                start=period.start_date,
                end=period.end_date,
                recalculation=recalculation,
                heating=now[SERVICE_HEATING] if fits else None,
                hot_water=now[SERVICE_HOT_WATER] if fits else None,
                heating_before=before[SERVICE_HEATING] if fits and recalculation else None,
                hot_water_before=before[SERVICE_HOT_WATER] if fits and recalculation else None,
            )
            before = now
    return details
