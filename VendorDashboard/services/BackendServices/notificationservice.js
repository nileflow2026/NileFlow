import vendorAxiosClient from "../api/vendorAxiosClient";

export const getNotifications = async (...types) => {
  try {
    let url = "/api/vendor/notifications";

    if (types.length > 0 && !types.includes("all")) {
      // ?type=product_submitted,product_approved
      const params = types.join(",");
      url += `?type=${params}`;
    }

    const response = await vendorAxiosClient.get(url);
    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications.");
  }
};

export const markNotificationsAsRead = async (ids) => {
  try {
    const response = await vendorAxiosClient.post(
      "/api/vendor/notifications/mark-as-read",
      {
        ids,
      }
    );
    // Optionally update your frontend state after successful update
    return response.data;
  } catch (error) {
    console.error(
      "Error marking notifications as read:",
      error.response?.data?.error || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to mark notifications as read."
    );
  }
};

export const clearAllVendorNotifications = async () => {
  try {
    const response = await vendorAxiosClient.delete(
      "/api/vendor/notifications/clear-all"
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error clearing all notifications:",
      error.response?.data?.error || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to clear all notifications."
    );
  }
};
