import GlobalProvider from "@/Context/GlobalProvider";
import { NotificationProvider } from "@/Context/NotificationContext";
import { PremiumProvider } from "@/Context/PremiumContext";
import { ThemeProvider } from "@/Context/ThemeProvider";
import { GroupBuyProvider } from "../Context/GroupBuyContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { STRIPE_PUBLISH_KEY } from "../config/config";
import { CartProvider } from "../Context/CartContext_NEW";
import { FavoritesProvider } from "../Context/FavoritesContext";
import { initCurrency } from "../api";
import { SocialProvider } from "../Context/SocialContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const router = useRouter();

  useEffect(() => {
    // Kick off currency detection immediately so it resolves before any
    // screen (Cart, Explore) tries to fetch data. initCurrency() is a
    // singleton — subsequent calls from screens return the same promise.
    initCurrency();
    SplashScreen.hideAsync();
  }, []);

  // Handle case where app is opened from a killed state via notification tap
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        router.push("/(Screens)/MyNotificationsScreen");
      }
    });
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
          <StripeProvider publishableKey={STRIPE_PUBLISH_KEY}>
            <GlobalProvider>
              <PremiumProvider>
                <NotificationProvider>
                  <SocialProvider>
                    <CartProvider>
                      <GroupBuyProvider>
                        <FavoritesProvider>
                          <AppContent />
                        </FavoritesProvider>
                      </GroupBuyProvider>
                      <StatusBar style="auto" />
                    </CartProvider>
                  </SocialProvider>
                </NotificationProvider>
              </PremiumProvider>
            </GlobalProvider>
          </StripeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
