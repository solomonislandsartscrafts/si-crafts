from rest_framework import serializers
from .models import ArticlePage


class ArticlePageSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = ArticlePage
        fields = [
            "id", "title", "slug", "excerpt", "body",
            "author_name", "author_role", "tags",
            "published_flag", "featured", "reading_time_minutes",
            "published_at", "cover_image_url", "cover_image_alt",
            "first_published_at", "last_published_at",
        ]

    def get_tags(self, obj):
        return [tag.name for tag in obj.tags.all()]
