from django.urls import path

from .views import SiteTextView

urlpatterns = [
    path("", SiteTextView.as_view(), name="site-text"),
]
