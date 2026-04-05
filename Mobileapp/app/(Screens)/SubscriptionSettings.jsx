import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePremiumContext } from "../../Context/PremiumContext";
import { usePremiumSubscription } from "../../hooks/usePremiumSubscription";

const SubscriptionSettings = () => {
  const { isPremium, loading, refreshStatus } = usePremiumContext();
  const {
    subscribe,
    cancelSubscription,
    paymentStatus,
    stopPolling,
    pollPaymentStatus,
  } = usePremiumSubscription();

  // Stripe Payment Sheet hooks
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPaymentPending, setShowPaymentPending] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);

  const handleSubscribe = async () => {
    if (paymentMethod === "mpesa" && !phoneNumber) {
      Alert.alert("Error", "Please enter your M-Pesa phone number");
      return;
    }

    if (paymentMethod === "stripe") {
      await handleStripeSubscription();
      return;
    }

    const result = await subscribe(paymentMethod, phoneNumber);

    if (result.success) {
      // M-Pesa payment - show pending modal and start polling
      if (
        paymentMethod === "mpesa" &&
        result.requiresPolling &&
        result.checkoutRequestId
      ) {
        setShowPaymentPending(true);
        setPaymentMessage("Processing your payment...");

        // Start polling for payment status
        pollPaymentStatus(
          result.checkoutRequestId,
          (statusData) => {
            // On success - status will be handled by useEffect
            console.log("Payment confirmed:", statusData);
          },
          () => {
            // On timeout - status will be handled by useEffect
            console.log("Payment polling timed out");
          }
        );
      }
    } else {
      Alert.alert("Error", result.message || "Failed to initiate subscription");
    }
  };

  const handleStripeSubscription = async () => {
    setStripeLoading(true);

    try {
      console.log("🔄 Initializing Stripe subscription...");

      // Get payment intent from backend
      const result = await subscribe("stripe");

      if (!result.success) {
        Alert.alert("Error", result.message || "Failed to initialize payment");
        return;
      }

      // Extract payment details
      const { paymentIntent, ephemeralKey, customer, publishableKey } =
        result.data.paymentDetails || {};

      if (!paymentIntent || !ephemeralKey || !customer) {
        Alert.alert("Error", "Invalid payment configuration received");
        return;
      }

      console.log("💳 Initializing Payment Sheet...");

      // Initialize the payment sheet
      const { error: paymentSheetError } = await initPaymentSheet({
        merchantDisplayName: "Nile Premium Subscription",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "Premium Subscriber",
        },
        appearance: {
          colors: {
            primary: "#F59E0B",
            background: "#1e293b",
            componentBackground: "#334155",
            componentBorder: "#475569",
            componentDivider: "#64748b",
            primaryText: "#f1f5f9",
            secondaryText: "#cbd5e1",
            componentText: "#f1f5f9",
            placeholderText: "#94a3b8",
          },
        },
        returnURL: "nilemart://payment-complete",
      });

      if (paymentSheetError) {
        console.error("❌ Payment Sheet init error:", paymentSheetError);
        Alert.alert("Error", "Failed to initialize payment. Please try again.");
        return;
      }

      console.log("✅ Payment Sheet initialized successfully");

      // Present the payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") {
          console.log("💳 User canceled payment");
        } else {
          console.error("❌ Payment error:", presentError);
          Alert.alert("Payment Error", presentError.message);
        }
        return;
      }

      console.log("✅ Payment successful! Confirming with backend...");

      // Extract PaymentIntent ID from client secret
      const paymentIntentId = paymentIntent.split("_secret_")[0];
      const subscriptionId = result.data.subscriptionId;

      // Confirm payment with backend after successful Payment Sheet
      try {
        const { premiumService } = await import("../../utils/premiumService");
        const confirmResult = await premiumService.confirmPayment(
          paymentIntentId,
          subscriptionId
        );

        if (confirmResult.success) {
          console.log("✅ Payment confirmed! Premium activated.");

          // Refresh premium status
          await refreshStatus();

          // Show success message
          Alert.alert(
            "Success!",
            "Payment successful! Your premium subscription is now active.",
            [{ text: "OK", onPress: () => {} }]
          );
        } else {
          Alert.alert(
            "Error",
            confirmResult.message || "Failed to activate subscription"
          );
        }
      } catch (confirmError) {
        console.error("❌ Payment confirmation error:", confirmError);
        Alert.alert(
          "Payment Processed",
          "Payment was successful, but there was an issue activating your subscription. Please contact support."
        );
      }
    } catch (error) {
      console.error("❌ Stripe subscription error:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your premium subscription?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const result = await cancelSubscription();
            if (result.success) {
              Alert.alert("Success", "Subscription cancelled successfully");
            } else {
              Alert.alert(
                "Error",
                result.message || "Failed to cancel subscription"
              );
            }
          },
        },
      ]
    );
  };

  // Handle payment status updates
  useEffect(() => {
    if (paymentStatus === "completed" || paymentStatus === "active") {
      setShowPaymentPending(false);
      setPaymentMessage("");
      setPhoneNumber("");
      Alert.alert(
        "Success",
        "Payment successful! Your premium subscription is now active."
      );
      stopPolling();
    } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
      setShowPaymentPending(false);
      setPaymentMessage("");
      Alert.alert("Failed", "Payment failed. Please try again.");
      stopPolling();
    } else if (paymentStatus === "timeout") {
      setShowPaymentPending(false);
      setPaymentMessage("");
      Alert.alert(
        "Timeout",
        "Payment verification timed out. Please check your subscription status."
      );
      stopPolling();
    }
  }, [paymentStatus, stopPolling]);

  const PremiumBenefit = ({ icon, title, desc, gradient }) => (
    <TouchableOpacity
      style={[styles.benefitCard, gradient && styles.benefitCardShadow]}
    >
      <LinearGradient
        colors={gradient || ["#1f2937", "#111827"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.benefitGradient}
      >
        <View
          style={[styles.benefitIcon, gradient && styles.benefitIconGradient]}
        >
          <LinearGradient
            colors={gradient || ["#f59e0b", "#d97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.benefitIconInner}
          >
            <Ionicons name={icon} size={24} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDesc}>{desc}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          style={styles.loadingCard}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <View style={styles.loadingPlaceholders}>
              <View style={styles.loadingHeader} />
              <View style={styles.loadingGrid}>
                <View style={styles.loadingItem} />
                <View style={styles.loadingItem} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.mainCard}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={["#9333ea", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconGradient}
              >
                <Ionicons name="diamond" size={32} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Premium Subscription</Text>
              <Text style={styles.subtitle}>
                {isPremium
                  ? "Manage your premium membership"
                  : "Unlock exclusive benefits"}
              </Text>
            </View>
          </View>

          {isPremium && (
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.activeStatus}
            >
              <Ionicons name="sparkles" size={16} color="white" />
              <Text style={styles.activeStatusText}>ACTIVE</Text>
            </LinearGradient>
          )}
        </View>

        {isPremium ? (
          <View style={styles.content}>
            {/* Premium Status */}
            <LinearGradient
              colors={["rgba(16,185,129,0.2)", "rgba(5,150,105,0.1)"]}
              style={styles.statusCard}
            >
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.statusTitle}>Current Plan</Text>
                  <Text style={styles.statusPlan}>Premium Monthly</Text>
                  <Text style={styles.statusPrice}>200 Ksh/month</Text>
                </View>

                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Premium Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Your Premium Benefits</Text>
              <View style={styles.benefitsGrid}>
                <PremiumBenefit
                  icon="flash"
                  title="Priority Support"
                  desc="24/7 premium customer service"
                />
                <PremiumBenefit
                  icon="star"
                  title="Exclusive Deals"
                  desc="Access to special offers"
                />
                <PremiumBenefit
                  icon="shield-checkmark"
                  title="Extended Warranty"
                  desc="Extra protection on all orders"
                />
                <PremiumBenefit
                  icon="sparkles"
                  title="Early Access"
                  desc="First to see new products"
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Non-Premium Header */}
            <View style={styles.upgradeHeader}>
              <View style={styles.upgradeIconContainer}>
                <LinearGradient
                  colors={["#9333ea", "#3b82f6"]}
                  style={styles.upgradeIcon}
                >
                  <Ionicons name="diamond" size={40} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Unlock exclusive benefits for just{" "}
                <Text style={styles.upgradePrice}>200 Ksh/month</Text>
              </Text>
            </View>

            {/* Benefits Grid */}
            <View style={styles.benefitsSection}>
              <View style={styles.benefitsGrid}>
                <PremiumBenefit
                  icon="flash"
                  title="Priority Support"
                  desc="24/7 dedicated customer service with instant responses"
                  gradient={["#eab308", "#f59e0b"]}
                />
                <PremiumBenefit
                  icon="star"
                  title="Exclusive Deals"
                  desc="Access special discounts and members-only offers"
                  gradient={["#9333ea", "#ec4899"]}
                />
                <PremiumBenefit
                  icon="shield-checkmark"
                  title="Extended Warranty"
                  desc="Extra protection and warranty on all your purchases"
                  gradient={["#2563eb", "#06b6d4"]}
                />
                <PremiumBenefit
                  icon="sparkles"
                  title="Early Access"
                  desc="Be the first to discover new products and collections"
                  gradient={["#059669", "#10b981"]}
                />
              </View>
            </View>

            {/* Payment Section */}
            <LinearGradient
              colors={["rgba(147,51,234,0.2)", "rgba(59,130,246,0.1)"]}
              style={styles.paymentSection}
            >
              <Text style={styles.paymentTitle}>Choose Payment Method</Text>

              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  onPress={() => setPaymentMethod("mpesa")}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === "mpesa" && styles.paymentMethodSelected,
                  ]}
                >
                  <LinearGradient
                    colors={
                      paymentMethod === "mpesa"
                        ? ["rgba(16,185,129,0.2)", "rgba(5,150,105,0.1)"]
                        : ["rgba(31,41,55,0.5)", "rgba(0,0,0,0.5)"]
                    }
                    style={styles.paymentMethodInner}
                  >
                    <Text style={styles.paymentMethodIcon}>📱</Text>
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === "mpesa" &&
                          styles.paymentMethodTextSelected,
                      ]}
                    >
                      M-Pesa
                    </Text>
                    {paymentMethod === "mpesa" && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10b981"
                      />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod("stripe")}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === "stripe" && styles.paymentMethodSelected,
                  ]}
                >
                  <LinearGradient
                    colors={
                      paymentMethod === "stripe"
                        ? ["rgba(147,51,234,0.2)", "rgba(79,70,229,0.1)"]
                        : ["rgba(31,41,55,0.5)", "rgba(0,0,0,0.5)"]
                    }
                    style={styles.paymentMethodInner}
                  >
                    <Text style={styles.paymentMethodIcon}>💳</Text>
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === "stripe" &&
                          styles.paymentMethodTextSelected,
                      ]}
                    >
                      Stripe
                    </Text>
                    {paymentMethod === "stripe" && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#9333ea"
                      />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {paymentMethod === "mpesa" && (
                <View style={styles.phoneInputSection}>
                  <Text style={styles.phoneInputLabel}>
                    M-Pesa Phone Number
                  </Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.phoneInputIcon}>📱</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="254XXXXXXXXX"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                    />
                  </View>
                  <Text style={styles.phoneInputHint}>
                    Enter your number in format: 254712345678
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubscribe}
                disabled={stripeLoading}
                style={[
                  styles.subscribeButton,
                  stripeLoading && { opacity: 0.7 },
                ]}
              >
                <LinearGradient
                  colors={["#9333ea", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeButtonGradient}
                >
                  {stripeLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="diamond" size={20} color="white" />
                  )}
                  <Text style={styles.subscribeButtonText}>
                    {stripeLoading
                      ? "Processing..."
                      : paymentMethod === "stripe"
                        ? "Pay with Stripe - 200 Ksh/month"
                        : "Subscribe Now - 200 Ksh/month"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {paymentMethod === "stripe" && !stripeLoading && (
                <Text style={styles.stripeNote}>
                  Secure payment with your card or mobile money
                </Text>
              )}
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Payment Pending Modal */}
      <Modal
        visible={showPaymentPending}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPaymentPending(false);
          stopPolling();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalSpinner}>
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                style={styles.spinnerContainer}
              >
                <ActivityIndicator size="large" color="white" />
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Processing Payment</Text>
            <Text style={styles.modalMessage}>
              {paymentMessage || "Please complete the payment on your phone..."}
            </Text>

            {paymentMethod === "mpesa" && (
              <LinearGradient
                colors={["rgba(16,185,129,0.3)", "rgba(5,150,105,0.2)"]}
                style={styles.mpesaInstructions}
              >
                <Text style={styles.mpesaTitle}>📱 Check your phone</Text>
                <Text style={styles.mpesaText}>
                  Enter your M-Pesa PIN to complete the payment
                </Text>
              </LinearGradient>
            )}

            <TouchableOpacity
              onPress={() => {
                setShowPaymentPending(false);
                stopPolling();
              }}
              style={styles.modalCancelButton}
            >
              <View style={styles.modalCancelButtonGradient}>
                <Ionicons name="close" size={20} color="#64748b" />
                <Text style={styles.modalCancelText}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  mainCard: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  loadingCard: {
    backgroundColor: "#f1f5f9",
    padding: 32,
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingPlaceholders: {
    width: "100%",
    marginTop: 24,
  },
  loadingHeader: {
    height: 24,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    width: "60%",
    marginBottom: 16,
  },
  loadingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadingItem: {
    height: 120,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    width: "48%",
  },
  header: {
    padding: 24,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 16,
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 16,
  },
  activeStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  activeStatusText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    padding: 24,
    backgroundColor: "#f1f5f9",
    flex: 1,
  },
  statusCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 8,
  },
  statusPlan: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(16,185,129,0.8)",
    marginBottom: 4,
  },
  statusPrice: {
    fontSize: 14,
    color: "rgba(16,185,129,0.6)",
  },
  cancelButton: {
    backgroundColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: "rgba(239,68,68,0.3)",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#ef4444",
    fontWeight: "bold",
    fontSize: 14,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitCard: {
    width: (width - 80) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitCardShadow: {
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  benefitGradient: {
    padding: 20,
    backgroundColor: "transparent",
  },
  benefitIcon: {
    marginBottom: 12,
  },
  benefitIconGradient: {
    marginBottom: 16,
  },
  benefitIconInner: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  benefitDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  upgradeHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  upgradeIconContainer: {
    marginBottom: 16,
  },
  upgradeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  upgradeSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  upgradePrice: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  paymentSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  paymentMethod: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  paymentMethodSelected: {
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  paymentMethodInner: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748b",
  },
  paymentMethodTextSelected: {
    color: "#0f172a",
  },
  phoneInputSection: {
    marginBottom: 24,
  },
  phoneInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  phoneInputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
  },
  phoneInputHint: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  subscribeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  stripeNote: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalSpinner: {
    marginBottom: 24,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  mpesaInstructions: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: "100%",
    borderColor: "#bbf7d0",
    borderWidth: 1,
  },
  mpesaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8,
    textAlign: "center",
  },
  mpesaText: {
    fontSize: 14,
    color: "#16a34a",
    textAlign: "center",
  },
  modalCancelButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalCancelButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
  },
  modalCancelText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default SubscriptionSettings;
