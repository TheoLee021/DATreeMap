import os

from django.core.exceptions import ImproperlyConfigured

from config.settings import *  # noqa: F401,F403

DEBUG = False

if SECRET_KEY.startswith("django-insecure"):
    raise ImproperlyConfigured(
        "Production SECRET_KEY must not use django-insecure values."
    )

if "ALLOWED_HOSTS" not in os.environ or not ALLOWED_HOSTS:
    raise ImproperlyConfigured("ALLOWED_HOSTS must be set in production.")

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"
