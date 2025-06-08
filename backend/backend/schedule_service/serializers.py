from rest_framework import serializers
from .models import Schedule
from data_service.serializers import TeachingLoadSerializer, TimeSlotSerializer, ClassroomSerializer

class ScheduleSerializer(serializers.ModelSerializer):
    teaching_load = TeachingLoadSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    
    class Meta:
        model = Schedule
        fields = '__all__'