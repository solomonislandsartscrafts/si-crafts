from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from apps.accounts.permissions import IsAdminOrReadOnly
from .models import TeamMember
from .serializers import TeamMemberSerializer


class TeamMemberViewSet(viewsets.ModelViewSet):
    """CRUD API for team members.

    - GET (list/retrieve): public, no auth required.
    - POST/PATCH/DELETE: requires admin auth.
    """

    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminOrReadOnly]
