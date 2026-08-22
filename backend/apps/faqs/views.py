from rest_framework import viewsets

from apps.accounts.permissions import IsAdminOrReadOnly
from .models import Faq
from .serializers import FaqSerializer


class FaqViewSet(viewsets.ModelViewSet):
    """CRUD API for FAQs.

    - GET (list/retrieve): public, no auth required.
    - POST/PATCH/DELETE: requires admin auth.
    """

    queryset = Faq.objects.all()
    serializer_class = FaqSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
