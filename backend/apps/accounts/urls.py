from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AdminLoginView,
    AdminVerifyView,
    AdminLogoutView,
    AdminListView,
    StockistLoginView,
    StockistVerifyView,
    StockistLogoutView,
)
from .user_views import UserAdminViewSet

router = DefaultRouter()
router.register("users", UserAdminViewSet, basename="account-user")

urlpatterns = [
    # Admin auth
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin/verify/", AdminVerifyView.as_view(), name="admin-verify"),
    path("admin/logout/", AdminLogoutView.as_view(), name="admin-logout"),
    path("admins/", AdminListView.as_view(), name="admin-list"),

    # Stockist auth
    path("stockist/login/", StockistLoginView.as_view(), name="stockist-login"),
    path("stockist/verify/", StockistVerifyView.as_view(), name="stockist-verify"),
    path("stockist/logout/", StockistLogoutView.as_view(), name="stockist-logout"),

    # Account management (super admin only)
    path("", include(router.urls)),
]
