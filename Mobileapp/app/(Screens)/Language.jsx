/* eslint-disable no-unused-vars */
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../Context/ThemeProvider";
import { changeLanguage } from "../../i18n";

const { width } = Dimensions.get("window");

const Language = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const { theme, themeStyles } = useTheme();
  const isDark = theme === "dark";

  const languages = [
    {
      lang: "en",
      label: "English",
      description: "International business language",
      region: "Global",
      flag: "🌍",
      speakers: "1.5B+ speakers",
    },
    {
      lang: "kis",
      label: "Kiswahili",
      description: "East African cultural language",
      region: "East Africa",
      flag: "🦁",
      speakers: "100M+ speakers",
    },
    {
      lang: "ar",
      label: "العربية / Juba Arabic",
      description: "North African cultural language",
      region: "North Africa",
      flag: "☪️",
      speakers: "400M+ speakers",
    },
    {
      lang: "src",
      label: "Arabic",
      description: "Middle Eastern language",
      region: "Middle East",
      flag: "🕌",
      speakers: "300M+ speakers",
    },
    {
      lang: "br",
      label: "Bari",
      description: "South Sudanese language",
      region: "South Sudan",
      flag: "🏛️",
      speakers: "1M+ speakers",
    },
    {
      lang: "nr",
      label: "Neur",
      description: "Nilotic language",
      region: "South Sudan",
      flag: "🌾",
      speakers: "800K+ speakers",
    },
    {
      lang: "dk",
      label: "Dinka",
      description: "Largest ethnic group language",
      region: "South Sudan",
      flag: "🐄",
      speakers: "2M+ speakers",
    },
  ];

  const [availableLanguages, setAvailableLanguages] = useState(
    languages.slice(0, 3)
  );

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem("selectedLanguage");
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    };
    loadLanguage();
  }, []);

  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
    setSelectedLanguage(lang);
    await AsyncStorage.setItem("selectedLanguage", lang);

    // Show success alert
    const langInfo = languages.find((l) => l.lang === lang);
    Alert.alert(
      "Language Updated",
      `Now browsing in ${langInfo?.label || lang}`,
      [{ text: "OK" }]
    );
  };

  const toggleAllLanguages = () => {
    setShowAllLanguages(!showAllLanguages);
    setAvailableLanguages(showAllLanguages ? languages.slice(0, 3) : languages);
  };

  // Responsive styles
  const titleFontSize = width < 350 ? 24 : 28;
  const subtitleFontSize = width < 350 ? 18 : 20;
  const bodyFontSize = width < 350 ? 14 : 16;
  const labelFontSize = width < 350 ? 16 : 18;
  const itemPadding = width < 350 ? 12 : 16;
  const itemMarginBottom = width < 350 ? 8 : 12;
  const iconSize = width < 350 ? 20 : 24;

  const currentLanguage =
    languages.find((l) => l.lang === selectedLanguage) || languages[0];

  const stats = [
    { value: "7+", label: "Languages", color: "#d97706" },
    { value: "54", label: "African Nations", color: "#059669" },
    { value: "100%", label: "Translation Accuracy", color: "#2563eb" },
    { value: "24/7", label: "Language Support", color: "#dc2626" },
  ];

  const benefits = [
    {
      icon: "🏆",
      title: "Cultural Accuracy",
      description: "Authentic translations for African products",
      color: "#d97706",
    },
    {
      icon: "🛡️",
      title: "Local Support",
      description: "Native speakers for customer service",
      color: "#059669",
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Accessible across all African regions",
      color: "#2563eb",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="keyboard-arrow-left" size={32} color="#f59e0b" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
          Language Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <LinearGradient
          colors={["#1e293b", "#334155", "#475569"]}
          style={styles.heroSection}
        >
          <View style={styles.premiumBadge}>
            <Text style={styles.badgeText}>🌐 Cultural Experience ✨</Text>
          </View>

          <Text style={[styles.heroTitle, { fontSize: titleFontSize + 4 }]}>
            <Text style={styles.gradientText}>Language Settings</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: titleFontSize - 4 }]}>
            African Cultural Interface
          </Text>

          <Text style={[styles.heroDescription, { fontSize: bodyFontSize }]}>
            Experience Nile Flow in your preferred language. Choose from our
            supported African and international languages for a personalized
            shopping experience.
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

        {/* Current Language Indicator */}
        <View style={styles.currentLanguageSection}>
          <LinearGradient
            colors={["rgba(217, 119, 6, 0.3)", "rgba(245, 158, 11, 0.2)"]}
            style={styles.currentLanguageCard}
          >
            <View style={styles.currentLanguageContent}>
              <View style={styles.currentLanguageHeader}>
                <View style={styles.currentLanguageIcon}>
                  <MaterialIcons name="language" size={32} color="white" />
                </View>
                <View style={styles.currentLanguageInfo}>
                  <Text
                    style={[
                      styles.currentLanguageLabel,
                      { fontSize: bodyFontSize - 2 },
                    ]}
                  >
                    Currently Browsing In
                  </Text>
                  <View style={styles.currentLanguageName}>
                    <Text style={styles.currentLanguageFlag}>
                      {currentLanguage.flag}
                    </Text>
                    <Text
                      style={[
                        styles.currentLanguageTitle,
                        { fontSize: subtitleFontSize },
                      ]}
                    >
                      {currentLanguage.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.currentLanguageDescription,
                      { fontSize: bodyFontSize - 2 },
                    ]}
                  >
                    {currentLanguage.description}
                  </Text>
                </View>
              </View>
              <View style={styles.activeIndicator}>
                <MaterialIcons name="volume-up" size={16} color="#10b981" />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        {/* Language Selection */}
        <View style={styles.languageSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text
                style={[styles.sectionTitle, { fontSize: subtitleFontSize }]}
              >
                Available Languages
              </Text>
              <Text
                style={[styles.sectionSubtitle, { fontSize: bodyFontSize }]}
              >
                Select your preferred browsing language
              </Text>
            </View>
            <MaterialIcons name="public" size={32} color="#f59e0b" />
          </View>

          {/* Languages List */}
          <View style={styles.languagesList}>
            {availableLanguages.map((language) => {
              const isSelected = selectedLanguage === language.lang;
              return (
                <Pressable
                  key={language.lang}
                  onPress={() => handleLanguageChange(language.lang)}
                  style={[
                    styles.languageCard,
                    isSelected && styles.languageCardSelected,
                  ]}
                  android_ripple={{ color: "#f59e0b" }}
                >
                  {isSelected && (
                    <View style={styles.selectionIndicator}>
                      <AntDesign name="check" size={20} color="white" />
                    </View>
                  )}

                  {/* Language Flag and Info */}
                  <View style={styles.languageContent}>
                    <View
                      style={[
                        styles.languageFlag,
                        isSelected && styles.languageFlagSelected,
                      ]}
                    >
                      <Text style={styles.flagEmoji}>{language.flag}</Text>
                    </View>
                    <View style={styles.languageInfo}>
                      <View style={styles.languageNameContainer}>
                        <Text
                          style={[
                            styles.languageName,
                            { fontSize: labelFontSize },
                            isSelected && styles.languageNameSelected,
                          ]}
                        >
                          {language.label}
                        </Text>
                        {language.lang === "en" && (
                          <View style={styles.defaultBadge}>
                            <MaterialIcons
                              name="star"
                              size={12}
                              color="#f59e0b"
                            />
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.languageDescription,
                          { fontSize: bodyFontSize - 2 },
                        ]}
                      >
                        {language.description}
                      </Text>
                    </View>
                  </View>

                  {/* Language Details */}
                  <View style={styles.languageDetails}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="people" size={16} color="#f59e0b" />
                      <Text
                        style={[
                          styles.detailText,
                          { fontSize: bodyFontSize - 3 },
                        ]}
                      >
                        {language.speakers}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons
                        name="location-on"
                        size={16}
                        color="#10b981"
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { fontSize: bodyFontSize - 3 },
                        ]}
                      >
                        {language.region}
                      </Text>
                    </View>
                  </View>

                  {/* Hover Arrow */}
                  <View
                    style={[
                      styles.arrowIndicator,
                      isSelected && styles.arrowIndicatorVisible,
                    ]}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-right"
                      size={20}
                      color="#f59e0b"
                    />
                  </View>

                  {/* Selection Glow */}
                  {isSelected && <View style={styles.selectionGlow} />}
                </Pressable>
              );
            })}
          </View>

          {/* View More Button */}
          <View style={styles.viewMoreContainer}>
            <TouchableOpacity
              onPress={toggleAllLanguages}
              style={styles.viewMoreButton}
            >
              <Text style={[styles.viewMoreText, { fontSize: bodyFontSize }]}>
                {showAllLanguages
                  ? "Show Less Languages"
                  : "Show All African Languages"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={20}
                color="#f59e0b"
                style={[
                  styles.viewMoreIcon,
                  showAllLanguages && { transform: [{ rotate: "90deg" }] },
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Language Benefits */}
          <View style={styles.benefitsSection}>
            <Text
              style={[styles.benefitsTitle, { fontSize: subtitleFontSize }]}
            >
              Language Benefits
            </Text>
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitCard}>
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                  <Text
                    style={[styles.benefitTitle, { fontSize: bodyFontSize }]}
                  >
                    {benefit.title}
                  </Text>
                  <Text
                    style={[
                      styles.benefitDescription,
                      { fontSize: bodyFontSize - 2 },
                    ]}
                  >
                    {benefit.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Language Assistance */}
        <LinearGradient
          colors={["rgba(5, 150, 105, 0.2)", "rgba(16, 185, 129, 0.1)"]}
          style={styles.assistanceSection}
        >
          <View style={styles.assistanceContent}>
            <View style={styles.assistanceHeader}>
              <View style={styles.assistanceIcon}>
                <MaterialIcons name="language" size={32} color="white" />
              </View>
              <View style={styles.assistanceInfo}>
                <Text
                  style={[
                    styles.assistanceTitle,
                    { fontSize: subtitleFontSize },
                  ]}
                >
                  Need Translation Help?
                </Text>
                <Text
                  style={[
                    styles.assistanceDescription,
                    { fontSize: bodyFontSize },
                  ]}
                >
                  Our multilingual support team is here to assist you
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.assistanceButton}>
              <Text
                style={[
                  styles.assistanceButtonText,
                  { fontSize: bodyFontSize },
                ]}
              >
                Contact Language Support
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(248, 250, 252, 0.1)",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: "#f8fafc",
    fontWeight: "bold",
  },
  heroSection: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  premiumBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#f8fafc",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  gradientText: {
    color: "#f59e0b",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 16,
  },
  heroDescription: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  statCard: {
    backgroundColor: "rgba(248, 250, 252, 0.05)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
  },
  currentLanguageSection: {
    padding: 16,
  },
  currentLanguageCard: {
    borderRadius: 16,
    padding: 20,
  },
  currentLanguageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentLanguageHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currentLanguageIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(245, 158, 11, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  currentLanguageInfo: {
    flex: 1,
  },
  currentLanguageLabel: {
    color: "#cbd5e1",
    marginBottom: 4,
  },
  currentLanguageName: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentLanguageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currentLanguageTitle: {
    color: "#f8fafc",
    fontWeight: "bold",
  },
  currentLanguageDescription: {
    color: "#94a3b8",
  },
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeText: {
    color: "#10b981",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  languageSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#94a3b8",
  },
  languagesList: {
    gap: 12,
  },
  languageCard: {
    backgroundColor: "rgba(248, 250, 252, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(248, 250, 252, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  languageCardSelected: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "#f59e0b",
  },
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  languageFlag: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(248, 250, 252, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  languageFlagSelected: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },
  flagEmoji: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  languageName: {
    color: "#f8fafc",
    fontWeight: "600",
    marginRight: 8,
  },
  languageNameSelected: {
    color: "#f59e0b",
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  languageDescription: {
    color: "#94a3b8",
    lineHeight: 20,
  },
  languageDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    color: "#64748b",
    marginLeft: 4,
  },
  arrowIndicator: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    opacity: 0,
  },
  arrowIndicatorVisible: {
    opacity: 1,
  },
  selectionGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: "rgba(245, 158, 11, 0.05)",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewMoreContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 252, 0.05)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  viewMoreText: {
    color: "#f59e0b",
    fontWeight: "600",
    marginRight: 8,
  },
  viewMoreIcon: {
    transition: "transform 0.3s ease",
  },
  benefitsSection: {
    marginTop: 32,
  },
  benefitsTitle: {
    color: "#f8fafc",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  benefitsList: {
    gap: 12,
  },
  benefitCard: {
    backgroundColor: "rgba(248, 250, 252, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(248, 250, 252, 0.1)",
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  benefitTitle: {
    color: "#f8fafc",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  benefitDescription: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  assistanceSection: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  assistanceContent: {
    alignItems: "center",
  },
  assistanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  assistanceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  assistanceInfo: {
    flex: 1,
  },
  assistanceTitle: {
    color: "#f8fafc",
    fontWeight: "bold",
    marginBottom: 4,
  },
  assistanceDescription: {
    color: "#94a3b8",
  },
  assistanceButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  assistanceButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default Language;
