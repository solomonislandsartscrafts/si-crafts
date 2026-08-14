from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import SiteContent
from .serializers import SiteContentSerializer, FIELD_MAP


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

        # Map frontend camelCase keys to snake_case model fields
        data = {}
        for camel_key, snake_field in FIELD_MAP.items():
            if camel_key in request.data:
                data[snake_field] = request.data[camel_key]

        serializer = SiteContentSerializer(obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.update(obj, serializer.validated_data)
        return Response(SiteContentSerializer(obj).data)


class ImageUploadView(APIView):
    """Upload an image, convert to WebP, store in Cloudflare R2, and return its public URL."""

    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        from .r2_storage import is_r2_configured, upload_to_r2

        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=400)

        # Validate type
        allowed = ("image/jpeg", "image/png", "image/webp")
        if file.content_type not in allowed:
            return Response({"error": "Only JPEG, PNG, and WebP allowed"}, status=400)

        # Validate size (max 10MB)
        if file.size > 10 * 1024 * 1024:
            return Response({"error": "File too large. Maximum 10 MB."}, status=400)

        # Read file bytes
        file_data = file.read()

        # Upload to R2 (converts to WebP automatically)
        if is_r2_configured():
            try:
                url = upload_to_r2(file_data, content_type=file.content_type)
                return Response({"url": url})
            except Exception as e:
                import logging
                logging.getLogger(__name__).exception("R2 upload failed")
                return Response({"error": "Upload failed. Please try again."}, status=500)

        # Fallback: save locally (for local development only)
        import os
        import uuid
        from django.conf import settings

        ext = "webp"
        filename = f"{uuid.uuid4()}.{ext}"
        upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        # Convert to WebP locally too
        from .r2_storage import convert_to_webp
        webp_data = convert_to_webp(file_data)

        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(webp_data)

        url = f"/uploads/{filename}"
        return Response({"url": url})
