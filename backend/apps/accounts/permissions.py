from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """Allow unauthenticated access for safe methods (GET, HEAD, OPTIONS).

    For write methods (POST, PUT, PATCH, DELETE), require the user to be
    authenticated and have an active AdminProfile.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        # Check that the user has an admin profile
        return hasattr(request.user, "admin_profile")
