"""One password rule for every path that sets a password.

Three separate places used to hard-code ``len(password) < 8`` while
AUTH_PASSWORD_VALIDATORS sat in settings.py unused, so the configured policy
(minimum length, common-password and all-numeric checks) was never actually
enforced anywhere. Every creation and reset path now goes through here, which
means changing the policy is a settings change rather than a code hunt.

Kept deliberately free of app imports so both apps.accounts and apps.stockists
can use it without an import cycle.
"""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# Still exported because error copy elsewhere refers to the length by name.
# Django's MinimumLengthValidator defaults to 8 and is what actually enforces it.
MIN_PASSWORD_LENGTH = 8


def password_error(password, user=None):
    """Return a single message describing why a password is unacceptable.

    Returns None when the password passes every configured validator. Messages
    are joined into one string because every caller renders a single
    ``{"error": ...}`` field.
    """
    try:
        validate_password(password, user=user)
    except ValidationError as exc:
        return " ".join(exc.messages)
    return None
