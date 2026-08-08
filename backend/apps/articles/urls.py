from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleWriteViewSet

router = DefaultRouter()
router.register("", ArticleWriteViewSet, basename="article-write")

urlpatterns = [
    path("", include(router.urls)),
]
