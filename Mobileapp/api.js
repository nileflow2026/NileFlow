import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ========================================
// BACKEND URL CONFIGURATION
// ========================================
// Choose ONE of the following based on your testing environment:

// 1. For ANDROID EMULATOR - Use this to connect to localhost:
// const API_BASE_URL = "http://10.0.2.2:3000";

// 2. For PHYSICAL DEVICE or EXPO GO - Use your computer's local IP:
// Your computer's IP: 192.168.1.4
const API_BASE_URL = "https://nile-flow-backend.onrender.com";

// 3. For IOS SIMULATOR - Use localhost:
// const API_BASE_URL = "http://localhost:3000";

// 4. For PRODUCTION - Use your deployed backend:
// const API_BASE_URL = "https://new-nile-flow-backend.onrender.com";

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
    "X-Client-Type": "mobile", // Identify as mobile client
  },
  timeout: 30000, // Increased from 10000 to 30000 ms
  withCredentials: true, // CRITICAL: Send cookies with requests
});

// NO REQUEST INTERCEPTOR NEEDED - cookies are sent automatically with withCredentials: true

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

      console.log("[Axios Interceptor] Token refreshed successfully");

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
        console.log("✅ Cleared storage after refresh token failure");
      } catch (clearError) {
        console.error("Error clearing storage:", clearError);
      }

      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
