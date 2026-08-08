from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.api import APIField
from modelcluster.fields import ParentalKey
from modelcluster.contrib.taggit import ClusterTaggableManager
from taggit.models import TaggedItemBase


class ArticleTag(TaggedItemBase):
    content_object = ParentalKey(
        "articles.ArticlePage", on_delete=models.CASCADE, related_name="tagged_items"
    )


class ArticlePage(Page):
    """A news/blog article."""

    excerpt = models.TextField(max_length=500, blank=True)
    body = RichTextField()
    cover_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    author_name = models.CharField(max_length=200)
    author_role = models.CharField(max_length=100, blank=True)
    tags = ClusterTaggableManager(through=ArticleTag, blank=True)
    published_flag = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    reading_time_minutes = models.PositiveIntegerField(default=3)
    published_at = models.DateTimeField(null=True, blank=True)
    # Cover image uploaded via the admin UI (stored as a path string, not a Wagtail Image FK).
    cover_image_url = models.CharField(max_length=500, blank=True, default="")
    cover_image_alt = models.CharField(max_length=300, blank=True, default="")

    content_panels = Page.content_panels + [
        FieldPanel("excerpt"),
        FieldPanel("body"),
        FieldPanel("cover_image"),
        FieldPanel("author_name"),
        FieldPanel("author_role"),
        FieldPanel("tags"),
        FieldPanel("published_flag"),
        FieldPanel("featured"),
        FieldPanel("reading_time_minutes"),
        FieldPanel("published_at"),
        FieldPanel("cover_image_url"),
        FieldPanel("cover_image_alt"),
    ]

    api_fields = [
        APIField("excerpt"),
        APIField("body"),
        APIField("author_name"),
        APIField("author_role"),
        APIField("published_flag"),
        APIField("featured"),
        APIField("reading_time_minutes"),
        APIField("published_at"),
        APIField("cover_image_url"),
        APIField("cover_image_alt"),
        APIField("tags"),
    ]

    class Meta:
        verbose_name = "Article"
        verbose_name_plural = "Articles"
