import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import Constants from "expo-constants";

// ========================================
// BACKEND URL CONFIGURATION
// ========================================
const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  "https://nile-flow-backend.onrender.com";

// ========================================

// Track if refresh is in progress
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

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "mobile",
  },
  timeout: 30000,
  withCredentials: true,
});

// ========================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ========================================
const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_METHODS = new Set(["get", "head", "options"]);

async function retryRequest(config, retryCount = 0) {
  try {
    return await axiosClient.request(config);
  } catch (error) {
    const isRetryable =
      RETRYABLE_METHODS.has(config.method?.toLowerCase()) &&
      (error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        RETRYABLE_STATUS_CODES.has(error.response?.status));

    if (isRetryable && retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
}

// ========================================
// OFFLINE DETECTION INTERCEPTOR
// ========================================
axiosClient.interceptors.request.use(
  async (config) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      const offlineError = new Error("No internet connection");
      offlineError.code = "ERR_OFFLINE";
      offlineError.isOffline = true;
      return Promise.reject(offlineError);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get deviceId from AsyncStorage if available (mobile equivalent of sessionStorage)
      const deviceId = await AsyncStorage.getItem("deviceId");

      console.log("[Axios Interceptor] Refreshing token...");

      // Refresh token is sent via httpOnly cookie automatically
      // IMPORTANT: Use a separate axios instance to avoid interceptor loop
      const response = await axios.post(
        `${API_BASE_URL}/api/customerauth/refresh`,
        { deviceId },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      // Process queued requests with success
      processQueue(null, true);
      isRefreshing = false;

      // Retry original request
      return axiosClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, false);

      // Clear queued requests
      failedQueue = [];

      console.error(
        "[Axios Interceptor] Refresh token failed:",
        refreshError.response?.data || refreshError.message,
      );

      // Trigger logout for mobile - clear stored data and set user state
      try {
        await AsyncStorage.multiRemove(["user", "isGuest", "deviceId"]);
      } catch (clearError) {
        // Silent fail — storage clear is best-effort
      }

      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
