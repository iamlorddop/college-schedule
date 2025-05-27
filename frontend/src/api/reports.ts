import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  responseType: "blob", // Для загрузки файлов
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  if (user && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const generateReport = (
  type: string,
  params: Record<string, any> = {}
) => {
  return api.get(`/${type}/`, { params });
};
