from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', _('Administrator')
        TEACHER = 'teacher', _('Teacher')
        STUDENT = 'student', _('Student')
    
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT
    )
    teacher_id = models.IntegerField(null=True, blank=True)
    group_id = models.IntegerField(null=True, blank=True)
    middle_name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name=_('Middle name')
    )

    class Meta:
        db_table = 'auth_user'