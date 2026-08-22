from rest_framework import viewsets

from apps.accounts.permissions import IsAdminOrReadOnly

from .models import RetailStockist
from .serializers import RetailStockistSerializer


class RetailStockistViewSet(viewsets.ModelViewSet):
    """CRUD API for the public stockist directory.

    - GET (list/retrieve): public, no auth required.
    - POST/PATCH/DELETE: requires admin auth.
    """

    queryset = RetailStockist.objects.all()
    serializer_class = RetailStockistSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
