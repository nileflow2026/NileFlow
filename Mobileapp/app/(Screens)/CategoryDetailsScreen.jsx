/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axiosClient from "../../api";

import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const CategoryDetailsScreen = () => {
  const { categoryId, categoryName, categoryImg } = useLocalSearchParams();
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [products, setProducts] = useState([]); // Display filtered products
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading data for category ID:", categoryId);

      // 1. Load category details
      const categoryResponse = await axiosClient.get(
        `/api/customerprofile/categories/${categoryId}`,
      );
      setCategoryDetails(categoryResponse.data);
      console.log("Category Details:", categoryResponse.data);

      // 2. Load subcategories
      const subResponse = await axiosClient.get(
        `/api/products/categories/${categoryId}/subcategories`,
      );
      const allSubcategories = subResponse.data.subcategories || [];
      const filteredSubcategories = allSubcategories.filter(
        (sub) => sub.name.toLowerCase() !== "all products",
      );
      setSubcategories(filteredSubcategories);
      console.log("Filtered Subcategories:", filteredSubcategories);

      // 3. Load products — use fetch-product-mobile for currency enrichment + bundled ratings
      const productsUrl = `/api/customerprofile/fetch-product-mobile`;
      console.log("📞 Calling products endpoint:", productsUrl);

      const productsResponse = await axiosClient.get(productsUrl, {
        params: { category: categoryId, limit: 100 },
      });
      console.log("📦 Products response:", productsResponse.data);

      if (productsResponse.data.success) {
        const loadedProducts = productsResponse.data.products || [];
        setAllProducts(loadedProducts); // Store all products
        setProducts(loadedProducts); // Initially show all products
        console.log("✅ Products loaded:", loadedProducts.length);
      } else {
        console.error("❌ Products API error:", productsResponse.data.error);
        setAllProducts([]);
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subId) => {
    setSelectedSubcategory(subId);

    if (!subId) {
      // Show all products
      setProducts(allProducts);
      console.log("✅ Showing all products:", allProducts.length);
    } else {
      // Filter products by subcategory
      const filtered = allProducts.filter(
        (product) =>
          product.subcategoryId === subId || product.subcategory === subId,
      );
      setProducts(filtered);
      console.log(
        `✅ Filtered products for subcategory ${subId}:`,
        filtered.length,
      );
    }
  };

  const getCategoryGradient = (categoryName) => {
    const gradients = {
      fashion: ["#EC4899", "#F43F5E", "#EF4444"],
      electronics: ["#3B82F6", "#6366F1", "#8B5CF6"],
      home: ["#F59E0B", "#FB923C", "#FBBF24"],
      beauty: ["#D946EF", "#EC4899", "#F43F5E"],
      food: ["#10B981", "#14B8A6", "#06B6D4"],
      art: ["#8B5CF6", "#A855F7", "#D946EF"],
      default: ["#F59E0B", "#FBBF24", "#FB923C"],
    };

    const name = categoryName?.toLowerCase() || "";
    if (name.includes("fashion")) return gradients.fashion;
    if (name.includes("electronic")) return gradients.electronics;
    if (name.includes("home")) return gradients.home;
    if (name.includes("beauty")) return gradients.beauty;
    if (name.includes("food")) return gradients.food;
    if (name.includes("art")) return gradients.art;
    return gradients.default;
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: "/(Screens)/ProductDetails",
          params: { item: JSON.stringify(item) },
        })
      }
    >
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.9)", "rgba(0, 0, 0, 0.9)"]}
        style={styles.productGradient}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.image || "https://via.placeholder.com/300",
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
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumBadge}
          >
            <Ionicons name="trophy" size={12} color="#FFF" />
            <Text style={styles.premiumText}>Premium</Text>
          </LinearGradient>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price
                ? typeof item.price === "object" && item.price.displayValue
                  ? item.price.displayValue
                  : `$${(parseFloat(item.price) || 0).toFixed(2)}`
                : "Price on request"}
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

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/(Screens)/ProductDetails",
                params: { item: JSON.stringify(item) },
              })
            }
          >
            <Text style={styles.addButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item, index) => item.$id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
                <View style={styles.headerInfo}>
                  <LinearGradient
                    colors={[
                      "rgba(245, 158, 11, 0.3)",
                      "rgba(16, 185, 129, 0.3)",
                    ]}
                    style={styles.premiumTag}
                  >
                    <Ionicons name="sparkles" size={14} color="#FCD34D" />
                    <Text style={styles.premiumTagText}>
                      Premium Collection
                    </Text>
                  </LinearGradient>

                  <Text style={styles.categoryTitle} numberOfLines={2}>
                    {categoryDetails?.name || categoryName || "Loading..."}
                  </Text>

                  <Text style={styles.categoryDescription}>
                    Discover authentic{" "}
                    {(categoryDetails?.name || categoryName)?.toLowerCase() ||
                      "African"}{" "}
                    products
                  </Text>
                  <Text style={styles.productCount}>
                    {products.length} premium products available
                  </Text>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statBadge}>
                      <Ionicons name="star" size={14} color="#FCD34D" />
                      <Text style={styles.statText}>Premium Quality</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color="#6EE7B7"
                      />
                      <Text style={styles.statText}>Authentic</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Ionicons name="flash" size={14} color="#60A5FA" />
                      <Text style={styles.statText}>Fast Delivery</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Subcategories Bar */}
            {subcategories.length > 0 && (
              <View style={styles.subcategoriesSection}>
                <View style={styles.subcategoriesHeader}>
                  <Text style={styles.subcategoriesTitle}>
                    Browse Collections
                  </Text>
                  <Text style={styles.subcategoriesSubtitle}>
                    {selectedSubcategory ? "Filtered" : "All products"}
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subcategoriesScroll}
                >
                  <TouchableOpacity
                    onPress={() => handleSubcategoryClick(null)}
                    style={[
                      styles.subcategoryButton,
                      !selectedSubcategory && styles.subcategoryButtonActive,
                    ]}
                  >
                    {!selectedSubcategory && (
                      <LinearGradient
                        colors={["#F59E0B", "#D97706"]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text
                      style={[
                        styles.subcategoryText,
                        !selectedSubcategory && styles.subcategoryTextActive,
                      ]}
                    >
                      All Products ({products.length})
                    </Text>
                  </TouchableOpacity>

                  {subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.$id}
                      onPress={() => handleSubcategoryClick(sub.$id)}
                      style={[
                        styles.subcategoryButton,
                        selectedSubcategory === sub.$id &&
                          styles.subcategoryButtonActive,
                      ]}
                    >
                      {selectedSubcategory === sub.$id && (
                        <LinearGradient
                          colors={["#F59E0B", "#D97706"]}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <Text
                        style={[
                          styles.subcategoryText,
                          selectedSubcategory === sub.$id &&
                            styles.subcategoryTextActive,
                        ]}
                      >
                        {sub.name}
                      </Text>
                      <Ionicons name="flash" size={12} color="#FCD34D" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={styles.loadingText}>
                Loading Premium Products...
              </Text>
              <Text style={styles.loadingSubtext}>
                Curating authentic African treasures for you
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="bag-handle-outline" size={48} color="#F59E0B" />
              </View>
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>
                We're currently updating our collection. Check back soon!
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
    backgroundColor: "rgba(245, 158, 11, 0.1)",
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
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: 12,
    gap: 6,
  },
  premiumTagText: {
    color: "#FCD34D",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FCD34D",
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: "#FCD34D",
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
    borderColor: "rgba(245, 158, 11, 0.3)",
    gap: 6,
  },
  statText: {
    color: "#F3F4F6",
    fontSize: 11,
  },
  subcategoriesSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  subcategoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subcategoriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  subcategoriesSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  subcategoriesScroll: {
    gap: 12,
  },
  subcategoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  subcategoryButtonActive: {
    borderColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subcategoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#D1D5DB",
  },
  subcategoryTextActive: {
    color: "#FFF",
    fontWeight: "600",
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
    borderColor: "rgba(245, 158, 11, 0.3)",
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
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FCD34D",
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FCD34D",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
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
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
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
});

export default CategoryDetailsScreen;
