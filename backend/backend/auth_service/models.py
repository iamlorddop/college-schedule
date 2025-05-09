# auth_service/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrator'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLES)
    teacher_id = models.IntegerField(null=True, blank=True)
    group_id = models.IntegerField(null=True, blank=True)