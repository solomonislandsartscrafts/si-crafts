from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AdminProfile
from .serializers import LoginSerializer, AdminProfileSerializer


class AdminLoginView(APIView):
    """Admin login — returns JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        # TEMP DEBUG: wrap everything to capture the real traceback in the response.
        # Remove this wrapper once the root cause is found.
        try:
            return self._post(request)
        except Exception:
            import traceback
            return Response({"error": "debug", "trace": traceback.format_exc()}, status=500)

    def _post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # Find user by email OR username (Django superuser may use email as username)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=email)
            except User.DoesNotExist:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Check admin profile exists — auto-create for superusers
        try:
            profile = user.admin_profile
        except AdminProfile.DoesNotExist:
            if user.is_superuser:
                profile, _ = AdminProfile.objects.get_or_create(
                    user=user, defaults={"role": "super_admin"}
                )
            else:
                return Response({"error": "Not an admin user"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            import logging
            logging.getLogger(__name__).exception("Unexpected error retrieving admin profile for user %s", user.pk)
            return Response({"error": "Login failed. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Check lockout
        if profile.is_locked:
            return Response(
                {"error": "Account locked. Try again later."},
                status=status.HTTP_423_LOCKED,
            )

        # Check active
        if not profile.is_active:
            return Response({"error": "Account deactivated"}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate using Django's auth system
        authed_user = authenticate(username=user.username, password=password)
        if authed_user is None:
            # Increment failed attempts
            profile.failed_login_attempts += 1
            if profile.failed_login_attempts >= 5:
                profile.locked_until = timezone.now() + timedelta(minutes=15)
            profile.save()
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Success — reset failures
        profile.failed_login_attempts = 0
        profile.locked_until = None
        profile.save()

        # Generate JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "sessionToken": str(refresh.access_token),
            "user": {
                "id": profile.id,
                "email": user.email,
                "name": user.get_full_name() or user.username,
                "role": profile.role,
            },
        })


class AdminVerifyView(APIView):
    """Verify an admin JWT token is still valid."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.admin_profile
        except AdminProfile.DoesNotExist:
            if request.user.is_superuser:
                profile = AdminProfile.objects.create(user=request.user, role="super_admin")
            else:
                return Response({"error": "Not an admin"}, status=status.HTTP_401_UNAUTHORIZED)

        if not profile.is_active:
            return Response({"error": "Account deactivated"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "id": profile.id,
            "email": request.user.email,
            "name": request.user.get_full_name() or request.user.username,
            "role": profile.role,
        })


class AdminLogoutView(APIView):
    """Blacklist the refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({"detail": "Logged out"})


class StockistLoginView(APIView):
    """Stockist login — returns JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=email)
            except User.DoesNotExist:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Verify user has a stockist profile
        from apps.stockists.models import Stockist
        try:
            stockist = Stockist.objects.get(user=user, status="approved")
        except Stockist.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        authed_user = authenticate(username=user.username, password=password)
        if authed_user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "sessionToken": str(refresh.access_token),
            "user": {
                "id": stockist.id,
                "email": user.email,
                "businessName": stockist.business_name,
                "contactName": stockist.contact_name,
            },
        })


class StockistVerifyView(APIView):
    """Verify a stockist JWT token."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.stockists.models import Stockist
        try:
            stockist = Stockist.objects.get(user=request.user, status="approved")
        except Stockist.DoesNotExist:
            return Response({"error": "Not a stockist"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "id": stockist.id,
            "email": request.user.email,
            "businessName": stockist.business_name,
            "contactName": stockist.contact_name,
        })


class StockistLogoutView(APIView):
    """Blacklist stockist refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({"detail": "Logged out"})


class AdminListView(APIView):
    """List all admin users (super_admin only)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.admin_profile
            if profile.role != "super_admin":
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        except AdminProfile.DoesNotExist:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        profiles = AdminProfile.objects.select_related("user").all()
        serializer = AdminProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new admin user."""
        try:
            profile = request.user.admin_profile
            if profile.role != "super_admin":
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        except AdminProfile.DoesNotExist:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        name = request.data.get("name", "")
        role = request.data.get("role", "editor")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already in use"}, status=400)

        user = User.objects.create_user(
            username=email, email=email, password=password,
            first_name=name.split(" ")[0] if name else "",
            last_name=" ".join(name.split(" ")[1:]) if " " in name else "",
        )
        admin_profile = AdminProfile.objects.create(user=user, role=role)
        return Response(AdminProfileSerializer(admin_profile).data, status=201)
