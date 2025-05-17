
from rest_framework import routers
from django.urls import path, include
from .views import (
    SpecialtyViewSet,
    CourseViewSet,
    StudentGroupViewSet,
    DisciplineViewSet,
    TeacherViewSet,
    TeachingLoadViewSet,
    ClassroomViewSet,
    TimeSlotViewSet,
    ScheduleViewSet,
)

router = routers.DefaultRouter()
router.register(r'specialties', SpecialtyViewSet, basename='specialty')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'groups', StudentGroupViewSet, basename='studentgroup')
router.register(r'disciplines', DisciplineViewSet, basename='discipline')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'teaching-loads', TeachingLoadViewSet, basename='teachingload')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'time-slots', TimeSlotViewSet, basename='timeslot')
router.register(r'schedules', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
]
