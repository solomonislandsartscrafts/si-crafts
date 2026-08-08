from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.filters import FieldsFilter, OrderingFilter, SearchFilter

from .models import CraftPage


class CraftPageAPIViewSet(PagesAPIViewSet):
    model = CraftPage

    body_fields = PagesAPIViewSet.body_fields + [
        "description",
        "cultural_context",
        "cultural_context_review_flag",
        "material_category",
    ]

    listing_default_fields = PagesAPIViewSet.listing_default_fields + [
        "description",
        "cultural_context",
        "cultural_context_review_flag",
        "material_category",
        "process_images",
    ]

    filter_backends = [FieldsFilter, OrderingFilter, SearchFilter]
