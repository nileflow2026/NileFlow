import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import { premiumService } from "../../utils/premiumService";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const PremiumDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();
  const { isPremium, loading: statusLoading } = usePremiumStatus();
  const isDark = theme === "dark";

  const fetchPremiumDeals = async () => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await premiumService.getPremiumDeals();
      setDeals(data);
    } catch (error) {
      console.error("Failed to fetch premium deals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!statusLoading) {
      fetchPremiumDeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, statusLoading]);

  const renderDeal = ({ item, index }) => {
    const productGradients = [
      ["rgba(168, 85, 247, 0.3)", "rgba(147, 51, 234, 0.3)"],
      ["rgba(245, 158, 11, 0.3)", "rgba(251, 191, 36, 0.3)"],
      ["rgba(16, 185, 129, 0.3)", "rgba(5, 150, 105, 0.3)"],
      ["rgba(239, 68, 68, 0.3)", "rgba(220, 38, 38, 0.3)"],
      ["rgba(59, 130, 246, 0.3)", "rgba(37, 99, 235, 0.3)"],
      ["rgba(6, 182, 212, 0.3)", "rgba(8, 145, 178, 0.3)"],
    ];

    const gradient = productGradients[index % productGradients.length];

    return (
      <TouchableOpacity
        style={[styles.dealCard, { width: cardWidth }]}
        onPress={() =>
          router.push({
            pathname: "/(Screens)/ProductDetails",
            params: { item: JSON.stringify(item) },
          })
        }
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(15, 23, 42, 0.9)", "rgba(30, 41, 59, 0.9)"]
              : ["rgba(248, 250, 252, 0.9)", "rgba(241, 245, 249, 0.9)"]
          }
          style={styles.dealGradient}
        >
          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <LinearGradient colors={gradient} style={styles.badgeGradient}>
              <Ionicons name="diamond" size={12} color="#FFF" />
              <Text style={styles.badgeText}>Premium</Text>
            </LinearGradient>
          </View>

          {/* Discount Badge */}
          {item.discount && (
            <View style={styles.discountBadge}>
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.discountGradient}
              >
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </LinearGradient>
            </View>
          )}

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image || item.images?.[0] }}
              style={styles.dealImage}
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View style={styles.dealInfo}>
            <Text
              style={[styles.dealName, { color: isDark ? "#FFF" : "#1F2937" }]}
              numberOfLines={2}
            >
              {item.productName || item.name}
            </Text>

            <View style={styles.priceRow}>
              <View style={styles.priceContainer}>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ${item.originalPrice.toFixed(2)}
                  </Text>
                )}
                <Text style={styles.premiumPrice}>
                  ${(item.price || 0).toFixed(2)}
                </Text>
              </View>
              {item.reviewCount > 0 && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {item.averageRating?.toFixed(1) || "5.0"}
                  </Text>
                </View>
              )}
            </View>

            {/* Premium Perks */}
            <View style={styles.perksContainer}>
              <View style={styles.perk}>
                <Ionicons name="flash" size={10} color="#10B981" />
                <Text style={styles.perkText}>Priority</Text>
              </View>
              <View style={styles.perk}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={styles.perkText}>2x Miles</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Don't show component if not premium or if loading premium status
  if (statusLoading || (!isPremium && !loading)) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.loadingText}>Loading Premium Deals</Text>
          <Text style={styles.loadingSubtext}>
            Discovering exclusive offers...
          </Text>
        </View>
      </View>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={["#A855F7", "#7C3AED"]}
            style={styles.headerIcon}
          >
            <Ionicons name="diamond" size={20} color="#FFF" />
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Premium Deals</Text>
            <Text style={styles.headerSubtitle}>Exclusive member offers</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(Screens)/PremiumDeals")}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="arrow-forward" size={16} color="#A855F7" />
        </TouchableOpacity>
      </View>

      {/* Premium Info Banner */}
      <View style={styles.infoBanner}>
        <LinearGradient
          colors={["rgba(168, 85, 247, 0.1)", "rgba(147, 51, 234, 0.1)"]}
          style={styles.infoBannerGradient}
        >
          <View style={styles.infoBannerIcon}>
            <Ionicons name="sparkles" size={16} color="#A855F7" />
          </View>
          <Text
            style={[
              styles.infoBannerText,
              { color: isDark ? "#FFF" : "#1F2937" },
            ]}
          >
            <Text style={styles.infoBannerHighlight}>Premium Perks:</Text>{" "}
            Priority delivery + 2x Nile Miles on all items
          </Text>
        </LinearGradient>
      </View>

      {/* Deals Grid */}
      <FlatList
        data={deals.slice(0, 4)} // Show first 4 deals
        renderItem={renderDeal}
        keyExtractor={(item, index) => item.$id || item.id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#A3A3A3",
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#A855F7",
    fontWeight: "600",
  },
  infoBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.2)",
  },
  infoBannerIcon: {
    marginRight: 8,
  },
  infoBannerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  infoBannerHighlight: {
    fontWeight: "bold",
    color: "#A855F7",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dealCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  dealGradient: {
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.2)",
    borderRadius: 16,
    overflow: "hidden",
  },
  premiumBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  discountGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFF",
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealInfo: {
    padding: 12,
  },
  dealName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  premiumPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A855F7",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
  },
  perksContainer: {
    flexDirection: "row",
    gap: 8,
  },
  perk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  perkText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#A855F7",
  },
  loadingContainer: {
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A855F7",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

export default PremiumDeals;
