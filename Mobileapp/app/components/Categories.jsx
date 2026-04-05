import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const Categories = ({
  categories,
  categoryData,
  selectedCategory,
  onCategoryChange,
}) => {
  const router = useRouter();
  const cardWidth = (width - 48) / 2; // 2 columns with spacing

  const handleCategoryPress = async (category) => {
    // If category has data (img, id), navigate to category page
    const categoryObj = categoryData?.find((cat) => cat.name === category);

    if (categoryObj && categoryObj.id) {
      // Navigate to CategoryDetailsScreen with category data
      router.push({
        pathname: "/(Screens)/CategoryDetailsScreen",
        params: {
          categoryId: categoryObj.id,
          categoryName: category,
          categoryImg: categoryObj.img,
        },
      });
    }

    // Store category in memory for personalization
    await AsyncStorage.setItem("mostUsed", category);

    try {
      const stored = await AsyncStorage.getItem("categoryCounts");
      const counts = stored ? JSON.parse(stored) : {};
      counts[category] = (counts[category] || 0) + 1;
      await AsyncStorage.setItem("categoryCounts", JSON.stringify(counts));
    } catch (error) {
      console.error("Failed to update category memory:", error);
    }
  };

  // Get category icon based on name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("fashion") || name.includes("apparel"))
      return "shirt-outline";
    if (name.includes("electronic")) return "phone-portrait-outline";
    if (name.includes("home") || name.includes("kitchen"))
      return "home-outline";
    if (name.includes("beauty") || name.includes("personal"))
      return "sparkles-outline";
    if (name.includes("health") || name.includes("wellness"))
      return "fitness-outline";
    if (name.includes("local") || name.includes("market"))
      return "basket-outline";
    return "star-outline";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="apps-outline" size={24} color="#F59E0B" />
        <Text style={styles.headerText}>Shop by Category</Text>
      </View>

      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        <View style={styles.grid}>
          {categoryData && categoryData.length > 0
            ? categoryData.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleCategoryPress(cat.name)}
                  style={[styles.card, { width: cardWidth }]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["rgba(15, 23, 42, 0.8)", "rgba(30, 41, 59, 0.8)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    {/* Icon Badge */}
                    <View style={styles.iconBadge}>
                      <LinearGradient
                        colors={[
                          "rgba(245, 158, 11, 0.3)",
                          "rgba(234, 179, 8, 0.3)",
                        ]}
                        style={styles.iconBadgeGradient}
                      >
                        <Ionicons
                          name={getCategoryIcon(cat.name)}
                          size={20}
                          color="#F59E0B"
                        />
                      </LinearGradient>
                    </View>

                    {/* Image */}
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: cat.img }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.8)"]}
                        style={styles.imageOverlay}
                      />
                    </View>

                    {/* Title */}
                    <View style={styles.titleContainer}>
                      <Text style={styles.title} numberOfLines={2}>
                        {cat.name}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#F59E0B"
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            : // Fallback to text-only categories
              categories.map(
                (category) =>
                  category !== "All" && (
                    <TouchableOpacity
                      key={category}
                      onPress={() => handleCategoryPress(category)}
                      style={[styles.fallbackCard, { width: cardWidth }]}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(15, 23, 42, 0.8)",
                          "rgba(30, 41, 59, 0.8)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.fallbackGradient}
                      >
                        <Ionicons
                          name={getCategoryIcon(category)}
                          size={32}
                          color="#F59E0B"
                        />
                        <Text style={styles.fallbackTitle}>{category}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )
              )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    height: 180,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 16,
    overflow: "hidden",
  },
  iconBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  iconBadgeGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  imageContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
  },
  fallbackCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  fallbackGradient: {
    height: 120,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
});

export default Categories;
