import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import ProductCard from "../components/ProductCard";

const CategoryScreen = () => {
  const router = useRouter();
  const { category, categoryId } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch real products from the backend for this category
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Use the category endpoint (same as Explore does for category filtering)
        // categoryId is preferred; fall back to category name if not passed
        const id = categoryId || category;
        const response = await axiosClient.get(
          `/api/customerprofile/fetch-product-mobile`,
          { params: { category: id, limit: 50 } },
        );
        const fetched = response.data?.products || [];
        setProducts(fetched);
        setSortedData(fetched);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setProducts([]);
        setSortedData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, categoryId]);

  const handleSort = (option) => {
    setSortOption(option);
    let sorted = [...products];
    if (option === "price") {
      sorted.sort((a, b) => {
        const priceA =
          typeof a.price === "object"
            ? (a.price.raw ?? 0)
            : parseFloat(a.price) || 0;
        const priceB =
          typeof b.price === "object"
            ? (b.price.raw ?? 0)
            : parseFloat(b.price) || 0;
        return priceA - priceB;
      });
    } else if (option === "brand") {
      sorted.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
    } else if (option === "rating") {
      sorted.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    }
    setSortedData(sorted);
  };

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ flex: 1, margin: 6 }}>
        <ProductCard
          product={item}
          id={item.$id}
          image={item.images?.length > 0 ? item.images[0] : item.image}
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
      </View>
    ),
    [router],
  );

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: "#0f172a" }}>
      <View className="flex-row items-center mb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="keyboard-arrow-left"
            size={45}
            color={"#2f9e44"}
          />
        </TouchableOpacity>
        <Text className="text-white text-3xl">{category}</Text>
      </View>

      {/* Sort buttons */}
      <View className="flex-row justify-around mb-4">
        {["price", "brand", "rating"].map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => handleSort(opt)}
            style={{
              padding: 10,
              backgroundColor: sortOption === opt ? "#f59e0b" : "gray",
              borderRadius: 5,
            }}
          >
            <Text className="text-white font-psemibold capitalize">
              Sort by {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#f59e0b"
            style={{ marginTop: 40 }}
          />
        ) : sortedData.length > 0 ? (
          <FlatList
            data={sortedData}
            keyExtractor={(item, index) =>
              item.$id?.toString() || index.toString()
            }
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 6 }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
        ) : (
          <Text className="text-white text-center mt-10">
            No products found in this category
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CategoryScreen;
