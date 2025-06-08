from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ScheduleViewSet,
    GenerateScheduleAPIView,
    ScheduleConflictsAPIView,
)

router = DefaultRouter()
router.register(r'', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('generate/', GenerateScheduleAPIView.as_view(), name='generate_schedule'),
    path('conflicts/', ScheduleConflictsAPIView.as_view(), name='schedule_conflicts'),
    path('group/<int:group_id>/', ScheduleViewSet.as_view({'get': 'list'}), name='group_schedule'),
    path('teacher/<int:teacher_id>/', ScheduleViewSet.as_view({'get': 'list'}), name='teacher_schedule'),
] + router.urls