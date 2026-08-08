from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockistViewSet, StockistApplyView, SetPasswordView, ForgotPasswordView, StockistProfileView, ChangePasswordView

router = DefaultRouter()
router.register("", StockistViewSet, basename="stockist")

urlpatterns = [
    path("apply/", StockistApplyView.as_view({"post": "create"}), name="stockist-apply"),
    path("set-password/", SetPasswordView.as_view(), name="stockist-set-password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="stockist-forgot-password"),
    path("profile/", StockistProfileView.as_view(), name="stockist-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="stockist-change-password"),
    path("", include(router.urls)),
]
