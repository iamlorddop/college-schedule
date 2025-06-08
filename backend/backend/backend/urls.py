from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include('auth_service.urls')), 
        path('schedules/', include('schedule_service.urls')),
        path('reports/', include('reporting_service.urls')),
        path('', include('data_service.urls')), 
    ])),
]