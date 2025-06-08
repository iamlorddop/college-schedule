import axios, { type AxiosResponse } from "axios";

import {
  type Specialty,
  type Course,
  type Group,
  type Discipline,
  type Teacher,
  type TeachingLoad,
  type Classroom,
  type TimeSlot,
  type User,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  if (user && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Пользователи
export const getUsers = (): Promise<AxiosResponse<User[]>> =>
  api.get("/users/");

// Специальности
export const getSpecialties = (): Promise<AxiosResponse<Specialty[]>> =>
  api.get("/specialties/");

export const createSpecialty = (
  data: Omit<Specialty, "id">
): Promise<AxiosResponse<Specialty>> => api.post("/specialties/", data);

export const updateSpecialty = (
  id: string,
  data: Partial<Specialty>
): Promise<AxiosResponse<Specialty>> => api.put(`/specialties/${id}/`, data);

export const deleteSpecialty = (id: string): Promise<AxiosResponse> =>
  api.delete(`/specialties/${id}/`);

// Курсы
export const getCourses = (): Promise<AxiosResponse<Course[]>> =>
  api.get("/courses/");
export const createCourse = (
  data: Omit<Course, "id">
): Promise<AxiosResponse<Course>> => api.post("/courses/", data);

// Группы
export const getGroups = (): Promise<AxiosResponse<Group[]>> =>
  api.get("/groups/");
export const createGroup = (
  data: Omit<Group, "id">
): Promise<AxiosResponse<Group>> => api.post("/groups/", data);
export const updateGroup = (
  id: string,
  data: Partial<Group>
): Promise<AxiosResponse<Group>> => api.put(`/groups/${id}/`, data);
export const deleteGroup = (id: string): Promise<AxiosResponse> =>
  api.delete(`/groups/${id}/`);

// Дисциплины
export const getDisciplines = (): Promise<AxiosResponse<Discipline[]>> =>
  api.get("/disciplines/");
export const createDiscipline = (
  data: Omit<Discipline, "id">
): Promise<AxiosResponse<Discipline>> => api.post("/disciplines/", data);
export const updateDiscipline = (
  id: string,
  data: Partial<Group>
): Promise<AxiosResponse<Group>> => api.put(`/disciplines/${id}/`, data);
export const deleteDiscipline = (id: string): Promise<AxiosResponse> =>
  api.delete(`/disciplines/${id}/`);

// Преподаватели
export const getTeachers = (): Promise<AxiosResponse<Teacher[]>> =>
  api.get("/teachers/");
export const createTeacher = (
  data: Omit<Teacher, "id" | "short_name">
): Promise<AxiosResponse<Teacher>> => api.post("/teachers/", data);

export const updateTeacher = async (
  id: string,
  data: Partial<Omit<Teacher, "id">>
): Promise<Teacher> => {
  const response = await api.patch(`/teachers/${id}/`, data);
  return response.data;
};

export const deleteTeacher = (id: string): Promise<AxiosResponse> =>
  api.delete(`/teachers/${id}/`);

// Нагрузки
export const getTeachingLoads = (): Promise<AxiosResponse<TeachingLoad[]>> =>
  api.get("/teaching-loads/");
export const createTeachingLoad = (
  data: Omit<TeachingLoad, "id">
): Promise<AxiosResponse<TeachingLoad>> => api.post("/teaching-loads/", data);
export const updateTeachingLoad = (
  id: string,
  data: Omit<TeachingLoad, "id">
): Promise<AxiosResponse<TeachingLoad>> =>
  api.patch(`/teaching-loads/${id}/`, data);
export const deleteTeachingLoad = (id: string): Promise<AxiosResponse> =>
  api.delete(`/teaching-loads/${id}/`);

// Аудитории
export const getClassrooms = (): Promise<AxiosResponse<Classroom[]>> =>
  api.get("/classrooms/");
export const createClassroom = (
  data: Omit<Classroom, "id">
): Promise<AxiosResponse<Classroom>> => api.post("/classrooms/", data);
export const updateClassroom = (
  id: string,
  data: Omit<Classroom, "id">
): Promise<AxiosResponse<Classroom>> => api.patch(`/classrooms/${id}/`, data);
export const deleteClassroom = (id: string): Promise<AxiosResponse> =>
  api.delete(`/classrooms/${id}/`);

// Временные слоты
export const getTimeSlots = (): Promise<AxiosResponse<TimeSlot[]>> =>
  api.get("/time-slots/");
export const createTimeSlot = (
  data: Omit<TimeSlot, "id">
): Promise<AxiosResponse<TimeSlot>> => api.post("/time-slots/", data);
export const updateTimeSlot = (
  id: string,
  data: Omit<TimeSlot, "id">
): Promise<AxiosResponse<TimeSlot>> => api.patch(`/time-slots/${id}/`, data);
export const deleteTimeSlot = (id: string): Promise<AxiosResponse> =>
  api.delete(`/time-slots/${id}/`);
