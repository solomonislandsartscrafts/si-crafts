from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AdminProfile


class AdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = AdminProfile
        fields = [
            "id", "user_id", "email", "name", "role",
            "is_active", "created_at", "updated_at",
        ]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class AccountUserSerializer(serializers.ModelSerializer):
    """Read view of a login account, with whatever role it currently holds.

    A "role" is not a column on the user — it is derived from which profile
    rows exist: an active AdminProfile makes someone an editor or super admin,
    a linked Stockist record makes them a stockist, and neither makes them a
    plain user with no dashboard access.
    """

    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    admin_profile = serializers.SerializerMethodField()
    stockist = serializers.SerializerMethodField()
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "name", "first_name", "last_name",
            "role", "is_active", "is_superuser", "has_password",
            "admin_profile", "stockist", "date_joined", "last_login",
        ]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_role(self, obj):
        return resolve_role(obj)

    def get_has_password(self, obj):
        return obj.has_usable_password()

    def get_admin_profile(self, obj):
        profile = getattr(obj, "admin_profile", None)
        if profile is None:
            return None
        return {
            "id": profile.id,
            "role": profile.role,
            "is_active": profile.is_active,
            "is_locked": profile.is_locked,
        }

    def get_stockist(self, obj):
        stockist = getattr(obj, "stockist", None)
        if stockist is None:
            return None
        return {
            "id": stockist.id,
            "business_name": stockist.business_name,
            "abn": stockist.abn,
            "contact_name": stockist.contact_name,
            "email": stockist.email,
            "phone": stockist.phone,
            "description": stockist.description,
            "status": stockist.status,
        }


def resolve_role(user):
    """Work out the single role to show for a user.

    Admin access takes precedence over stockist access, because that is the
    more privileged of the two and the one an admin most needs to see.
    """
    profile = getattr(user, "admin_profile", None)
    if profile is not None and profile.is_active:
        return profile.role

    # A pending or suspended stockist record grants no access, so those users
    # read as plain users with an application attached.
    stockist = getattr(user, "stockist", None)
    if stockist is not None and stockist.status == "approved":
        return "stockist"

    return "user"


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()  # Accept email or username
    password = serializers.CharField(write_only=True)


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()
