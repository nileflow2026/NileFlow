import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const ProductSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <Animated.View style={[styles.title, { opacity }]} />
      <Animated.View style={[styles.price, { opacity }]} />
      <Animated.View style={[styles.rating, { opacity }]} />
    </View>
  );
};

const ProductSkeletonGrid = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <ProductSkeleton key={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    width: "80%",
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 6,
  },
  price: {
    width: "40%",
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 6,
  },
  rating: {
    width: "60%",
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
});

export default ProductSkeletonGrid;
