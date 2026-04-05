/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStripe } from "@stripe/stripe-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  DollarSign,
  Gem,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react-native";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import { useCart } from "../../Context/CartContext_NEW";
import {
  createNotification,
  getCurrentUser,
} from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const Payments = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const { cart, clearCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const router = useRouter();
  const [createdAt, setCreatedAt] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const { theme, themeStyles } = useTheme();
  const isDarkMode = theme === "dark";
  const [currency, setCurrency] = useState("KES"); // or 'KES'
  const [navigationTrigger, setNavigationTrigger] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [paymentPolling, setPaymentPolling] = useState(false);

  // Debug router on component mount
  useEffect(() => {
    console.log("🔍 Router initialized:", {
      hasRouter: !!router,
      hasPush: !!(router && router.push),
      routerType: typeof router,
    });
  }, [router]);

  // Handle navigation in useEffect to avoid async context issues
  useEffect(() => {
    if (navigationTrigger) {
      console.log("🧭 Navigation triggered:", navigationTrigger);
      try {
        if (router && router.push) {
          // Pass order data as parameters - use captured data from navigation trigger
          router.push({
            pathname: "/(Screens)/OrdersScreen",
            params: {
              orderId: navigationTrigger.orderId || "N/A",
              totalAmount: navigationTrigger.totalAmount || totalAmount || 0,
              paymentMethod:
                navigationTrigger.paymentMethod || "Cash on Delivery",
              orderTime: new Date().toLocaleString(),
              paymentTime: new Date().toLocaleString(),
              productsAmount:
                navigationTrigger.productsAmount ||
                navigationTrigger.totalAmount ||
                totalAmount ||
                0,
              orderStatus: navigationTrigger.orderStatus || "Processing",
              estimatedDelivery: new Date(
                Date.now() + 5 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              paymentRef: navigationTrigger.paymentRef || `REF-${Date.now()}`,
              items: navigationTrigger.cartItems || JSON.stringify(cart || []),
            },
          });
        } else {
          Alert.alert(
            "Success",
            "Order completed successfully! Please check your orders in the profile section."
          );
        }
      } catch (navError) {
        console.error("Navigation error:", navError);
        Alert.alert(
          "Success",
          "Order completed successfully! Please check your orders in the profile section."
        );
      }
      setNavigationTrigger(null); // Reset trigger
    }
  }, [navigationTrigger, router, totalAmount, cart]);

  useEffect(() => {
    if (cart.length > 0) {
      // 🟢 Get the currency from the first item in the cart
      const cartCurrency = cart[0].currency;
      setCurrency(cartCurrency);
    }

    setTotalAmount(
      cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
  }, [cart]);

  const paymentMethods = [
    {
      id: "card",
      name: "Credit / Debit Card",
      icon: CreditCard,
      gradient: ["#F59E0B", "#D97706"],
      description: "Pay securely with your card",
      features: ["Secure", "Fast", "3D Secure"],
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: DollarSign,
      gradient: ["#10B981", "#059669"],
      description: "Pay when you receive your order",
      features: [
        "No online payment",
        "Pay at doorstep",
        "Extra charges may apply",
      ],
    },
    {
      id: "mobile",
      name: "Mobile Money",
      icon: DollarSign,
      gradient: ["#8B5CF6", "#7C3AED"],
      description: "M-Pesa, Airtel Money, etc.",
      features: ["Instant", "Secure", "24/7"],
    },
  ];

  const handleCashOnDelivery = async (user, token) => {
    const now = new Date();
    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + 5);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", options);

    try {
      // Validate required fields before making the request
      const userId = user?.id || user?.$id;
      const customerEmail = user?.email;
      const username = user?.username || user?.email;
      const orderCurrency = currency || "KES";

      console.log("=== COD PAYMENT VALIDATION ===");
      console.log("User object:", JSON.stringify(user, null, 2));
      console.log("User ID:", userId);
      console.log("Customer Email:", customerEmail);
      console.log("Username:", username);
      console.log("Total Amount:", totalAmount);
      console.log("Currency:", orderCurrency);
      console.log("Cart:", JSON.stringify(cart, null, 2));

      // Validate required fields
      if (!userId) {
        Alert.alert("Error", "User ID is missing. Please log in again.");
        return;
      }
      if (!customerEmail) {
        Alert.alert("Error", "Email is missing. Please update your profile.");
        return;
      }
      if (!username) {
        Alert.alert(
          "Error",
          "Username is missing. Please update your profile."
        );
        return;
      }
      if (!totalAmount || totalAmount <= 0) {
        Alert.alert("Error", "Invalid total amount.");
        return;
      }
      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        Alert.alert("Error", "Cart is empty.");
        return;
      }

      const payload = {
        cart,
        userId: userId,
        customerEmail: customerEmail,
        username: username,
        paymentMethod: "Cash on Delivery",
        totalAmount: parseFloat(totalAmount).toFixed(2),
        currency: orderCurrency,
        status: "Pending", // Set a status for COD orders
      };

      console.log("=== SENDING COD PAYLOAD ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const apiResponse = await axiosClient.post(
        "/api/payments/cash-on-delivery", // Ensure you have a dedicated backend endpoint for creating orders
        payload
      );

      console.log("=== COD API RESPONSE ===");
      console.log("Response:", JSON.stringify(apiResponse.data, null, 2));

      const result = apiResponse.data;
      if (!result.success) {
        Alert.alert("Order Failed", result.message || "Failed to create order");
        return;
      }

      if (!result.orderId) {
        throw new Error("Failed to create COD order.");
      }

      // Ensure totalAmount is a valid number before using .toFixed()
      const validTotalAmount =
        typeof totalAmount === "number"
          ? totalAmount
          : parseFloat(totalAmount) || 0;

      console.log("=== CREATING NOTIFICATION ===");
      console.log("Notification data:", {
        orderId: result.orderId,
        customerEmail,
        totalAmount: validTotalAmount,
        formattedAmount: validTotalAmount.toFixed(2),
      });

      try {
        await createNotification({
          message: `🛍️ New COD order #${result.orderId} placed by ${customerEmail} for $${validTotalAmount.toFixed(2)}.`,
          type: "order",
          username: username,
          userId: userId,
          email: customerEmail,
        });
        console.log("✅ Notification created successfully");
      } catch (notificationError) {
        console.error("❌ Notification creation failed:", notificationError);
        // Continue execution even if notification fails
      }

      console.log(
        "✅ Order completed successfully! Email already sent by backend."
      );

      // Clear cart after successful payment
      console.log("🛒 Clearing cart after successful payment...");
      await clearCart();
      console.log("✅ Cart cleared successfully");

      // Trigger navigation via state to avoid async context issues
      console.log("🧭 Triggering navigation via state...");
      setNavigationTrigger({
        type: "cod",
        orderId: result.orderId,
        paymentMethod: "Cash on Delivery",
        orderStatus: "Pending",
        paymentRef: `COD-${result.orderId}`,
        totalAmount: totalAmount, // Capture amount before cart is cleared
        productsAmount: totalAmount,
        cartItems: JSON.stringify(cart), // Capture cart before it's cleared
        timestamp: Date.now(),
      });
      return true;
    } catch (error) {
      console.error("=== COD CHECKOUT ERROR ===");
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred during checkout";

      Alert.alert("COD Checkout Error", errorMessage);
      return false;
    }
  };

  const handleMpesaPayment = async (user, token) => {
    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.trim().length === 0) {
        Alert.alert("Error", "Please enter your M-Pesa phone number.");
        return;
      }

      // Basic phone number validation
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) {
        Alert.alert("Error", "Please enter a valid phone number.");
        return;
      }

      setMpesaLoading(true);

      const userId = user?.id || user?.$id;
      const customerEmail = user?.email;
      const username = user?.username || user?.email;
      const orderCurrency = currency || "KES";

      console.log("=== M-PESA PAYMENT INITIATION ===");
      console.log("Phone Number:", phoneNumber);
      console.log("Amount:", totalAmount);
      console.log("Currency:", orderCurrency);

      const payload = {
        phoneNumber: phoneNumber.trim(),
        amount: parseFloat(totalAmount),
        accountReference: `ORDER_${Date.now()}`,
        transactionDesc: `Payment for Nile Mart Order`,
        userId: userId,
        cart,
        customerEmail,
        username,
        currency: orderCurrency,
      };

      console.log("=== SENDING M-PESA PAYLOAD ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const apiResponse = await axiosClient.post(
        "/api/payments/mpesa/initiate",
        payload
      );

      console.log("=== M-PESA API RESPONSE ===");
      console.log("Response:", JSON.stringify(apiResponse.data, null, 2));

      const result = apiResponse.data;
      if (!result.success) {
        Alert.alert(
          "M-Pesa Error",
          result.message || "Failed to initiate payment"
        );
        return;
      }

      // Show STK push sent message
      Alert.alert(
        "M-Pesa Payment",
        "Please check your phone and enter your M-Pesa PIN to complete the payment.",
        [{ text: "OK" }]
      );

      // Start polling for payment status
      await pollMpesaPaymentStatus(result.orderId, user);

      return true;
    } catch (error) {
      console.error("=== M-PESA PAYMENT ERROR ===");
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to initiate M-Pesa payment";

      Alert.alert("M-Pesa Payment Error", errorMessage);
      return false;
    } finally {
      setMpesaLoading(false);
    }
  };

  const pollMpesaPaymentStatus = async (orderId, user) => {
    setPaymentPolling(true);
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (10 second intervals)

    const poll = async () => {
      try {
        const response = await axiosClient.get(
          `/api/payments/mpesa/status/${orderId}`
        );
        const status = response.data;

        console.log(`M-Pesa status check ${attempts + 1}:`, status);

        if (status.paymentStatus === "succeeded") {
          setPaymentPolling(false);

          // Create notification
          try {
            await createNotification({
              message: `🛍️ New M-Pesa order #${orderId} completed successfully for KES ${totalAmount.toFixed(2)}.`,
              type: "order",
              username: user?.username || user?.email,
              userId: user?.id || user?.$id,
              email: user?.email,
            });
          } catch (e) {
            console.warn("Notification error:", e);
          }

          // Clear cart
          await clearCart();

          Alert.alert(
            "Payment Successful",
            "Your M-Pesa payment was completed successfully!",
            [
              {
                text: "View Order",
                onPress: () => {
                  setNavigationTrigger({
                    type: "mpesa",
                    orderId: orderId,
                    paymentMethod: "M-Pesa",
                    orderStatus: "Processing",
                    paymentRef: `MPESA-${orderId}`,
                    totalAmount: totalAmount,
                    productsAmount: totalAmount,
                    cartItems: JSON.stringify(cart),
                    timestamp: Date.now(),
                  });
                },
              },
            ]
          );

          return;
        } else if (
          status.paymentStatus === "failed" ||
          status.paymentStatus === "cancelled"
        ) {
          setPaymentPolling(false);
          Alert.alert(
            "Payment Failed",
            "Your M-Pesa payment was unsuccessful. Please try again."
          );
          return;
        }

        // Continue polling if payment is still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentPolling(false);
          Alert.alert(
            "Payment Timeout",
            "Payment verification is taking longer than expected. Please check your order status later.",
            [
              {
                text: "Check Order Status",
                onPress: () => {
                  setNavigationTrigger({
                    type: "mpesa-timeout",
                    orderId: orderId,
                    paymentMethod: "M-Pesa",
                    orderStatus: "Pending",
                    paymentRef: `MPESA-${orderId}`,
                    totalAmount: totalAmount,
                    productsAmount: totalAmount,
                    cartItems: JSON.stringify(cart),
                    timestamp: Date.now(),
                  });
                },
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        }
      } catch (error) {
        console.error("Error polling M-Pesa status:", error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000);
        } else {
          setPaymentPolling(false);
          Alert.alert(
            "Error",
            "Unable to verify payment status. Please contact support."
          );
        }
      }
    };

    poll();
  };

  const initiateCheckout = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method.");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const user = await getCurrentUser();
      const token = await AsyncStorage.getItem("accessToken");

      // Validate user object first
      if (!user) {
        Alert.alert("Error", "Please log in to continue with checkout.");
        setLoading(false);
        return;
      }

      const userId = user?.id || user?.$id;
      const customerEmail = user?.email;
      const username = user?.username || user?.email;

      console.log("=== CHECKOUT VALIDATION ===");
      console.log("User object:", JSON.stringify(user, null, 2));
      console.log("User ID:", userId);
      console.log("Customer Email:", customerEmail);
      console.log("Username:", username);
      console.log("Selected Payment Method:", selectedMethod);
      console.log("Cart Items:", cart);
      console.log("Total Amount to be sent:", totalAmount);

      // Add this code at the beginning of your initiateCheckout function
      const now = new Date();
      const deliveryDate = new Date(now);
      deliveryDate.setDate(now.getDate() + 5);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      /* const estimatedDelivery = deliveryDate.toLocaleDateString(
        "en-US",
        options
      ); */
      console.log("Estimated Delivery Date:", estimatedDelivery);

      // --- CRITICAL FIX: Add this conditional logic ---
      if (selectedMethod === "cod") {
        await handleCashOnDelivery(user, token);
      } else if (selectedMethod === "mobile") {
        await handleMpesaPayment(user, token);
      } else if (selectedMethod === "card") {
        const payload = {
          cart,
          userId: userId,
          customerEmail: customerEmail,
          username: username,
          paymentMethod: selectedMethod,
          totalAmount: parseFloat(totalAmount).toFixed(2),
          currency: currency || "KES",
        };

        console.log("Payload being sent to backend:", payload);

        const apiResponse = await axiosClient.post(
          "/api/payments/stripe-mobile-paymentsheet",
          payload
        );

        const result = apiResponse.data;

        console.log("=== STRIPE MOBILE API RESPONSE ===");
        console.log("Response:", JSON.stringify(result, null, 2));

        if (!result.client_secret || !result.orderId) {
          throw new Error("Invalid payment response from server");
        }

        setOrderId(result.orderId);
        setCreatedAt(result.createdAt);

        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: result.client_secret,
          merchantDisplayName: "Nile Mart",
          style: "alwaysDark", // Add consistent styling
          googlePay: {
            merchantCountryCode: "KE",
            testEnv: __DEV__, // Use test environment in development
            currencyCode: currency || "KES",
          },
        });

        console.log("=== PAYMENT SHEET INITIALIZATION ===");
        if (error) {
          console.error("PaymentSheet initialization error:", error);
          Alert.alert(
            "Error",
            `Payment sheet failed to initialize: ${error.message}`
          );
          return;
        }

        console.log("✅ PaymentSheet initialized successfully");

        const { error: paymentError } = await presentPaymentSheet();

        console.log("=== PAYMENT SHEET RESULT ===");
        if (paymentError) {
          console.error("Payment error:", paymentError);
          Alert.alert("Payment Failed", paymentError.message);
          return;
        }

        console.log("✅ Payment completed successfully");
        console.log("✅ Payment completed successfully");

        // Create notification after successful payment
        console.log("=== CREATING POST-PAYMENT NOTIFICATION ===");
        try {
          await createNotification({
            message: `🛍️ New order #${result.orderId} placed by ${customerEmail} totaling ${currency} ${totalAmount.toFixed(2)}.`,
            type: "order",
            username: username,
            userId,
            email: customerEmail,
          });
          console.log("✅ Notification created successfully");
        } catch (notificationError) {
          console.error("❌ Notification creation failed:", notificationError);
          // Continue with cart clearing even if notification fails
        }

        // Clear cart after successful payment
        console.log("🛒 Clearing cart after successful Credit Card payment...");
        try {
          await clearCart();
          console.log("✅ Cart cleared successfully");
        } catch (clearError) {
          console.error("❌ Cart clearing failed:", clearError);
          // Continue to navigation even if cart clearing fails
        }

        // Trigger navigation via state to avoid async context issues
        console.log("🧭 Triggering navigation via state for credit card...");
        setNavigationTrigger({
          type: "card",
          orderId: result.orderId,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // <-- Add this closing brace for the try block
      console.error("Checkout Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      const orderDate = new Date(createdAt);
      const deliveryDate = moment(orderDate)
        .add(2, "days")
        .format("MMM  Do YYYY");
      setEstimatedDelivery(deliveryDate);
      console.log("Estimated Delivery Date:", deliveryDate);
      console.log(
        "Order created with ID:",
        orderId,
        "- waiting for payment completion"
      );
    }
  }, [orderId]);

  // Responsive styles
  const titleFontSize = width < 350 ? 18 : 20;
  const methodFontSize = width < 350 ? 16 : 18;
  const itemPadding = width < 350 ? 12 : 16;
  const itemMarginBottom = width < 350 ? 8 : 12;
  const buttonPadding = width < 350 ? 12 : 16;
  const buttonFontSize = width < 350 ? 16 : 18;
  const themedText = isDarkMode ? "text-white" : "text-black";
  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0f172a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            nestedScrollEnabled={true}
          >
            {/* Header Section */}
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(245, 158, 11, 0.3)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Lock size={24} color="#F59E0B" />
                </View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                    letterSpacing: 0.5,
                  }}
                >
                  Secure Payment
                </Text>
              </View>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                Select your preferred payment method for a seamless checkout
                experience
              </Text>

              {/* Trust Badges */}
              <View
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(245, 158, 11, 0.2)",
                  padding: 16,
                  marginTop: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Shield size={18} color="#10B981" />
                    <Text
                      style={{ color: "#A7F3D0", fontSize: 12, marginLeft: 6 }}
                    >
                      SSL Secured
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Gem size={18} color="#F59E0B" />
                    <Text
                      style={{ color: "#FDE68A", fontSize: 12, marginLeft: 6 }}
                    >
                      Premium Security
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Sparkles size={18} color="#A855F7" />
                    <Text
                      style={{ color: "#DDD6FE", fontSize: 12, marginLeft: 6 }}
                    >
                      100% Safe
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Payment Methods Title */}
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 20,
              }}
            >
              Choose Payment Method
            </Text>

            {/* Payment Methods */}
            <View style={{ marginBottom: 30 }}>
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedMethod(method.id)}
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(30, 41, 59, 0.9)"
                        : "rgba(30, 41, 59, 0.6)",
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? "rgba(245, 158, 11, 0.5)"
                        : "rgba(245, 158, 11, 0.2)",
                      padding: 20,
                      marginBottom: 16,
                      shadowColor: isSelected ? "#F59E0B" : "transparent",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: isSelected ? 8 : 0,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          backgroundColor: isSelected
                            ? "rgba(245, 158, 11, 0.3)"
                            : "rgba(75, 85, 99, 0.5)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 16,
                        }}
                      >
                        <Icon
                          size={28}
                          color={isSelected ? "#F59E0B" : "#9CA3AF"}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              color: isSelected ? "#FCD34D" : "white",
                              marginRight: 8,
                            }}
                          >
                            {method.name}
                          </Text>
                          {isSelected && (
                            <CheckCircle size={20} color="#10B981" />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#9CA3AF",
                            marginBottom: 8,
                          }}
                        >
                          {method.description}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {method.features.map((feature, i) => (
                            <View
                              key={i}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderRadius: 20,
                                backgroundColor: "rgba(17, 24, 39, 0.5)",
                                borderWidth: 1,
                                borderColor: "rgba(245, 158, 11, 0.3)",
                              }}
                            >
                              <Text
                                style={{
                                  color: "#FDE68A",
                                  fontSize: 12,
                                  fontWeight: "500",
                                }}
                              >
                                {feature}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* M-Pesa Phone Number Input */}
            {selectedMethod === "mobile" && (
              <View
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: "#FCD34D",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 12,
                  }}
                >
                  Enter M-Pesa Phone Number
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(245, 158, 11, 0.4)",
                    padding: 16,
                    color: "white",
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                  placeholder="e.g. 0712345678 or +254712345678"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={15}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    lineHeight: 16,
                  }}
                >
                  You will receive an M-Pesa prompt on this number
                </Text>
              </View>
            )}

            {/* Security Info */}
            <View
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.2)",
                padding: 20,
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Shield
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2, marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#A7F3D0",
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    Your Payment is Secure
                  </Text>
                  <Text
                    style={{
                      color: "#D1D5DB",
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    All transactions are encrypted and secured with 256-bit SSL.
                    We never store your card details.
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirm Order Button */}
            <TouchableOpacity
              onPress={initiateCheckout}
              disabled={
                loading || !selectedMethod || mpesaLoading || paymentPolling
              }
              style={{
                backgroundColor:
                  loading || !selectedMethod || mpesaLoading || paymentPolling
                    ? "#4B5563"
                    : "#F59E0B",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                shadowColor:
                  loading || !selectedMethod || mpesaLoading || paymentPolling
                    ? "transparent"
                    : "#F59E0B",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation:
                  loading || !selectedMethod || mpesaLoading || paymentPolling
                    ? 0
                    : 8,
                position: "relative",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading || mpesaLoading || paymentPolling ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "white",
                        marginLeft: 12,
                      }}
                    >
                      {paymentPolling
                        ? "Waiting for payment..."
                        : "Processing..."}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      {selectedMethod === "mobile"
                        ? "Send M-Pesa Prompt"
                        : selectedMethod
                          ? "Confirm Order"
                          : "Select Payment Method"}
                    </Text>
                    {selectedMethod && (
                      <ArrowRight
                        size={20}
                        color="white"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Lock Badge */}
              {!loading &&
                !mpesaLoading &&
                !paymentPolling &&
                selectedMethod && (
                  <View
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#10B981",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Lock size={16} color="white" />
                  </View>
                )}
            </TouchableOpacity>

            {/* Help Text */}
            <Text
              style={{
                color: "#9CA3AF",
                textAlign: "center",
                marginTop: 16,
                fontSize: 14,
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Payments;
