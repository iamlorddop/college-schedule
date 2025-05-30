import axios from "axios";

import { type User, type AuthResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL + "/auth";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (
  userData: AuthResponse
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/register/`, userData);

  return response.data;
};

export const login = async (
  credentials: AuthResponse
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login/`, credentials);

  if (response.data.access) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh || "");
  }

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Обновляет профиль пользователя (разрешённые поля)
 * @param updatedFields - поля для обновления (например, last_name, first_name, middle_name, email)
 * @returns обновлённый объект пользователя
 */
export const updateProfile = async (
  updatedFields: Partial<
    Omit<
      User,
      | "id"
      | "token"
      | "role"
      | "groupId"
      | "teacherId"
      | "disciplinesCount"
      | "groupsCount"
    >
  >
): Promise<User> => {
  const response = await axios.patch(
    `${API_URL}/profile/update/`,
    updatedFields
  );
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Смена пароля пользователя
 * @param params - объект с полями oldPassword, newPassword
 * @returns void или сообщение об успехе/ошибке
 */
export const changePassword = async (params: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> => {
  await axios.put(`${API_URL}/users/change-password/`, {
    old_password: params.oldPassword,
    new_password: params.newPassword,
  });
};
