import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getCurrentUser, getCustomerNotification } from "./GlobalProvider";
import { usePushNotifications } from "../hooks/usePushNotifications";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  // Use try/catch so that if expo-router isn't ready it degrades gracefully
  let routerInstance = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    routerInstance = useRouter();
  } catch (_) {}

  const handleNotificationReceived = (notification) => {
    // Increment badge count when a push arrives while app is open
    setNotificationCount((prev) => prev + 1);
  };

  const handleNotificationResponse = (response) => {
    // Navigate to notifications screen when user taps a notification
    try {
      routerInstance?.push?.("/(Screens)/MyNotificationsScreen");
    } catch (_) {}
  };

  usePushNotifications(handleNotificationReceived, handleNotificationResponse);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          // User not logged in, skip notification initialization
          console.log(
            "User not logged in, skipping notification initialization",
          );
          return;
        }

        const notifications = await getCustomerNotification();
        const unreadCount = notifications.filter((n) => !n.read).length;
        setNotificationCount(unreadCount);
      } catch (err) {
        console.error("Error initializing notifications:", err);
      }
    };

    init();

    // Realtime subscription disabled to prevent connection errors when user is not authenticated
    /* const unsubscribe = client.subscribe(
      `databases.${Config.databaseId}.collections.${Config.NOTIFICATIONS_COLLECTION_ID}.documents`,
      async (response) => {
        const { payload, events } = response;
        const user = await getCurrentUser();

        if (
          events.includes("databases.*.documents.*.create") &&
          payload.userId === user.$id &&
          payload.type === "userNotification" &&
          payload.read === false
        ) {
          setNotificationCount((prev) => prev + 1);
        }
      }
    );

    return () => unsubscribe(); */
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notificationCount, setNotificationCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
