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


class StockistSerializer(NormalisedEmailMixin, serializers.ModelSerializer):
    class Meta:
        model = Stockist
        fields = [
            "id", "business_name", "abn", "contact_name", "email",
            "phone", "description", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockistApplicationSerializer(NormalisedEmailMixin, serializers.ModelSerializer):
    """Public endpoint — only fields a new applicant submits."""

    class Meta:
        model = Stockist
        fields = ["business_name", "abn", "contact_name", "email", "phone", "description"]
