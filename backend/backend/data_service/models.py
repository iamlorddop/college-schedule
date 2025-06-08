from django.db import models

class Specialty(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'specialties'

class Course(models.Model):
    number = models.IntegerField()

    def __str__(self):
        return f"Курс {self.number}"
    
    class Meta:
        db_table = 'courses'

class StudentGroup(models.Model):
    STUDY_FORMS = [
        ('б', 'Бюджет'),
        ('п', 'Коммерция'),
        ('в', 'Вечернее'),
    ]
    
    name = models.CharField(max_length=50)
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    study_form = models.CharField(max_length=1, choices=STUDY_FORMS)
    subgroup = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'student_groups'

class Discipline(models.Model):
    name = models.CharField(max_length=255)
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'disciplines'

class Teacher(models.Model):
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    
    @property
    def short_name(self):
        return f"{self.last_name} {self.first_name[0]}.{self.middle_name[0] + '.' if self.middle_name else ''}"

    def __str__(self):
        return self.short_name

    class Meta:
        db_table = 'teachers'

class TeachingLoad(models.Model):
    discipline = models.ForeignKey(Discipline, on_delete=models.CASCADE)
    group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    total_hours = models.IntegerField(blank=True, null=True)
    self_study_hours = models.IntegerField(blank=True, null=True)
    current_year_hours = models.IntegerField(blank=True, null=True)
    semester1_hours = models.IntegerField(blank=True, null=True)
    semester2_hours = models.IntegerField(blank=True, null=True)
    hours_to_issue = models.IntegerField(blank=True, null=True)
    course_design_hours = models.IntegerField(blank=True, null=True)
    semester1_exams = models.IntegerField(blank=True, null=True)
    semester2_exams = models.IntegerField(blank=True, null=True)
    course_work_check_hours = models.IntegerField(blank=True, null=True)
    consultations_hours = models.IntegerField(blank=True, null=True)
    dp_review_hours = models.IntegerField(blank=True, null=True)
    dp_guidance_hours = models.IntegerField(blank=True, null=True)
    total_teaching_hours = models.IntegerField(blank=True, null=True)
    master_training_hours = models.IntegerField(blank=True, null=True)
    advanced_level_hours = models.IntegerField(blank=True, null=True)
    notebook_check_10_percent = models.IntegerField(blank=True, null=True)
    notebook_check_15_percent = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.discipline} - {self.group} - {self.teacher}"
    
    class Meta:
        db_table = 'teaching_loads'

class Classroom(models.Model):
    CLASSROOM_TYPES = [
        ('lecture', 'Лекционная'),
        ('lab', 'Лаборатория'),
        ('practice', 'Практическая'),
    ]
    
    number = models.CharField(max_length=50)
    capacity = models.IntegerField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=CLASSROOM_TYPES, default='lecture')
    
    def __str__(self):
        return f"Аудитория {self.number}"
    
    class Meta:
        db_table = 'classrooms'

class TimeSlot(models.Model):
    DAYS_OF_WEEK = [
        (1, 'Понедельник'),
        (2, 'Вторник'),
        (3, 'Среда'),
        (4, 'Четверг'),
        (5, 'Пятница'),
        (6, 'Суббота'),
        (7, 'Воскресенье'),
    ]
    
    start_time = models.TimeField()
    end_time = models.TimeField()
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}-{self.end_time}"

    class Meta:
        db_table = 'time_slots'