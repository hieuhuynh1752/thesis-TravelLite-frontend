import { AccountType } from './type.api';
import { API_URL } from './api';

export const register = async (
  email: string,
  password: string,
  name?: string,
) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return {
    status: response.status,
    data: (await response.json()) as AccountType,
  };
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return {
    status: response.status,
    data: (await response.json()) as AccountType,
  };
};
