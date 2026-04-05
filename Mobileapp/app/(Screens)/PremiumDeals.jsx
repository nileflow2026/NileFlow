/* eslint-disable no-dupe-keys */
/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
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

/**
 * PremiumDeals Screen - Exclusive deals for premium members
 * Protected screen - shows upgrade CTA if not premium
 */
const PremiumDeals = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { isPremium, loading: statusLoading } = usePremiumStatus();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!statusLoading) {
      fetchDeals();
    }
  }, [statusLoading, isPremium]);

  const fetchDeals = async () => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await premiumService.getPremiumDeals();
      setDeals(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDeals();
    setRefreshing(false);
  };

  const renderDeal = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: "/(Screens)/ProductDetails",
          params: { productId: item.$id || item.id },
        })
      }
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.9)", "rgba(0, 0, 0, 0.9)"]}
        style={styles.productGradient}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.image ||
                item.images?.[0] ||
                "https://via.placeholder.com/300",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageOverlay}
          />

          {/* Premium Badge */}
          <LinearGradient
            colors={["#A855F7", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumBadge}
          >
            <Ionicons name="diamond" size={12} color="#FFF" />
            <Text style={styles.premiumText}>Premium</Text>
          </LinearGradient>

          {/* Discount Badge */}
          {item.discount && (
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </LinearGradient>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName || item.name}
          </Text>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  KES{item.originalPrice.toFixed(2)}
                </Text>
              )}
              <Text style={styles.premiumPrice}>
                KES{(item.price || 0).toFixed(2)}
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

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/(Screens)/ProductDetails",
                params: { productId: item.$id || item.id },
              })
            }
          >
            <Text style={styles.addButtonText}>View Deal</Text>
            <Ionicons name="arrow-forward" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Loading state
  if (statusLoading || loading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>Loading Premium Deals</Text>
            <Text style={styles.loadingSubtext}>
              Discovering exclusive offers...
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Non-premium user - show upgrade CTA
  if (!isPremium) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.upgradeContainer}>
          <LinearGradient
            colors={
              isDark
                ? ["rgba(168, 85, 247, 0.2)", "rgba(147, 51, 234, 0.2)"]
                : ["rgba(168, 85, 247, 0.1)", "rgba(147, 51, 234, 0.1)"]
            }
            style={styles.upgradeCard}
          >
            {/* Lock Icon */}
            <View style={styles.lockContainer}>
              <LinearGradient
                colors={["#A855F7", "#7C3AED"]}
                style={styles.lockIcon}
              >
                <Ionicons name="lock-closed" size={32} color="#FFF" />
              </LinearGradient>
            </View>

            {/* Content */}
            <Text
              style={[
                styles.upgradeTitle,
                { color: isDark ? "#FFF" : "#1F2937" },
              ]}
            >
              Premium Deals Are Members-Only
            </Text>
            <Text
              style={[
                styles.upgradeSubtitle,
                { color: isDark ? "#A3A3A3" : "#6B7280" },
              ]}
            >
              Unlock exclusive discounts, priority delivery, and 2x Nile Miles
              with Nile Premium for just{" "}
              <Text style={styles.priceHighlight}>200 Ksh/month</Text>
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitEmoji}>🏷️</Text>
                </View>
                <View style={styles.benefitText}>
                  <Text
                    style={[
                      styles.benefitTitle,
                      { color: isDark ? "#FFF" : "#1F2937" },
                    ]}
                  >
                    Up to 40% Off
                  </Text>
                  <Text
                    style={[
                      styles.benefitDesc,
                      { color: isDark ? "#A3A3A3" : "#6B7280" },
                    ]}
                  >
                    Premium-only deals
                  </Text>
                </View>
              </View>
              <View style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitEmoji}>🚀</Text>
                </View>
                <View style={styles.benefitText}>
                  <Text
                    style={[
                      styles.benefitTitle,
                      { color: isDark ? "#FFF" : "#1F2937" },
                    ]}
                  >
                    Priority Delivery
                  </Text>
                  <Text
                    style={[
                      styles.benefitDesc,
                      { color: isDark ? "#A3A3A3" : "#6B7280" },
                    ]}
                  >
                    Get it in 1-2 days
                  </Text>
                </View>
              </View>
              <View style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitEmoji}>⭐</Text>
                </View>
                <View style={styles.benefitText}>
                  <Text
                    style={[
                      styles.benefitTitle,
                      { color: isDark ? "#FFF" : "#1F2937" },
                    ]}
                  >
                    2x Miles
                  </Text>
                  <Text
                    style={[
                      styles.benefitDesc,
                      { color: isDark ? "#A3A3A3" : "#6B7280" },
                    ]}
                  >
                    Double rewards
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={() => router.push("/(Screens)/SubscriptionSettings")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#A855F7", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeButton}
              >
                <Ionicons name="diamond" size={20} color="#FFF" />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text
              style={[
                styles.finePrint,
                { color: isDark ? "#6B7280" : "#9CA3AF" },
              ]}
            >
              Try it risk-free. Cancel anytime.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    );
  }

  // Error state
  if (error) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </View>
            <Text
              style={[
                styles.errorTitle,
                { color: isDark ? "#FFF" : "#1F2937" },
              ]}
            >
              Failed to Load Premium Deals
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: isDark ? "#A3A3A3" : "#6B7280" },
              ]}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchDeals}
              style={styles.retryButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.retryGradient}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Premium user - show deals
  return (
    <View style={styles.container}>
      <FlatList
        data={deals}
        renderItem={renderDeal}
        keyExtractor={(item, index) => item.$id || item.id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]
                  : ["rgba(248, 250, 252, 0.95)", "rgba(241, 245, 249, 0.95)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerRow}>
                {/* <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#A855F7" />
                </TouchableOpacity> */}
                <View style={styles.headerInfo}>
                  <LinearGradient
                    colors={[
                      "rgba(168, 85, 247, 0.3)",
                      "rgba(147, 51, 234, 0.3)",
                    ]}
                    style={styles.premiumTag}
                  >
                    <Ionicons name="diamond" size={14} color="#A855F7" />
                    <Text style={styles.premiumTagText}>
                      Premium Collection
                    </Text>
                  </LinearGradient>

                  <Text style={styles.categoryTitle}>Premium Deals</Text>

                  <Text style={styles.categoryDescription}>
                    Discover exclusive deals only for premium members
                  </Text>
                  <Text style={styles.productCount}>
                    {deals.length} premium deals available
                  </Text>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statBadge}>
                      <Ionicons name="diamond" size={14} color="#A855F7" />
                      <Text style={styles.statText}>Premium Only</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Ionicons name="flash" size={14} color="#10B981" />
                      <Text style={styles.statText}>Priority Delivery</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.statText}>2x Miles</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Info Banner */}
            <View style={styles.infoBannerContainer}>
              <LinearGradient
                colors={["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"]}
                style={styles.infoBannerGradient}
              >
                <View style={styles.infoBannerIcon}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#10B981"
                  />
                </View>
                <View style={styles.infoBannerContent}>
                  <Text style={styles.infoBannerText}>
                    <Text style={styles.infoBannerHighlight}>
                      Premium Perk:
                    </Text>{" "}
                    All items here qualify for priority delivery and earn 2x
                    Nile Miles
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A855F7" />
              <Text style={styles.loadingText}>Loading Premium Deals...</Text>
              <Text style={styles.loadingSubtext}>
                Discovering exclusive offers for you
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>🎁</Text>
              </View>
              <Text style={styles.emptyTitle}>New Deals Coming Soon</Text>
              <Text style={styles.emptyText}>
                Check back later for exclusive premium discounts
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  premiumTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    marginBottom: 12,
    gap: 6,
  },
  premiumTagText: {
    color: "#A855F7",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#A855F7",
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: "#A855F7",
    opacity: 0.7,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    gap: 6,
  },
  statText: {
    color: "#F3F4F6",
    fontSize: 11,
  },
  infoBannerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  infoBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  infoBannerIcon: {
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFF",
  },
  infoBannerHighlight: {
    fontWeight: "bold",
    color: "#10B981",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productCard: {
    width: cardWidth,
    borderRadius: 24,
    overflow: "hidden",
  },
  productGradient: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  premiumBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  premiumText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFF",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
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
    fontWeight: "700",
    color: "#A855F7",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#D1D5DB",
    fontWeight: "600",
  },
  perksContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  // Loading states
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A855F7",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  // Upgrade CTA
  upgradeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  upgradeCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    alignItems: "center",
  },
  lockContainer: {
    marginBottom: 20,
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  upgradeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  priceHighlight: {
    fontWeight: "bold",
    color: "#F59E0B",
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  benefitEmoji: {
    fontSize: 20,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 14,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  finePrint: {
    fontSize: 12,
    textAlign: "center",
  },
  // Error state
  errorContainer: {
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  errorContent: {
    alignItems: "center",
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  retryGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  // Empty state (alternative)
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default PremiumDeals;
