from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamMemberViewSet

router = DefaultRouter()
router.register("", TeamMemberViewSet, basename="team-member")

urlpatterns = [
    path("", include(router.urls)),
]
