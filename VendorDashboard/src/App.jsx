import "./App.css";

// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
/* import { AuthProvider, useAuth } from "../contexts/AuthContext"; */
import ProtectedRoute from "../components/layout/Auth/ProtectedRoute";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import AccountSettings from "./pages/AccountSettings";
import VendorAuthProvider, { useAuth } from "../contexts/VendorAuthContext";
import NotificationsPage from "./pages/NotificationPage";
import CustomerDetail from "./pages/CustomerDetail";
import MaintenancePage from "./pages/MaintenancePage";
import { isMaintenanceModeActive } from "./config/maintenance";
import { initializeDevToolsProtection } from "./utils/devToolsProtection";

// Public route that redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route path="/NotificationsPage" element={<NotificationsPage />} />
      <Route path="/admin/customers/:customerId" element={<CustomerDetail />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Orders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Customers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AccountSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  console.log("🎯 App rendering");

  useEffect(() => {
    console.log("🏁 App mounted");

    // Initialize developer tools protection
    initializeDevToolsProtection();

    return () => console.log("🏳️ App unmounted");
  }, []);

  // Check if maintenance mode is active
  if (isMaintenanceModeActive()) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      <VendorAuthProvider>
        <AppContent />
      </VendorAuthProvider>
    </Router>
  );
}

export default App;
