// components/RelatedProductCard.js
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RelatedProductCard = ({
  id,
  title,
  image,
  price,
  rating,
  totalRatings,
  onPress,
}) => {
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <MaterialIcons
        key={star}
        name={star <= rating ? "star" : "star-border"}
        size={14}
        color={star <= rating ? "#fbbf24" : "#6b7280"}
        style={{ marginRight: 2 }}
      />
    ));
  };
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
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageOverlay}
          />

          {/* Premium Badge */}
          <LinearGradient
            colors={["#f59e0b", "#d97706"]}
            style={styles.premiumBadge}
          >
            <MaterialIcons name="star" size={12} color="#fff" />
          </LinearGradient>
        </View>

        <View style={styles.productInfo}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.price}>${price.toFixed(2)}</Text>

          <View style={styles.ratingSection}>
            <View style={styles.starsContainer}>{renderStars()}</View>
            <Text style={styles.ratingCount}>({totalRatings})</Text>
          </View>

          {/* Rating Score Badge */}
          <LinearGradient
            colors={["rgba(245, 158, 11, 0.4)", "rgba(217, 119, 6, 0.3)"]}
            style={styles.ratingBadge}
          >
            <MaterialIcons name="star" size={10} color="#fbbf24" />
            <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
          </LinearGradient>
        </View>

        {/* Bottom Accent Line */}
        <LinearGradient
          colors={["#f59e0b", "#10b981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default RelatedProductCard;

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  imageContainer: {
    height: 120,
    position: "relative",
    backgroundColor: "rgba(17, 24, 39, 1)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  premiumBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    minHeight: 32,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 8,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingCount: {
    fontSize: 10,
    color: "#9ca3af",
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    gap: 3,
  },
  ratingScore: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fbbf24",
  },
  accentLine: {
    height: 2,
    width: "70%",
    alignSelf: "center",
    borderRadius: 1,
  },
});
