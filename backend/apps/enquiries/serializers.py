from rest_framework import serializers
from .models import MakerEnquiry, StockistRequest, ContactEnquiry


class MakerEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = MakerEnquiry
        fields = ["id", "name", "village", "province", "craft", "message", "contact", "whatsapp", "submitted_at", "handled"]
        read_only_fields = ["id", "submitted_at"]
        extra_kwargs = {
            "message": {"required": False, "allow_blank": True},
            "whatsapp": {"required": False, "allow_blank": True},
        }


class StockistRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockistRequest
        fields = ["id", "stockist", "request_data", "submitted_at", "handled"]
        read_only_fields = ["id", "submitted_at"]


class ContactEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactEnquiry
        fields = ["id", "name", "email", "reason", "message", "submitted_at", "handled"]
        read_only_fields = ["id", "submitted_at"]
