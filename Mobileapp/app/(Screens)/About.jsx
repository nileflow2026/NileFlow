/* eslint-disable react/no-unescaped-entities */
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const About = () => {
  // Premium African marketplace theme
  const premiumColors = {
    primary: "#fbbf24", // amber-400
    secondary: "#d97706", // amber-600
    accent: "#10b981", // emerald-500
    background: "#0f172a", // slate-900
    surface: "#1e293b", // slate-800
    text: "#f8fafc", // slate-50
    textSecondary: "#cbd5e1", // slate-300
  };

  const stats = [
    { label: "African Artisans", value: "500+", icon: "people" },
    { label: "Countries", value: "54", icon: "public" },
    { label: "Products", value: "5000+", icon: "inventory" },
    { label: "Satisfaction", value: "99%", icon: "star" },
  ];

  const values = [
    {
      icon: "favorite",
      title: "Cultural Integrity",
      description: "Preserving authentic African heritage",
    },
    {
      icon: "security",
      title: "Premium Quality",
      description: "Only the finest handpicked products",
    },
    {
      icon: "group",
      title: "Community First",
      description: "Empowering African communities",
    },
    {
      icon: "eco",
      title: "Sustainable Growth",
      description: "Ethical and eco-friendly practices",
    },
  ];

  const teamMembers = [
    {
      name: "Margaret Nasieku",
      role: "Founder & CEO",
      avatar: "👑",
      region: "East Africa",
    },
    {
      name: "David Omondi",
      role: "Head of Operations",
      avatar: "🛡️",
      region: "West Africa",
    },
    {
      name: "Amina Hassan",
      role: "Product Curator",
      avatar: "💎",
      region: "North Africa",
    },
    {
      name: "Thabo Ndlovu",
      role: "Customer Experience",
      avatar: "🌟",
      region: "Southern Africa",
    },
  ];

  const openPrivacyPolicy = () => {
    Linking.openURL("https://nileflowafrica.com/privacy-policy");
  };

  const contactSupport = () => {
    Alert.alert("Contact Support", "Choose a contact method:", [
      {
        text: "Email",
        onPress: () => Linking.openURL("mailto:support@nileflowafrica.com"),
      },
      { text: "Call", onPress: () => Linking.openURL("tel:+254703115359") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0f172a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={["rgba(251, 191, 36, 0.1)", "rgba(217, 119, 6, 0.05)"]}
              style={styles.premiumBadge}
            >
              <MaterialIcons
                name="star"
                size={18}
                color={premiumColors.primary}
              />
              <Text style={styles.badgeText}>Our Story</Text>
              <MaterialIcons name="auto-awesome" size={16} color="#fde047" />
            </LinearGradient>

            <Text style={styles.heroTitle}>
              About <Text style={styles.heroTitleAccent}>Nile Flow</Text>
            </Text>

            <Text style={styles.heroSubtitle}>Premium African Marketplace</Text>

            <Text style={styles.heroDescription}>
              We are a premium eCommerce platform dedicated to showcasing
              authentic African products to the world. Our mission is to bridge
              the gap between African artisans and global consumers while
              preserving cultural heritage.
            </Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <LinearGradient
                  key={index}
                  colors={
                    index % 2 === 0
                      ? ["rgba(251, 191, 36, 0.1)", "rgba(0, 0, 0, 0.1)"]
                      : ["rgba(16, 185, 129, 0.1)", "rgba(0, 0, 0, 0.1)"]
                  }
                  style={styles.statCard}
                >
                  <MaterialIcons
                    name={stat.icon}
                    size={20}
                    color={
                      index % 2 === 0
                        ? premiumColors.primary
                        : premiumColors.accent
                    }
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Mission & Vision */}
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={["rgba(251, 191, 36, 0.1)", "rgba(0, 0, 0, 0.1)"]}
              style={styles.missionCard}
            >
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={[premiumColors.primary, premiumColors.secondary]}
                  style={styles.sectionIcon}
                >
                  <MaterialIcons name="my-location" size={20} color="white" />
                </LinearGradient>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Our Mission</Text>
                  <Text style={styles.sectionSubtitle}>
                    Defining African excellence
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionDescription}>
                To create the world's premier marketplace for authentic African
                products, connecting talented artisans with discerning global
                customers while preserving Africa's rich cultural heritage.
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(16, 185, 129, 0.1)", "rgba(0, 0, 0, 0.1)"]}
              style={styles.visionCard}
            >
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={[premiumColors.accent, "#059669"]}
                  style={styles.sectionIcon}
                >
                  <MaterialIcons name="visibility" size={20} color="white" />
                </LinearGradient>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Our Vision</Text>
                  <Text style={styles.sectionSubtitle}>
                    The future of African commerce
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionDescription}>
                To become the global standard for African eCommerce, where every
                purchase tells a story of craftsmanship, heritage, and quality
                worldwide.
              </Text>
            </LinearGradient>
          </View>

          {/* Core Values */}
          <View style={styles.sectionContainer}>
            <Text style={styles.mainSectionTitle}>Our Core Values</Text>
            <Text style={styles.mainSectionSubtitle}>
              The principles that guide everything we do at Nile Flow
            </Text>

            <View style={styles.valuesGrid}>
              {values.map((value, index) => (
                <LinearGradient
                  key={index}
                  colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                  style={styles.valueCard}
                >
                  <LinearGradient
                    colors={[
                      `${premiumColors.primary}20`,
                      `${premiumColors.secondary}20`,
                    ]}
                    style={styles.valueIcon}
                  >
                    <MaterialIcons
                      name={value.icon}
                      size={20}
                      color={premiumColors.primary}
                    />
                  </LinearGradient>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.valueDescription}>
                    {value.description}
                  </Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Leadership Team */}
          <View style={styles.sectionContainer}>
            <Text style={styles.mainSectionTitle}>Our Leadership Team</Text>
            <Text style={styles.mainSectionSubtitle}>
              Passionate individuals from across Africa, united by a shared
              vision
            </Text>

            <View style={styles.teamGrid}>
              {teamMembers.map((member, index) => (
                <LinearGradient
                  key={index}
                  colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                  style={styles.teamCard}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarEmoji}>
                      {member.avatar}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <LinearGradient
                    colors={["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.5)"]}
                    style={styles.memberRegion}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={12}
                      color={premiumColors.accent}
                    />
                    <Text style={styles.memberRegionText}>{member.region}</Text>
                  </LinearGradient>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.mainSectionTitle}>Contact Information</Text>
            <Text style={styles.mainSectionSubtitle}>
              Get in touch with our premium support team
            </Text>

            <View style={styles.contactGrid}>
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() =>
                  Linking.openURL("mailto:support@nileflowafrica.com")
                }
              >
                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                  style={styles.contactCardInner}
                >
                  <LinearGradient
                    colors={["#3b82f6", "#1d4ed8"]}
                    style={styles.contactIcon}
                  >
                    <MaterialIcons name="email" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactValue}>
                    support@nileflowafrica.com
                  </Text>
                  <Text style={styles.contactDescription}>
                    24/7 Premium Support
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => Linking.openURL("tel:+254703115359")}
              >
                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                  style={styles.contactCardInner}
                >
                  <LinearGradient
                    colors={[premiumColors.accent, "#059669"]}
                    style={styles.contactIcon}
                  >
                    <MaterialIcons name="phone" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.contactTitle}>Phone Support</Text>
                  <Text style={styles.contactValue}>+254 703 115 359</Text>
                  <Text style={styles.contactDescription}>Available 24/7</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.contactCard}>
                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                  style={styles.contactCardInner}
                >
                  <LinearGradient
                    colors={["#ef4444", "#dc2626"]}
                    style={styles.contactIcon}
                  >
                    <MaterialIcons name="location-on" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.contactTitle}>Headquarters</Text>
                  <Text style={styles.contactValue}>Nairobi, Kenya</Text>
                  <Text style={styles.contactDescription}>
                    Premium Showroom
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* App Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.mainSectionTitle}>App Information</Text>
            <Text style={styles.mainSectionSubtitle}>
              Details about your premium experience
            </Text>

            <View style={styles.appInfoGrid}>
              <LinearGradient
                colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                style={styles.appInfoCard}
              >
                <View style={styles.appInfoHeader}>
                  <MaterialIcons
                    name="diamond"
                    size={24}
                    color={premiumColors.primary}
                  />
                  <View style={styles.appInfoHeaderText}>
                    <Text style={styles.appInfoTitle}>App Version</Text>
                    <Text style={styles.appInfoSubtitle}>Premium Edition</Text>
                  </View>
                </View>
                <LinearGradient
                  colors={[
                    `${premiumColors.primary}40`,
                    `${premiumColors.secondary}30`,
                  ]}
                  style={styles.versionBadge}
                >
                  <Text style={styles.versionText}>
                    v{Constants.expoConfig?.version || "1.5.2"}
                  </Text>
                </LinearGradient>
              </LinearGradient>

              <TouchableOpacity
                style={styles.appInfoCard}
                onPress={openPrivacyPolicy}
              >
                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                  style={styles.appInfoCardInner}
                >
                  <View style={styles.appInfoHeader}>
                    <MaterialIcons
                      name="security"
                      size={24}
                      color={premiumColors.accent}
                    />
                    <View style={styles.appInfoHeaderText}>
                      <Text style={styles.appInfoTitle}>
                        Privacy & Security
                      </Text>
                      <Text style={styles.appInfoSubtitle}>
                        Your data is protected
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.privacyLink}>View Policy →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <LinearGradient
                colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                style={styles.appInfoCard}
              >
                <View style={styles.appInfoHeader}>
                  <MaterialIcons name="trending-up" size={24} color="#3b82f6" />
                  <View style={styles.appInfoHeaderText}>
                    <Text style={styles.appInfoTitle}>Latest Update</Text>
                    <Text style={styles.appInfoSubtitle}>
                      Enhanced features
                    </Text>
                  </View>
                </View>
                <Text style={styles.updateDate}>Jan 2026</Text>
              </LinearGradient>
            </View>

            {/* App Features */}
            <LinearGradient
              colors={["rgba(30, 41, 59, 0.6)", "rgba(15, 23, 42, 0.6)"]}
              style={styles.featuresContainer}
            >
              <Text style={styles.featuresTitle}>Premium App Features</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="star" size={16} color="#fde047" />
                  <Text style={styles.featureText}>Premium Design</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons
                    name="security"
                    size={16}
                    color={premiumColors.accent}
                  />
                  <Text style={styles.featureText}>Secure Payments</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="language" size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>Multi-language</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons
                    name="flash-on"
                    size={16}
                    color={premiumColors.primary}
                  />
                  <Text style={styles.featureText}>Fast Delivery</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Final CTA */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={["rgba(251, 191, 36, 0.1)", "rgba(16, 185, 129, 0.1)"]}
              style={styles.ctaCard}
            >
              <Text style={styles.ctaTitle}>Join Our African Journey</Text>
              <Text style={styles.ctaDescription}>
                Be part of a movement that celebrates African craftsmanship and
                brings premium products to the world.
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    Alert.alert("Shop", "Redirecting to premium products...")
                  }
                >
                  <LinearGradient
                    colors={[premiumColors.primary, premiumColors.secondary]}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonText}>
                      Shop Premium Products
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={contactSupport}
                >
                  <Text style={styles.secondaryButtonText}>
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Hero Section
  heroSection: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  badgeText: {
    color: "#fbbf24",
    fontWeight: "600",
    marginHorizontal: 8,
    fontSize: 14,
  },
  heroTitle: {
    fontSize: width > 400 ? 36 : 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#f8fafc",
  },
  heroTitleAccent: {
    background: "linear-gradient(to right, #fbbf24, #fde047)",
    color: "#fbbf24",
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#fbbf24",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 4,
    textAlign: "center",
  },
  // Section Containers
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  mainSectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 8,
  },
  mainSectionSubtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 24,
  },
  // Mission & Vision Cards
  missionCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  visionCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  sectionDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    lineHeight: 24,
  },
  // Values Grid
  valuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  valueCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
    marginBottom: 8,
  },
  valueDescription: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 20,
  },
  // Team Grid
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  teamCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fbbf24",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  memberAvatarEmoji: {
    fontSize: 24,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: "#fbbf24",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  memberRegion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  memberRegionText: {
    fontSize: 12,
    color: "#10b981",
    marginLeft: 4,
  },
  // Contact Grid
  contactGrid: {
    gap: 16,
  },
  contactCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  contactCardInner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: "#fbbf24",
    fontWeight: "600",
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  // App Info Grid
  appInfoGrid: {
    gap: 16,
  },
  appInfoCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  appInfoCardInner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  appInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appInfoHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  appInfoSubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  versionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  privacyLink: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
  },
  updateDate: {
    fontSize: 14,
    color: "#3b82f6",
  },
  // Features
  featuresContainer: {
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
    marginBottom: 12,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#cbd5e1",
    marginLeft: 8,
  },
  // CTA Section
  ctaSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ctaCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButtons: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.5)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
  },
});
