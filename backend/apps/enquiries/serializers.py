from rest_framework import serializers
from .models import MakerEnquiry, StockistRequest, ContactEnquiry


class MakerEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = MakerEnquiry
        fields = ["id", "name", "village", "province", "craft", "message", "contact", "submitted_at", "handled"]
        read_only_fields = ["id", "submitted_at"]


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
