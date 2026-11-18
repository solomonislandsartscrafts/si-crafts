from django.core.exceptions import ValidationError
from django.utils.text import slugify
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from wagtail.models import Page

from apps.accounts.permissions import IsApprovedStockistOrAdmin, IsSiteAdmin
from apps.page_tree import repair_numchild, delete_page

from .models import ProductPage
from .serializers import ProductPageSerializer


def _unique_slug(parent, wanted, exclude_pk=None):
    """Return a slug that no sibling under `parent` is using.

    Wagtail requires sibling pages to have different slugs and raises a
    ValidationError (an HTTP 500) otherwise. Product names repeat — a maker
    can have two "Shoulder Bag (medium)" pieces — so a clash gets -2, -3...
    """
    base = slugify(wanted) or "product"
    siblings = Page.objects.child_of(parent)
    if exclude_pk:
        siblings = siblings.exclude(pk=exclude_pk)
    taken = set(siblings.filter(slug__startswith=base).values_list("slug", flat=True))
    slug, n = base, 2
    while slug in taken:
        slug = f"{base}-{n}"
        n += 1
    return slug


def _validation_response(err):
    """Turn a Django ValidationError into a readable 400 instead of a 500."""
    if hasattr(err, "message_dict"):
        msg = "; ".join(f"{k}: {' '.join(v)}" for k, v in err.message_dict.items())
    else:
        msg = " ".join(err.messages)
    return Response({"error": msg}, status=status.HTTP_400_BAD_REQUEST)


class ProductWriteViewSet(viewsets.ViewSet):
    """Writable API for ProductPages (create, update, delete)."""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], permission_classes=[IsApprovedStockistOrAdmin])
    def prices(self, request):
        """Wholesale prices (one row per product) for approved stockists and admins.

        The public v2 API never carries prices, so this is the only read path.
        Stockists see published products only; admins see everything.
        """
        qs = ProductPage.objects.all()
        if not IsSiteAdmin().has_permission(request, self):
            qs = qs.filter(published_flag=True)
        return Response(list(qs.values("id", "product_code", "wholesale_price")))

    def create(self, request):
        """Create a new product page."""
        data = request.data
        # Find the Products index page
        products_index = Page.objects.filter(title="Products").first()
        if not products_index:
            # Create it under the home page
            root = Page.objects.filter(depth=1).first()
            home = root.get_children().first() if root else None
            parent = home or root
            products_index = Page(title="Products", slug="products")
            parent.add_child(instance=products_index)
        else:
            repair_numchild(products_index)

        # Check for duplicate product code
        if ProductPage.objects.filter(product_code=data.get("product_code", "")).exists():
            return Response({"error": "Product code already exists"}, status=status.HTTP_400_BAD_REQUEST)

        title = data.get("title", data.get("name", ""))
        product = ProductPage(
            title=title,
            slug=_unique_slug(products_index, data.get("slug") or title),
            product_code=data.get("product_code", ""),
            description=data.get("description", ""),
            material_category=data.get("material_category", ""),
            product_type=data.get("product_type", ""),
            maker_id=data.get("maker") if data.get("maker") else None,
            craft_id=data.get("craft") if data.get("craft") else None,
            dimensions=data.get("dimensions"),
            care_notes=data.get("care_notes"),
            wholesale_price=data.get("wholesale_price", 0),
            published_flag=data.get("published_flag", True),
            image_urls=data.get("image_urls", []) or [],
            image_alts=data.get("image_alts", []) or [],
        )
        try:
            products_index.add_child(instance=product)
            # Publish so the page is live and gets a first_published_at timestamp.
            product.save_revision().publish()
        except ValidationError as err:
            return _validation_response(err)
        return Response(ProductPageSerializer(product).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """Update an existing product page."""
        try:
            product = ProductPage.objects.get(pk=pk)
        except ProductPage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "title" in data or "name" in data:
            product.title = data.get("title", data.get("name", product.title))
        if "slug" in data and data["slug"] and data["slug"] != product.slug:
            product.slug = _unique_slug(product.get_parent(), data["slug"], exclude_pk=product.pk)
        if "product_code" in data:
            product.product_code = data["product_code"]
        if "description" in data:
            product.description = data["description"]
        if "material_category" in data:
            product.material_category = data["material_category"]
        if "product_type" in data:
            product.product_type = data["product_type"]
        if "maker" in data:
            product.maker_id = data["maker"] if data["maker"] else None
        if "craft" in data:
            product.craft_id = data["craft"] if data["craft"] else None
        if "dimensions" in data:
            product.dimensions = data["dimensions"]
        if "care_notes" in data:
            product.care_notes = data["care_notes"]
        if "wholesale_price" in data:
            product.wholesale_price = data["wholesale_price"]
        if "published_flag" in data:
            product.published_flag = data["published_flag"]
        if "image_urls" in data:
            product.image_urls = data["image_urls"] or []
        if "image_alts" in data:
            product.image_alts = data["image_alts"] or []

        try:
            product.save_revision().publish()
        except ValidationError as err:
            return _validation_response(err)
        return Response(ProductPageSerializer(product).data)

    def destroy(self, request, pk=None):
        """Delete a product page."""
        try:
            product = ProductPage.objects.get(pk=pk)
        except ProductPage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        delete_page(product)
        return Response(status=status.HTTP_204_NO_CONTENT)
