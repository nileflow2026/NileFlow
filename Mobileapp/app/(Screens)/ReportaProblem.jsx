import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Config, databases, fetchUserName, ID } from "../../Appwrite";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const ReportaProblem = () => {
  const [problemDetails, setProblemDetails] = useState("");
  const [problemType, setProblemType] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useGlobalContext();
  const { theme, themeStyles } = useTheme();
  const isDark = theme === "dark";

  const problemTypes = [
    {
      id: "technical",
      label: "Technical Issue",
      icon: "🐛",
      color: ["#d97706", "#ea580c"],
    },
    {
      id: "payment",
      label: "Payment Problem",
      icon: "⚡",
      color: ["#059669", "#047857"],
    },
    {
      id: "delivery",
      label: "Delivery Issue",
      icon: "🕐",
      color: ["#2563eb", "#1d4ed8"],
    },
    {
      id: "product",
      label: "Product Problem",
      icon: "📄",
      color: ["#7c3aed", "#6d28d9"],
    },
    {
      id: "account",
      label: "Account Issue",
      icon: "👤",
      color: ["#dc2626", "#b91c1c"],
    },
    {
      id: "other",
      label: "Other Problem",
      icon: "⚠️",
      color: ["#f59e0b", "#d97706"],
    },
  ];

  const stats = [
    { value: "1H", label: "Response Time", color: "#d97706" },
    { value: "24/7", label: "Support", color: "#dc2626" },
    { value: "100%", label: "Resolution", color: "#059669" },
    { value: "Premium", label: "Handling", color: "#2563eb" },
  ];

  const handleReportProblem = async () => {
    if (!problemDetails.trim()) {
      Alert.alert("Error", "Please enter the problem details.");
      return;
    }

    if (!problemType) {
      Alert.alert("Error", "Please select a problem type.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userName = (await fetchUserName()) || "Anonymous";
      const email = user?.email || "unknown";

      await databases.createDocument(
        Config.databaseId,
        Config.reportsCollectionId,
        ID.unique(),
        {
          problemDetails,
          problemType,
          priority,
          createdAt: new Date().toISOString(),
          userName,
          email,
        }
      );

      Alert.alert(
        "Report Submitted",
        "Thank you for reporting the problem. Our premium support team will contact you within 1 hour.",
        [
          {
            text: "OK",
            onPress: () => {
              setSubmitted(true);
              setProblemDetails("");
              setProblemType("");
              setPriority("medium");
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Failed to submit report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Contact support feature coming soon!");
  };

  const handleReportAnother = () => {
    setSubmitted(false);
    setProblemDetails("");
    setProblemType("");
    setPriority("medium");
  };

  // Responsive styles
  const titleFontSize = width < 350 ? 24 : 28;
  const subtitleFontSize = width < 350 ? 18 : 20;
  const bodyFontSize = width < 350 ? 14 : 16;
  const inputFontSize = width < 350 ? 14 : 16;
  const spacing = width < 350 ? 16 : 20;

  // Success State
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Success Hero */}
          <LinearGradient
            colors={["#064e3b", "#065f46", "#047857"]}
            style={styles.successHero}
          >
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={80} color="#10b981" />
            </View>
            <Text
              style={[styles.successTitle, { fontSize: titleFontSize + 2 }]}
            >
              Report Submitted Successfully!
            </Text>
            <Text
              style={[styles.successDescription, { fontSize: bodyFontSize }]}
            >
              Thank you for helping us improve Nile Flow. Our premium support
              team has received your report and will contact you within 1 hour.
            </Text>
          </LinearGradient>

          {/* Success Stats */}
          <View style={styles.successStats}>
            <View style={styles.successStatsGrid}>
              <View style={styles.successStatCard}>
                <MaterialIcons name="schedule" size={32} color="#f59e0b" />
                <Text
                  style={[
                    styles.successStatTitle,
                    { fontSize: subtitleFontSize - 2 },
                  ]}
                >
                  Response Time
                </Text>
                <Text
                  style={[
                    styles.successStatValue,
                    { fontSize: bodyFontSize - 2 },
                  ]}
                >
                  Within 1 Hour
                </Text>
              </View>
              <View style={styles.successStatCard}>
                <MaterialIcons name="shield" size={32} color="#10b981" />
                <Text
                  style={[
                    styles.successStatTitle,
                    { fontSize: subtitleFontSize - 2 },
                  ]}
                >
                  Priority Support
                </Text>
                <Text
                  style={[
                    styles.successStatValue,
                    { fontSize: bodyFontSize - 2 },
                  ]}
                >
                  Premium Handling
                </Text>
              </View>
              <View style={styles.successStatCard}>
                <MaterialIcons name="headset-mic" size={32} color="#3b82f6" />
                <Text
                  style={[
                    styles.successStatTitle,
                    { fontSize: subtitleFontSize - 2 },
                  ]}
                >
                  Follow-up
                </Text>
                <Text
                  style={[
                    styles.successStatValue,
                    { fontSize: bodyFontSize - 2 },
                  ]}
                >
                  24/7 Available
                </Text>
              </View>
            </View>
          </View>

          {/* Success Actions */}
          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.primarySuccessButton}
              onPress={handleReportAnother}
            >
              <LinearGradient
                colors={["#d97706", "#b45309"]}
                style={styles.primarySuccessButtonGradient}
              >
                <Text
                  style={[
                    styles.primarySuccessButtonText,
                    { fontSize: bodyFontSize },
                  ]}
                >
                  Report Another Issue
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondarySuccessButton}
              onPress={handleContactSupport}
            >
              <MaterialIcons name="headset-mic" size={20} color="#f59e0b" />
              <Text
                style={[
                  styles.secondarySuccessButtonText,
                  { fontSize: bodyFontSize },
                ]}
              >
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <LinearGradient
          colors={["#1e293b", "#334155", "#475569"]}
          style={styles.heroSection}
        >
          <View style={styles.premiumBadge}>
            <Text style={styles.badgeText}>⚠️ Premium Support 🛡️</Text>
          </View>

          <Text style={[styles.heroTitle, { fontSize: titleFontSize + 4 }]}>
            <Text style={styles.gradientText}>Report a Problem</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: titleFontSize - 4 }]}>
            Premium Issue Resolution
          </Text>

          <Text style={[styles.heroDescription, { fontSize: bodyFontSize }]}>
            Encountering an issue? Our dedicated African support team is ready
            to help. Provide details below for swift resolution.
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { borderColor: stat.color + "40" }]}
              >
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Form Header */}
          <View style={styles.formHeader}>
            <View style={styles.formHeaderIcon}>
              <MaterialIcons name="report-problem" size={32} color="#ffffff" />
            </View>
            <View style={styles.formHeaderInfo}>
              <Text
                style={[styles.formHeaderTitle, { fontSize: subtitleFontSize }]}
              >
                Describe Your Issue
              </Text>
              <Text
                style={[
                  styles.formHeaderDescription,
                  { fontSize: bodyFontSize },
                ]}
              >
                Provide detailed information for faster resolution
              </Text>
            </View>
          </View>

          {/* User Info */}
          {user && (
            <View style={styles.userInfo}>
              <View style={styles.userInfoContent}>
                <View style={styles.userIcon}>
                  <MaterialIcons name="person" size={24} color="#ffffff" />
                </View>
                <View style={styles.userDetails}>
                  <Text
                    style={[
                      styles.userInfoLabel,
                      { fontSize: bodyFontSize - 2 },
                    ]}
                  >
                    Reporting as
                  </Text>
                  <Text
                    style={[
                      styles.userName,
                      { fontSize: subtitleFontSize - 2 },
                    ]}
                  >
                    {user.name || "User"}
                  </Text>
                  <View style={styles.userEmailContainer}>
                    <MaterialIcons name="email" size={12} color="#fbbf24" />
                    <Text
                      style={[styles.userEmail, { fontSize: bodyFontSize - 3 }]}
                    >
                      {user.email || "No email"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Problem Type Selection */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { fontSize: bodyFontSize }]}>
              🐛 Problem Type
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { fontSize: bodyFontSize - 2 },
              ]}
            >
              Select the category that best describes your issue
            </Text>
            <View style={styles.problemTypeGrid}>
              {problemTypes.map((type, index) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setProblemType(type.id)}
                  style={[
                    styles.problemTypeCard,
                    problemType === type.id && styles.problemTypeCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.problemTypeIcon,
                      problemType === type.id && {
                        backgroundColor: type.color[0] + "80",
                      },
                    ]}
                  >
                    <Text style={styles.problemTypeIconText}>{type.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.problemTypeLabel,
                      { fontSize: bodyFontSize - 1 },
                      problemType === type.id &&
                        styles.problemTypeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Level */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { fontSize: bodyFontSize }]}>
              ⚡ Priority Level
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { fontSize: bodyFontSize - 2 },
              ]}
            >
              How urgent is this issue?
            </Text>
            <View style={styles.priorityGrid}>
              {["low", "medium", "high"].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setPriority(level)}
                  style={[
                    styles.priorityCard,
                    priority === level && [
                      styles.priorityCardSelected,
                      level === "high" && styles.priorityCardHigh,
                      level === "medium" && styles.priorityCardMedium,
                      level === "low" && styles.priorityCardLow,
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityLabel,
                      { fontSize: bodyFontSize },
                      priority === level && [
                        styles.priorityLabelSelected,
                        level === "high" && styles.priorityLabelHigh,
                        level === "medium" && styles.priorityLabelMedium,
                        level === "low" && styles.priorityLabelLow,
                      ],
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Problem Details */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { fontSize: bodyFontSize }]}>
              📄 Problem Details
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { fontSize: bodyFontSize - 2 },
              ]}
            >
              Please describe the issue in detail for faster resolution
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { fontSize: inputFontSize }]}
                placeholder="Describe the issue you're experiencing. Include any error messages, steps to reproduce, and what you were trying to accomplish..."
                multiline
                value={problemDetails}
                onChangeText={setProblemDetails}
                placeholderTextColor="rgba(251, 191, 36, 0.5)"
                editable={!isSubmitting}
              />
              <View style={styles.inputFooter}>
                <Text
                  style={[
                    styles.characterCount,
                    { fontSize: bodyFontSize - 3 },
                  ]}
                >
                  Character count: {problemDetails.length}/2000
                </Text>
                <View style={styles.dateContainer}>
                  <MaterialIcons name="event" size={12} color="#f59e0b" />
                  <Text
                    style={[styles.dateText, { fontSize: bodyFontSize - 3 }]}
                  >
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleReportProblem}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={
                isSubmitting ? ["#6b7280", "#4b5563"] : ["#d97706", "#b45309"]
              }
              style={styles.submitButtonGradient}
            >
              {isSubmitting ? (
                <>
                  <MaterialIcons
                    name="hourglass-empty"
                    size={20}
                    color="#ffffff"
                  />
                  <Text
                    style={[
                      styles.submitButtonText,
                      { fontSize: bodyFontSize },
                    ]}
                  >
                    Submitting Report...
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="#ffffff" />
                  <Text
                    style={[
                      styles.submitButtonText,
                      { fontSize: bodyFontSize },
                    ]}
                  >
                    Submit Report
                  </Text>
                  <Text style={styles.sparkles}>✨</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Contact Support Section */}
        <LinearGradient
          colors={["rgba(5, 150, 105, 0.2)", "rgba(16, 185, 129, 0.1)"]}
          style={styles.contactSection}
        >
          <View style={styles.contactContent}>
            <View style={styles.contactHeader}>
              <View style={styles.contactIcon}>
                <MaterialIcons name="headset-mic" size={32} color="#ffffff" />
              </View>
              <View style={styles.contactInfo}>
                <Text
                  style={[styles.contactTitle, { fontSize: subtitleFontSize }]}
                >
                  Need Immediate Assistance?
                </Text>
                <Text
                  style={[
                    styles.contactDescription,
                    { fontSize: bodyFontSize },
                  ]}
                >
                  Contact our premium African support team directly
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSupport}
            >
              <LinearGradient
                colors={["#059669", "#047857"]}
                style={styles.contactButtonGradient}
              >
                <Text
                  style={[styles.contactButtonText, { fontSize: bodyFontSize }]}
                >
                  Contact Support Team
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Bottom Stats */}
        <View style={styles.bottomStats}>
          <View style={styles.bottomStatsGrid}>
            <View style={styles.bottomStatCard}>
              <Text style={styles.bottomStatValue}>1H</Text>
              <Text style={styles.bottomStatLabel}>Response Time</Text>
            </View>
            <View style={styles.bottomStatCard}>
              <Text style={styles.bottomStatValue}>100%</Text>
              <Text style={styles.bottomStatLabel}>Resolution Rate</Text>
            </View>
            <View style={styles.bottomStatCard}>
              <Text style={styles.bottomStatValue}>24/7</Text>
              <Text style={styles.bottomStatLabel}>Premium Support</Text>
            </View>
            <View style={styles.bottomStatCard}>
              <Text style={styles.bottomStatValue}>Native</Text>
              <Text style={styles.bottomStatLabel}>African Support Team</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportaProblem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  // Hero Section Styles
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  premiumBadge: {
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.5)",
    marginBottom: 20,
  },
  badgeText: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  gradientText: {
    color: "#fbbf24",
  },
  heroSubtitle: {
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  heroDescription: {
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  statCard: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
  },
  // Form Section Styles
  formSection: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 24,
    margin: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217, 119, 6, 0.3)",
  },
  formHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(217, 119, 6, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  formHeaderInfo: {
    flex: 1,
  },
  formHeaderTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 4,
  },
  formHeaderDescription: {
    color: "rgba(251, 191, 36, 0.7)",
  },
  // User Info Styles
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217, 119, 6, 0.3)",
  },
  userInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userInfoLabel: {
    color: "#fbbf24",
    marginBottom: 4,
  },
  userName: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userEmail: {
    color: "rgba(251, 191, 36, 0.7)",
    marginLeft: 4,
  },
  // Section Container Styles
  sectionContainer: {
    padding: 20,
  },
  sectionLabel: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    color: "rgba(251, 191, 36, 0.7)",
    marginBottom: 16,
    lineHeight: 20,
  },
  // Problem Type Styles
  problemTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  problemTypeCard: {
    width: "48%",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    marginBottom: 8,
  },
  problemTypeCardSelected: {
    backgroundColor: "rgba(217, 119, 6, 0.2)",
    borderColor: "rgba(245, 158, 11, 0.5)",
  },
  problemTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(55, 65, 81, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  problemTypeIconText: {
    fontSize: 20,
  },
  problemTypeLabel: {
    color: "#fbbf24",
    textAlign: "center",
    fontWeight: "600",
  },
  problemTypeLabelSelected: {
    color: "#f59e0b",
  },
  // Priority Styles
  priorityGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  priorityCardSelected: {
    backgroundColor: "rgba(217, 119, 6, 0.2)",
  },
  priorityCardHigh: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  priorityCardMedium: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderColor: "rgba(245, 158, 11, 0.5)",
  },
  priorityCardLow: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(16, 185, 129, 0.5)",
  },
  priorityLabel: {
    color: "#fbbf24",
    fontWeight: "600",
  },
  priorityLabelSelected: {
    fontWeight: "bold",
  },
  priorityLabelHigh: {
    color: "#ef4444",
  },
  priorityLabelMedium: {
    color: "#f59e0b",
  },
  priorityLabelLow: {
    color: "#10b981",
  },
  // Input Styles
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.5)",
    borderRadius: 16,
    padding: 16,
    color: "#fbbf24",
    textAlignVertical: "top",
    minHeight: 200,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  characterCount: {
    color: "rgba(251, 191, 36, 0.5)",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "rgba(251, 191, 36, 0.5)",
    marginLeft: 4,
  },
  // Submit Button Styles
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  sparkles: {
    color: "#fef3c7",
    fontSize: 16,
  },
  // Contact Section Styles
  contactSection: {
    margin: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  contactContent: {
    alignItems: "center",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactDescription: {
    color: "rgba(16, 185, 129, 0.7)",
  },
  contactButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  contactButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  // Bottom Stats Styles
  bottomStats: {
    paddingHorizontal: 20,
  },
  bottomStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bottomStatCard: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  bottomStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fbbf24",
    marginBottom: 4,
  },
  bottomStatLabel: {
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
  },
  // Success State Styles
  successHero: {
    padding: 40,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  successDescription: {
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  successStats: {
    padding: 20,
  },
  successStatsGrid: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    gap: 20,
  },
  successStatCard: {
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  successStatTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  successStatValue: {
    color: "rgba(251, 191, 36, 0.7)",
  },
  successActions: {
    paddingHorizontal: 20,
    gap: 16,
  },
  primarySuccessButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primarySuccessButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primarySuccessButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  secondarySuccessButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  secondarySuccessButtonText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
});
