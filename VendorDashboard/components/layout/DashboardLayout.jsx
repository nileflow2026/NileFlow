// src/components/Layout/DashboardLayout.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Menu,
  X,
  Settings,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth } from "../../contexts/VendorAuthContext";
import { getNotifications } from "../../services/BackendServices/notificationservice";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("vendorNotificationSound") !== "false"
  );
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const dropdownRef = useRef(null);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Request notification permission and setup sound
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }

    // Create notification sound (using a data URL for a simple beep sound)
    if (notificationSoundRef.current === null) {
      // Create a simple notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const createNotificationSound = () => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            600,
            audioContext.currentTime + 0.1
          );
          oscillator.frequency.setValueAtTime(
            800,
            audioContext.currentTime + 0.2
          );

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        };

        notificationSoundRef.current = createNotificationSound;
      } catch (error) {
        console.log("Audio context not supported:", error);
        // Fallback to simple beep
        notificationSoundRef.current = () => {
          // Simple beep fallback
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSN+wOvWhjcLF3bJ7eGESwoXe8Dt3YU2CxV+wO3WgjkPGH3C7uGESQwUa7jy5ZWRZTEBAAARBQAABCAJAAAAAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSN+wOvWhjcLF3bJ7eGESwoXe8Dt3YU2CxV+wO3WgjkPGH3C7uGESQwUa7jy5ZV6"
          );
          audio.volume = 0.3;
          audio.play().catch(() => {});
        };
      }
    }
  }, []);

  // Fetch unread notification count and handle new notifications
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const notifications = await getNotifications(
          "product_submitted",
          "product_approved",
          "product_rejected",
          "order_received",
          "payment_processed"
        );

        const unreadNotifications = notifications.filter((n) => !n.read);
        const newUnreadCount = unreadNotifications.length;

        // Check if there are new notifications
        if (newUnreadCount > previousUnreadCount && previousUnreadCount !== 0) {
          const newNotificationsCount = newUnreadCount - previousUnreadCount;

          // Play notification sound
          if (soundEnabled && notificationSoundRef.current) {
            try {
              notificationSoundRef.current();
            } catch (error) {
              console.log("Could not play notification sound:", error);
            }
          }

          // Show browser notification
          if (notificationPermission === "granted") {
            const latestNotifications = unreadNotifications.slice(
              0,
              newNotificationsCount
            );
            latestNotifications.forEach((notification, index) => {
              setTimeout(() => {
                new Notification(
                  `${user?.storeName || "Vendor"} - New Notification`,
                  {
                    body: notification.message || "You have a new notification",
                    icon: "/favicon.ico",
                    badge: "/favicon.ico",
                    tag: `vendor-notification-${notification.$id}`,
                    requireInteraction: false,
                    silent: !soundEnabled,
                  }
                );
              }, index * 200); // Stagger notifications
            });
          }
        }

        setPreviousUnreadCount(newUnreadCount);
        setUnreadCount(newUnreadCount);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();

    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    user,
    previousUnreadCount,
    soundEnabled,
    notificationPermission,
  ]);

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/products", icon: Package, label: "Products" },

    /* { path: "/customers", icon: Users, label: "Customers" }, */
  ];

  const toggleNotificationSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem("vendorNotificationSound", newSoundEnabled.toString());
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* African Pattern Top Strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800 via-orange-600 to-amber-700 z-50">
        <div className="absolute inset-0 opacity-20">
          <div className="flex h-full">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="w-6 border-r border-amber-900"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col mt-1">
        <div className="flex flex-col flex-grow pt-6 overflow-y-auto bg-gradient-to-b from-amber-900 to-amber-800 border-r border-amber-700 shadow-2xl relative">
          {/* Sidebar Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
              }}
            ></div>
          </div>

          <div className="flex items-center flex-shrink-0 px-6 mb-8 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-amber-900 font-bold text-lg">N</span>
            </div>
            <h1 className="text-2xl font-bold text-amber-50 tracking-wide">
              Nile Flow
            </h1>
          </div>

          <div className="mt-4 flex-grow flex flex-col relative z-10">
            <nav className="flex-1 px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105"
                        : "text-amber-100 hover:bg-amber-700 hover:text-white hover:translate-x-1"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                        isActive(item.path)
                          ? "scale-110"
                          : "group-hover:scale-110"
                      }`}
                    />
                    {item.label}
                    {isActive(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-amber-700 mt-auto">
              <div className="bg-amber-800/50 rounded-xl p-4 text-center">
                <p className="text-amber-200 text-sm font-medium">
                  Vendor Excellence
                </p>
                <p className="text-amber-300 text-xs mt-1">
                  Building African Commerce
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-amber-900 bg-opacity-80"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-amber-900 to-amber-800 shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-700 hover:bg-amber-600 text-amber-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-amber-900 font-bold text-lg">N</span>
                </div>
                <h1 className="text-2xl font-bold text-amber-50">Nile Flow</h1>
              </div>

              <nav className="mt-4 px-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                          : "text-amber-100 hover:bg-amber-700 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden mt-1">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-md shadow-lg border-b border-amber-200">
          <button
            className="px-4 border-r border-amber-200 text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h2 className="text-xl font-bold text-amber-900 ml-2 md:ml-0">
                {menuItems.find((item) => isActive(item.path))?.label ||
                  "Dashboard"}
              </h2>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <Link
                to="/NotificationsPage"
                className="bg-white/80 p-2 rounded-xl text-amber-600 hover:text-amber-700
             focus:outline-none focus:ring-2 focus:ring-amber-500 relative
             border border-amber-200 hover:border-amber-300 transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-red-500
                 text-white rounded-full w-5 h-5 text-xs flex items-center
                 justify-center shadow-lg font-bold"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-xl p-2 hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-amber-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-bold text-amber-900">
                      {user?.name || "Vendor Account"}
                    </div>
                    <div className="text-xs text-amber-600 font-medium">
                      {user?.storeName || "Vendor Store"}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-amber-500 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-amber-200 focus:outline-hidden transform transition-all duration-300">
                    <div className="py-2">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-xl">
                        <div className="text-sm font-bold text-amber-900 truncate">
                          {user?.name || "Vendor Name"}
                        </div>
                        <div className="text-sm text-amber-600 truncate font-medium">
                          {user?.email || "vendor@example.com"}
                        </div>
                        {user?.storeName && (
                          <div className="text-xs text-amber-500 mt-1 truncate font-medium">
                            {user.storeName}
                          </div>
                        )}
                      </div>
                      {/* Settings Link */}
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900 transition-all duration-300 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings
                          size={16}
                          className="mr-3 text-amber-500 group-hover:scale-110 transition-transform"
                        />
                        Account Settings
                      </Link>

                      {/* Notification Sound Toggle */}
                      <button
                        onClick={toggleNotificationSound}
                        className="flex items-center w-full px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900 transition-all duration-300 group"
                      >
                        {soundEnabled ? (
                          <Volume2
                            size={16}
                            className="mr-3 text-green-500 group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <VolumeX
                            size={16}
                            className="mr-3 text-gray-400 group-hover:scale-110 transition-transform"
                          />
                        )}
                        Notification Sound {soundEnabled ? "On" : "Off"}
                      </button>
                      {/* Divider */}
                      <div className="my-1 border-t border-amber-100"></div>
                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 group rounded-b-xl"
                      >
                        <LogOut
                          size={16}
                          className="mr-3 group-hover:scale-110 transition-transform"
                        />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
