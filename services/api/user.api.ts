'use client';
import api from './api';
import { UserType } from './type.api';

export const getProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: number, data: UserType) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};
