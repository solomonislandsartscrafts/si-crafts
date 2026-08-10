from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.api.v2.router import WagtailAPIRouter

from apps.makers.api import MakerPageAPIViewSet
from apps.products.api import ProductPageAPIViewSet
from apps.crafts.api import CraftPageAPIViewSet
from apps.articles.api import ArticlePageAPIViewSet

# Wagtail API v2
api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("makers", MakerPageAPIViewSet)
api_router.register_endpoint("products", ProductPageAPIViewSet)
api_router.register_endpoint("crafts", CraftPageAPIViewSet)
api_router.register_endpoint("articles", ArticlePageAPIViewSet)

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),

    # Wagtail content API (pages)
    path("api/v2/", api_router.urls),

    # Custom REST APIs
    path("api/auth/", include("apps.accounts.urls")),
    path("api/stockists/", include("apps.stockists.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/enquiries/", include("apps.enquiries.urls")),
    path("api/categories/", include("apps.categories.urls")),
    path("api/site-content/", include("apps.site_content.urls")),
    path("api/upload/", include("apps.site_content.upload_urls")),

    # Writable page APIs (POST/PATCH/DELETE for Wagtail pages)
    path("api/write/products/", include("apps.products.urls")),
    path("api/write/makers/", include("apps.makers.urls")),
    path("api/write/crafts/", include("apps.crafts.urls")),
    path("api/write/articles/", include("apps.articles.urls")),

    # Wagtail catch-all (serves page previews etc.)
    path("", include(wagtail_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # In production, serve media via a simple view (Render free tier has no CDN for media)
    from django.views.static import serve
    from django.urls import re_path
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
