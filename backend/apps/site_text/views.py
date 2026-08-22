from django.db import transaction
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrReadOnly

from .models import SiteText
from .serializers import validate_entries


class SiteTextView(APIView):
    """GET the whole site-text map; PUT a partial update.

    - GET: public, no auth. Returns a flat {key: value} object so the frontend
      can look copy up by key without walking a list.
    - PUT: admin only. Upserts only the keys present in the body, so two admins
      editing different pages cannot clobber each other's work.
    """

    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [JSONParser]

    def get(self, request):
        return Response(dict(SiteText.objects.values_list("key", "value")))

    def put(self, request):
        entries = validate_entries(request.data)

        # All or nothing: a save covers one screenful of related copy, so a
        # failure partway through must not leave half of it published.
        with transaction.atomic():
            for key, value in entries.items():
                SiteText.objects.update_or_create(key=key, defaults={"value": value})

        return Response(dict(SiteText.objects.values_list("key", "value")))
