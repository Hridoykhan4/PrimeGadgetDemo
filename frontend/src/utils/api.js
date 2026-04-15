import axios from "axios";

const api = axios.create({
  // baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  baseURL: `/api/v1`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("pg-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pg-auth");
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
