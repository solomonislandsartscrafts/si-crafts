from rest_framework import serializers
from .models import MakerPage


class MakerPageSerializer(serializers.ModelSerializer):
    craft = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = MakerPage
        fields = [
            "id", "title", "slug", "village", "province", "island",
            "story", "story_cultural_review_flag", "consent_status",
            "published_flag", "age", "years_active", "craft",
            "portrait_url", "portrait_alt",
        ]
