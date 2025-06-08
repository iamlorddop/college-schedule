from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from schedule_service.models import Schedule

def generate_schedule_pdf():
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=schedule.pdf'
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Заголовки
    p.drawString(100, height - 40, "Расписание")
    p.drawString(50, height - 60, "День")
    p.drawString(150, height - 60, "Время")
    p.drawString(250, height - 60, "Дисциплина")
    p.drawString(350, height - 60, "Преподаватель")
    p.drawString(450, height - 60, "Аудитория")
    
    # Данные
    y = height - 80
    schedules = Schedule.objects.select_related(
        'teaching_load__discipline',
        'teaching_load__teacher',
        'classroom'
    ).all()
    
    for schedule in schedules:
        p.drawString(50, y, schedule.time_slot.get_day_of_week_display())
        p.drawString(150, y, f"{schedule.time_slot.start_time}-{schedule.time_slot.end_time}")
        p.drawString(250, y, schedule.teaching_load.discipline.name)
        p.drawString(350, y, schedule.teaching_load.teacher.short_name)
        p.drawString(450, y, schedule.classroom.number)
        y -= 20
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    response.write(buffer.getvalue())
    buffer.close()
    return response