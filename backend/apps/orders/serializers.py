from rest_framework import serializers
from .models import OrderRequest, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product_code", "product_name", "quantity", "unit_price", "line_total"]


class OrderRequestSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    stockist_name = serializers.CharField(source="stockist.business_name", read_only=True)

    class Meta:
        model = OrderRequest
        fields = [
            "id", "reference_number", "stockist", "stockist_name",
            "total_aud", "status", "notes", "items",
            "submitted_at", "updated_at",
        ]
        read_only_fields = ["id", "reference_number", "submitted_at", "updated_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        # Generate reference number
        import uuid
        validated_data["reference_number"] = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = OrderRequest.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order
