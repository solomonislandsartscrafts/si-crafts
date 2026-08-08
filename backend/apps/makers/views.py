from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from wagtail.models import Page

from apps.page_tree import repair_numchild, delete_page

from .models import MakerPage
from .serializers import MakerPageSerializer


class MakerWriteViewSet(viewsets.ViewSet):
    """Writable API for MakerPages (create, update, delete)."""

    permission_classes = [IsAuthenticated]

    def create(self, request):
        data = request.data
        makers_index = Page.objects.filter(title="Makers").first()
        if not makers_index:
            root = Page.objects.filter(depth=1).first()
            home = root.get_children().first() if root else None
            parent = home or root
            makers_index = Page(title="Makers", slug="makers")
            parent.add_child(instance=makers_index)
        else:
            repair_numchild(makers_index)

        maker = MakerPage(
            title=data.get("title", data.get("name", "")),
            slug=data.get("slug", ""),
            village=data.get("village", ""),
            province=data.get("province", ""),
            island=data.get("island", ""),
            story=data.get("story", ""),
            story_cultural_review_flag=data.get("story_cultural_review_flag", "unreviewed"),
            consent_status=data.get("consent_status", "Not Signed"),
            published_flag=data.get("published_flag", False),
            age=data.get("age"),
            years_active=data.get("years_active"),
            craft_id=data.get("craft") if data.get("craft") else None,
            portrait_url=data.get("portrait_url", ""),
            portrait_alt=data.get("portrait_alt", ""),
        )
        makers_index.add_child(instance=maker)
        maker.save_revision().publish()
        return Response(MakerPageSerializer(maker).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        try:
            maker = MakerPage.objects.get(pk=pk)
        except MakerPage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "title" in data or "name" in data:
            maker.title = data.get("title", data.get("name", maker.title))
        if "slug" in data:
            maker.slug = data["slug"]
        if "village" in data:
            maker.village = data["village"]
        if "province" in data:
            maker.province = data["province"]
        if "island" in data:
            maker.island = data["island"]
        if "story" in data:
            maker.story = data["story"]
        if "story_cultural_review_flag" in data:
            maker.story_cultural_review_flag = data["story_cultural_review_flag"]
        if "consent_status" in data:
            maker.consent_status = data["consent_status"]
        if "published_flag" in data:
            maker.published_flag = data["published_flag"]
        if "age" in data:
            maker.age = data["age"]
        if "years_active" in data:
            maker.years_active = data["years_active"]
        if "craft" in data:
            maker.craft_id = data["craft"] if data["craft"] else None
        if "portrait_url" in data:
            maker.portrait_url = data["portrait_url"] or ""
        if "portrait_alt" in data:
            maker.portrait_alt = data["portrait_alt"] or ""

        maker.save_revision().publish()
        return Response(MakerPageSerializer(maker).data)

    def destroy(self, request, pk=None):
        try:
            maker = MakerPage.objects.get(pk=pk)
        except MakerPage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        delete_page(maker)
        return Response(status=status.HTTP_204_NO_CONTENT)
