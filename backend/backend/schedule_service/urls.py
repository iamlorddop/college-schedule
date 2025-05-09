from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ScheduleViewSet,
    GenerateScheduleAPIView,
    ScheduleConflictsAPIView,
)

router = DefaultRouter()
router.register(r'schedules', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('generate/', GenerateScheduleAPIView.as_view(), name='generate_schedule'),
    path('conflicts/', ScheduleConflictsAPIView.as_view(), name='schedule_conflicts'),
] + router.urls