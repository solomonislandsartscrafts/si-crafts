from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AdminProfile


class AdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = AdminProfile
        fields = ["id", "email", "name", "role", "is_active", "created_at", "updated_at"]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()  # Accept email or username
    password = serializers.CharField(write_only=True)


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()
