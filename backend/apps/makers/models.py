from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.api import APIField


class MakerPage(Page):
    """A maker profile page."""

    village = models.CharField(max_length=200)
    province = models.CharField(max_length=200)
    island = models.CharField(max_length=200)
    portrait = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    story = RichTextField(blank=True, null=True)
    story_cultural_review_flag = models.CharField(
        max_length=20,
        choices=[("unreviewed", "Unreviewed"), ("reviewed", "Reviewed")],
        default="unreviewed",
    )
    craft = models.ForeignKey(
        "crafts.CraftPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="makers",
    )
    consent_status = models.CharField(
        max_length=20,
        choices=[("Signed", "Signed"), ("Not Signed", "Not Signed")],
        default="Not Signed",
    )
    published_flag = models.BooleanField(default=False)
    age = models.PositiveIntegerField(null=True, blank=True)
    years_active = models.PositiveIntegerField(null=True, blank=True)
    # Portrait URL uploaded via admin UI (stored as a path string, not a Wagtail Image FK).
    portrait_url = models.CharField(max_length=500, blank=True, default="")
    portrait_alt = models.CharField(max_length=300, blank=True, default="")

    content_panels = Page.content_panels + [
        FieldPanel("village"),
        FieldPanel("province"),
        FieldPanel("island"),
        FieldPanel("portrait"),
        FieldPanel("story"),
        FieldPanel("story_cultural_review_flag"),
        FieldPanel("craft"),
        FieldPanel("consent_status"),
        FieldPanel("published_flag"),
        FieldPanel("age"),
        FieldPanel("years_active"),
        FieldPanel("portrait_url"),
        FieldPanel("portrait_alt"),
    ]

    api_fields = [
        APIField("village"),
        APIField("province"),
        APIField("island"),
        APIField("story"),
        APIField("story_cultural_review_flag"),
        APIField("consent_status"),
        APIField("published_flag"),
        APIField("age"),
        APIField("years_active"),
        APIField("portrait_url"),
        APIField("portrait_alt"),
        APIField("craft"),
    ]

    class Meta:
        verbose_name = "Maker"
        verbose_name_plural = "Makers"
