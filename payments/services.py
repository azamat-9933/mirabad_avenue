from decimal import Decimal

from django.db import transaction
from django.db.models import Q

from main_app.models import Owner
from payments.models import Transaction


# Marks the first balance entry of a resident: carried-over debt or credit, not money received.
OPENING_BALANCE_TAG = "[opening-balance]"


def apply_balance_change(
    owner_id,
    amount,
    payment_type,
    *,
    description="",
    created_by="",
    invoice_id=None,
    external_id=None,
):
    """Change an owner's balance and record the change in the Transaction ledger.

    This is the only code path that should modify ``Owner.balance``. The owner
    row stays locked until the surrounding transaction commits, so concurrent
    changes queue up instead of overwriting each other, and every change leaves
    a Transaction whose balance_before/balance_after chain matches the balance.
    """
    amount = Decimal(str(amount))
    if not amount:
        raise ValueError("Balance change amount must be non-zero.")

    with transaction.atomic():
        owner = Owner.objects.select_for_update().get(pk=owner_id)
        balance_before = owner.balance
        owner.balance = balance_before + amount
        owner.save(update_fields=["balance"])
        return Transaction.objects.create(
            owner=owner,
            invoice_id=invoice_id,
            payment_type=payment_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=owner.balance,
            description=description[:500],
            created_by=created_by[:255],
            external_id=external_id or None,
        )


def is_incoming_payment(item: Transaction) -> bool:
    """True for money actually received; billing charges and opening balances are not payments."""
    if item.amount <= 0 or item.payment_type == Transaction.TYPE_CHARGE:
        return False
    return OPENING_BALANCE_TAG not in (item.description or "")


def incoming_payment_q(prefix: str = "") -> Q:
    """Queryset form of is_incoming_payment(); prefix is the path to Transaction, e.g. "transactions__"."""
    return (
        Q(**{f"{prefix}amount__gt": 0})
        & ~Q(**{f"{prefix}payment_type": Transaction.TYPE_CHARGE})
        & ~Q(**{f"{prefix}description__contains": OPENING_BALANCE_TAG})
    )
