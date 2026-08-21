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

class IsSiteAdmin(BasePermission):
    """Allow only users with an active AdminProfile (superusers always pass).

    IsAuthenticated is not enough for admin-only endpoints: a logged-in
    stockist also holds a valid JWT.
    """

    message = "Admin access required."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        # Raises RelatedObjectDoesNotExist (an AttributeError) when absent.
        profile = getattr(user, "admin_profile", None)
        return bool(profile and profile.is_active)


class IsSuperAdmin(BasePermission):
    """Allow only active super admins (Django superusers always pass).

    Used for account management: creating, editing and deleting other people's
    logins is the one thing editors must not be able to do.
    """

    message = "Super admin access required."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        profile = getattr(user, "admin_profile", None)
        return bool(profile and profile.is_active and profile.role == "super_admin")
