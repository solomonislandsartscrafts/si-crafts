from rest_framework import serializers
from .models import ProductPage


class ProductPageSerializer(serializers.ModelSerializer):
    maker = serializers.PrimaryKeyRelatedField(read_only=True)
    craft = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ProductPage
        fields = [
            "id", "title", "slug", "product_code", "description",
            "material_category", "product_type", "maker", "craft",
            "dimensions", "care_notes", "wholesale_price", "published_flag",
            "image_urls", "image_alts",
        ]
