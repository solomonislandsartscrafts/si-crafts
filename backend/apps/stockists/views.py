import secrets

from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.accounts.permissions import IsSiteAdmin

from .models import Stockist
from .serializers import StockistSerializer, StockistApplicationSerializer


def provision_stockist_login(stockist, password=None, send_invite=True):
    """Give an approved stockist a way to log in.

    Creates or links their Django user, then either sets the password supplied
    by an admin or emails them a one-time link to set their own. Returns a
    short message for the admin UI describing what happened.
    """
    from .models import PasswordSetToken

    user = stockist.user
    if user is None:
        # filter().first() rather than get() — auth_user.email is not unique.
        user = User.objects.filter(email__iexact=stockist.email).order_by("-id").first()

    if user is None:
        username = stockist.email[:150]
        if User.objects.filter(username=username).exists():
            username = f"{username[:140]}-{secrets.token_hex(4)}"
        contact = stockist.contact_name or ""
        user = User(
            username=username,
            email=stockist.email,
            first_name=contact.split(" ")[0] if contact else "",
            last_name=" ".join(contact.split(" ")[1:]) if " " in contact else "",
        )
        user.set_unusable_password()
        user.save()

    if stockist.user_id != user.pk:
        stockist.user = user
        stockist.save(update_fields=["user"])

    if not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    if password:
        user.set_password(password)
        user.save()
        return "Login created — they can sign in now with the password you set."

    if not send_invite:
        return "Saved. They'll need a password link before they can log in."

    token = secrets.token_urlsafe(48)
    PasswordSetToken.objects.create(stockist=stockist, token=token)

    from apps.notifications.emails import notify_stockist_approved_with_link
    notify_stockist_approved_with_link(
        stockist_email=stockist.email,
        business_name=stockist.business_name,
        contact_name=stockist.contact_name,
        set_password_token=token,
    )
    return "Password setup email sent to the stockist."


class StockistViewSet(viewsets.ModelViewSet):
    queryset = Stockist.objects.all()
    serializer_class = StockistSerializer
    permission_classes = [IsSiteAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        email = self.request.query_params.get("email")
        if email:
            qs = qs.filter(email__iexact=email.strip())
        return qs

    def create(self, request, *args, **kwargs):
        """Admin adds a stockist directly, without waiting for an application.

        Pass a `password` to set one immediately, or leave it blank to email the
        stockist a one-time link so they choose their own.
        """
        password = str(request.data.get("password") or "").strip()
        if password and len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Normalise the address before validating — Stockist.email is unique and
        # every lookup is case-insensitive, so store one canonical form.
        data = {key: request.data.get(key) for key in request.data}
        email = str(data.get("email") or "").strip().lower()
        data["email"] = email
        data.pop("password", None)

        if email and Stockist.objects.filter(email__iexact=email).exists():
            return Response(
                {"error": "A stockist with that email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        stockist = serializer.save(status=data.get("status") or "approved")

        message = "Stockist added."
        if stockist.status == "approved":
            message = provision_stockist_login(stockist, password=password or None)

        return Response(
            {**self.get_serializer(stockist).data, "message": message},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        stockist = self.get_object()
        stockist.status = "approved"
        stockist.save()

        message = provision_stockist_login(stockist)

        return Response({
            **StockistSerializer(stockist).data,
            "message": f"Approved — {message[0].lower()}{message[1:]}",
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

        # Notify admins and applicant — don't let email failure break the submission
        try:
            from apps.notifications.emails import notify_stockist_application, confirm_stockist_application
            notify_stockist_application(
                business_name=stockist.business_name,
                contact_name=stockist.contact_name,
                email=stockist.email,
                description=stockist.description,
            )
            confirm_stockist_application(
                stockist_email=stockist.email,
                business_name=stockist.business_name,
                contact_name=stockist.contact_name,
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception("Failed to send stockist application emails")

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
