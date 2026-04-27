import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../Context/GlobalProvider";

const { width } = Dimensions.get("window");

const PaymentMethods = () => {
  const router = useRouter();
  const { isLogged } = useGlobalContext();

  // Placeholder saved methods — replace with real API data as needed
  const [savedMethods] = useState([
    // Empty by default; populate from backend when available
  ]);

  const paymentOptions = [
    {
      title: "Credit / Debit Card",
      subtitle: "Visa, Mastercard, American Express",
      icon: "credit-card",
      iconColors: ["#2563EB", "#1D4ED8"],
      onPress: () =>
        Alert.alert(
          "Add Card",
          "Card payment is handled at checkout via Stripe.",
          [{ text: "OK" }],
        ),
    },
    {
      title: "M-Pesa",
      subtitle: "Lipa na M-Pesa (Kenya)",
      icon: "phone-android",
      iconColors: ["#059669", "#047857"],
      onPress: () =>
        Alert.alert(
          "M-Pesa",
          "M-Pesa payment is handled at checkout. Enter your number when prompted.",
          [{ text: "OK" }],
        ),
    },
    {
      title: "Airtel Money",
      subtitle: "Airtel Money mobile payment",
      icon: "wifi",
      iconColors: ["#DC2626", "#B91C1C"],
      onPress: () =>
        Alert.alert(
          "Airtel Money",
          "Airtel Money payment is processed at checkout.",
          [{ text: "OK" }],
        ),
    },
    {
      title: "Bank Transfer",
      subtitle: "Direct bank transfer",
      icon: "account-balance",
      iconColors: ["#7C3AED", "#6D28D9"],
      onPress: () =>
        Alert.alert(
          "Bank Transfer",
          "Contact support for bank transfer payment details.",
          [{ text: "OK" }],
        ),
    },
  ];

  const handleGoToCheckout = () => {
    router.push("/Cart");
  };

  return (
    <LinearGradient
      colors={["#111827", "#000000", "#111827"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F59E0B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Payment Methods</Text>
            <Text style={styles.headerSubtitle}>
              Manage how you pay on NileFlow
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Saved Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
            <LinearGradient
              colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
              style={styles.card}
            >
              {!isLogged ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="lock-outline"
                    size={48}
                    color="rgba(245, 158, 11, 0.4)"
                  />
                  <Text style={styles.emptyTitle}>Sign In Required</Text>
                  <Text style={styles.emptySubtitle}>
                    Sign in to view and manage your saved payment methods
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/sign-in")}
                    style={styles.signInButton}
                  >
                    <LinearGradient
                      colors={["#D97706", "#B45309"]}
                      style={styles.signInGradient}
                    >
                      <Text style={styles.signInText}>Sign In</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : savedMethods.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="credit-card-off"
                    size={48}
                    color="rgba(245, 158, 11, 0.4)"
                  />
                  <Text style={styles.emptyTitle}>No Saved Methods</Text>
                  <Text style={styles.emptySubtitle}>
                    Your payment methods will appear here after your first
                    checkout
                  </Text>
                  <TouchableOpacity
                    onPress={handleGoToCheckout}
                    style={styles.signInButton}
                  >
                    <LinearGradient
                      colors={["#D97706", "#B45309"]}
                      style={styles.signInGradient}
                    >
                      <Text style={styles.signInText}>Go to Checkout</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                savedMethods.map((method, index) => (
                  <View
                    key={index}
                    style={[
                      styles.savedMethodItem,
                      index < savedMethods.length - 1 && styles.menuItemBorder,
                    ]}
                  >
                    <View style={styles.menuItemLeft}>
                      <LinearGradient
                        colors={method.iconColors}
                        style={styles.menuIconContainer}
                      >
                        <MaterialIcons
                          name={method.icon}
                          size={20}
                          color="white"
                        />
                      </LinearGradient>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>{method.title}</Text>
                        <Text style={styles.menuSubtitle}>
                          {method.subtitle}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={method.onDelete}>
                      <MaterialIcons
                        name="delete-outline"
                        size={22}
                        color="#DC2626"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </LinearGradient>
          </View>

          {/* Accepted Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accepted Payment Methods</Text>
            <LinearGradient
              colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
              style={styles.card}
            >
              {paymentOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={option.onPress}
                  style={[
                    styles.menuItem,
                    index < paymentOptions.length - 1 && styles.menuItemBorder,
                  ]}
                >
                  <View style={styles.menuItemLeft}>
                    <LinearGradient
                      colors={option.iconColors}
                      style={styles.menuIconContainer}
                    >
                      <MaterialIcons
                        name={option.icon}
                        size={20}
                        color="white"
                      />
                    </LinearGradient>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuTitle}>{option.title}</Text>
                      <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>

          {/* Security Notice */}
          <LinearGradient
            colors={["rgba(5, 150, 105, 0.15)", "rgba(4, 120, 87, 0.08)"]}
            style={styles.noticeBanner}
          >
            <MaterialIcons name="verified-user" size={24} color="#10B981" />
            <View style={styles.noticeTextContainer}>
              <Text style={styles.noticeTitle}>Secure Payments</Text>
              <Text style={styles.noticeSubtitle}>
                All transactions are encrypted and processed securely via Stripe
                and M-Pesa
              </Text>
            </View>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: width < 350 ? 18 : 20,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: width < 350 ? 14 : 16,
    fontWeight: "600",
    color: "#FCD34D",
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  savedMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: width < 350 ? 14 : 15,
    fontWeight: "600",
    color: "#F1F5F9",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F1F5F9",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  signInButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  signInGradient: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signInText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    gap: 12,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  noticeSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 3,
    lineHeight: 18,
  },
});

export default PaymentMethods;
