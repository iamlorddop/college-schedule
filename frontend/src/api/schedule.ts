import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  
  return config;
});

export const getSchedule = (params = {}) => {
  return api.get("/", { params });
};

export const generateSchedule = (params: Record<string, any>) => {
  return api.post("/generate/", params);
};

export const getScheduleForGroup = (groupId: string, params: Record<string, any> = {}) => {
  return api.get(`/group/${groupId}/`, { params });
};

export const getScheduleForTeacher = (teacherId: string, params: Record<string, any> = {}) => {
  return api.get(`/teacher/${teacherId}/`, { params });
};