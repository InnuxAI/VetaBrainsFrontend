import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export function getToken() {
  return localStorage.getItem("accessToken");
}

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});
