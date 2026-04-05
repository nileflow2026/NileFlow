// src/rider/components/RiderProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRiderAuth } from "../Context/RiderAuthContext";

export const RiderProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useRiderAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-blue-500 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/rider/login" state={{ from: location }} replace />;
  }

  return children;
};
