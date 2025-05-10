from backend.backend.backend.celery import shared_task
from .models import Schedule
from data_service.models import TeachingLoad, TimeSlot, Classroom
import random

@shared_task
def generate_schedule():
    Schedule.objects.all().delete()  # Очистка старого расписания
    
    teaching_loads = TeachingLoad.objects.filter(semester1_hours__gt=0)
    time_slots = TimeSlot.objects.all()
    classrooms = Classroom.objects.all()
    
    for load in teaching_loads:
        available_slots = []
        for slot in time_slots:
            for room in classrooms:
                if not Schedule.objects.filter(
                    time_slot=slot,
                    classroom=room,
                ).exists():
                    available_slots.append((slot, room))
        
        if available_slots:
            slot, room = random.choice(available_slots)
            Schedule.objects.create(
                teaching_load=load,
                time_slot=slot,
                classroom=room,
            )
    
    return "Расписание сгенерировано"