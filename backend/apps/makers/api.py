from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.filters import FieldsFilter, OrderingFilter, SearchFilter

from .models import MakerPage


class MakerPageAPIViewSet(PagesAPIViewSet):
    model = MakerPage

    body_fields = PagesAPIViewSet.body_fields + [
        "village",
        "province",
        "island",
        "story",
        "story_cultural_review_flag",
        "consent_status",
        "published_flag",
        "age",
        "years_active",
        "portrait_url",
        "portrait_alt",
        "craft",
    ]

    listing_default_fields = PagesAPIViewSet.listing_default_fields + [
        "village",
        "province",
        "island",
        "story",
        "story_cultural_review_flag",
        "consent_status",
        "published_flag",
        "age",
        "years_active",
        "portrait_url",
        "portrait_alt",
        "craft",
    ]

    filter_backends = [FieldsFilter, OrderingFilter, SearchFilter]

    known_query_parameters = PagesAPIViewSet.known_query_parameters.union([
        "consent_status",
        "published_flag",
        "craft",
    ])

    def get_queryset(self):
        qs = super().get_queryset()
        # Custom filters
        consent = self.request.query_params.get("consent_status")
        if consent:
            qs = qs.filter(consent_status=consent)
        published = self.request.query_params.get("published_flag")
        if published is not None:
            qs = qs.filter(published_flag=published.lower() in ("true", "1"))
        craft_id = self.request.query_params.get("craft")
        if craft_id:
            qs = qs.filter(craft_id=craft_id)
        return qs
