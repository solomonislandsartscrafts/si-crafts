from rest_framework import serializers
from .models import CraftPage


class CraftPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CraftPage
        fields = [
            "id", "title", "slug", "description",
            "material_category", "cultural_context", "cultural_context_review_flag",
            "process_image_url", "process_image_alt",
        ]


class CraftPageRequestSerializer(serializers.Serializer):
    """Validates process_image_url and process_image_alt on create/update."""

    process_image_url = serializers.URLField(
        max_length=500, required=False, allow_blank=True
    )
    process_image_alt = serializers.CharField(
        max_length=300, required=False, allow_blank=True
    )
