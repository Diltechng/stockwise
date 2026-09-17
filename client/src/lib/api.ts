import axios from "axios";
import Cookies from "js-cookie";
import { BASE_API_URL } from "./env";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;
