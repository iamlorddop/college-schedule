import openpyxl
from io import BytesIO
from django.http import HttpResponse
from schedule_service.models import Schedule

def generate_schedule_xlsx():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Расписание"
    
    # Заголовки
    ws.append(["День", "Время", "Дисциплина", "Преподаватель", "Аудитория"])
    
    # Данные
    schedules = Schedule.objects.select_related(
        'teaching_load__discipline',
        'teaching_load__teacher',
        'classroom'
    ).all()
    
    for schedule in schedules:
        ws.append([
            schedule.time_slot.get_day_of_week_display(),
            f"{schedule.time_slot.start_time}-{schedule.time_slot.end_time}",
            schedule.teaching_load.discipline.name,
            schedule.teaching_load.teacher.short_name,
            schedule.classroom.number,
        ])
    
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    response = HttpResponse(
        buffer,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response['Content-Disposition'] = 'attachment; filename=schedule.xlsx'
    return response