from django.db import models
from data_service.models import TeachingLoad, TimeSlot, Classroom

class Schedule(models.Model):
    WEEK_TYPES = [
        ('ч', 'Четная'),
        ('з', 'Нечетная'),
    ]
    
    teaching_load = models.ForeignKey(
        TeachingLoad, 
        on_delete=models.CASCADE, 
        related_name='schedule_service_teaching_loads'  # Изменено
    )
    time_slot = models.ForeignKey(
        TimeSlot, 
        on_delete=models.CASCADE, 
        related_name='schedule_service_time_slots'  # Изменено
    )
    classroom = models.ForeignKey(
        Classroom, 
        on_delete=models.CASCADE, 
        related_name='schedule_service_classrooms'  # Изменено
    )
    week_type = models.CharField(max_length=1, choices=WEEK_TYPES, blank=True, null=True)
    date = models.DateField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['classroom', 'teaching_load', 'time_slot'], 
                name='unique_schedule_booking'
            )
        ]
        db_table = 'schedule'

    def __str__(self):
        return f"{self.teaching_load} - {self.time_slot} - {self.classroom}"