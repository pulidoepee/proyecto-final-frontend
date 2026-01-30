import { getToken } from '@/modules/auth/utils/token';
import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || 'https://proyecto-final-backend-production-683e.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
