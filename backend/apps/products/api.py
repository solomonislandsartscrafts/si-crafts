from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.filters import FieldsFilter, OrderingFilter, SearchFilter

from .models import ProductPage


class ProductPageAPIViewSet(PagesAPIViewSet):
    model = ProductPage

    body_fields = PagesAPIViewSet.body_fields + [
        "product_code",
        "description",
        "material_category",
        "product_type",
        "maker",
        "craft",
        "dimensions",
        "care_notes",
        "wholesale_price",
        "published_flag",
        "image_urls",
        "image_alts",
    ]

    listing_default_fields = PagesAPIViewSet.listing_default_fields + [
        "product_code",
        "description",
        "material_category",
        "product_type",
        "maker",
        "craft",
        "dimensions",
        "care_notes",
        "wholesale_price",
        "published_flag",
        "image_urls",
        "image_alts",
    ]

    filter_backends = [FieldsFilter, OrderingFilter, SearchFilter]

    known_query_parameters = PagesAPIViewSet.known_query_parameters.union([
        "product_code",
        "material_category",
        "product_type",
        "maker",
        "published_flag",
    ])

    def get_queryset(self):
        qs = super().get_queryset()
        code = self.request.query_params.get("product_code")
        if code:
            qs = qs.filter(product_code=code)
        material = self.request.query_params.get("material_category")
        if material:
            qs = qs.filter(material_category=material)
        ptype = self.request.query_params.get("product_type")
        if ptype:
            qs = qs.filter(product_type=ptype)
        maker_id = self.request.query_params.get("maker")
        if maker_id:
            qs = qs.filter(maker_id=maker_id)
        published = self.request.query_params.get("published_flag")
        if published is not None:
            qs = qs.filter(published_flag=published.lower() in ("true", "1"))
        return qs
