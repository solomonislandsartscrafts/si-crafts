from django.core.exceptions import ValidationError
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

    # Process photo stored as a URL (R2/media). Kept as a plain URL rather than
    # a wagtailimages FK so the admin UI can save an uploaded image by URL.
    process_image_url = models.CharField(max_length=500, blank=True, default="")
    process_image_alt = models.CharField(max_length=300, blank=True, default="")

    # Ordered list of related news article slugs (e.g. "how shell-money is
    # made"). Stored as a JSON list of plain slugs, not page FKs (same pattern as
    # ProductPage.image_urls); the frontend resolves each via getArticleBySlug
    # and renders nothing for any that is empty or unpublished.
    related_article_slugs = models.JSONField(default=list, blank=True)

    def clean(self):
        """Enforce that related_article_slugs is a list of strings.

        Runs on full_clean(), which Wagtail's admin ModelForm calls on save, so
        editing through the Wagtail admin is validated too — not only the REST
        write views. The default (empty list) and blank behaviour is unchanged:
        an empty list passes.
        """
        super().clean()
        slugs = self.related_article_slugs
        if not isinstance(slugs, list) or not all(isinstance(item, str) for item in slugs):
            raise ValidationError(
                {"related_article_slugs": "Must be a list containing only strings."}
            )

    content_panels = Page.content_panels + [
        FieldPanel("description"),
        FieldPanel("material_category"),
        FieldPanel("cultural_context"),
        FieldPanel("cultural_context_review_flag"),
        FieldPanel("process_image_url"),
        FieldPanel("process_image_alt"),
        FieldPanel("related_article_slugs"),
        InlinePanel("process_images", label="Process Images"),
    ]

    api_fields = [
        APIField("description"),
        APIField("cultural_context"),
        APIField("cultural_context_review_flag"),
        APIField("material_category"),
        APIField("process_image_url"),
        APIField("process_image_alt"),
        APIField("related_article_slugs"),
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
