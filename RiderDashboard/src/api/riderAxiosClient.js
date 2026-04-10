/* eslint-disable no-unused-vars */
// src/rider/api/riderAxiosClient.js
import axios from "axios";

const API_BASE_URL = "https://nile-flow-backend.onrender.com";

const riderAxiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = false) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(success);
    }
  });
  failedQueue = [];
};

// Response interceptor
riderAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Don't retry on auth endpoints or if already retried
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    // ✅ If on public pages, don't try to refresh
    const publicRoutes = ["/rider/login", "/rider/register"];
    const isPublicRoute = publicRoutes.some((route) =>
      window.location.pathname.startsWith(route),
    );

    if (isPublicRoute) {
      console.log("[Rider Axios] On public route, not attempting refresh");
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => riderAxiosClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const deviceId = sessionStorage.getItem("riderDeviceId") || null;

      console.log("[Rider Axios] Refreshing token...");

      const response = await axios.post(
        `${API_BASE_URL}/api/rider/auth/refresh`,
        { deviceId },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      console.log("[Rider Axios] Token refreshed successfully");

      processQueue(null, true);
      isRefreshing = false;

      return riderAxiosClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, false);
      failedQueue = [];

      console.error(
        "[Rider Axios] Refresh token failed:",
        refreshError.response?.data || refreshError.message,
      );

      // ✅ Only trigger logout if not on public route
      if (!isPublicRoute && !window.__rider_auth_logout_triggered) {
        window.__rider_auth_logout_triggered = true;
        window.dispatchEvent(new CustomEvent("rider:logout"));

        setTimeout(() => {
          window.__rider_auth_logout_triggered = false;
        }, 1000);
      }

      return Promise.reject(refreshError);
    }
  },
);

export default riderAxiosClient;
