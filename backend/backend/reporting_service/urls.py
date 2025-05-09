from django.urls import path
from .views import (
    ScheduleReportAPIView,
    TeachingLoadReportAPIView,
)

urlpatterns = [
    path('schedule/', ScheduleReportAPIView.as_view(), name='schedule_report'),
    path('teaching-load/', TeachingLoadReportAPIView.as_view(), name='teaching_load_report'),
]