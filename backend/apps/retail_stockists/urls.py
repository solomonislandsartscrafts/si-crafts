from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import RetailStockistViewSet

router = DefaultRouter()
router.register("", RetailStockistViewSet, basename="retail-stockist")

urlpatterns = [
    path("", include(router.urls)),
]
