from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve

from api.views import api
from main.health_views import health_live, health_ready

urlpatterns = [
    path("health/live/", health_live),
    path("health/ready/", health_ready),
    path('admin/', admin.site.urls),
    path("api/", api.urls),
    path('editorjs/', include('django_editorjs_fields.urls')),
    # Медиафайлы — работает в любом режиме (DEBUG=True/False)
    re_path(r'^files/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
