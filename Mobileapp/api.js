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
// CLIENT-SIDE CURRENCY DETECTION
//
// Device locale (expo-localization) reflects the LANGUAGE setting, not the
// user's physical location — an en-US phone in South Sudan returns "US".
// Instead we do a one-time IP geolocation via ipapi.co (same service the
// backend uses), cache the result in AsyncStorage for 7 days, and attach
// x-currency on every request.  This bypasses the server's unreliable
// per-instance in-memory GEO_CACHE entirely.
// ========================================
const COUNTRY_CURRENCY_MAP = {
  KE: "KES",
  UG: "UGX",
  TZ: "TZS",
  ET: "ETB",
  NG: "NGN",
  GH: "GHS",
  RW: "RWF",
  SS: "SSP",
  ZM: "ZMW",
  MZ: "MZN",
  BW: "BWP",
  ZA: "ZAR",
  SD: "SDG",
  SO: "SOS",
  ER: "ERN",
  DJ: "DJF",
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
};
const CURRENCY_CACHE_KEY = "nileflow_detected_currency";
const CURRENCY_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
let _initCurrencyPromise = null;
let _detectedCurrency = null; // set from server product responses (most reliable source)

/**
 * Lock in a currency that we learned from a real server response (e.g. a
 * product's price.currency). This is more reliable than client-side geo-IP
 * because it uses the same detection the backend already ran successfully.
 * Calling this immediately updates the axios default header and replaces the
 * singleton promise so every future initCurrency() call returns it instantly.
 */
export function setDetectedCurrency(currency) {
  if (!currency || typeof currency !== "string") return;
  if (_detectedCurrency === currency) return; // no-op if unchanged
  _detectedCurrency = currency;
  axiosClient.defaults.headers.common["x-currency"] = currency;
  // Replace the singleton so future callers get the correct value instantly
  _initCurrencyPromise = Promise.resolve(currency);
  AsyncStorage.setItem(
    CURRENCY_CACHE_KEY,
    JSON.stringify({ currency, ts: Date.now() }),
  ).catch(() => {});
}

/**
 * Detect and lock in the user's local currency.
 * • Instant for returning users (reads AsyncStorage cache).
 * • Does a single ipapi.co lookup for new users / expired cache.
 * • Sets axiosClient.defaults.headers.common["x-currency"] so every
 *   subsequent request carries the correct currency header automatically.
 * Safe to call multiple times — returns the same promise.
 */
export async function initCurrency() {
  if (_initCurrencyPromise) return _initCurrencyPromise;
  _initCurrencyPromise = (async () => {
    // 0. Currency already learned from a real server product response — use it
    if (_detectedCurrency) {
      axiosClient.defaults.headers.common["x-currency"] = _detectedCurrency;
      return _detectedCurrency;
    }

    // 1. Return cached value from a previous session (no network needed).
    // IMPORTANT: Do NOT trust a cached "KES" — it is the default fallback and
    // may have been written by old buggy code that called setDetectedCurrency("KES")
    // from a stale server response. Only skip the IP lookup for explicitly
    // detected non-default currencies (e.g. "SSP", "UGX").
    try {
      const raw = await AsyncStorage.getItem(CURRENCY_CACHE_KEY);
      if (raw) {
        const { currency, ts } = JSON.parse(raw);
        if (
          currency &&
          currency !== "KES" &&
          Date.now() - ts < CURRENCY_CACHE_TTL_MS
        ) {
          axiosClient.defaults.headers.common["x-currency"] = currency;
          return currency;
        }
      }
    } catch (_) {}

    // 2. Live IP-based detection — client-side, avoids multi-instance issue
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      const currency = COUNTRY_CURRENCY_MAP[data.country_code] ?? "KES";
      axiosClient.defaults.headers.common["x-currency"] = currency;
      AsyncStorage.setItem(
        CURRENCY_CACHE_KEY,
        JSON.stringify({ currency, ts: Date.now() }),
      ).catch(() => {});
      return currency;
    } catch (_) {}

    return "KES";
  })();
  return _initCurrencyPromise;
}

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
