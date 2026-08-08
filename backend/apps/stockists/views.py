from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Stockist
from .serializers import StockistSerializer, StockistApplicationSerializer


class StockistViewSet(viewsets.ModelViewSet):
    queryset = Stockist.objects.all()
    serializer_class = StockistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        email = self.request.query_params.get("email")
        if email:
            qs = qs.filter(email=email)
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        from django.contrib.auth.models import User
        import secrets
        from .models import PasswordSetToken

        stockist = self.get_object()
        stockist.status = "approved"

        # Create a Django User account if one doesn't exist
        if not stockist.user:
            username = stockist.email

            # Check if user already exists with this email
            user, created = User.objects.get_or_create(
                email=stockist.email,
                defaults={
                    "username": username,
                    "first_name": stockist.contact_name.split(" ")[0] if stockist.contact_name else "",
                    "last_name": " ".join(stockist.contact_name.split(" ")[1:]) if " " in (stockist.contact_name or "") else "",
                },
            )
            if created:
                # Set unusable password — stockist will set their own via the token link
                user.set_unusable_password()
                user.save()

            stockist.user = user

        stockist.save()

        # Generate a password-set token
        token = secrets.token_urlsafe(48)
        PasswordSetToken.objects.create(stockist=stockist, token=token)

        # Email the stockist with a link to set their password
        from apps.notifications.emails import notify_stockist_approved_with_link
        notify_stockist_approved_with_link(
            stockist_email=stockist.email,
            business_name=stockist.business_name,
            contact_name=stockist.contact_name,
            set_password_token=token,
        )

        return Response({
            **StockistSerializer(stockist).data,
            "message": "Approved — password setup email sent to the stockist.",
        })

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        stockist = self.get_object()
        stockist.status = "rejected"
        stockist.save()

        # Notify the stockist of rejection
        from apps.notifications.emails import notify_stockist_rejected
        notify_stockist_rejected(
            stockist_email=stockist.email,
            business_name=stockist.business_name,
            contact_name=stockist.contact_name,
        )

        return Response(StockistSerializer(stockist).data)

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        """Pause a stockist's access. They can no longer log in."""
        stockist = self.get_object()
        stockist.status = "suspended"
        stockist.save()
        # Disable their Django user account
        if stockist.user:
            stockist.user.is_active = False
            stockist.user.save()
        return Response(StockistSerializer(stockist).data)

    @action(detail=True, methods=["post"])
    def enable(self, request, pk=None):
        """Re-enable a suspended stockist."""
        stockist = self.get_object()
        stockist.status = "approved"
        stockist.save()
        # Re-enable their Django user account
        if stockist.user:
            stockist.user.is_active = True
            stockist.user.save()
        return Response(StockistSerializer(stockist).data)

    def destroy(self, request, pk=None):
        """Permanently delete a stockist and their user account."""
        stockist = self.get_object()
        # Delete the linked user account if it exists
        if stockist.user:
            stockist.user.delete()
        stockist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StockistApplyView(viewsets.GenericViewSet):
    """Public endpoint for stockist applications."""

    serializer_class = StockistApplicationSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stockist = serializer.save(status="pending")

        # Notify admins of new application
        from apps.notifications.emails import notify_stockist_application, confirm_stockist_application
        notify_stockist_application(
            business_name=stockist.business_name,
            contact_name=stockist.contact_name,
            email=stockist.email,
            description=stockist.description,
        )

        # Send confirmation email to the applicant
        confirm_stockist_application(
            stockist_email=stockist.email,
            business_name=stockist.business_name,
            contact_name=stockist.contact_name,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SetPasswordView(APIView):
    """Public endpoint for stockists to set their password using a token."""

    permission_classes = [AllowAny]

    def post(self, request):
        from .models import PasswordSetToken

        token_value = request.data.get("token")
        password = request.data.get("password")

        if not token_value or not password:
            return Response({"error": "Token and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({"error": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = PasswordSetToken.objects.get(token=token_value)
        except PasswordSetToken.DoesNotExist:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.is_valid:
            return Response({"error": "This link has expired. Please contact us for a new one."}, status=status.HTTP_400_BAD_REQUEST)

        # Set the password
        user = token_obj.stockist.user
        if not user:
            return Response({"error": "Account not found."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        # Mark token as used
        token_obj.used = True
        token_obj.save()

        return Response({"success": True, "message": "Password set successfully. You can now log in."})


class ForgotPasswordView(APIView):
    """Request a password reset token (sent via email)."""

    permission_classes = [AllowAny]

    def post(self, request):
        import secrets
        from .models import PasswordSetToken

        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Always respond with success (don't reveal whether account exists)
        try:
            stockist = Stockist.objects.get(email=email, status="approved")
        except Stockist.DoesNotExist:
            return Response({"success": True, "message": "If that email is registered, a reset link has been sent."})

        # Generate token
        token = secrets.token_urlsafe(48)
        PasswordSetToken.objects.create(stockist=stockist, token=token)

        # Send reset email
        from apps.notifications.emails import notify_password_reset
        notify_password_reset(
            stockist_email=stockist.email,
            contact_name=stockist.contact_name,
            reset_token=token,
        )

        return Response({"success": True, "message": "If that email is registered, a reset link has been sent."})


class StockistProfileView(APIView):
    """Authenticated stockist: view and update their own profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            stockist = Stockist.objects.get(user=request.user, status="approved")
        except Stockist.DoesNotExist:
            return Response({"error": "Not a stockist"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "id": stockist.id,
            "businessName": stockist.business_name,
            "abn": stockist.abn,
            "contactName": stockist.contact_name,
            "email": stockist.email,
            "phone": stockist.phone,
            "description": stockist.description,
            "profileImageUrl": stockist.profile_image_url,
        })

    def patch(self, request):
        try:
            stockist = Stockist.objects.get(user=request.user, status="approved")
        except Stockist.DoesNotExist:
            return Response({"error": "Not a stockist"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data

        # Update allowed fields
        if "businessName" in data:
            stockist.business_name = data["businessName"]
        if "contactName" in data:
            stockist.contact_name = data["contactName"]
        if "phone" in data:
            stockist.phone = data["phone"]
        if "abn" in data:
            stockist.abn = data["abn"]
        if "description" in data:
            stockist.description = data["description"]
        if "profileImageUrl" in data:
            stockist.profile_image_url = data["profileImageUrl"]

        stockist.save()

        return Response({
            "id": stockist.id,
            "businessName": stockist.business_name,
            "abn": stockist.abn,
            "contactName": stockist.contact_name,
            "email": stockist.email,
            "phone": stockist.phone,
            "description": stockist.description,
            "profileImageUrl": stockist.profile_image_url,
        })


class ChangePasswordView(APIView):
    """Authenticated stockist: change their password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.contrib.auth import authenticate

        current_password = request.data.get("currentPassword", "")
        new_password = request.data.get("newPassword", "")

        if not current_password or not new_password:
            return Response({"error": "Current and new passwords are required."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"error": "New password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify current password
        user = authenticate(username=request.user.username, password=current_password)
        if user is None:
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"success": True, "message": "Password changed successfully."})
