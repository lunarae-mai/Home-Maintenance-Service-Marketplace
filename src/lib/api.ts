import axios from "axios";

export interface ApiResponseEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  details?: string;
}

export function getApiData<T = unknown>(response: { data?: ApiResponseEnvelope<T> | T }): T | null {
  if (!response?.data || typeof response.data !== "object") return null;

  const payload = response.data as ApiResponseEnvelope<T> & Record<string, unknown>;
  if (payload && ("success" in payload || "message" in payload || "details" in payload) && "data" in payload) {
    return (payload.data as T) ?? null;
  }

  return response.data as T;
}

const API_BASE_URL = "http://localhost:5000/api";

const isPublicRequest = (url?: string) => {
  if (!url) return false;
  const normalizedUrl = url.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/api/i, "");
  return ["/Auth/register", "/Auth/login", "/Auth/refresh-token"].some(
    (path) => normalizedUrl === path || normalizedUrl.endsWith(path),
  );
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for attaching the token
api.interceptors.request.use((config) => {
  const isPublicRoute = isPublicRequest(config.url);

  if (isPublicRoute) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} | Public Route - Skipping Token`);
    if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = localStorage.getItem("accessToken");
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} | Token Present: ${!!token}`);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API Request Headers] Authorization Attached: Bearer ${token.substring(0, 15)}...`);
  }
  return config;
});

// Interceptor for refreshing token on 401
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.warn(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${error.response?.status}`);
    const originalRequest = error.config;
    const publicRequest = isPublicRequest(originalRequest?.url);
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const isAuthPage = pathname === "/admin_/login" || pathname === "/auth" || pathname === "/login";

    if (error.response?.status === 401 && !originalRequest._retry && !publicRequest && !isAuthPage) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        console.log(`[Token Refresh] Attempting to refresh token using: ${refreshToken?.substring(0, 15)}...`);
        const res = await api.post("/Auth/refresh-token", { refreshToken });
        if (res.data.success) {
          console.log(`[Token Refresh] Token refreshed successfully!`);
          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("refreshToken", res.data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        console.error(`[Token Refresh Error] Failed to refresh token:`, e);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
