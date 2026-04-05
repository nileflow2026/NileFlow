// screens/ProductPage.js
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, View } from "react-native";

export default function ProductPage({ route }) {
  const { product } = route.params; // productId, title, basePrice
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startGroupBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.nilemart.com/api/group-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          creatorId: "CURRENT_USER_ID", // replace with auth user
          maxParticipants: 5,
          basePrice: product.price,
          priceStrategy: "tiered",
          tiers: [
            { min: 1, discount: 0.0 },
            { min: 2, discount: 0.05 },
            { min: 4, discount: 0.12 },
            { min: 6, discount: 0.2 },
          ],
        }),
      });
      const order = await res.json();
      router.push({
        pathname: "/GroupOrderPage",
        params: { orderId: order.$id },
      });
    } catch (_err) {
      Alert.alert("Error", "Failed to start group order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold">{product.title}</Text>
      <Text className="text-lg mt-2">${product.price}</Text>

      <Button
        title={loading ? "Starting..." : "Start Group Buy"}
        onPress={startGroupBuy}
        disabled={loading}
      />
    </View>
  );
}
