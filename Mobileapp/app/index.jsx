import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, InteractionManager, Text, View } from "react-native";
import { useGlobalContext } from "../Context/GlobalProvider";
import CustomButton from "./components/CusttomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Index = () => {
  const router = useRouter();
  /*   const { isLogged, loading } = useGlobalContext();

  useEffect(() => {
    if (!loading && !isLogged) {
      const timer = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          router.push("/(tabs)/BottomTabs");
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, isLogged, router]);

  if (isLogged) {
    return null;
  } */
  /* AsyncStorage.removeItem("nileflow_detected_currency"); */
  /* AsyncStorage.clear(); */ // Clear AsyncStorage on app launch for testing purposes
  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0f172a"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          {/* Logo */}
          <View style={{ marginBottom: 40 }}>
            <LinearGradient
              colors={["#F59E0B", "#D97706", "#B45309"]}
              style={{
                width: 200,
                height: 200,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <Image
                source={require("../assets/images/newlogo.png")}
                style={{ width: 160, height: 160 }}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text
            style={{
              color: "#FCD34D",
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            PREMIUM AFRICAN MARKETPLACE
          </Text>

          {/* <Text
            style={{
              color: "#D1D5DB",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            Bringing Light and Progress Through Authentic African Commerce
          </Text> */}

          {/* Welcome */}
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 15,
            }}
          >
            Welcome to Nile Flow Africa
          </Text>

          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 16,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 40,
            }}
          >
            Discover authentic African products, support local artisans, and
            experience premium e-commerce designed for the continent.
          </Text>

          {/* Button */}
          <CustomButton
            title="Explore African Excellence"
            handlePress={() => router.push("/(tabs)/BottomTabs")}
          />

          {/* Footer */}
          <Text
            style={{
              color: "#6B7280",
              fontSize: 12,
              textAlign: "center",
              marginTop: 30,
            }}
          >
            Entering marketplace automatically...
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Index;
