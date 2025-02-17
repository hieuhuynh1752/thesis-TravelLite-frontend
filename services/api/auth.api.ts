'use client';
import { AccountType } from './type.api';
import api from './api';

export const register = async (
  email: string,
  password: string,
  name?: string,
) => {
  const response = await api.post(`/auth/register`, {
    email,
    password,
    name,
  });
  return {
    status: response.status,
    data: (await response.data) as AccountType,
  };
};

export const login = async (email: string, password: string) => {
  console.log('here');
  const response = await api.post(`/auth/login`, {
    email,
    password,
  });
  return {
    status: response.status,
    data: (await response.data) as AccountType,
  };
};

export const getMe = async (): Promise<number> => {
  const response = await api.get('/auth/me');
  return Number.parseInt(response.data.userId);
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    console.error('Logout failed', error.response?.data);
  }
};
