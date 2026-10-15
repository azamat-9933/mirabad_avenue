from decimal import Decimal

from django.db import transaction
from django.db.models import Q

from main_app.models import Apartment, Owner
from payments.models import Transaction


# Marks the first balance entry of a resident: carried-over debt or credit, not money received.
OPENING_BALANCE_TAG = "[opening-balance]"


def apply_account_change(
    apartment_id,
    amount,
    payment_type,
    *,
    description="",
    created_by="",
    invoice_id=None,
    external_id=None,
):
    """Change an apartment account's balance and record the change in the Transaction ledger.

    The account belongs to the apartment, so charges land here even while the apartment has no
    owner; the current owner's ``balance`` is kept equal to it. This and ``apply_balance_change``
    are the only code paths that should modify ``Apartment.balance`` / ``Owner.balance``. The rows
    stay locked until the surrounding transaction commits, so concurrent changes queue up instead
    of overwriting each other, and the balance_before/balance_after chain of an apartment's
    Transactions matches its balance.
    """
    amount = Decimal(str(amount))
    if not amount:
        raise ValueError("Balance change amount must be non-zero.")

    with transaction.atomic():
        # Apartment first, then owner: one lock order everywhere keeps concurrent changes from deadlocking.
        apartment = Apartment.objects.select_for_update().get(pk=apartment_id)
        owner = Owner.objects.select_for_update().filter(apartment_id=apartment.pk).first()
        balance_before = apartment.balance
        apartment.balance = balance_before + amount
        apartment.save(update_fields=["balance"])
        if owner is not None:
            owner.balance = apartment.balance
            owner.save(update_fields=["balance"])
        return Transaction.objects.create(
            apartment=apartment,
            owner=owner,
            invoice_id=invoice_id,
            payment_type=payment_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=apartment.balance,
            description=description[:500],
            created_by=created_by[:255],
            external_id=external_id or None,
        )


def apply_balance_change(owner_id, amount, payment_type, **kwargs):
    """Change the balance of the account behind an owner (their apartment's account)."""
    apartment_id = Owner.objects.values_list("apartment_id", flat=True).get(pk=owner_id)
    return apply_account_change(apartment_id, amount, payment_type, **kwargs)


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
