/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePremiumContext } from "../../Context/PremiumContext";

/**
 * SubscriptionSuccess - Handles return from Stripe checkout
 * Polls subscription status until confirmed
 */
const SubscriptionSuccess = () => {
  const router = useRouter();
  const { session_id } = useLocalSearchParams();
  const { isPremium, refreshStatus } = usePremiumContext();
  const [status, setStatus] = useState("checking"); // checking, success, failed
  const [countdown, setCountdown] = useState(30);

  const sessionId = session_id;

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }

    // Poll subscription status
    let pollCount = 0;
    const maxPolls = 30; // 60 seconds total (2 second intervals) - increased for webhook delay

    const checkStatus = setInterval(async () => {
      console.log(
        `[Stripe Success] Polling subscription status... (${
          pollCount + 1
        }/${maxPolls})`
      );

      try {
        await refreshStatus();
        console.log(`[Stripe Success] Current isPremium status:`, isPremium);
      } catch (error) {
        console.error(`[Stripe Success] Error refreshing status:`, error);
      }

      pollCount++;

      // Update countdown
      setCountdown(60 - pollCount * 2);

      // Stop polling after max attempts
      if (pollCount >= maxPolls) {
        console.log("[Stripe Success] Max polls reached, stopping...");
        clearInterval(checkStatus);
        if (!isPremium) {
          console.log(
            "[Stripe Success] Still not premium, showing failed state"
          );
          setStatus("failed");
        }
      }
    }, 2000);

    return () => clearInterval(checkStatus);
  }, [sessionId, refreshStatus, isPremium]);

  // Check if premium status changed
  useEffect(() => {
    console.log(
      "[Stripe Success] isPremium changed:",
      isPremium,
      "status:",
      status
    );
    if (isPremium && status === "checking") {
      console.log(
        "[Stripe Success] Premium activated! Showing success message"
      );
      setStatus("success");

      // Redirect to profile after 3 seconds
      setTimeout(() => {
        console.log("[Stripe Success] Redirecting to profile...");
        router.push("/Profile");
      }, 3000);
    }
  }, [isPremium, status, router]);

  const AnimatedDots = () => (
    <View style={styles.animatedDots}>
      <View style={[styles.dot, styles.dot1]} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.dot, styles.dot3]} />
    </View>
  );

  const PremiumBenefit = ({ title }) => (
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
      <Text style={styles.benefitText}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Checking Status */}
      {status === "checking" && (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={["rgba(17,24,39,0.9)", "rgba(0,0,0,0.9)"]}
            style={styles.cardGradient}
          >
            <LinearGradient
              colors={["#9333ea", "#3b82f6"]}
              style={styles.statusIcon}
            >
              <ActivityIndicator size="large" color="white" />
            </LinearGradient>

            <Text style={styles.statusTitle}>Processing Your Payment</Text>
            <Text style={styles.statusSubtitle}>
              Please wait while we confirm your premium subscription...
            </Text>

            <LinearGradient
              colors={["rgba(147,51,234,0.2)", "rgba(59,130,246,0.1)"]}
              style={styles.detailsCard}
            >
              <Text style={styles.detailsTitle}>⏱️ Verifying Payment</Text>
              <Text style={styles.detailsText}>
                Stripe is confirming your payment. This can take up to 60
                seconds.
              </Text>
              <Text style={styles.countdownText}>
                Time remaining: {countdown} seconds
              </Text>
              <Text style={styles.sessionText}>
                Session ID: {sessionId?.slice(-20)}
              </Text>
            </LinearGradient>

            <AnimatedDots />
          </LinearGradient>
        </View>
      )}

      {/* Success Status */}
      {status === "success" && (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={["rgba(17,24,39,0.9)", "rgba(0,0,0,0.9)"]}
            style={styles.cardGradient}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.statusIcon}
            >
              <Ionicons name="checkmark-circle" size={48} color="white" />
            </LinearGradient>

            <Text style={styles.successTitle}>Welcome to Premium! 🎉</Text>
            <Text style={styles.statusSubtitle}>
              Your payment was successful and your premium subscription is now
              active.
            </Text>

            <LinearGradient
              colors={["rgba(16,185,129,0.3)", "rgba(5,150,105,0.2)"]}
              style={styles.benefitsCard}
            >
              <View style={styles.benefitsHeader}>
                <Ionicons name="diamond" size={24} color="#10b981" />
                <Text style={styles.benefitsTitle}>
                  Premium Benefits Unlocked
                </Text>
              </View>

              <View style={styles.benefitsList}>
                <PremiumBenefit title="2x Nile Miles on every purchase" />
                <PremiumBenefit title="Priority delivery (1-2 days)" />
                <PremiumBenefit title="Exclusive premium deals" />
                <PremiumBenefit title="24/7 priority customer support" />
              </View>
            </LinearGradient>

            <TouchableOpacity
              onPress={() => router.push("/Profile")}
              style={styles.actionButton}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>
                  Go to Your Dashboard
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.redirectText}>
              Redirecting automatically in 3 seconds...
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Failed Status */}
      {status === "failed" && (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={["rgba(17,24,39,0.9)", "rgba(0,0,0,0.9)"]}
            style={styles.cardGradient}
          >
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              style={styles.statusIcon}
            >
              <Ionicons name="close-circle" size={48} color="white" />
            </LinearGradient>

            <Text style={styles.failedTitle}>Payment Verification Failed</Text>
            <Text style={styles.statusSubtitle}>
              We couldn't verify your payment. This might be due to:
            </Text>

            <LinearGradient
              colors={["rgba(239,68,68,0.3)", "rgba(220,38,38,0.2)"]}
              style={styles.errorCard}
            >
              <View style={styles.errorList}>
                <Text style={styles.errorItem}>
                  • Stripe webhook hasn't arrived yet (can take 30-60 seconds)
                </Text>
                <Text style={styles.errorItem}>
                  • Payment was cancelled or declined
                </Text>
                <Text style={styles.errorItem}>
                  • Network connection issues
                </Text>
                <Text style={styles.errorItem}>
                  • Payment is still being processed
                </Text>
              </View>

              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailTitle}>
                  Session ID: {sessionId?.slice(-20)}
                </Text>
                <Text style={styles.errorDetailText}>
                  Check your profile in a few minutes - the subscription may
                  activate soon.
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => router.push("/Profile")}
                style={styles.primaryButton}
              >
                <LinearGradient
                  colors={["#9333ea", "#3b82f6"]}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/HelpCenter")}
                style={styles.secondaryButton}
              >
                <View style={styles.secondaryButtonInner}>
                  <Text style={styles.secondaryButtonText}>
                    Contact Support
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    minHeight: Dimensions.get("window").height - 100,
  },
  statusCard: {
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.3)",
  },
  statusIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e2e8f0",
    textAlign: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#10b981",
    textAlign: "center",
    marginBottom: 16,
  },
  failedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: "rgba(17,24,39,0.5)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.3)",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a855f7",
    marginBottom: 8,
    textAlign: "center",
  },
  detailsText: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  countdownText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
  animatedDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#a855f7",
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  benefitsCard: {
    backgroundColor: "rgba(17,24,39,0.5)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  benefitsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
    marginLeft: 12,
  },
  benefitsList: {
    alignItems: "flex-start",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#cbd5e1",
    marginLeft: 12,
    flex: 1,
  },
  errorCard: {
    backgroundColor: "rgba(17,24,39,0.5)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorList: {
    marginBottom: 16,
  },
  errorItem: {
    fontSize: 14,
    color: "#fca5a5",
    marginBottom: 8,
    lineHeight: 20,
  },
  errorDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(220,38,38,0.3)",
  },
  errorDetailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fca5a5",
    marginBottom: 8,
  },
  errorDetailText: {
    fontSize: 12,
    color: "#f87171",
    lineHeight: 18,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  actionButtons: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  secondaryButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    backgroundColor: "rgba(31,41,55,0.8)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "bold",
  },
  redirectText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});

export default SubscriptionSuccess;
