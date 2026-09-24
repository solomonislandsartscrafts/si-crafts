import re

from rest_framework import serializers
from .models import Stockist


class NormalisedEmailMixin:
    """Lower-cases the incoming email before any validation runs.

    Uniqueness is enforced case-insensitively (see Stockist.Meta), and every
    lookup elsewhere uses `email__iexact`. The unique validator attached to the
    field compares exactly, so normalising in `validate_email` is too late — it
    runs after that check and would let "Shop@Gallery.com" past a stored
    "shop@gallery.com", only to fail on the database constraint.
    """

    def to_internal_value(self, data):
        email = data.get("email") if hasattr(data, "get") else None
        if isinstance(email, str):
            data = {**data, "email": email.strip().lower()}
        return super().to_internal_value(data)


class AbnValidationMixin:
    """Enforce the same 11-digit ABN rule the apply form applies client-side.

    The model column is `blank=True` (an admin adding a stockist directly may
    not have it to hand), so an empty ABN stays valid. But a value that IS
    supplied must be a real ABN shape — 11 digits — or a caller bypassing the
    form (a direct API POST) could store "123" or "not an abn".

    Spaces are stripped in `to_internal_value`, i.e. BEFORE field validation,
    not in `validate_abn`. The model column is `max_length=11`, so a display-
    formatted "12 345 678 901" (14 chars) would trip DRF's built-in max-length
    validator with a misleading "no more than 11 characters" error before a
    `validate_abn` hook ever ran. Normalising up front lets the real 11-digit
    rule below produce the message a caller can act on.
    """

    def to_internal_value(self, data):
        abn = data.get("abn") if hasattr(data, "get") else None
        if isinstance(abn, str):
            data = {**data, "abn": re.sub(r"\s", "", abn)}
        return super().to_internal_value(data)

    def validate_abn(self, value):
        if not value:
            return value
        if not re.fullmatch(r"\d{11}", value):
            raise serializers.ValidationError("ABN must be 11 digits.")
        return value


class StockistSerializer(NormalisedEmailMixin, AbnValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = Stockist
        fields = [
            "id", "business_name", "abn", "contact_name", "email",
            "phone", "description", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockistApplicationSerializer(NormalisedEmailMixin, AbnValidationMixin, serializers.ModelSerializer):
    """Public endpoint — only fields a new applicant submits."""

    class Meta:
        model = Stockist
        fields = ["business_name", "abn", "contact_name", "email", "phone", "description"]
