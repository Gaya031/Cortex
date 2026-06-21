import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem(
    "ai_code_editor_token",
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
