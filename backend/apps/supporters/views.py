from rest_framework import viewsets

from apps.accounts.permissions import IsAdminOrReadOnly

from .models import Supporter
from .serializers import SupporterSerializer


class SupporterViewSet(viewsets.ModelViewSet):
    """CRUD API for homepage supporter logos.

    - GET (list/retrieve): public, no auth required.
    - POST/PATCH/DELETE: requires admin auth.
    """

    queryset = Supporter.objects.all()
    serializer_class = SupporterSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
