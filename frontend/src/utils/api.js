import axios from "axios";

export const API_ORIGIN = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_ORIGIN ? `${API_ORIGIN}/api/v1` : "/api/v1",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("pg-auth");
    const token = stored ? JSON.parse(stored)?.state?.token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// An expired session must never interrupt shopping: drop the token and carry on as a guest.
// Pages that need an account (orders history, admin) redirect through their route guards.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      try {
        const stored = JSON.parse(localStorage.getItem("pg-auth") || "{}");
        if (stored?.state?.token) {
          stored.state.token = null;
          localStorage.setItem("pg-auth", JSON.stringify(stored));
        }
      } catch {}
    }
    return Promise.reject(err);
  },
);

export default api;
