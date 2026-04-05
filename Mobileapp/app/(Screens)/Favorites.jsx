/* eslint-disable @typescript-eslint/no-unused-vars */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../../Context/FavoritesContext";

const { width } = Dimensions.get("window");

const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorites();
  console.log("Favorites data:", favorites);
  const router = useRouter();

  if (favorites.length === 0) {
    return (
      <View className="flex-1 justify-center bg-black items-center">
        <Text className="text-lg text-white font-bold">
          No Favorites added yet
        </Text>
      </View>
    );
  }

  // Responsive styles
  const imageWidth = width * 0.33;
  const imageHeight = 150;
  const itemPadding = width < 350 ? 12 : 16;
  const titleFontSize = width < 350 ? 16 : 18;
  const priceFontSize = width < 350 ? 16 : 18;

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
        <View>
          <Text className="text-white text-3xl font-psemibold items-center">
            Your Favorites
          </Text>
        </View>
      </View>
      <View>
        <FlatList
          data={favorites}
          /* keyExtractor={(item) => item.id  (item.$id ? item.id.toString() : Math.random().toString()) */
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => {
            console.log("item data:", item);
            return (
              <View
                className="flex-row items-center border-b border-gray-200"
                style={{ padding: itemPadding }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(Screens)/ProductDetails",
                      params: { item: JSON.stringify(item) },
                    })
                  }
                  className="bg-white rounded-lg mb-5"
                >
                  <Image
                    source={{ uri: item.productImage }}
                    className="rounded-3xl mr-3"
                    style={{ width: imageWidth, height: imageHeight }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View className="flex-1 pl-4 ml-5 mb-10">
                  <Text
                    className="text-white font-semibold"
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{ fontSize: titleFontSize }}
                  >
                    {item.productName}
                  </Text>
                  <Text
                    className="text-yellow-400 mt-5"
                    style={{ fontSize: priceFontSize }}
                  >
                    SSP : {item.price}.00
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Favorites;
