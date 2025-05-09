import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  responseType: "blob", // Для загрузки файлов
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsedUser = JSON.parse(user);
    if (parsedUser.token) {
      config.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
  }
  return config;
});

export const generateReport = (type: string, params: Record<string, any> = {}) => {
  return api.get(`/${type}/`, { params });
};
