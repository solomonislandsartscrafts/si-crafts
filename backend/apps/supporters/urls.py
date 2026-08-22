from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SupporterViewSet

router = DefaultRouter()
router.register("", SupporterViewSet, basename="supporter")

urlpatterns = [
    path("", include(router.urls)),
]
