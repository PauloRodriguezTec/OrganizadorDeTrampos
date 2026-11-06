import axios from "axios";

const api = axios.create({
  // Em produção (Netlify) a API fica na mesma origem, em /api
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "")
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;