from rest_framework import serializers
from .models import Stockist


class StockistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stockist
        fields = [
            "id", "business_name", "abn", "contact_name", "email",
            "phone", "description", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockistApplicationSerializer(serializers.ModelSerializer):
    """Public endpoint — only fields a new applicant submits."""

    class Meta:
        model = Stockist
        fields = ["business_name", "abn", "contact_name", "email", "phone", "description"]
