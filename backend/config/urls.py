"""
URL configuration for config project.
"""

from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.views.static import serve


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/marketplace/", include("marketplace.urls")),

    # Serve uploaded media files in production.
    path(
        "media/<path:path>",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]