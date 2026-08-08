from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MakerWriteViewSet

router = DefaultRouter()
router.register("", MakerWriteViewSet, basename="maker-write")

urlpatterns = [
    path("", include(router.urls)),
]
