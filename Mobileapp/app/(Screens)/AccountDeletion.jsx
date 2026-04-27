/**
 * AccountDeletion.jsx — Mobile Screen
 * =====================================
 * Route: /AccountDeletion  (Settings → Privacy → Delete Account)
 *
 * Flow:
 *  1. Show warning + data list
 *  2. User taps "Request Deletion" → POST /api/account/deletion/send-otp
 *  3. OTP input screen
 *  4. Verify OTP → POST /api/account/deletion/request
 *  5. Status screen — shows scheduled date, cancel option
 */

import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const DATA_DELETED = [
  "Account profile & personal information",
  "Order history & cart data",
  "Saved addresses & payment methods",
  "Product reviews & ratings",
  "Notification preferences",
  "Social activity (posts, likes, follows)",
  "Loyalty points (Nile Miles)",
  "Media uploads & profile photos",
  "Device & session logs",
  "Recommendation data",
];

const GRACE_PERIOD_DAYS = 7;

// ─────────────────────────────────────────────
// OTP Input Row
// ─────────────────────────────────────────────
const OtpInputRow = ({ otp, setOtp }) => {
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpRow}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[styles.otpInput, digit ? styles.otpInputFilled : {}]}
          selectionColor="#ef4444"
          accessibilityLabel={`OTP digit ${index + 1}`}
        />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending: { label: "Pending Deletion", bg: "#7f1d1d", text: "#fca5a5" },
    processing: { label: "Processing", bg: "#1e3a5f", text: "#93c5fd" },
    completed: { label: "Completed", bg: "#064e3b", text: "#6ee7b7" },
    cancelled: { label: "Cancelled", bg: "#1e293b", text: "#94a3b8" },
    none: { label: "No Request", bg: "#1e293b", text: "#64748b" },
  };
  const c = cfg[status] || cfg.none;
  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: c.text, fontSize: 12, fontWeight: "600" }}>
        {c.label}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
const AccountDeletionScreen = () => {
  const router = useRouter();
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { theme, themeStyles } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState("form"); // form | otp | status | cancelled
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [cancelReason, setCancelReason] = useState("");

  // Pre-fill email
  useEffect(() => {
    const e = user?.email || user?.prefs?.email || "";
    if (e) setEmail(e);
  }, [user]);

  // Fetch existing status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      const userId = user?.id || user?.$id || user?.userId;
      if (!userId) return;
      try {
        const res = await axiosClient.get(
          `/api/account/deletion/status/${userId}`,
        );
        const data = res.data;
        if (
          data.status &&
          data.status !== "none" &&
          data.status !== "cancelled"
        ) {
          setStatusData(data);
          setStep("status");
        }
      } catch {
        // No existing request — stay on form
      }
    };
    fetchStatus();
  }, [user]);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await axiosClient.post(
        "/api/account/deletion/send-otp",
        { email },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      setStep("otp");
      setResendCooldown(120);
    } catch (err) {
      const data = err.response?.data || {};
      if (data.code === "OTP_RATE_LIMITED") {
        const mins = data.retryAfterMinutes || 60;
        setError(`Too many requests. Try again in ${mins} minute(s).`);
      } else {
        setError(data.error || "Failed to send code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await axiosClient.post(
        "/api/account/deletion/request",
        { email, otp: otpString },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      setStatusData(res.data);
      setStep("status");
    } catch (err) {
      const data = err.response?.data || {};
      const code = data.code;
      if (code === "OTP_INVALID") {
        const rem = data.remainingAttempts;
        setError(
          `Invalid code. ${rem > 0 ? `${rem} attempt(s) remaining.` : "No attempts left — request a new code."}`,
        );
      } else if (code === "OTP_EXPIRED") {
        setError("Code expired. Please request a new one.");
        setStep("form");
      } else if (code === "OTP_LOCKED") {
        setError("Too many attempts. Please request a new code.");
        setStep("form");
      } else if (code === "ACTIVE_ORDERS_BLOCKING") {
        Alert.alert(
          "Active Orders",
          "You have active orders in progress. Please wait for them to complete before deleting your account.",
          [{ text: "OK" }],
        );
        setStep("form");
      } else {
        setError(data.error || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await axiosClient.post(
        "/api/account/deletion/send-otp",
        { email },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      setResendCooldown(120);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel deletion ───────────────────────────────────────────────
  const handleCancelDeletion = () => {
    Alert.alert(
      "Cancel Account Deletion",
      "Are you sure you want to cancel the deletion? Your account will be fully restored.",
      [
        { text: "No, keep deleting", style: "cancel" },
        {
          text: "Yes, restore my account",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem("accessToken");
              await axiosClient.post(
                "/api/account/deletion/cancel",
                { reason: cancelReason || "User cancelled via mobile app" },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} },
              );
              setStep("cancelled");
              setStatusData(null);
            } catch (err) {
              Alert.alert(
                "Error",
                err.response?.data?.error ||
                  "Failed to cancel deletion. Please contact support.",
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ─────────────────────────────────────────────
  // Render — Form
  // ─────────────────────────────────────────────
  const renderForm = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Warning */}
      <View style={styles.warningCard}>
        <MaterialIcons name="warning" size={24} color="#ef4444" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.warningTitle}>Permanent &amp; Irreversible</Text>
          <Text style={styles.warningText}>
            Deleting your account removes all personal data after a{" "}
            {GRACE_PERIOD_DAYS}-day grace period. This cannot be undone.
          </Text>
        </View>
      </View>

      {/* Data to be deleted */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <MaterialIcons name="delete-forever" size={16} color="#ef4444" />
          {"  "}Data permanently deleted
        </Text>
        {DATA_DELETED.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <MaterialIcons name="cancel" size={14} color="#ef4444" />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Legal retention notice */}
      <View style={styles.retentionCard}>
        <MaterialIcons name="gavel" size={16} color="#f59e0b" />
        <Text style={styles.retentionText}>
          Financial records may be anonymised and retained for legal compliance.
          Your personal identity is removed from all retained data.
        </Text>
      </View>

      {/* Email input */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>Confirm your email address</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="email" size={20} color="#64748b" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#475569"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.textInput}
          />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSendOtp}
        disabled={loading || !email}
        style={[styles.deleteButton, (loading || !email) && { opacity: 0.5 }]}
      >
        <MaterialIcons name="delete-forever" size={20} color="#fff" />
        <Text style={styles.deleteButtonText}>
          {loading ? "Sending code…" : "Request Account Deletion"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        A 6-digit verification code will be sent to your email.
      </Text>
    </ScrollView>
  );

  // ─────────────────────────────────────────────
  // Render — OTP
  // ─────────────────────────────────────────────
  const renderOtp = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={styles.lockIcon}>
            <MaterialIcons name="lock" size={32} color="#ef4444" />
          </View>
          <Text style={styles.otpTitle}>Verify your identity</Text>
          <Text style={styles.otpSubtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={{ color: "#e2e8f0", fontWeight: "600" }}>{email}</Text>
          </Text>
        </View>

        <OtpInputRow otp={otp} setOtp={setOtp} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleVerifyOtp}
          disabled={loading || otp.join("").length !== 6}
          style={[
            styles.deleteButton,
            (loading || otp.join("").length !== 6) && { opacity: 0.5 },
            { marginTop: 24 },
          ]}
        >
          <MaterialIcons name="delete-forever" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>
            {loading ? "Verifying…" : "Confirm Deletion Request"}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={loading || resendCooldown > 0}
          style={[
            styles.secondaryButton,
            resendCooldown > 0 && { opacity: 0.4 },
          ]}
        >
          <MaterialIcons name="refresh" size={18} color="#94a3b8" />
          <Text style={styles.secondaryButtonText}>
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
          </Text>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity
          onPress={() => {
            setStep("form");
            setError("");
            setOtp(["", "", "", "", "", ""]);
          }}
          style={styles.secondaryButton}
        >
          <MaterialIcons name="arrow-back" size={18} color="#64748b" />
          <Text style={[styles.secondaryButtonText, { color: "#64748b" }]}>
            Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ─────────────────────────────────────────────
  // Render — Status
  // ─────────────────────────────────────────────
  const renderStatus = () => {
    if (!statusData) return null;

    const scheduledDate = statusData.scheduledDeletionDate
      ? new Date(statusData.scheduledDeletionDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const canCancel =
      statusData.status === "pending" &&
      statusData.scheduledDeletionDate &&
      new Date(statusData.scheduledDeletionDate) > new Date();

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Deletion Request</Text>
            <StatusBadge status={statusData.status} />
          </View>

          {statusData.requestedAt && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Requested</Text>
              <Text style={styles.statusValue}>
                {new Date(statusData.requestedAt).toLocaleDateString()}
              </Text>
            </View>
          )}

          {scheduledDate && statusData.status === "pending" && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Scheduled deletion</Text>
              <Text style={[styles.statusValue, { color: "#ef4444" }]}>
                {scheduledDate}
              </Text>
            </View>
          )}

          {statusData.completedAt && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Completed</Text>
              <Text style={[styles.statusValue, { color: "#6ee7b7" }]}>
                {new Date(statusData.completedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Pending notice */}
        {statusData.status === "pending" && (
          <View style={styles.pendingCard}>
            <MaterialIcons name="access-time" size={20} color="#ef4444" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.warningTitle}>Grace period active</Text>
              <Text style={styles.warningText}>
                Your account is locked and scheduled for permanent deletion on{" "}
                <Text style={{ color: "#fca5a5", fontWeight: "600" }}>
                  {scheduledDate}
                </Text>
                . You can cancel this request before that date.
              </Text>
            </View>
          </View>
        )}

        {/* Completed notice */}
        {statusData.status === "completed" && (
          <View style={styles.completedCard}>
            <MaterialIcons name="check-circle" size={20} color="#6ee7b7" />
            <Text
              style={[styles.warningText, { color: "#6ee7b7", marginLeft: 10 }]}
            >
              All personal data has been permanently removed.
            </Text>
          </View>
        )}

        {/* Legal retention note */}
        {statusData.retentionNote ? (
          <View style={styles.retentionCard}>
            <MaterialIcons name="shield" size={14} color="#f59e0b" />
            <Text style={styles.retentionText}>{statusData.retentionNote}</Text>
          </View>
        ) : null}

        {/* Cancel button */}
        {canCancel && (
          <TouchableOpacity
            onPress={handleCancelDeletion}
            disabled={loading}
            style={[
              styles.secondaryButton,
              { marginTop: 12, borderColor: "rgba(255,255,255,0.15)" },
            ]}
          >
            <MaterialIcons name="refresh" size={18} color="#94a3b8" />
            <Text style={styles.secondaryButtonText}>
              Cancel Deletion Request
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  // ─────────────────────────────────────────────
  // Render — Cancelled
  // ─────────────────────────────────────────────
  const renderCancelled = () => (
    <View style={{ alignItems: "center", paddingTop: 40 }}>
      <View style={styles.lockIcon}>
        <MaterialIcons name="check-circle" size={40} color="#6ee7b7" />
      </View>
      <Text style={[styles.otpTitle, { marginTop: 16 }]}>
        Deletion Cancelled
      </Text>
      <Text style={[styles.otpSubtitle, { marginTop: 8 }]}>
        Your account has been restored. You can continue using Nile Flow Africa
        as normal.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace("/")}
        style={[
          styles.deleteButton,
          { backgroundColor: "#059669", marginTop: 32 },
        ]}
      >
        <MaterialIcons name="home" size={20} color="#fff" />
        <Text style={styles.deleteButtonText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────
  // Layout
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e0505", "#0f172a"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#e2e8f0" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <Text style={styles.headerSubtitle}>
            Privacy &amp; Data Management
          </Text>
        </View>
        <MaterialIcons name="delete-forever" size={24} color="#ef4444" />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {step === "form" && renderForm()}
        {step === "otp" && renderOtp()}
        {step === "status" && renderStatus()}
        {step === "cancelled" && renderCancelled()}
      </View>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningTitle: {
    color: "#fca5a5",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  warningText: {
    color: "rgba(252,165,165,0.7)",
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#cbd5e1",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  listItemText: {
    color: "#94a3b8",
    fontSize: 13,
    flex: 1,
  },
  retentionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245,158,11,0.06)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  retentionText: {
    color: "rgba(245,158,11,0.7)",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 15,
  },
  errorText: {
    color: "#f87171",
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footerNote: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239,68,68,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  otpTitle: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  otpSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
  },
  otpInput: {
    width: 46,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "rgba(239,68,68,0.6)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  secondaryButtonText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  statusLabel: {
    color: "#64748b",
    fontSize: 13,
  },
  statusValue: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
  },
  pendingCard: {
    flexDirection: "row",
    backgroundColor: "rgba(239,68,68,0.06)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.06)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
});

export default AccountDeletionScreen;
