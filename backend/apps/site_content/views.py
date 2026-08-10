from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import SiteContent
from .serializers import SiteContentSerializer


class SiteContentView(APIView):
    """GET/PUT the singleton site content record."""

    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        obj = SiteContent.load()
        serializer = SiteContentSerializer(obj)
        return Response(serializer.data)

    def put(self, request):
        obj = SiteContent.load()
        # Map frontend camelCase keys to snake_case
        data = {}
        if "aboutSolomonIslandsImage" in request.data:
            data["about_solomon_islands_image_url"] = request.data["aboutSolomonIslandsImage"]
        if "aboutSolomonIslandsImageAlt" in request.data:
            data["about_solomon_islands_image_alt"] = request.data["aboutSolomonIslandsImageAlt"]
        if "aboutTeamImage" in request.data:
            data["about_team_image_url"] = request.data["aboutTeamImage"]
        if "aboutTeamImageAlt" in request.data:
            data["about_team_image_alt"] = request.data["aboutTeamImageAlt"]
        if "whyWeDoThisImage" in request.data:
            data["why_we_do_this_image_url"] = request.data["whyWeDoThisImage"]
        if "whyWeDoThisImageAlt" in request.data:
            data["why_we_do_this_image_alt"] = request.data["whyWeDoThisImageAlt"]

        serializer = SiteContentSerializer(obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.update(obj, serializer.validated_data)
        return Response(SiteContentSerializer(obj).data)


class ImageUploadView(APIView):
    """Upload an image and return its URL."""

    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        import os
        import uuid
        from django.conf import settings

        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=400)

        # Validate type
        allowed = ("image/jpeg", "image/png", "image/webp")
        if file.content_type not in allowed:
            return Response({"error": "Only JPEG, PNG, and WebP allowed"}, status=400)

        # Save to media directory
        ext = "webp" if file.content_type == "image/webp" else "jpg" if file.content_type == "image/jpeg" else "png"
        filename = f"{uuid.uuid4()}.{ext}"
        upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

        url = f"{settings.MEDIA_URL}uploads/{filename}"
        # In production, return an absolute URL so the frontend can reference it
        base_url = os.environ.get("WAGTAILADMIN_BASE_URL", "").rstrip("/")
        if base_url:
            url = f"{base_url}{url}"
        return Response({"url": url})
