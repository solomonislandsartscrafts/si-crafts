from rest_framework import serializers

from .models import Supporter


class SupporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supporter
        fields = [
            "id",
            "name",
            "logo_url",
            "logo_alt",
            "href",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value.strip()

    def validate_href(self, value):
        value = value.strip()
        if value and not value.startswith("https://") and not value.startswith("http://"):
            raise serializers.ValidationError("Link must start with https:// or http://")
        return value
