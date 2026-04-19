import Constants from "expo-constants";

// SECURITY: Never hardcode secret keys in client code.
// APPWRITE_API_KEY and FLW_SECRET_KEY must ONLY exist on the backend.
// Public keys are loaded from EAS environment variables via app.config.js extra field.

// Flutterwave public key (safe for client-side)
export const FLW_PUBLIC_KEY = Constants.expoConfig?.extra?.FLW_PUBLIC_KEY || "";

// Stripe publishable key (safe for client-side)
export const STRIPE_PUBLISH_KEY =
  Constants.expoConfig?.extra?.STRIPE_PUBLISH_KEY || "";

// PayPal client ID (safe for client-side)
export const PAYPAL_CLIENT_ID =
  Constants.expoConfig?.extra?.PAYPAL_CLIENT_ID || "";
