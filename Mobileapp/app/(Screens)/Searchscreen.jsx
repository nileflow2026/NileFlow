/* eslint-disable no-unused-vars */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProducts, saveRecentSearch } from "../../Appwrite";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import ProductCard from "../components/ProductCard";
import RecentSearches from "./RecentSearches";

const width = Dimensions.get("window").width;
const Searchscreen = () => {
  const router = useRouter();
  const { user } = useGlobalContext();
  const { themeStyles } = useTheme();
  // State to manage search-related data and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce logic to prevent excessive API calls
  const debounceTimer = useRef(null);

  const performSearch = useCallback(async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Assuming fetchProducts is an API call that returns product data
      const data = await fetchProducts("", trimmedQuery);
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    setIsTyping(text.length > 0);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(text);
    }, 500); // 500ms delay for debouncing
  };

  const handleSearchSubmit = async () => {
    const trimmedQuery = searchTerm.trim();
    if (trimmedQuery && user && user.userId) {
      // Check for both trimmed query and valid user ID
      try {
        // ✅ Corrected order: user ID first, then the query
        await saveRecentSearch(user.userId, trimmedQuery);
        console.log("Search saved successfully!");
      } catch (error) {
        console.error("Failed to save recent search:", error.message);
      }

      performSearch(trimmedQuery);
      setIsTyping(false);
    }
  };

  const handleRecentSearchSelect = (query) => {
    setSearchTerm(query);
    setIsTyping(false);
    performSearch(query);

    // It's good practice to also update the recent search list
    // This will likely move the item to the top of the list
    if (user && user.id) {
      saveRecentSearch(user.id, query).catch((err) =>
        console.error("Failed to re-save recent search:", err.message)
      );
    }
  };

  const renderProductCard = ({ item }) => (
    <ProductCard
      id={item.$id}
      price={item.price}
      image={item.image}
      brand={item.brand}
      title={
        item.productName.length > 10
          ? `${item.productName.slice(0, 15)}...`
          : item.productName
      }
      totalRatings={item.totalRatings || 0}
      rating={item.rating || 0}
      onPress={() =>
        router.push({
          pathname: "/(Screens)/ProductDetails",
          params: { item: JSON.stringify(item) },
        })
      }
    />
  );

  const renderSuggestions = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleRecentSearchSelect(item.query)}
      style={styles.suggestionItem}
    >
      <Text style={styles.suggestionText}>{item.query}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color={themeStyles.primary}
          style={styles.loadingIndicator}
        />
      );
    }

    if (isTyping && searchResults.length > 0) {
      return (
        <FlatList
          key="suggestions-list" // Add a unique key for the single-column list
          data={searchResults}
          keyExtractor={(item) => item.$id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm(item.productName);
                handleSearchSubmit();
              }}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionText}>{item.productName}</Text>
            </TouchableOpacity>
          )}
          style={{ flex: 1 }}
        />
      );
    }

    if (!isTyping && searchResults.length === 0 && searchTerm.length === 0) {
      return (
        <RecentSearches
          userId={user?.userId}
          onSearchSelect={handleRecentSearchSelect}
        />
      );
    }

    if (!isTyping && searchResults.length > 0) {
      return (
        <FlatList
          key="product-grid" // Add a unique key for the multi-column list
          data={searchResults}
          keyExtractor={(item) => item.$id.toString()}
          renderItem={renderProductCard}
          numColumns={2}
          columnWrapperStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 66 }}
          ListEmptyComponent={
            <Text style={styles.emptyResultsText}>No Results Found</Text>
          }
        />
      );
    }

    // Case for when a search was performed and yielded no results
    if (searchTerm.length > 0 && searchResults.length === 0) {
      return (
        <Text style={styles.emptyResultsText}>
          No Results Found for &quot;{searchTerm}&quot;
        </Text>
      );
    }

    return null; // Fallback
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#0f172a" }]}>
      <View style={styles.searchBarContainer}>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: themeStyles.accent2 },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={themeStyles.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, { color: themeStyles.textPrimary }]}
            placeholder="Search for products..."
            placeholderTextColor={themeStyles.textSecondary}
            value={searchTerm}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchTerm("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={themeStyles.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25, // For a nice rounded look
    paddingHorizontal: 15,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  suggestionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  suggestionText: {
    color: "#fff",
    fontSize: 16,
  },
  emptyResultsText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontSize: 16,
  },
  productGrid: {
    justifyContent: "space-between",
    paddingVertical: 10,
  },
});

export default Searchscreen;
