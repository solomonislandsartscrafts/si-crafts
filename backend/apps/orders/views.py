from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import OrderRequest
from .serializers import OrderRequestSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = OrderRequest.objects.all()
    serializer_class = OrderRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        stockist_id = self.request.query_params.get("stockist")
        if stockist_id:
            qs = qs.filter(stockist_id=stockist_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        order = serializer.save()
        # Notify admins of new order
        from apps.notifications.emails import notify_new_order
        notify_new_order(
            reference_number=order.reference_number,
            stockist_name=order.stockist.business_name,
            total_aud=float(order.total_aud),
            item_count=order.items.count(),
        )

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(OrderRequest.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )
        old_status = order.status
        order.status = new_status
        order.save()

        # Notify stockist of status change (only for meaningful transitions)
        if new_status != old_status and new_status in ("Confirmed", "Shipped"):
            from apps.notifications.emails import notify_order_status_update
            stockist_email = order.stockist.email
            if stockist_email:
                notify_order_status_update(
                    stockist_email=stockist_email,
                    reference_number=order.reference_number,
                    new_status=new_status,
                )

        return Response(OrderRequestSerializer(order).data)
