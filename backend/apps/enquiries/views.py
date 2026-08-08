from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import MakerEnquiry, StockistRequest, ContactEnquiry
from .serializers import (
    MakerEnquirySerializer,
    StockistRequestSerializer,
    ContactEnquirySerializer,
)


class MakerEnquiryViewSet(viewsets.ModelViewSet):
    queryset = MakerEnquiry.objects.all()
    serializer_class = MakerEnquirySerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        # Notify admins
        from apps.notifications.emails import notify_maker_enquiry
        notify_maker_enquiry(
            name=enquiry.name,
            village=enquiry.village,
            province=enquiry.province,
            craft=enquiry.craft,
            message=enquiry.message,
            contact=enquiry.contact,
        )

    @action(detail=True, methods=["post"])
    def handled(self, request, pk=None):
        enquiry = self.get_object()
        enquiry.handled = True
        enquiry.save()
        return Response(MakerEnquirySerializer(enquiry).data)


class StockistRequestViewSet(viewsets.ModelViewSet):
    queryset = StockistRequest.objects.all()
    serializer_class = StockistRequestSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"])
    def handled(self, request, pk=None):
        enquiry = self.get_object()
        enquiry.handled = True
        enquiry.save()
        return Response(StockistRequestSerializer(enquiry).data)


class ContactEnquiryViewSet(viewsets.ModelViewSet):
    queryset = ContactEnquiry.objects.all()
    serializer_class = ContactEnquirySerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        # Notify admins
        from apps.notifications.emails import notify_contact_form
        notify_contact_form(
            name=enquiry.name,
            email=enquiry.email,
            reason=enquiry.get_reason_display(),
            message=enquiry.message,
        )

    @action(detail=True, methods=["post"])
    def handled(self, request, pk=None):
        enquiry = self.get_object()
        enquiry.handled = True
        enquiry.save()
        return Response(ContactEnquirySerializer(enquiry).data)
