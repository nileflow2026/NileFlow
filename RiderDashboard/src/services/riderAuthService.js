// src/rider/services/riderAuthService.js
import riderAxiosClient from "../api/riderAxiosClient";

/**
 * Generate or retrieve device ID
 */
const getDeviceId = () => {
  let deviceId = sessionStorage.getItem("riderDeviceId");
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("riderDeviceId", deviceId);
  }
  return deviceId;
};

/**
 * Register Rider
 */
export const registerRider = async (riderData) => {
  try {
    const deviceId = getDeviceId();

    const response = await riderAxiosClient.post("/api/rider/auth/register", {
      ...riderData,
      deviceId,
    });

    console.log("✅ Rider registration successful");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Rider registration error:",
      error.response?.data?.error || error.message
    );
    return {
      success: false,
      error: error.response?.data?.error || "Failed to register rider",
    };
  }
};

/**
 * Login Rider
 */
export const loginRider = async (email, password) => {
  try {
    const deviceId = getDeviceId();

    console.log("Attempting rider login for:", email);
    const response = await riderAxiosClient.post("/api/rider/auth/login", {
      email,
      password,
      deviceId,
    });

    console.log("✅ Rider login successful");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Rider login error:",
      error.response?.data?.error || error.message
    );
    return {
      success: false,
      error: error.response?.data?.error || "Login failed",
    };
  }
};

/**
 * Get Current Rider
 */
export const getCurrentRider = async () => {
  try {
    console.log("[RiderAuthService] Fetching current rider...");
    const response = await riderAxiosClient.get("/api/rider/profile");
    console.log("[RiderAuthService] getCurrentRider response:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "[RiderAuthService] getCurrentRider error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.error || "Failed to get rider data",
    };
  }
};

/**
 * Refresh Tokens
 */
export const refreshTokens = async () => {
  try {
    const deviceId = getDeviceId();
    const response = await riderAxiosClient.post("/api/rider/auth/refresh", {
      deviceId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Token refresh failed",
    };
  }
};

/**
 * Logout Rider
 */
export const logoutRider = async () => {
  try {
    await riderAxiosClient.post("/api/rider/auth/logout", {});
    sessionStorage.removeItem("riderDeviceId");
    console.log("Rider logged out successfully");
    return { success: true };
  } catch (error) {
    console.error(
      "Rider logout error:",
      error.response?.data?.error || error.message
    );
    sessionStorage.removeItem("riderDeviceId");
    return {
      success: false,
      error: error.response?.data?.error || "Logout failed",
    };
  }
};

/**
 * Get Rider Profile
 */
export const getRiderProfile = async () => {
  try {
    const response = await riderAxiosClient.get("/api/rider/profile");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch profile",
    };
  }
};

/**
 * Update Rider Profile
 */
export const updateRiderProfile = async (profileData) => {
  try {
    const response = await riderAxiosClient.patch(
      "/api/rider/profile",
      profileData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update profile",
    };
  }
};

/**
 * Update Rider Status
 */
export const updateRiderStatus = async (status) => {
  try {
    const response = await riderAxiosClient.patch("/api/rider/status", {
      status,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update status",
    };
  }
};

/**
 * Get Rider Deliveries - Original Version
 */
export const getRiderDeliveries = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await riderAxiosClient.get(
      `/api/rider/deliveries?${params}`
    );
    console.log("Rider deliveries fetched:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch deliveries",
    };
  }
};

/**
 * Get Rider Earnings
 */
export const getRiderEarnings = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await riderAxiosClient.get(
      `/api/rider/earnings?${params}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch earnings",
    };
  }
};

/**
 * Update Delivery Status
 */
export const updateDeliveryStatus = async (deliveryId, status, notes) => {
  try {
    const response = await riderAxiosClient.patch(
      `/api/rider/deliveries/${deliveryId}/status`,
      { status, notes }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update delivery status",
    };
  }
};

export default {
  registerRider,
  loginRider,
  getCurrentRider,
  refreshTokens,
  logoutRider,
  getRiderProfile,
  updateRiderProfile,
  updateRiderStatus,
  getRiderDeliveries,
  getRiderEarnings,
  updateDeliveryStatus,
};
