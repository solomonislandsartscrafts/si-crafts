from django.db import models
from wagtail.models import Page, Orderable
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.api import APIField
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel


class CraftPage(Page):
    """A craft technique (e.g. Pandanus Weaving, Wood Carving)."""

    description = RichTextField()
    cultural_context = RichTextField(blank=True, null=True)
    cultural_context_review_flag = models.CharField(
        max_length=20,
        choices=[("unreviewed", "Unreviewed"), ("reviewed", "Reviewed")],
        default="unreviewed",
    )
    material_category = models.CharField(max_length=50)

    content_panels = Page.content_panels + [
        FieldPanel("description"),
        FieldPanel("material_category"),
        FieldPanel("cultural_context"),
        FieldPanel("cultural_context_review_flag"),
        InlinePanel("process_images", label="Process Images"),
    ]

    api_fields = [
        APIField("description"),
        APIField("cultural_context"),
        APIField("cultural_context_review_flag"),
        APIField("material_category"),
    ]

    class Meta:
        verbose_name = "Craft"
        verbose_name_plural = "Crafts"


class CraftProcessImage(Orderable):
    """Process image attached to a CraftPage."""

    craft = ParentalKey(CraftPage, on_delete=models.CASCADE, related_name="process_images")
    image = models.ForeignKey(
        "wagtailimages.Image", on_delete=models.CASCADE, related_name="+"
    )
    caption = models.CharField(max_length=250, blank=True)

    panels = [FieldPanel("image"), FieldPanel("caption")]
