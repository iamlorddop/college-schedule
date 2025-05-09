import axios from 'axios';

import { type User } from '../types';

const API_URL = import.meta.env.VITE_API_URL + '/auth';
console.log(API_URL)
export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> => {
  const response = await axios.post(`${API_URL}/register/`, userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<User> => {
  const response = await axios.post(`${API_URL}/login/`, credentials);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};