// src/vendor/services/vendorAuthService.js

import vendorAxiosClient from "./api/vendorAxiosClient";

/**
 * Generate or retrieve device ID
 */
const getDeviceId = () => {
  let deviceId = sessionStorage.getItem("vendorDeviceId");
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("vendorDeviceId", deviceId);
  }
  return deviceId;
};

/**
 * Register Vendor
 */
export const registerVendor = async (
  name,
  storeName,
  email,
  password,
  confirmPassword,
  category,
  storeDescription,
  location,
) => {
  try {
    const deviceId = getDeviceId();

    const response = await vendorAxiosClient.post("/api/vendor/auth/register", {
      name,
      storeName,
      email,
      password,
      confirmPassword,
      category,
      storeDescription,
      location,
      deviceId,
    });

    console.log("✅ Vendor registration successful");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Vendor registration error:",
      error.response?.data?.error || error.message,
    );
    return {
      success: false,
      error: error.response?.data?.error || "Failed to register vendor",
    };
  }
};

/**
 * Login Vendor
 */
export const loginVendor = async (email, password) => {
  try {
    const deviceId = getDeviceId();

    console.log("Attempting vendor login for:", email);
    const response = await vendorAxiosClient.post("/api/vendor/auth/login", {
      email,
      password,
      deviceId,
    });

    console.log("✅ Vendor login successful");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Vendor login error:",
      error.response?.data?.error || error.message,
    );
    return {
      success: false,
      error: error.response?.data?.error || "Login failed",
    };
  }
};

/**
 * Get Current Vendor
 */
export const getCurrentVendor = async () => {
  try {
    console.log("[VendorAuthService] Fetching current vendor...");
    const response = await vendorAxiosClient.get("/api/vendor/auth/me");
    console.log(
      "[VendorAuthService] getCurrentVendor response:",
      response.data,
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "[VendorAuthService] getCurrentVendor error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data?.error || "Failed to get vendor data",
    };
  }
};

/**
 * Refresh Tokens
 */
export const refreshTokens = async () => {
  try {
    const deviceId = getDeviceId();
    const response = await vendorAxiosClient.post("/api/vendor/auth/refresh", {
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
 * Logout Vendor
 */
export const logoutVendor = async () => {
  try {
    await vendorAxiosClient.post("/api/vendor/auth/logout", {});
    sessionStorage.removeItem("vendorDeviceId");
    console.log("Vendor logged out successfully");
    return { success: true };
  } catch (error) {
    console.error(
      "Vendor logout error:",
      error.response?.data?.error || error.message,
    );
    sessionStorage.removeItem("vendorDeviceId");
    return {
      success: false,
      error: error.response?.data?.error || "Logout failed",
    };
  }
};

/**
 * Update Profile
 */
export const updateVendorProfile = async (profileData) => {
  try {
    const response = await vendorAxiosClient.patch(
      "/api/vendors/profile",
      profileData,
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
 * Update Profile Picture
 */
export const updateVendorProfilePicture = async (file) => {
  try {
    console.log("Uploading profile picture:", file.name);

    const formData = new FormData();
    formData.append("avatar", file);

    // Use transformRequest to delete the axios-instance default
    // "Content-Type: application/json" so the browser can set the correct
    // "multipart/form-data; boundary=..." header from the FormData object.
    const response = await vendorAxiosClient.put(
      "/api/vendors/profile-picture",
      formData,
      {
        transformRequest: (data, headers) => {
          delete headers["Content-Type"];
          return data;
        },
        timeout: 30000,
      },
    );

    console.log("Profile picture uploaded successfully");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Profile picture upload error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data?.error || "Failed to upload profile picture",
    };
  }
};

/**
 * Remove Profile Picture
 */
export const removeVendorProfilePicture = async () => {
  try {
    const response = await vendorAxiosClient.delete(
      "/api/vendors/profile-picture",
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to remove profile picture",
    };
  }
};

export default {
  registerVendor,
  loginVendor,
  getCurrentVendor,
  refreshTokens,
  logoutVendor,
  updateVendorProfile,
  updateVendorProfilePicture,
  removeVendorProfilePicture,
};
