import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePremiumContext } from "../../Context/PremiumContext";
import { useTheme } from "../../Context/ThemeProvider";

const PremiumBanner = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { isPremium, loading } = usePremiumContext();
  const isDark = theme === "dark";

  // Don't show the banner to premium users
  if (loading || isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isDark
            ? ["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]
            : ["rgba(248, 250, 252, 0.95)", "rgba(241, 245, 249, 0.95)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#F59E0B", "#EAB308"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="diamond" size={24} color="#FFF" />
            </LinearGradient>
          </View>

          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#FCD34D" : "#D97706" },
                ]}
              >
                Unlock Nile Premium
              </Text>
              <MaterialCommunityIcons
                name="star-four-points"
                size={16}
                color="#F59E0B"
              />
            </View>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#E5E7EB" : "#4B5563" },
              ]}
            >
              Get 2x Nile Miles & exclusive benefits
            </Text>
          </View>
        </View>

        {/* Benefits Grid */}
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitCard}>
            <LinearGradient
              colors={["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"]}
              style={styles.benefitGradient}
            >
              <MaterialCommunityIcons name="trophy" size={20} color="#10B981" />
              <Text style={styles.benefitValue}>2x Miles</Text>
              <Text style={styles.benefitLabel}>Per Purchase</Text>
            </LinearGradient>
          </View>

          <View style={styles.benefitCard}>
            <LinearGradient
              colors={["rgba(245, 158, 11, 0.2)", "rgba(217, 119, 6, 0.2)"]}
              style={styles.benefitGradient}
            >
              <Ionicons name="flash" size={20} color="#F59E0B" />
              <Text style={styles.benefitValue}>1-2 Days</Text>
              <Text style={styles.benefitLabel}>Fast Delivery</Text>
            </LinearGradient>
          </View>

          <View style={styles.benefitCard}>
            <LinearGradient
              colors={["rgba(168, 85, 247, 0.2)", "rgba(147, 51, 234, 0.2)"]}
              style={styles.benefitGradient}
            >
              <Ionicons name="star" size={20} color="#A855F7" />
              <Text style={styles.benefitValue}>VIP</Text>
              <Text style={styles.benefitLabel}>Access</Text>
            </LinearGradient>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => router.push("/(Screens)/SubscriptionSettings")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#F59E0B", "#EAB308"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Ionicons name="gift" size={20} color="#FFF" />
            <Text style={styles.ctaText}>View Premium Benefits</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  benefitsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  benefitCard: {
    flex: 1,
  },
  benefitGradient: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  benefitValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 6,
  },
  benefitLabel: {
    fontSize: 10,
    color: "#D1D5DB",
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default PremiumBanner;
