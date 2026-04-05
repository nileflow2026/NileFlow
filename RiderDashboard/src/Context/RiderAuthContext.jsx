/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
// src/rider/contexts/RiderAuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as riderAuthAPI from "../services/riderAuthService";

const RiderAuthContext = createContext(null);

const getDeviceId = () => {
  let deviceId = sessionStorage.getItem("riderDeviceId");
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("riderDeviceId", deviceId);
  }
  return deviceId;
};

export const RiderAuthProvider = ({ children }) => {
  const [rider, setRider] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("[RiderAuth] Initializing auth state...");

        // ✅ Check if we should even try to authenticate
        // Don't try to fetch if on public routes
        const publicRoutes = ["/rider/login", "/rider/register"];
        const isPublicRoute = publicRoutes.some((route) =>
          window.location.pathname.startsWith(route)
        );

        if (isPublicRoute) {
          console.log("[RiderAuth] On public route, skipping auth check");
          setLoading(false);
          return;
        }

        const result = await riderAuthAPI.getCurrentRider();

        console.log("[RiderAuth] getCurrentRider result:", result);

        if (result.success && result.data?.rider) {
          console.log("[RiderAuth] Setting rider:", result.data.rider);
          setRider(result.data.rider);
          setIsAuthenticated(true);
        } else {
          console.log("[RiderAuth] No authenticated rider");
          setRider(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("[RiderAuth] Initialization error:", error);
        setRider(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // ✅ Empty dependency array - only run once

  // Debug state changes
  useEffect(() => {
    console.log("[RiderAuth] State updated:", {
      rider,
      isAuthenticated,
      loading,
      riderId: rider?.id,
    });
  }, [rider, isAuthenticated, loading]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      console.log("[RiderAuth] Logout event received");
      setRider(null);
      setIsAuthenticated(false);

      // ✅ Only redirect if not already on public route
      const publicRoutes = ["/rider/login", "/rider/register"];
      const isPublicRoute = publicRoutes.some((route) =>
        window.location.pathname.startsWith(route)
      );

      if (!isPublicRoute) {
        window.location.href = "/rider/login";
      }
    };

    window.addEventListener("rider:logout", handleLogout);
    return () => window.removeEventListener("rider:logout", handleLogout);
  }, []);

  const register = useCallback(async (riderData) => {
    console.log("[RiderAuth] Register called");
    const result = await riderAuthAPI.registerRider(riderData);

    console.log("[RiderAuth] Register result:", result);

    if (result.success && result.data?.rider) {
      console.log(
        "[RiderAuth] Setting rider after registration:",
        result.data.rider
      );
      setRider(result.data.rider);
      setIsAuthenticated(true);
    }

    return result;
  }, []);

  const login = useCallback(async (email, password) => {
    console.log("[RiderAuth] Login called for:", email);
    const result = await riderAuthAPI.loginRider(email, password);

    console.log("[RiderAuth] Login result:", result);

    if (result.success && result.data?.rider) {
      console.log("[RiderAuth] Setting rider after login:", result.data.rider);
      setRider(result.data.rider);
      setIsAuthenticated(true);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    console.log("[RiderAuth] Logout called");
    const result = await riderAuthAPI.logoutRider();
    setRider(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem("riderDeviceId");
    return result;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    console.log("[RiderAuth] Updating profile with:", profileData);
    const result = await riderAuthAPI.updateRiderProfile(profileData);

    if (result.success && result.data?.rider) {
      setRider(result.data.rider);
    }

    return result;
  }, []);

  const updateStatus = useCallback(async (status) => {
    console.log("[RiderAuth] Updating status to:", status);
    const result = await riderAuthAPI.updateRiderStatus(status);

    if (result.success) {
      setRider((prev) => ({ ...prev, status: result.data.status }));
    }

    return result;
  }, []);

  const value = {
    rider,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile,
    updateStatus,
    setRider,
  };

  return (
    <RiderAuthContext.Provider value={value}>
      {children}
    </RiderAuthContext.Provider>
  );
};

export const useRiderAuth = () => {
  const context = useContext(RiderAuthContext);
  if (!context) {
    throw new Error("useRiderAuth must be used within RiderAuthProvider");
  }
  return context;
};

export default RiderAuthProvider;
