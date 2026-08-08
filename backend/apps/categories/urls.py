from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MaterialCategoryViewSet, ProductTypeViewSet

router = DefaultRouter()
router.register("materials", MaterialCategoryViewSet, basename="material-category")
router.register("product-types", ProductTypeViewSet, basename="product-type")

urlpatterns = [
    path("", include(router.urls)),
]
