from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from data_service.views import *

router = routers.DefaultRouter()
router.register(r'specialties', SpecialtyViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'groups', StudentGroupViewSet)
router.register(r'disciplines', DisciplineViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'teaching-loads', TeachingLoadViewSet)
router.register(r'classrooms', ClassroomViewSet)
router.register(r'time-slots', TimeSlotViewSet)
router.register(r'schedule', ScheduleViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('auth_service.urls')),
    path('api/schedule-generator/', include('schedule_service.urls')),
    path('api/reports/', include('reporting_service.urls')),
]