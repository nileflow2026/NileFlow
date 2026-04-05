/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { RecentSearches } from "../(Screens)/RecentSearches";
import { icons, images } from "../../constants";
import {
  fetchProduct,
  fetchReviews,
  getRecentSearches,
  saveRecentSearch,
  updateCurrencyRates,
  useGlobalContext,
} from "../../Context/GlobalProvider";
import i18n from "../../i18n";
import Carousel from "../components/Carousel";
import Categories from "../components/Categories";
import CurrencyUpdater from "../components/CurrencyUpdater";
import FilterModal from "../components/FilterModa";
import ProductCard from "../components/ProductCard";

const width = Dimensions.get("window").width;
const Search = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const spinValue = useRef(new Animated.Value(0)).current;
  const [dynamicPlaceholder, setDynamicPlaceholder] =
    useState("Search products...");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products); // State for filtered products
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [textResults, setTextResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false); // Loading state
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const { user } = useGlobalContext();

  let debounceTimer;
  const categories = [
    "All",
    "Accessories",
    "Jewelry",
    "Clothing",
    "Sports",
    "HomeItems",
    "Electronics",
  ];

  const limit = 10;

  const loadProducts = async (category = "All") => {
    setLoading(true);
    try {
      const data = await fetchProduct(
        category === "All" ? "" : category,
        limit,
        0,
        ""
      );
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  /*   const debouncedSearch = (query) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (query) {
          setSearchLoading(true);
          try {
            const trimmedQuery = query.trim();
            console.log("Searching for:", trimmedQuery); // Add this
            const data = await fetchProduct('', limit, 0, trimmedQuery);

          
            setTextResults(data);
          } catch (error) {
            console.error('Error fetching search results:', error);
          } finally {
            setSearchLoading(false);
          }
        } else {
          setTextResults([]);
        }
      }, 300); // 300ms debounce delay
    }; */

  const debouncedSearch = (query) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const trimmedQuery = query.trim();
      console.log("Final search query being sent:", trimmedQuery); // ✅ add this
      if (trimmedQuery) {
        setSearchLoading(true);
        try {
          await saveRecentSearch(user.$id, trimmedQuery);
          const data = await fetchProduct("", limit, 0, trimmedQuery);
          console.log("Search results from backend:", data); // ✅ add this
          setTextResults(data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        console.log("Search term empty after trim");
        setTextResults([]);
      }
    }, 300);
  };

  const handleSearch = (query) => {
    console.log("User typed:", query);
    setSearchTerm(query);
    if (query.trim()) {
      setIsSearching(true);
      debouncedSearch(query);
    } else {
      setIsSearching(false);
      setTextResults([]);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory, isSearching]);

  const getSimilarProducts = (searchResult) => {
    console.log("Finding similar products for:", searchResult);
    const lowerCaseSearch = searchResult.toLowerCase();
    return products.filter((product) => {
      const lowerCaseName = product.productName.toLowerCase();
      const lowerCaseCategory = product.category.toLowerCase();
      const lowerCaseDescription = product.description
        ? product.description.toLowerCase()
        : "";

      return (
        lowerCaseCategory === lowerCaseSearch ||
        lowerCaseName.includes(lowerCaseSearch) ||
        lowerCaseDescription.includes(lowerCaseSearch)
      );
    });
  };

  useEffect(() => {
    const fetchAllRatings = async () => {
      const ratingsData = {};

      for (const product of products) {
        if (!product.$id) continue; // Ensure the product has an ID

        try {
          // Fetch reviews for the current product
          const reviews = await fetchReviews(product.$id);

          // If reviews are successfully fetched, store the count or the reviews themselves
          ratingsData[product.$id] = reviews?.length || 0; // If reviews exist, use the count; otherwise, set it to 0
        } catch (error) {
          console.error("Error fetching reviews:", error);
          ratingsData[product.$id] = 0; // Fallback in case of an error
        }
      }

      // Set the ratings data to state after processing all products
      setRatings(ratingsData);
    };

    // Only fetch ratings if there are products
    if (products.length > 0) {
      fetchAllRatings();
    }
  }, [products]);

  useEffect(() => {
    updateCurrencyRates();

    const interval = setInterval(
      () => {
        updateCurrencyRates();
      },
      4 * 60 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  const generatePlaceholderList = (categories) => {
    if (categories.length === 0) {
      return ["Search products..."];
    }

    return categories
      .filter((cat) => cat !== "All")
      .map((cat) => `Search for ${cat}`); // Exclude "All" and format
  };

  /* ProductCard */
  const renderProductCard = ({ item }) => {
    return (
      <ProductCard
        id={item.$id}
        price={item.price}
        image={item.image}
        brand={item.brand}
        title={
          item.productName.length > 10
            ? item.productName.slice(0, 15) + "..."
            : item.productName
        }
        totalRatings={ratings[item.$id] || 0}
        rating={ratings[item.$id] || 0}
        onPress={() =>
          router.push({
            pathname: "/(Screens)/ProductDetails",
            params: { item: JSON.stringify(item) },
          })
        }
      />
    );
  };
  const indexRef = useRef(0);

  /* Caregories */
  useEffect(() => {
    const placeholderList = generatePlaceholderList(categories);

    const intervalId = setInterval(() => {
      setDynamicPlaceholder(placeholderList[indexRef.current]);
      indexRef.current = (indexRef.current + 1) % placeholderList.length; // Update indexRef.current
    }, 3000);

    return () => clearInterval(intervalId);
  }, [categories]);

  /* Loading */
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* Filtering */
  const handleFilterIconPress = () => {
    setIsFilterVisible(true);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    // Implement your actual filtering logic here based on 'filters'
    const newFilteredProducts = products.filter((product) => {
      let matchesAll = true;
      for (const key in filters) {
        if (filters.hasOwnProperty(key) && filters[key].length > 0) {
          let matchesForKey = false;
          // Example: Filtering by category
          if (key === "categories" && product.category) {
            if (filters[key].includes(product.category)) {
              matchesForKey = true;
            }
          }
          // Add more filtering logic for other filter types (brand, price, etc.)

          if (!matchesForKey) {
            matchesAll = false;
            break;
          }
        }
      }
      return matchesAll;
    });
    setFilteredProducts(newFilteredProducts);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setActiveFilters({});
    setFilteredProducts(products); // Reset to the original list
    setIsFilterVisible(false);
    // Optionally, reload products from the API
  };

  /*  useEffect(() => {
      // Call seedProducts only once when the component mounts
      seedProducts()
        .then(() => console.log('Product seeding completed.'))
        .catch((error) => console.error('Product seeding failed:', error));
    }, []); */
  const handleClearRecentSearches = () => {
    getRecentSearches([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-black h-full">
      <View style={styles.productListSection}>
        <View style={styles.headerSection}>
          <CurrencyUpdater />
          <View style={styles.inputContainer}>
            <Image source={icons.search} style={styles.icon} />
            <TextInput
              placeholder={dynamicPlaceholder}
              placeholderTextColor="gray"
              value={searchTerm}
              onChangeText={handleSearch}
              style={styles.input}
            />
          </View>

          {!isSearching && (
            <>
              <RecentSearches
                userId={user?.$id}
                onSearchSelect={(query) => {
                  setSearchTerm(query);
                  handleSearch(query);
                }}
                onClearRecentSearches={handleClearRecentSearches}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Categories
                  categories={categories}
                  onCategoryChange={setSelectedCategory}
                />
              </ScrollView>
            </>
          )}
        </View>
        {isSearching ? (
          selectedSearchResult ? (
            // Display similar products
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  padding: 10,
                }}
              >
                <TouchableOpacity
                  /* onPress={() => setSelectedSearchResult(null)} */ onPress={
                    handleFilterIconPress
                  }
                >
                  <Image source={icons.filter} style={styles.filterIcon} />
                </TouchableOpacity>
              </View>

              <FlatList
                /* data={getSimilarProducts(selectedSearchResult)} */

                data={getSimilarProducts(selectedSearchResult)}
                /* keyExtractor={(item) => item.$id.toString( )}*/
                keyExtractor={(item) => {
                  console.log("Rendering item:", item); // ✅ Add here
                  return item.$id.toString();
                }}
                renderItem={renderProductCard}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-around" }}
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 66 }}
              />

              <FilterModal
                isVisible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
                initialFilters={activeFilters} // Pass current filters for persistence
                categories={[
                  "Heels",
                  "Ankle & Bootie",
                  "Knee-High",
                  "Mid-Calf",
                  "Over-The-Knee",
                ]} // Example data
                brands={["Generic", "ZZQLM", "VOIT沃特", "ASSKLO", "Nike"]} // Example data
                // Pass other necessary filter data
              />
            </View>
          ) : searchLoading ? (
            <ActivityIndicator
              size="large"
              color="white"
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={textResults}
              keyExtractor={(item) => item.$id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedSearchResult(item.productName)}
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderColor: "#333",
                  }}
                >
                  <Text style={{ color: "white" }}>{item.productName}</Text>
                </TouchableOpacity>
              )}
              key={isSearching ? "searchList" : "productList"}
              style={{ flex: 1 }}
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", marginTop: 20, color: "#666" }}
                >
                  No Results Found
                </Text>
              }
            />
          )
        ) : loading ? (
          <View className="flex-1 bg-black h-full justify-center items-center">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon name="spinner" size={40} color="#3B82F6" />
            </Animated.View>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.$id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-around" }}
            showsHorizontalScrollIndicator={false}
            key={isSearching ? "searchList" : "productList"}
            style={{ marginBottom: 66 }}
            ListHeaderComponent={() => (
              <View>
                <View style={styles.carouselSection}>
                  {!isSearching && <Carousel products={products} />}
                </View>

                <View style={styles.titleSection}>
                  <View className="flex-row items-center bg-blue-500 px-3 py-2 rounded-lg">
                    <Image
                      source={images.image}
                      className="w-6 h-6 mr-2"
                      resizeMode="contain"
                    />
                    <Text className="text-white text-3xl font-bold">
                      {i18n.t("Our products")}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    // Styles for header section
  },
  filterIcon: {
    width: 30, // Adjust size as needed
    height: 30, // Adjust size as needed
    resizeMode: "contain", // Or 'cover'
    tintColor: "white", // Adjust color as needed
  },
  carouselSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  productListSection: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
    color: "black",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
});

export default Search;
