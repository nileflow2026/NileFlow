// Security and developer tools blocking configuration
export const SECURITY_CONFIG = {
  // Set to true to enable developer tools blocking
  BLOCK_DEV_TOOLS: false,

  // Set to true to disable console logs
  DISABLE_CONSOLE: false,

  // Set to true to disable right-click context menu
  DISABLE_RIGHT_CLICK: false,

  // Set to true to disable keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
  DISABLE_SHORTCUTS: false,

  // Set to true to enable maintenance mode
  MAINTENANCE_MODE: false,

  // Message to display (optional)
  MAINTENANCE_MESSAGE:
    "Site is currently under inspection and temporarily unavailable.",

  // Estimated time (optional)
  ESTIMATED_TIME: "We expect to be back online shortly.",

  // Allow specific IPs or user roles to bypass (for testing)
  BYPASS_MAINTENANCE: [],

  // Contact information
  CONTACT_INFO: {
    email: "support@nileflow.com",
    phone: "+1-XXX-XXX-XXXX",
  },
};

// Legacy export for backward compatibility
export const MAINTENANCE_CONFIG = SECURITY_CONFIG;

// Function to check if maintenance mode should be active
export const isMaintenanceModeActive = () => {
  return SECURITY_CONFIG.MAINTENANCE_MODE;
};

// Function to check if developer tools should be blocked
export const shouldBlockDevTools = () => {
  return SECURITY_CONFIG.BLOCK_DEV_TOOLS;
};

// Function to check if console should be disabled
export const shouldDisableConsole = () => {
  return SECURITY_CONFIG.DISABLE_CONSOLE;
};

// Function to check if right-click should be disabled
export const shouldDisableRightClick = () => {
  return SECURITY_CONFIG.DISABLE_RIGHT_CLICK;
};

// Function to check if keyboard shortcuts should be disabled
export const shouldDisableShortcuts = () => {
  return SECURITY_CONFIG.DISABLE_SHORTCUTS;
};

// Function to check if user can bypass maintenance
export const canBypassMaintenance = (userInfo = {}) => {
  // Add logic here to allow certain users to bypass
  // For example, admin users or specific IP addresses
  return false;
};
