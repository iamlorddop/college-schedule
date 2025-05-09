from django.db import models
from data_service.models import TeachingLoad, TimeSlot, Classroom

class Schedule(models.Model):
    WEEK_TYPES = [
        ('ч', 'Четная'),
        ('з', 'Нечетная'),
    ]
    
    teaching_load = models.ForeignKey(TeachingLoad, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    week_type = models.CharField(max_length=1, choices=WEEK_TYPES, blank=True, null=True)
    date = models.DateField(blank=True, null=True)  # Для разовых занятий

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['time_slot', 'classroom', 'week_type', 'date'],
                name='unique_booking'
            )
        ]