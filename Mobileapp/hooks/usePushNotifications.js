import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import axiosClient from "../api";

export const MUTE_SOUND_KEY = "nileflow_notifications_muted";

// Configure how notifications appear when the app is in the foreground.
// Reads the persisted mute preference so the handler always reflects current setting.
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const muted = await AsyncStorage.getItem(MUTE_SOUND_KEY);
    const shouldPlaySound = muted !== "true";
    return {
      shouldShowAlert: true,
      shouldPlaySound,
      shouldSetBadge: true,
    };
  },
});

/**
 * Apply mute/unmute setting immediately:
 * - Persists preference to AsyncStorage
 * - Updates Android notification channels (sound on/off)
 */
export async function applyMuteSetting(muted) {
  await AsyncStorage.setItem(MUTE_SOUND_KEY, muted ? "true" : "false");

  if (Platform.OS === "android") {
    const sound = muted ? null : "default";
    const importance = muted
      ? Notifications.AndroidImportance.LOW
      : Notifications.AndroidImportance.MAX;

    await Notifications.setNotificationChannelAsync("default", {
      name: "NileFlow Notifications",
      importance,
      vibrationPattern: muted ? null : [0, 250, 250, 250],
      lightColor: "#F59E0B",
      sound,
      enableLights: !muted,
      enableVibrate: !muted,
      showBadge: true,
    });
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Order Updates",
      importance,
      vibrationPattern: muted ? null : [0, 250, 250, 250],
      lightColor: "#10B981",
      sound,
      enableLights: !muted,
      enableVibrate: !muted,
      showBadge: true,
    });
    await Notifications.setNotificationChannelAsync("promotions", {
      name: "Promotions & Deals",
      importance: muted
        ? Notifications.AndroidImportance.LOW
        : Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: muted ? null : [0, 250],
      lightColor: "#F59E0B",
      sound,
      showBadge: true,
    });
  }
}

const PROJECT_ID = "ca39cda3-b6fc-4a8a-a0ed-9d8a280862a4";

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn(
      "[PushNotifications] Push notifications require a physical device.",
    );
    return null;
  }

  // Set up Android notification channels (respecting persisted mute preference)
  const muted = (await AsyncStorage.getItem(MUTE_SOUND_KEY)) === "true";
  await applyMuteSetting(muted);

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn(
      "[PushNotifications] Permission denied for push notifications.",
    );
    return null;
  }

  // Get the Expo push token
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? PROJECT_ID;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (error) {
    console.error("[PushNotifications] Failed to get push token:", error);
    return null;
  }
}

async function savePushTokenToBackend(token) {
  try {
    await axiosClient.post("/api/customernotifications/register-token", {
      pushToken: token,
    });
    console.log("[PushNotifications] Token saved to backend.");
  } catch (error) {
    console.warn(
      "[PushNotifications] Could not save token to backend:",
      error?.message,
    );
  }
}

/**
 * Hook that registers for push notifications, saves the token to the backend,
 * and provides listeners for received / tapped notifications.
 *
 * Returns { expoPushToken, notification }
 */
export function usePushNotifications(
  onNotificationReceived,
  onNotificationResponse,
) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register and save token
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        savePushTokenToBackend(token);
      }
    });

    // Listener: notification received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((incomingNotification) => {
        setNotification(incomingNotification);
        onNotificationReceived?.(incomingNotification);
      });

    // Listener: user tapped a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onNotificationResponse?.(response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { expoPushToken, notification };
}
