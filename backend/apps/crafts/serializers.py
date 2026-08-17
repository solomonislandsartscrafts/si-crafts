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
