import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://auth-system-backend-blond.vercel.app/api',
  withCredentials: true,
});
