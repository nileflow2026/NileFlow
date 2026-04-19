/**
 * Maps raw API/network errors to user-friendly messages.
 * Optimized for African infrastructure (low bandwidth, unstable networks).
 */

const USER_MESSAGES = {
  ERR_OFFLINE:
    "No internet connection. Please check your network and try again.",
  ERR_NETWORK: "Network issue. Please check your connection and try again.",
  ECONNABORTED: "Request timed out. Please try again.",
  ERR_CANCELED: "Request was cancelled.",
  DEFAULT: "Something went wrong. Please try again.",
  SERVER_ERROR:
    "Our servers are temporarily busy. Please try again in a moment.",
  AUTH_EXPIRED: "Your session has expired. Please sign in again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
};

/**
 * Get a user-friendly error message from an Axios error or generic Error.
 * @param {Error} error
 * @returns {string} A safe, user-facing message
 */
export function getUserErrorMessage(error) {
  if (!error) return USER_MESSAGES.DEFAULT;

  // Offline / network errors
  if (error.isOffline || error.code === "ERR_OFFLINE") {
    return USER_MESSAGES.ERR_OFFLINE;
  }

  if (error.code === "ERR_NETWORK") {
    return USER_MESSAGES.ERR_NETWORK;
  }

  if (error.code === "ECONNABORTED") {
    return USER_MESSAGES.ECONNABORTED;
  }

  if (error.code === "ERR_CANCELED") {
    return USER_MESSAGES.ERR_CANCELED;
  }

  // HTTP status based messages
  const status = error.response?.status;
  if (status) {
    if (status === 401 || status === 403) {
      return USER_MESSAGES.AUTH_EXPIRED;
    }
    if (status === 429) {
      return USER_MESSAGES.RATE_LIMITED;
    }
    if (status >= 500) {
      return USER_MESSAGES.SERVER_ERROR;
    }
    // For 4xx, use backend message if safe, otherwise default
    const backendMsg = error.response?.data?.error;
    if (
      backendMsg &&
      typeof backendMsg === "string" &&
      backendMsg.length < 200
    ) {
      return backendMsg;
    }
  }

  return USER_MESSAGES.DEFAULT;
}

/**
 * Returns true if the error is a network/connectivity issue.
 */
export function isNetworkError(error) {
  return (
    error?.isOffline ||
    error?.code === "ERR_OFFLINE" ||
    error?.code === "ERR_NETWORK" ||
    error?.code === "ECONNABORTED" ||
    !error?.response
  );
}
