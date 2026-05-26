import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://auth-system-sage.vercel.app/api',
  withCredentials: true,
});
