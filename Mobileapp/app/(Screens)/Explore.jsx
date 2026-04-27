/* eslint-disable no-unused-vars */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axiosClient from "../../api";
import {
  getCurrentUser,
  updateCurrencyRates,
} from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import CurrencyUpdater from "../components/CurrencyUpdater";
import ProductCard from "../components/ProductCard";

const MemoizedProductCard = React.memo(ProductCard);

const Explore = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([{ id: "all", name: "All" }]);
  const [categoryData, setCategoryData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const spinValue = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);
  // Cursor for the fetch-product-mobile endpoint (cursor-based pagination)
  const nextCursorRef = useRef(null);

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

  // Fetch all data with pagination
  const fetchAllData = useCallback(
    async (categoryId, isInitial = false, pageNum = 1) => {
      try {
        if (!isInitial && pageNum === 1) setLoading(true);

        console.log("📞 Fetching products for category ID:", categoryId);

        let freshProducts = [];

        if (categoryId === "all") {
          // Use the mobile-optimised endpoint (bundles ratings + currency)
          const params = { limit: 20 };
          if (pageNum > 1 && nextCursorRef.current) {
            params.cursor = nextCursorRef.current;
          } else {
            nextCursorRef.current = null; // reset on fresh load
          }
          const response = await axiosClient.get(
            `/api/customerprofile/fetch-product-mobile`,
            { params },
          );

          if (response.data.success) {
            freshProducts = response.data.products || [];
            nextCursorRef.current = response.data.nextCursor || null;
            // Use server-reported hasMore for accuracy
            setHasMore(response.data.hasMore ?? freshProducts.length === 20);
          }
        } else {
          // Fetch products by category ID (like the website does)
          const response = await axiosClient.get(
            `/api/customerprofile/products/category/${categoryId}`,
          );
          // Handle different response formats
          freshProducts = Array.isArray(response.data)
            ? response.data
            : response.data?.products || [];
        }

        console.log(
          "✅ Fetched",
          freshProducts.length,
          "products for category:",
          categoryId,
        );

        if (pageNum === 1) {
          setAllProducts(freshProducts);
          setProducts(freshProducts);
          setPage(1);
          setLoading(false);
        } else {
          setAllProducts((prev) => [...prev, ...freshProducts]);
          setProducts((prev) => [...prev, ...freshProducts]);
        }

        // Disable pagination for category-specific endpoint (no cursor support)
        if (categoryId !== "all") {
          setHasMore(false);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosClient.get("/api/customerprofile/categories");

        if (Array.isArray(res.data)) {
          const cats = [
            { id: "all", name: "All" },
            ...res.data.map((cat) => ({
              id: cat.$id || cat.id,
              name: cat.name,
            })),
          ];

          setCategories(cats);
          setCategoryData(res.data);
          console.log("📋 Categories loaded:", cats);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([{ id: "all", name: "All" }]);
      }
    };

    fetchCats();
    updateCurrencyRates();

    const interval = setInterval(updateCurrencyRates, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchAllData(selectedCategory, false, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when category changes
  useEffect(() => {
    const handler = setTimeout(() => {
      console.log("📁 Category changed to:", selectedCategory);
      setPage(1);
      setHasMore(true);
      setSearchQuery("");
      fetchAllData(selectedCategory, false, 1);
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setProducts(filtered);
    }
  }, [searchQuery, allProducts]);

  // Reload when focused
  useFocusEffect(
    useCallback(() => {
      const shouldRefetch =
        !lastUpdated || Date.now() - lastUpdated.getTime() > 5 * 60 * 1000;

      if (selectedCategory && shouldRefetch) {
        setPage(1);
        setHasMore(true);
        fetchAllData(selectedCategory, true, 1);
      }
      return () => {};
    }, [selectedCategory, lastUpdated, fetchAllData]),
  );

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllData(selectedCategory, false, nextPage);
    }
  }, [loadingMore, loading, hasMore, page, selectedCategory, fetchAllData]);

  const renderProductCard = useCallback(
    ({ item }) => (
      <MemoizedProductCard
        key={item.$id}
        product={item}
        id={item.$id}
        image={
          item.images && item.images.length > 0
            ? item.images[0]
            : item.image || require("../../assets/themes/default-bg.png")
        }
        price={item.price}
        title={
          item.productName && item.productName.length > 20
            ? `${item.productName.slice(0, 20)}...`
            : item.productName
        }
        onPress={() =>
          router.push({
            pathname: "/(Screens)/ProductDetails",
            params: { item: JSON.stringify(item) },
          })
        }
      />
    ),
    [router],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData(selectedCategory);
  }, [selectedCategory, fetchAllData]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Memoize categories bar only (search is separate to prevent recreation)
  const CategoriesBar = useCallback(
    () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
          >
            {selectedCategory === category.id ? (
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={styles.categoryChip}
              >
                <Text style={styles.categoryText}>{category.name}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.categoryChip, styles.categoryChipInactive]}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    ),
    [categories, selectedCategory],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <CurrencyUpdater />

      {/* Fixed Header with Search - Outside FlatList */}
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
        <View style={styles.headerRow}>
          <Ionicons name="compass" size={28} color="#F59E0B" />
          <Text style={styles.headerTitle}>Explore All Products</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            returnKeyType="search"
            blurOnSubmit={false}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item, index) =>
          item.$id?.toString() || item._id?.toString() || index.toString()
        }
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 10,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: 0,
        }}
        style={{ flex: 1, width: "100%" }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={CategoriesBar}
        ListFooterComponent={() => (
          <>
            {loadingMore && (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Icon name="spinner" size={24} color="#999" />
                <Text style={{ color: "#999", marginTop: 8 }}>
                  Loading more...
                </Text>
              </View>
            )}
            {lastUpdated && !loadingMore && (
              <Text
                style={{
                  textAlign: "center",
                  color: "#777",
                  fontSize: 12,
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
            {!hasMore && products.length > 0 && (
              <Text
                style={{
                  textAlign: "center",
                  color: "#999",
                  fontSize: 14,
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >
                No more products
              </Text>
            )}
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <Ionicons name="hourglass-outline" size={48} color="#F59E0B" />
                <Text style={styles.emptyText}>Loading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="bag-handle-outline" size={64} color="#F59E0B" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `No products found for "${searchQuery}"`
                    : "No products available"}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    onPress={() => fetchAllData(selectedCategory, false, 1)}
                  >
                    <LinearGradient
                      colors={["#F59E0B", "#D97706"]}
                      style={styles.retryButton}
                    >
                      <Text style={styles.retryText}>Retry</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    gap: 12,
  },
  searchIcon: {
    marginRight: -6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#FFF",
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  categoryChipInactive: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
  },
  categoryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#D1D5DB",
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default Explore;
