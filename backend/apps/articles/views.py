from django.core.exceptions import ValidationError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from wagtail.models import Page

from apps.page_tree import repair_numchild, delete_page

from .models import ArticlePage
from .serializers import ArticlePageSerializer


def _get_news_index():
    """Find (or create) the News index page that articles live under."""
    index = Page.objects.filter(slug="news").first()
    if index:
        return repair_numchild(index)

    root = Page.objects.filter(depth=1).first()
    home = root.get_children().first() if root else None
    parent = home or root
    index = Page(title="News", slug="news")
    parent.add_child(instance=index)
    return index


def _error_response(exc):
    """Turn a Django ValidationError into a readable 400 response."""
    if hasattr(exc, "message_dict"):
        first = next(iter(exc.message_dict.values()))
        message = first[0] if first else str(exc)
    else:
        message = "; ".join(exc.messages)
    return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)


class ArticleWriteViewSet(viewsets.ViewSet):
    """Writable API for ArticlePages (create, update, delete)."""

    permission_classes = [IsAuthenticated]

    def create(self, request):
        data = request.data
        news_index = _get_news_index()

        article = ArticlePage(
            title=data.get("title", ""),
            slug=data.get("slug", ""),
            excerpt=data.get("excerpt", "") or "",
            standfirst=data.get("standfirst", "") or "",
            body=data.get("body", "") or "",
            author_name=data.get("author_name", "") or "",
            author_role=data.get("author_role", "") or "",
            published_flag=data.get("published_flag", False),
            featured=data.get("featured", False),
            reading_time_minutes=data.get("reading_time_minutes") or 3,
            published_at=data.get("published_at") or None,
            cover_image_url=data.get("cover_image_url", "") or "",
            cover_image_alt=data.get("cover_image_alt", "") or "",
        )

        try:
            news_index.add_child(instance=article)
            if data.get("tags"):
                article.tags.set(data["tags"])
            article.save_revision().publish()
        except ValidationError as exc:
            if article.pk:
                delete_page(article)
            return _error_response(exc)

        article.refresh_from_db()
        return Response(ArticlePageSerializer(article).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        try:
            article = ArticlePage.objects.get(pk=pk)
        except ArticlePage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "title" in data:
            article.title = data["title"]
        if "slug" in data:
            article.slug = data["slug"]
        if "excerpt" in data:
            article.excerpt = data["excerpt"] or ""
        if "standfirst" in data:
            article.standfirst = data["standfirst"] or ""
        if "body" in data:
            article.body = data["body"] or ""
        if "author_name" in data:
            article.author_name = data["author_name"] or ""
        if "author_role" in data:
            article.author_role = data["author_role"] or ""
        if "published_flag" in data:
            article.published_flag = data["published_flag"]
        if "featured" in data:
            article.featured = data["featured"]
        if "reading_time_minutes" in data:
            article.reading_time_minutes = data["reading_time_minutes"] or 3
        if "published_at" in data:
            article.published_at = data["published_at"] or None
        if "cover_image_url" in data:
            article.cover_image_url = data["cover_image_url"] or ""
        if "cover_image_alt" in data:
            article.cover_image_alt = data["cover_image_alt"] or ""
        if "tags" in data:
            article.tags.set(data["tags"] or [])

        try:
            article.save_revision().publish()
        except ValidationError as exc:
            return _error_response(exc)

        article.refresh_from_db()
        return Response(ArticlePageSerializer(article).data)

    def destroy(self, request, pk=None):
        try:
            article = ArticlePage.objects.get(pk=pk)
        except ArticlePage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        delete_page(article)
        return Response(status=status.HTTP_204_NO_CONTENT)
