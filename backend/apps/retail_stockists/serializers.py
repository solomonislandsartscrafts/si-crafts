from rest_framework import serializers

from .models import RetailStockist


class RetailStockistSerializer(serializers.ModelSerializer):
    # The columns are plain CharFields, so DRF would otherwise accept anything
    # at all here — including a string that renders as a dead link or an address
    # that can never receive mail. Declared explicitly to get host and syntax
    # validation; both stay optional, as the model allows blank.
    url = serializers.URLField(required=False, allow_blank=True, max_length=500)
    email = serializers.EmailField(required=False, allow_blank=True, max_length=200)

    class Meta:
        model = RetailStockist
        fields = [
            "id",
            "name",
            "city",
            "url",
            "address",
            "phone",
            "email",
            "hours",
            "closed",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value.strip()

    def validate_url(self, value):
        # URLField checks the syntax and host but accepts ftp:// and ftps://
        # too. A shop listing is only ever a web address.
        value = value.strip()
        if value and not value.startswith("https://") and not value.startswith("http://"):
            raise serializers.ValidationError(
                "Website must start with https:// or http://"
            )
        return value
