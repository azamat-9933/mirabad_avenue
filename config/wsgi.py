"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Import the views now, while the worker boots: they pull in aiogram (~4 s on the server), and the
# first operator request to reach each worker would otherwise wait for it.
get_resolver().url_patterns
