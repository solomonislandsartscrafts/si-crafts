from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductWriteViewSet

router = DefaultRouter()
router.register("", ProductWriteViewSet, basename="product-write")

urlpatterns = [
    path("", include(router.urls)),
]
