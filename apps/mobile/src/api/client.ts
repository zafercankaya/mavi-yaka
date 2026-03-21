import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // API expects refresh token as Bearer header, not in body
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
        await useAuthStore.getState().setTokens(newAccess, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

// Debug: log all requests in dev
if (__DEV__) {
  api.interceptors.response.use(
    (response) => {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`);
      return response;
    },
    (error) => {
      const status = error.response?.status;
      // 403/409 are expected business errors (plan limits, conflicts) — don't show as red error
      if (status === 403 || status === 409) {
        console.log(`[API] ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.data?.message || error.message}`);
      } else {
        const params = error.config?.params ? JSON.stringify(error.config.params) : '';
        console.error(`[API] ERROR ${error.config?.method?.toUpperCase()} ${error.config?.url} →`, error.message, params, error.response?.data);
      }
      return Promise.reject(error);
    },
  );
}

export default api;
