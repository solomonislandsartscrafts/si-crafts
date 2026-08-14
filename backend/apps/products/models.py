from django.db import models
from wagtail.models import Page, Orderable
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.api import APIField
from modelcluster.fields import ParentalKey


class ProductPage(Page):
    """A product page."""

    product_code = models.CharField(max_length=20, unique=True)
    description = RichTextField()
    material_category = models.CharField(max_length=50)
    product_type = models.CharField(max_length=50)
    maker = models.ForeignKey(
        "makers.MakerPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="products",
    )
    craft = models.ForeignKey(
        "crafts.CraftPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="products",
    )
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    care_notes = models.TextField(blank=True, null=True)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2)
    published_flag = models.BooleanField(default=True)
    featured = models.BooleanField(
        default=False,
        help_text="Show this product in the homepage hero gallery (max 3 recommended).",
    )
    # Photo URLs uploaded via the admin UI (same pattern as SiteContent image URLs).
    image_urls = models.JSONField(default=list, blank=True)
    image_alts = models.JSONField(default=list, blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("product_code"),
        FieldPanel("description"),
        FieldPanel("material_category"),
        FieldPanel("product_type"),
        FieldPanel("maker"),
        FieldPanel("craft"),
        FieldPanel("dimensions"),
        FieldPanel("care_notes"),
        FieldPanel("wholesale_price"),
        FieldPanel("published_flag"),
        FieldPanel("featured"),
        FieldPanel("image_urls"),
        FieldPanel("image_alts"),
        InlinePanel("images", label="Product Images"),
    ]

    api_fields = [
        APIField("product_code"),
        APIField("description"),
        APIField("material_category"),
        APIField("product_type"),
        APIField("maker"),
        APIField("craft"),
        APIField("dimensions"),
        APIField("care_notes"),
        APIField("wholesale_price"),
        APIField("published_flag"),
        APIField("featured"),
        APIField("image_urls"),
        APIField("image_alts"),
    ]

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"


class ProductImage(Orderable):
    """Image attached to a ProductPage."""

    product = ParentalKey(ProductPage, on_delete=models.CASCADE, related_name="images")
    image = models.ForeignKey(
        "wagtailimages.Image", on_delete=models.CASCADE, related_name="+"
    )
    caption = models.CharField(max_length=250, blank=True)

    panels = [FieldPanel("image"), FieldPanel("caption")]
