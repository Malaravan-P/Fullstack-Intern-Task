import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach JWT from localStorage to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Convenience wrapper so callers get plain data or a clean error.
export async function request(promise) {
  try {
    const res = await promise;
    return { ok: true, data: res.data };
  } catch (err) {
    const data = err.response?.data || null;
    return {
      ok: false,
      status: err.response?.status || 0,
      message: data?.message || "Something went wrong. Please try again.",
      errors: data?.errors || null,
    };
  }
}

export default api;
