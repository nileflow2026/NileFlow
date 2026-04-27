/**
 * Expo Push Notification Service
 *
 * Sends push notifications to individual users via the Expo Push API.
 * Works for ALL notification types: orders, app updates, promotions, news, etc.
 *
 * The user's Expo push token is stored on their Appwrite user document
 * (registered by the mobile app on startup via POST /api/customernotifications/register-token).
 */

const { db } = require("./appwriteService");
const { env } = require("../src/env");

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

// Human-readable title map for each notification type
const TYPE_TITLES = {
  order: "Order Update",
  orderUpdate: "Order Update",
  payment: "Payment Update",
  promotion: "New Promotion",
  deal: "New Deal",
  flash_sale: "Flash Sale",
  appUpdate: "App Update",
  policy: "Policy Update",
  news: "NileFlow News",
  referral: "Referral Reward",
  reward: "Rewards",
  welcome: "Welcome to NileFlow",
  userNotification: "Notification",
  default: "NileFlow",
};

function getTitleForType(type) {
  if (!type) return TYPE_TITLES.default;
  // Direct match
  if (TYPE_TITLES[type]) return TYPE_TITLES[type];
  // Partial match (e.g. "orderStatus" → "Order Update")
  const key = Object.keys(TYPE_TITLES).find((k) =>
    type.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? TYPE_TITLES[key] : TYPE_TITLES.default;
}

/**
 * Fetch a user's Expo push token from Appwrite.
 * Returns null if not found or not registered.
 */
async function getUserPushToken(userId) {
  try {
    const userDoc = await db.getDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_USER_COLLECTION_ID,
      userId,
    );
    return userDoc?.pushToken || null;
  } catch (error) {
    // User document not found or field missing — silently ignore
    return null;
  }
}

/**
 * Send a single push notification to a user.
 *
 * @param {object} options
 * @param {string} options.userId        - Appwrite user document ID
 * @param {string} options.message       - Notification body text
 * @param {string} [options.type]        - Notification type (determines title)
 * @param {string} [options.title]       - Override title (optional)
 * @param {object} [options.data]        - Extra data payload for the app
 */
async function sendPushNotification({
  userId,
  message,
  type,
  title,
  data = {},
}) {
  if (!userId || !message) return;

  const pushToken = await getUserPushToken(userId);

  if (!pushToken) {
    // User hasn't registered a push token (e.g. web user, simulator, permissions denied)
    return;
  }

  const notificationTitle = title || getTitleForType(type);

  const payload = {
    to: pushToken,
    title: notificationTitle,
    body: message,
    sound: "default",
    badge: 1,
    data: { type, ...data },
    channelId: resolveChannelId(type),
  };

  try {
    const response = await fetch(EXPO_PUSH_API, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result?.data?.status === "error") {
      console.warn(
        `[Push] Delivery error for user ${userId}:`,
        result.data.message,
      );
      // If token is no longer valid, clear it from the user document
      if (
        result.data.details?.error === "DeviceNotRegistered" ||
        result.data.message?.includes("DeviceNotRegistered")
      ) {
        await clearInvalidToken(userId);
      }
    }
  } catch (error) {
    // Push delivery failure is non-critical — never let it break the caller
    console.warn("[Push] Failed to send notification:", error.message);
  }
}

/**
 * Send push notifications to multiple users at once (batch).
 * Uses the Expo bulk API endpoint.
 *
 * @param {Array<{userId, message, type, title, data}>} notifications
 */
async function sendPushNotificationBatch(notifications) {
  if (!notifications?.length) return;

  const payloads = await Promise.all(
    notifications.map(async ({ userId, message, type, title, data = {} }) => {
      const pushToken = await getUserPushToken(userId);
      if (!pushToken) return null;
      return {
        to: pushToken,
        title: title || getTitleForType(type),
        body: message,
        sound: "default",
        badge: 1,
        data: { type, ...data },
        channelId: resolveChannelId(type),
      };
    }),
  );

  const validPayloads = payloads.filter(Boolean);
  if (!validPayloads.length) return;

  try {
    const response = await fetch(EXPO_PUSH_API, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validPayloads),
    });

    const result = await response.json();
    console.log(`[Push] Batch sent ${validPayloads.length} notifications.`);
    return result;
  } catch (error) {
    console.warn("[Push] Batch send failed:", error.message);
  }
}

/**
 * Map notification type to an Android channel ID (created in usePushNotifications.js).
 */
function resolveChannelId(type) {
  if (!type) return "default";
  const lower = type.toLowerCase();
  if (
    lower.includes("order") ||
    lower.includes("payment") ||
    lower.includes("delivery")
  ) {
    return "orders";
  }
  if (
    lower.includes("promo") ||
    lower.includes("deal") ||
    lower.includes("flash") ||
    lower.includes("sale")
  ) {
    return "promotions";
  }
  return "default";
}

async function clearInvalidToken(userId) {
  try {
    await db.updateDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_USER_COLLECTION_ID,
      userId,
      { pushToken: null },
    );
  } catch (_) {}
}

module.exports = {
  sendPushNotification,
  sendPushNotificationBatch,
};
