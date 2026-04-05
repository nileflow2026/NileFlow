/* eslint-disable react-refresh/only-export-components */
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, this would verify the token with your backend
        const token = localStorage.getItem("vendor_token");
        const userData = localStorage.getItem("vendor_user");

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("vendor_token");
        localStorage.removeItem("vendor_user");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("vendor_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.patch(
        "http://localhost:3000/api/vendors/profile", // Your backend endpoint
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const { vendor } = response.data.data;

        // Update local storage with new user data
        localStorage.setItem("vendor_user", JSON.stringify(vendor));

        // Update state
        setUser(vendor);

        return {
          success: true,
          user: vendor,
          message: response.data.message || "Profile updated successfully",
        };
      } else {
        return {
          success: false,
          error: response.data.error || "Failed to update profile",
        };
      }
    } catch (error) {
      console.error(
        "Update profile failed:",
        error.response?.data || error.message
      );

      // Handle different error scenarios
      let errorMessage = "Failed to update profile";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
        // Optionally logout user here
        logout();
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };
  const updateProfilePicture = async (file) => {
    try {
      console.log("=== FRONTEND UPLOAD DEBUG ===");
      console.log("File object:", file);
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      const token = localStorage.getItem("vendor_token");
      console.log("Token present:", !!token);

      const formData = new FormData();
      formData.append("avatar", file);

      // Debug FormData contents
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      const response = await axios.put(
        "http://localhost:3000/api/vendors/profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${progress}%`);
          },
        }
      );

      console.log("Upload response:", response.data);
      return response.data;
    } catch (error) {
      console.log("=== UPLOAD ERROR ===");
      console.log("Error response:", error.response);
      console.log("Error message:", error.message);
      throw error;
    }
  };

  /* const updateProfilePicture = async (file) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("vendor_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.put(
        "http://localhost:3000/api/vendors/profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      if (response.data.success) {
        const { vendor } = response.data.data;

        // Update local storage with new user data
        localStorage.setItem("vendor_user", JSON.stringify(vendor));

        // Update state
        setUser(vendor);

        return {
          success: true,
          user: vendor,
          message:
            response.data.message || "Profile picture updated successfully",
        };
      } else {
        return {
          success: false,
          error: response.data.error || "Failed to update profile picture",
        };
      }
    } catch (error) {
      console.error(
        "Update profile picture failed:",
        error.response?.data || error.message
      );

      let errorMessage = "Failed to update profile picture";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
        logout();
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }; */

  // Add remove profile picture function
  const removeProfilePicture = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("vendor_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        "http://localhost:3000/api/vendors/profile-picture",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { vendor } = response.data.data;

        localStorage.setItem("vendor_user", JSON.stringify(vendor));
        setUser(vendor);

        return {
          success: true,
          user: vendor,
          message:
            response.data.message || "Profile picture removed successfully",
        };
      } else {
        return {
          success: false,
          error: response.data.error || "Failed to remove profile picture",
        };
      }
    } catch (error) {
      console.error(
        "Remove profile picture failed:",
        error.response?.data || error.message
      );

      let errorMessage = "Failed to remove profile picture";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
        logout();
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/vendorauth/register", // Replace with your backend URL
        {
          name: userData.name,
          storeName: userData.storeName,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
        }
      );

      if (response.data.success) {
        const { vendor, token } = response.data.data;

        // Save token and user info locally
        localStorage.setItem("vendor_token", token);
        localStorage.setItem("vendor_user", JSON.stringify(vendor));

        setUser(vendor);

        return { success: true, user: vendor };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.error || "Failed to register vendor",
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/vendorauth/login", // Replace with your backend URL
        { email, password }
      );

      if (response.data.success) {
        const { vendor, token } = response.data.data;

        // Save token and vendor info locally
        localStorage.setItem("vendor_token", token);
        localStorage.setItem("vendor_user", JSON.stringify(vendor));

        setUser(vendor);

        return { success: true, user: vendor };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("vendor_token");

      if (!token) {
        console.warn("No token found, clearing local state anyway.");
      } else {
        // Call backend logout endpoint
        await axios.post(
          "http://localhost:3000/api/vendorauth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error(
        "Logout failed on backend:",
        error.response?.data || error.message
      );
    } finally {
      // Clear local state regardless of backend success
      localStorage.removeItem("vendor_token");
      localStorage.removeItem("vendor_user");
      setUser(null);
    }
  };

  // utils/auth.js or in your productService.js
  const getToken = () => {
    try {
      const token = localStorage.getItem("vendor_token");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  };

  const value = {
    user,
    updateProfile,
    updateProfilePicture,
    removeProfilePicture,
    login,
    getToken,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
