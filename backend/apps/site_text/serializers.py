import re

from rest_framework import serializers

from .models import SiteText

# Keys are authored in the frontend manifest, never by end users, so they are
# held to a strict shape. This keeps them safe to use as object keys and as
# lookup values, and stops a typo silently creating a junk row.
KEY_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$")

# Generous enough for the longest page section (the About page bodies run to
# several paragraphs) while still bounding what a single request can store.
MAX_VALUE_LENGTH = 20_000


class SiteTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteText
        fields = ["key", "value", "updated_at"]
        read_only_fields = ["updated_at"]


def validate_entries(data):
    """Validate a {key: value} payload and return it normalised.

    Raises ValidationError describing every offending key at once, rather than
    failing on the first one, so an admin save that goes wrong says why.
    """
    if not isinstance(data, dict):
        raise serializers.ValidationError(
            {"detail": "Expected an object mapping text keys to values."}
        )

    errors = {}
    cleaned = {}

    for key, value in data.items():
        if not isinstance(key, str) or not KEY_PATTERN.match(key):
            errors[str(key)[:100]] = "Invalid key."
            continue
        if value is None:
            value = ""
        if not isinstance(value, str):
            errors[key] = "Value must be a string."
            continue
        if len(value) > MAX_VALUE_LENGTH:
            errors[key] = f"Value exceeds {MAX_VALUE_LENGTH} characters."
            continue
        cleaned[key] = value

    if errors:
        raise serializers.ValidationError(errors)

    return cleaned
