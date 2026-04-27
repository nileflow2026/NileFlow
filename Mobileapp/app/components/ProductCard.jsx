import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../Context/CartContext_NEW";
import { useFavorites } from "../../Context/FavoritesContext";
import { fetchReviews, useGlobalContext } from "../../Context/GlobalProvider";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const ProductCard = ({
  product,
  id,
  title,
  price,
  image,
  onPress,
  premium = false,
}) => {
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [stockStatus, setStockStatus] = useState("");
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useGlobalContext();

  const productId = id || product?.$id || product?.id;
  const productData = product || {
    productName: title,
    price,
    image,
    $id: id,
    id,
  };
  const isWishlisted = isFavorite(productId);
  const { addToCart } = useCart();

  useEffect(() => {
    // If the product already has bundled rating data (from fetch-product-mobile), use it directly
    if (
      productData.totalRatings !== undefined &&
      productData.avgRating !== undefined
    ) {
      setTotalRatings(productData.totalRatings);
      setAverageRating(productData.avgRating);
      return;
    }

    const fetchReviewCount = async () => {
      try {
        const reviewsData = await fetchReviews(String(productId));

        if (!reviewsData || !Array.isArray(reviewsData)) {
          setTotalRatings(0);
          setAverageRating(0);
          return;
        }

        setTotalRatings(reviewsData.length);

        const totalRatingScore = reviewsData.reduce(
          (acc, review) => acc + (review.rating || 0),
          0,
        );
        const avgRating =
          reviewsData.length > 0 ? totalRatingScore / reviewsData.length : 0;
        setAverageRating(avgRating);
      } catch (error) {
        console.error("Failed to fetch reviews count:", error);
      }
    };

    if (productId) {
      fetchReviewCount();
    }
  }, [productId, productData.totalRatings, productData.avgRating]);

  useEffect(() => {
    const stock = productData.stock || 10;
    if (stock <= 0) {
      setStockStatus("Out of Stock");
    } else if (stock <= 5) {
      setStockStatus(`Only ${stock} left`);
    } else {
      setStockStatus("In Stock");
    }
  }, [productData.stock]);

  const handleWishlistClick = () => {
    toggleFavorite({ ...productData, $id: productId, id: productId });
  };

  const getProductGradient = (id) => {
    const gradients = [
      ["#F59E0B", "#FB923C"],
      ["#10B981", "#14B8A6"],
      ["#EF4444", "#F43F5E"],
      ["#3B82F6", "#6366F1"],
      ["#8B5CF6", "#A855F7"],
      ["#06B6D4", "#0EA5E9"],
    ];
    const hash = id
      ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 0;
    return gradients[hash % gradients.length];
  };

  const gradientColors = getProductGradient(productId);
  const stockColor =
    productData.stock <= 0
      ? ["#DC2626", "#B91C1C"]
      : productData.stock <= 5
        ? ["#F59E0B", "#D97706"]
        : ["#10B981", "#059669"];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.9)", "rgba(0, 0, 0, 0.9)"]}
        style={styles.card}
      >
        {/* Badges Container - Top Left */}
        <View style={styles.badgesContainer}>
          {productData.isOnSale && (
            <LinearGradient
              colors={["#DC2626", "#B91C1C"]}
              style={styles.badge}
            >
              <Ionicons name="flash" size={10} color="#FFF" />
              <Text style={styles.badgeText}>SALE</Text>
            </LinearGradient>
          )}

          {premium && (
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              style={styles.badge}
            >
              <Ionicons name="trophy" size={10} color="#FFF" />
              <Text style={styles.badgeText}>PREMIUM</Text>
            </LinearGradient>
          )}
        </View>

        {/* Wishlist Button - Top Right */}
        <TouchableOpacity
          onPress={handleWishlistClick}
          style={[
            styles.wishlistButton,
            isWishlisted && styles.wishlistButtonActive,
          ]}
        >
          <LinearGradient
            colors={
              isWishlisted
                ? ["#DC2626", "#EC4899"]
                : ["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]
            }
            style={StyleSheet.absoluteFill}
          />
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={16}
            color={isWishlisted ? "#FFF" : "#FCD34D"}
          />
        </TouchableOpacity>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image || productData.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageOverlay}
          />

          {/* Stock Status Badge */}
          <LinearGradient colors={stockColor} style={styles.stockBadge}>
            <Text style={styles.stockText}>{stockStatus}</Text>
          </LinearGradient>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {title || productData.productName}
          </Text>

          {premium && productData.description && (
            <Text style={styles.description} numberOfLines={2}>
              {productData.description}
            </Text>
          )}

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < averageRating ? "star" : "star-outline"}
                  size={12}
                  color={index < averageRating ? "#FCD34D" : "#6B7280"}
                />
              ))}
              <Text style={styles.ratingCount}>({totalRatings})</Text>
            </View>

            <LinearGradient
              colors={["rgba(245, 158, 11, 0.4)", "rgba(217, 119, 6, 0.3)"]}
              style={styles.ratingBadge}
            >
              <Ionicons name="star" size={10} color="#FCD34D" />
              <Text style={styles.ratingScore}>{averageRating.toFixed(1)}</Text>
            </LinearGradient>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {(() => {
                  const raw = price ?? productData.price;
                  if (raw && typeof raw === "object" && raw.displayValue) {
                    return raw.displayValue;
                  }
                  return `$${(parseFloat(raw) || 0).toFixed(2)}`;
                })()}
              </Text>
              {productData.originalPrice && (
                <View style={styles.discountContainer}>
                  <Text style={styles.originalPrice}>
                    ${(parseFloat(productData.originalPrice) || 0).toFixed(2)}
                  </Text>
                  <Text style={styles.discountBadge}>
                    {Math.round(
                      (1 - productData.price / productData.originalPrice) * 100,
                    )}
                    % OFF
                  </Text>
                </View>
              )}
            </View>
            {productData.shipping && (
              <View style={styles.shippingContainer}>
                <Ionicons name="car" size={10} color="#6EE7B7" />
                <Text style={styles.shippingText}>Free shipping</Text>
              </View>
            )}
          </View>

          {/* Features Badges */}
          {premium && (
            <View style={styles.featuresContainer}>
              <LinearGradient
                colors={["rgba(17, 24, 39, 0.5)", "rgba(0, 0, 0, 0.5)"]}
                style={styles.featureBadge}
              >
                <Ionicons name="shield-checkmark" size={10} color="#6EE7B7" />
                <Text style={styles.featureText}>Authentic</Text>
              </LinearGradient>
              <LinearGradient
                colors={["rgba(17, 24, 39, 0.5)", "rgba(0, 0, 0, 0.5)"]}
                style={styles.featureBadge}
              >
                <Ionicons name="car" size={10} color="#60A5FA" />
                <Text style={styles.featureText}>Fast Ship</Text>
              </LinearGradient>
              <LinearGradient
                colors={["rgba(17, 24, 39, 0.5)", "rgba(0, 0, 0, 0.5)"]}
                style={styles.featureBadge}
              >
                <Ionicons name="sparkles" size={10} color="#FCD34D" />
                <Text style={styles.featureText}>Premium</Text>
              </LinearGradient>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            onPress={() =>
              addToCart(
                { ...productData, $id: productId, id: productId },
                user?.id,
              )
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                premium
                  ? ["#F59E0B", "#D97706"]
                  : ["rgba(31, 41, 55, 1)", "rgba(0, 0, 0, 1)"]
              }
              style={[styles.cartButton, !premium && styles.cartButtonBorder]}
            >
              <Ionicons
                name="bag-handle"
                size={14}
                color={premium ? "#FFF" : "#FCD34D"}
              />
              <Text
                style={[
                  styles.cartButtonText,
                  !premium && styles.cartButtonTextAlt,
                ]}
              >
                Let It Flow
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Accent Line */}
        <LinearGradient
          colors={["#F59E0B", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  badgesContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  wishlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    overflow: "hidden",
  },
  wishlistButtonActive: {
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  imageContainer: {
    height: 180,
    position: "relative",
    backgroundColor: "rgba(17, 24, 39, 1)",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  stockBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  stockText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
    minHeight: 36,
  },
  description: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingCount: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    gap: 3,
  },
  ratingScore: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FCD34D",
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FCD34D",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  originalPrice: {
    fontSize: 11,
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F87171",
  },
  shippingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  shippingText: {
    fontSize: 11,
    color: "#6EE7B7",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    gap: 3,
  },
  featureText: {
    fontSize: 9,
    color: "#F3F4F6",
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  cartButtonBorder: {
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  cartButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  cartButtonTextAlt: {
    color: "#FCD34D",
  },
  accentLine: {
    height: 2,
    width: "75%",
    alignSelf: "center",
    borderRadius: 1,
  },
});

export default ProductCard;
