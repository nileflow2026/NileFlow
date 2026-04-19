/* eslint-disable no-unused-vars */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import axiosClient from "../../api";
import {
  getCurrentUser,
  updateCurrencyRates,
} from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import i18n from "../../i18n";
import AIChat from "../components/AIChat";
import Categories from "../components/Categories";
import CurrencyUpdater from "../components/CurrencyUpdater";
import FeaturedProducts from "../components/FeaturedProducts";
import HeroCarousel from "../components/HeroCarousel";
import PremiumBanner from "../components/PremiumBanner";
import PremiumDeals from "../components/PremiumDeals";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { themeStyles, theme } = useTheme();
  const isDark = theme === "dark";

  const [categories, setCategories] = useState([i18n.t("All")]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(i18n.t("All"));
  const [selectedLanguageLabel, setSelectedLanguageLabel] = useState("English");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosClient.get("/api/customerprofile/categories");
        console.log("Categories API response:", res.data);

        // Backend returns array of category objects directly
        if (Array.isArray(res.data)) {
          // Extract category names from objects
          const categoryNames = res.data.map((cat) => cat.name);
          const cats = ["All", ...categoryNames];

          setCategories(cats);
          setCategoryData(res.data); // Store full data with images
          console.log("Categories set:", cats);
          console.log("Category data with images:", res.data);
        } else if (res.data.success && Array.isArray(res.data.categories)) {
          // Alternative format: { success: true, categories: [...] }
          const categoryNames = res.data.categories.map((cat) =>
            typeof cat === "string" ? cat : cat.name,
          );
          const cats = ["All", ...categoryNames];

          setCategories(cats);
          if (res.data.categories[0]?.img) {
            setCategoryData(res.data.categories);
          }
          console.log("Categories set:", cats);
        } else {
          console.warn("Unexpected category response format");
          setCategories(["All"]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        console.error("Error details:", err.response?.data);
        setCategories(["All"]);
      }
    };

    fetchCats();
    updateCurrencyRates(); // Update currency on mount

    const interval = setInterval(updateCurrencyRates, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
    >
      <CurrencyUpdater />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <LinearGradient
          colors={
            isDark
              ? ["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]
              : ["rgba(248, 250, 252, 0.95)", "rgba(241, 245, 249, 0.95)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          <View style={styles.greetingRow}>
            <View style={styles.profileContainer}>
              <Image
                source={{
                  uri:
                    user?.avatarUrl &&
                    typeof user.avatarUrl === "string" &&
                    user.avatarUrl.trim() !== ""
                      ? user.avatarUrl
                      : "https://fra.cloud.appwrite.io/v1/storage/buckets/692a3b700039c02fb4bc/files/695439130011158bb8af/view?project=6926c7df002fa7831d94",
                }}
                style={styles.avatar}
                onLoad={() => console.log("Home avatar loaded successfully")}
                onError={(error) => {
                  console.log("Home avatar error:", error.nativeEvent);
                }}
              />
              <View>
                <Text
                  style={[styles.greetingText, { color: themeStyles.text }]}
                >
                  Welcome, {user?.username || "Guest"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Premium Banner */}
        {/* <PremiumBanner /> */}

        {/* Categories Section */}
        <Categories
          categories={categories.map((cat) =>
            cat === "All" ? i18n.t("All") : i18n.t(cat) || cat,
          )}
          categoryData={categoryData}
          selectedCategory={i18n.t(selectedCategory)}
        />

        {/* Featured Products Section */}
        <FeaturedProducts />

        {/* Premium Deals Section */}
        <PremiumDeals />
      </ScrollView>
      {/* AI Chat Assistant - Overlay on top */}
      {/* <AIChat /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black", // Adjust based on your theme
  },
  cartButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    minWidth: 60,
    justifyContent: "center",
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  carouselContainer: {
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  homeProductItem: {
    marginRight: 12,
    alignItems: "center",
    width: 96,
  },
  homeProductImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginBottom: 6,
  },
  homeProductText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
});

export default Home;
