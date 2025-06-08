from django.db.models import Q, OuterRef, Exists
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
from dateutil import rrule
from .models import Schedule
from .serializers import ScheduleSerializer
from data_service.models import TeachingLoad, Classroom, TimeSlot

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Обработка URL параметров (/teacher/<id>/ и /group/<id>/)
        teacher_id = self.kwargs.get('teacher_id')
        group_id = self.kwargs.get('group_id')
        
        # Обработка query параметров (?teacher_id= и ?group_id=)
        query_teacher_id = self.request.query_params.get('teacher_id')
        query_group_id = self.request.query_params.get('group_id')
        
        # Фильтрация по датам
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        # Приоритет отдается URL параметрам
        if teacher_id:
            queryset = queryset.filter(teaching_load__teacher__id=teacher_id)
        elif query_teacher_id:
            queryset = queryset.filter(teaching_load__teacher__id=query_teacher_id)

        if group_id:
            queryset = queryset.filter(teaching_load__group__id=group_id)
        elif query_group_id:
            queryset = queryset.filter(teaching_load__group__id=query_group_id)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Оптимизация запросов
        queryset = queryset.select_related(
            'teaching_load__teacher',
            'teaching_load__group',
            'teaching_load__discipline',
            'time_slot',
            'classroom'
        ).order_by('date', 'time_slot__start_time')

        return queryset

class GenerateScheduleAPIView(APIView):
    def post(self, request):
        semester = request.data.get('semester', 1)
        start_date_str = request.data.get('startDate')
        end_date_str = request.data.get('endDate')
        group_ids = request.data.get('groupIds', [])
        
        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'Необходимо указать начальную и конечную даты'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Неверный формат даты. Используйте YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем учебные нагрузки для выбранных групп
        teaching_loads = TeachingLoad.objects.filter(
            group__id__in=group_ids,
            **self._get_semester_filter(semester)
        ).select_related('group', 'teacher', 'discipline')

        if not teaching_loads.exists():
            return Response(
                {'error': 'Не найдено учебных нагрузок для выбранных групп'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Получаем доступные временные слоты и аудитории
        time_slots = TimeSlot.objects.all().order_by('day_of_week', 'start_time')
        classrooms = Classroom.objects.all()

        generated_schedules = []
        existing_schedules = []

        with transaction.atomic():
            # Удаляем старые расписания для этих групп в указанном периоде
            Schedule.objects.filter(
                teaching_load__group__id__in=group_ids,
                date__gte=start_date,
                date__lte=end_date
            ).delete()

            # Генерируем расписание для каждой даты в диапазоне
            for single_date in rrule.rrule(
                rrule.DAILY,
                dtstart=start_date,
                until=end_date
            ):
                day_of_week = single_date.isoweekday()
                
                # Определяем тип недели (четная/нечетная)
                week_num = single_date.isocalendar()[1]
                week_type = 'ч' if week_num % 2 == 0 else 'з'

                # Фильтруем слоты по дню недели
                day_slots = [ts for ts in time_slots if ts.day_of_week == day_of_week]

                for load in teaching_loads:
                    # Пропускаем нагрузки, не относящиеся к текущему семестру
                    if not self._is_load_in_semester(load, semester):
                        continue

                    # Находим подходящий временной слот и аудиторию
                    for slot in day_slots:
                        # Проверяем доступность преподавателя
                        teacher_busy = Schedule.objects.filter(
                            teaching_load__teacher=load.teacher,
                            time_slot=slot,
                            date=single_date
                        ).exists()

                        if teacher_busy:
                            continue
                        
                        # Находим подходящую аудиторию
                        suitable_classroom = self._find_suitable_classroom(
                            load, slot, single_date, classrooms
                        )

                        if suitable_classroom:
                            schedule = Schedule.objects.create(
                                teaching_load=load,
                                time_slot=slot,
                                classroom=suitable_classroom,
                                week_type=week_type,
                                date=single_date
                            )
                            generated_schedules.append(schedule)
                            break

        # Преобразуем даты в строки перед сериализацией
        for schedule in generated_schedules:
            schedule.date = schedule.date.isoformat()

        serializer = ScheduleSerializer(generated_schedules, many=True)
        return Response({
            'message': f'Сгенерировано {len(generated_schedules)} занятий',
            'schedules': serializer.data
        }, status=status.HTTP_201_CREATED)

    def _get_semester_filter(self, semester):
        if semester == 1:
            return {'semester1_hours__gt': 0}
        return {'semester2_hours__gt': 0}

    def _is_load_in_semester(self, load, semester):
        if semester == 1:
            return load.semester1_hours and load.semester1_hours > 0
        return load.semester2_hours and load.semester2_hours > 0

    def _find_suitable_classroom(self, load, time_slot, date, classrooms):
        for classroom in classrooms:
            # Проверяем тип аудитории
            if (load.discipline.specialty.name.lower() in ['математика', 'физика'] and 
                classroom.type != 'lecture'):
                continue

            # Проверяем занятость аудитории
            classroom_busy = Schedule.objects.filter(
                classroom=classroom,
                time_slot=time_slot,
                date=date
            ).exists()

            if not classroom_busy:
                return classroom
        return None

class ScheduleConflictsAPIView(APIView):
    def get(self, request):
        # Конфликты по аудиториям
        classroom_conflicts = Schedule.objects.filter(
            Exists(
                Schedule.objects.filter(
                    Q(classroom=OuterRef('classroom')),
                    Q(time_slot=OuterRef('time_slot')),
                    Q(date=OuterRef('date')),
                    ~Q(id=OuterRef('id'))
                )
            )
        )

        # Конфликты по преподавателям
        teacher_conflicts = Schedule.objects.filter(
            Exists(
                Schedule.objects.filter(
                    Q(teaching_load__teacher=OuterRef('teaching_load__teacher')),
                    Q(time_slot=OuterRef('time_slot')),
                    Q(date=OuterRef('date')),
                    ~Q(id=OuterRef('id'))
                )
            )
        )

        # Объединяем конфликты
        conflicts = classroom_conflicts.union(teacher_conflicts).distinct()

        # Добавляем информацию о типе конфликта
        conflicts_data = []
        for conflict in conflicts:
            conflict_type = []
            if classroom_conflicts.filter(id=conflict.id).exists():
                conflict_type.append('classroom')
            if teacher_conflicts.filter(id=conflict.id).exists():
                conflict_type.append('teacher')
            
            conflict_data = ScheduleSerializer(conflict).data
            conflict_data['conflict_types'] = conflict_type
            conflicts_data.append(conflict_data)

        return Response({
            'count': len(conflicts_data),
            'conflicts': conflicts_data
        })
        
