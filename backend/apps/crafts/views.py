from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from wagtail.models import Page

from apps.page_tree import repair_numchild, delete_page

from .models import CraftPage
from .serializers import CraftPageSerializer, CraftPageRequestSerializer


class CraftWriteViewSet(viewsets.ViewSet):
    """Writable API for CraftPages (create, update, delete)."""

    permission_classes = [IsAuthenticated]

    def create(self, request):
        data = request.data

        # Validate process_image_url and process_image_alt
        image_fields = {}
        if "process_image_url" in data:
            image_fields["process_image_url"] = data["process_image_url"]
        if "process_image_alt" in data:
            image_fields["process_image_alt"] = data["process_image_alt"]
        if image_fields:
            req_serializer = CraftPageRequestSerializer(data=image_fields)
            if not req_serializer.is_valid():
                return Response(req_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        crafts_index = Page.objects.filter(title="Crafts").first()
        if not crafts_index:
            root = Page.objects.filter(depth=1).first()
            home = root.get_children().first() if root else None
            parent = home or root
            crafts_index = Page(title="Crafts", slug="crafts")
            parent.add_child(instance=crafts_index)
        else:
            repair_numchild(crafts_index)

        craft = CraftPage(
            title=data.get("title", data.get("name", "")),
            slug=data.get("slug", ""),
            description=data.get("description", ""),
            material_category=data.get("material_category", ""),
            cultural_context=data.get("cultural_context", ""),
            cultural_context_review_flag=data.get("cultural_context_review_flag", "unreviewed"),
            process_image_url=data.get("process_image_url", ""),
            process_image_alt=data.get("process_image_alt", ""),
        )
        crafts_index.add_child(instance=craft)
        return Response(CraftPageSerializer(craft).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        try:
            craft = CraftPage.objects.get(pk=pk)
        except CraftPage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        # Validate process_image_url and process_image_alt
        image_fields = {}
        if "process_image_url" in data:
            image_fields["process_image_url"] = data["process_image_url"]
        if "process_image_alt" in data:
            image_fields["process_image_alt"] = data["process_image_alt"]
        if image_fields:
            req_serializer = CraftPageRequestSerializer(data=image_fields)
            if not req_serializer.is_valid():
                return Response(req_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if "title" in data or "name" in data:
            craft.title = data.get("title", data.get("name", craft.title))
        if "slug" in data:
            craft.slug = data["slug"]
        if "description" in data:
            craft.description = data["description"]
        if "material_category" in data:
            craft.material_category = data["material_category"]
        if "cultural_context" in data:
            craft.cultural_context = data["cultural_context"]
        if "cultural_context_review_flag" in data:
            craft.cultural_context_review_flag = data["cultural_context_review_flag"]
        if "process_image_url" in data:
            craft.process_image_url = data["process_image_url"]
        if "process_image_alt" in data:
            craft.process_image_alt = data["process_image_alt"]

        craft.save_revision().publish()
        return Response(CraftPageSerializer(craft).data)

    def destroy(self, request, pk=None):
        try:
            craft = CraftPage.objects.get(pk=pk)
        except CraftPage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        delete_page(craft)
        return Response(status=status.HTTP_204_NO_CONTENT)
