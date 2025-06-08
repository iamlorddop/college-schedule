import { AxiosHeaders, type AxiosResponse } from "axios";
import type { Teacher, TeachingLoad } from "../../types";

// Функция для генерации моковых данных
export const getMockTeachingLoads = (): TeachingLoad[] => {
  const mockTeachers: Teacher[] = [
    {
      id: "1",
      last_name: "Иванов",
      first_name: "Иван",
      middle_name: "Иванович",
    },
    {
      id: "2",
      last_name: "Петрова",
      first_name: "Анна",
      middle_name: "Сергеевна",
    },
    {
      id: "3",
      last_name: "Сидоров",
      first_name: "Дмитрий",
    },
    {
      id: "4",
      last_name: "Кузнецова",
      first_name: "Елена",
    },
  ];

  const mockLoads: TeachingLoad[] = [];

  mockTeachers.forEach((teacher) => {
    // Добавляем 3-5 дисциплин для каждого преподавателя
    const disciplineCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < disciplineCount; i++) {
      mockLoads.push({
        id: `${teacher.id}-${i}`,
        discipline_id: `d-${i}`,
        group_id: `g-${Math.floor(Math.random() * 5) + 1}`,
        teacher_id: teacher.id,
        teacher: teacher, // обязательно объект Teacher
        total_hours: 0,
        self_study_hours: 0,
        current_year_hours: 0,
        semester1_hours: 0,
        semester2_hours: 0,
        hours_to_issue: 0,
        course_design_hours: 0,
        semester1_exams: 0,
        semester2_exams: 0,
        course_work_check_hours: 0,
        consultations_hours: 0,
        dp_review_hours: 0,
        dp_guidance_hours: 0,
        total_teaching_hours: 0,
        master_training_hours: 0,
        advanced_level_hours: 0,
        notebook_check_10_percent: 0,
        notebook_check_15_percent: 0,
      });
    }
  });

  return mockLoads;
};

// Моковая реализация функции getTeachingLoads для useApi
export const getTeachingLoads = async (): Promise<
  AxiosResponse<TeachingLoad[]>
> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = getMockTeachingLoads();
      resolve({
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
    }, 800); // Имитация задержки сети
  });
};
