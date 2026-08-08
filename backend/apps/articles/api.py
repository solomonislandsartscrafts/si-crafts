from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.filters import FieldsFilter, OrderingFilter, SearchFilter

from .models import ArticlePage


class ArticlePageAPIViewSet(PagesAPIViewSet):
    model = ArticlePage

    body_fields = PagesAPIViewSet.body_fields + [
        "excerpt",
        "body",
        "author_name",
        "author_role",
        "published_flag",
        "featured",
        "reading_time_minutes",
        "published_at",
        "cover_image_url",
        "cover_image_alt",
        "tags",
    ]

    listing_default_fields = PagesAPIViewSet.listing_default_fields + [
        "excerpt",
        "body",
        "author_name",
        "author_role",
        "published_flag",
        "featured",
        "reading_time_minutes",
        "published_at",
        "cover_image_url",
        "cover_image_alt",
        "tags",
    ]

    filter_backends = [FieldsFilter, OrderingFilter, SearchFilter]

    known_query_parameters = PagesAPIViewSet.known_query_parameters.union([
        "published_flag",
        "featured",
    ])

    def get_queryset(self):
        qs = super().get_queryset()
        published = self.request.query_params.get("published_flag")
        if published is not None:
            qs = qs.filter(published_flag=published.lower() in ("true", "1"))
        featured = self.request.query_params.get("featured")
        if featured is not None:
            qs = qs.filter(featured=featured.lower() in ("true", "1"))
        return qs
