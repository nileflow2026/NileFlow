/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// src/vendor/contexts/VendorAuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as vendorAuthAPI from "../services/vendorAuthService";

const VendorAuthContext = createContext(null);

const getDeviceId = () => {
  let deviceId = sessionStorage.getItem("vendorDeviceId");
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("vendorDeviceId", deviceId);
  }
  return deviceId;
};

export const VendorAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("[VendorAuth] Initializing auth state...");
        const result = await vendorAuthAPI.getCurrentVendor();

        console.log("[VendorAuth] getCurrentVendor result:", result);

        if (result.success && result.data?.vendor) {
          console.log("[VendorAuth] Setting vendor:", result.data.vendor);
          setUser(result.data.vendor);
          setIsAuthenticated(true);
        } else {
          console.log("[VendorAuth] No authenticated vendor");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("[VendorAuth] Initialization error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("[VendorAuth] State updated:", {
      user,
      isAuthenticated,
      loading,
      vendorId: user?.id,
    });
  }, [user, isAuthenticated, loading]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      console.log("[VendorAuth] Logout event received");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/vendor/login";
    };

    window.addEventListener("vendor:logout", handleLogout);
    return () => window.removeEventListener("vendor:logout", handleLogout);
  }, []);

  const register = useCallback(
    async (
      name,
      storeName,
      email,
      password,
      confirmPassword,
      category,
      storeDescription,
      location,
    ) => {
      console.log("[VendorAuth] Register called");
      const result = await vendorAuthAPI.registerVendor(
        name,
        storeName,
        email,
        password,
        confirmPassword,
        category,
        storeDescription,
        location,
      );

      console.log("[VendorAuth] Register result:", result);

      if (result.success && result.data?.vendor) {
        console.log(
          "[VendorAuth] Setting vendor after registration:",
          result.data.vendor,
        );
        setUser(result.data.vendor);
        setIsAuthenticated(true);
      }

      return result;
    },
    [],
  );

  const login = useCallback(async (email, password) => {
    console.log("[VendorAuth] Login called for:", email);
    const result = await vendorAuthAPI.loginVendor(email, password);

    console.log("[VendorAuth] Login result:", result);

    if (result.success && result.data?.vendor) {
      console.log(
        "[VendorAuth] Setting vendor after login:",
        result.data.vendor,
      );
      setUser(result.data.vendor);
      setIsAuthenticated(true);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    console.log("[VendorAuth] Logout called");
    const result = await vendorAuthAPI.logoutVendor();
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem("vendorDeviceId");
    return result;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    console.log("[VendorAuth] Updating profile with:", profileData);
    const result = await vendorAuthAPI.updateVendorProfile(profileData);

    if (result.success && result.data?.vendor) {
      setUser(result.data.vendor);
    }

    return result;
  }, []);

  const updateProfilePicture = useCallback(async (file) => {
    console.log("[VendorAuth] Updating profile picture");
    const result = await vendorAuthAPI.updateVendorProfilePicture(file);

    if (result.success && result.data?.vendor) {
      setUser(result.data.vendor);
    }

    return result;
  }, []);

  const removeProfilePicture = useCallback(async () => {
    console.log("[VendorAuth] Removing profile picture");
    const result = await vendorAuthAPI.removeVendorProfilePicture();

    if (result.success && result.data?.vendor) {
      setUser(result.data.vendor);
    }

    return result;
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile,
    updateProfilePicture,
    removeProfilePicture,
    setUser, // For manual updates if needed
  };

  return (
    <VendorAuthContext.Provider value={value}>
      {children}
    </VendorAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within VendorAuthProvider");
  }
  return context;
};

// Alias for more specific naming
export const useVendorAuth = useAuth;

export default VendorAuthProvider;
