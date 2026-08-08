from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MakerEnquiryViewSet, StockistRequestViewSet, ContactEnquiryViewSet

router = DefaultRouter()
router.register("maker", MakerEnquiryViewSet, basename="maker-enquiry")
router.register("stockist-request", StockistRequestViewSet, basename="stockist-request")
router.register("contact", ContactEnquiryViewSet, basename="contact-enquiry")

urlpatterns = [
    path("", include(router.urls)),
]
