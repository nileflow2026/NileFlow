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
import axiosClient from "../../api";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axiosClient.get(
        "/api/customerprofile/featured-products"
      );
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item, index }) => {
    const productGradients = [
      ["rgba(245, 158, 11, 0.2)", "rgba(251, 191, 36, 0.2)"],
      ["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"],
      ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.2)"],
      ["rgba(59, 130, 246, 0.2)", "rgba(37, 99, 235, 0.2)"],
      ["rgba(168, 85, 247, 0.2)", "rgba(147, 51, 234, 0.2)"],
      ["rgba(6, 182, 212, 0.2)", "rgba(8, 145, 178, 0.2)"],
    ];

    const gradient = productGradients[index % productGradients.length];

    return (
      <TouchableOpacity
        style={[styles.productCard, { width: cardWidth }]}
        onPress={() =>
          router.push({
            pathname: "/(Screens)/ProductDetails",
            params: { productId: item.$id || item.id },
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
          style={styles.productGradient}
        >
          {/* Featured Badge */}
          <View style={styles.featuredBadge}>
            <LinearGradient colors={gradient} style={styles.badgeGradient}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.badgeText}>Featured</Text>
            </LinearGradient>
          </View>

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image || item.images?.[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text
              style={[
                styles.productName,
                { color: isDark ? "#FFF" : "#1F2937" },
              ]}
              numberOfLines={2}
            >
              {item.productName || item.name}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {item.price ? `$${item.price.toFixed(2)}` : "Price on request"}
              </Text>
              {item.reviewCount > 0 && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {item.averageRating?.toFixed(1) || "5.0"}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Add Button */}
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => {
                // Quick add to cart functionality
                router.push({
                  pathname: "/(Screens)/ProductDetails",
                  params: { productId: item.$id || item.id },
                });
              }}
            >
              <LinearGradient
                colors={["#F59E0B", "#EAB308"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading Featured Products</Text>
          <Text style={styles.loadingSubtext}>
            Discovering premium selections...
          </Text>
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={24} color="#F59E0B" />
          <Text style={styles.headerTitle}>Featured Products</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(Screens)/Explore")}>
          <View style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products.slice(0, 6)} // Show first 6 products
        renderItem={renderProduct}
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  productGradient: {
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredBadge: {
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
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
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
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F59E0B",
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
  quickAddButton: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  addButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#F59E0B",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

export default FeaturedProducts;
