'use client';
import axios from 'axios';
import Cookies from 'js-cookie';

let API_URL = process.env.NEXT_PUBLIC_SERVER_URL;
console.log(API_URL);
if (process.env.NODE_ENV === 'production') {
  API_URL += '/api';
  console.log(process.env.NEXT_PUBLIC_SERVER_URL);
}
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
