import axios, { type AxiosResponse } from "axios";
import { type ScheduleItem, type ScheduleConflict } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const userString = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");
  const user = userString ? JSON.parse(userString) : null;

  if (user && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Получить расписание
 * @param params Параметры фильтрации
 * @returns Promise<ScheduleItem[]>
 */
export const getSchedule = (
  params: Record<string, unknown> = {}
): Promise<AxiosResponse<ScheduleItem[]>> => {
  return api.get("/schedules/", { params });
};

/**
 * Сгенерировать расписание
 * @param params Параметры генерации
 * @returns Promise<{ message: string, schedules: ScheduleItem[] }>
 */
export const generateSchedule = (
  params: Partial<ScheduleItem>
): Promise<
  AxiosResponse<{
    message: string;
    schedules: ScheduleItem[];
  }>
> => {
  console.log("Generation params:", params);
  return api.post("/schedules/generate/", params);
};

/**
 * Получить расписание для группы
 * @param groupId ID группы
 * @param params Дополнительные параметры
 * @returns Promise<ScheduleItem[]>
 */
export const getScheduleForGroup = (
  groupId: string,
  params: Record<string, unknown> = {}
): Promise<AxiosResponse<ScheduleItem[]>> => {
  return api.get(`/schedule/group/${groupId}/`, { params });
};

/**
 * Получить расписание для преподавателя
 * @param teacherId ID преподавателя
 * @param params Дополнительные параметры
 * @returns Promise<ScheduleItem[]>
 */
export const getScheduleForTeacher = (
  teacherId: string,
  params: Record<string, unknown> = {}
): Promise<AxiosResponse<ScheduleItem[]>> => {
  return api.get(`/schedule/teacher/${teacherId}/`, { params });
};

/**
 * Получить конфликты в расписании
 * @returns Promise<ScheduleConflict[]>
 */
export const getScheduleConflicts = (): Promise<
  AxiosResponse<{
    count: number;
    conflicts: ScheduleConflict[];
  }>
> => {
  return api.get("/schedules/conflicts/");
};

/**
 * Удалить расписание
 * @param scheduleId ID расписания
 * @returns Promise<void>
 */
export const deleteSchedule = (
  scheduleId: string
): Promise<AxiosResponse<void>> => {
  return api.delete(`/schedules/${scheduleId}/`);
};

export const checkScheduleData = (
  params: Record<string, unknown>
): Promise<
  AxiosResponse<{
    ready: boolean;
    missing_data: string[];
    can_generate: boolean;
    groups_count: number;
    teaching_loads_count: number;
    teachers_count: number;
    classrooms_count: number;
    time_slots_count: number;
  }>
> => {
  return api.post("/schedules/check-data/", params);
};
