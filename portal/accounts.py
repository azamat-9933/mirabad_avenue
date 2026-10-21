"""Accounts: only the company's operators use the platform, and every operator has full rights.

A new account is staff and superuser, so it can use the whole portal (the activity log included)
and Django admin. Access is taken away by switching the account off (Active), not by narrowing
its rights; an administrator can still narrow one account by hand on its admin page.
"""
from django.conf import settings
from django.db.models.signals import pre_save
from django.dispatch import receiver


@receiver(pre_save, sender=settings.AUTH_USER_MODEL)
def operators_get_full_rights(sender, instance, **kwargs):
    if instance._state.adding:
        instance.is_staff = True
        instance.is_superuser = True
