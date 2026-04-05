import GlobalProvider from "@/Context/GlobalProvider";
import { NotificationProvider } from "@/Context/NotificationContext";
import { PremiumProvider } from "@/Context/PremiumContext";
import { ThemeProvider } from "@/Context/ThemeProvider";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { STRIPE_PUBLISH_KEY } from "../config/config";
import { CartProvider } from "../Context/CartContext_NEW";
import { FavoritesProvider } from "../Context/FavoritesContext";
import { SocialProvider } from "../Context/SocialContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISH_KEY}>
          <PremiumProvider>
            <NotificationProvider>
              <GlobalProvider>
                <SocialProvider>
                  <CartProvider>
                    <FavoritesProvider>
                      <Stack screenOptions={{ headerShown: false }} />
                      <Toast />
                    </FavoritesProvider>
                    <StatusBar style="auto" />
                  </CartProvider>
                </SocialProvider>
              </GlobalProvider>
            </NotificationProvider>
          </PremiumProvider>
        </StripeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
