import { useLocalSearchParams } from "expo-router";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";
import { client, Config, databases } from "../../Appwrite";
import { useTheme } from "../../Context/ThemeProvider";

const TrackOrder = () => {
  const { orderId, estimatedDelivery, orderTime } = useLocalSearchParams();
  const [orderStatus, setOrderStatus] = useState(null);
  const { themeStyles } = useTheme();

  useEffect(() => {
    if (!orderId) return;
    const fetchInitialStatus = async () => {
      try {
        const response = await databases.getDocument(
          Config.databaseId,
          Config.orderCollectionId,
          orderId
        );
        console.log("Initial Order Status:", response);
        if (response && response.orderStatus) {
          setOrderStatus(response.orderStatus);
        }
      } catch (error) {
        console.error("Error fetching initial order status:", error);
      }
    };

    fetchInitialStatus();

    const unsubscribe = client.subscribe(
      `databases.${Config.orderCollectionId}.orders.documents.${orderId}`,
      (response) => {
        if (response.payload && response.payload.orderStatus) {
          console.log("Live Update:", response.payload.orderStatus);
          setOrderStatus(response.payload.orderStatus); // Update state dynamically
        }
      }
    );

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [orderId]);

  const trackingSteps = [
    { status: "Ordered", completed: true },
    {
      status: "Processed",
      completed:
        orderStatus === "Processed" ||
        orderStatus === "Shipped" ||
        orderStatus === "Out for Delivery" ||
        orderStatus === "Delivered",
    },
    {
      status: "Shipped",
      completed:
        orderStatus === "Shipped" ||
        orderStatus === "Out for Delivery" ||
        orderStatus === "Delivered",
    },
    {
      status: "Out for Delivery",
      completed:
        orderStatus === "Out for Delivery" || orderStatus === "Delivered",
    },
    { status: "Delivered", completed: orderStatus === "Delivered" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#0f172a" }]}>
      <View style={styles.container}>
        <Text style={styles.title}>📦 Track Your Order</Text>
        <Text className="text-yellow-600" style={styles.subtitle}>
          Order ID: {orderId}
        </Text>

        {/* Tracking Steps */}
        <FlatList
          data={trackingSteps}
          keyExtractor={(item) => item.status}
          renderItem={({ item }) => (
            <View style={styles.stepContainer}>
              <Text
                style={[styles.stepText, item.completed && styles.completed]}
              >
                {item.completed ? "✅" : "⏳"} {item.status}
              </Text>
            </View>
          )}
        />

        {/* Order Details "🚚" */}
        <View
          style={[
            styles.detailsContainer,
            { backgroundColor: themeStyles.accent2 },
          ]}
        >
          <Text style={styles.detailTitle}>🕒 Order Details</Text>
          <Text style={styles.detailText}>Order Time: {orderTime}</Text>
          <Text style={styles.detailText}>
            Estimated Delivery: {estimatedDelivery}
          </Text>
          <Text style={styles.detailText}>
            Order Status:{" "}
            <Text
              style={[
                styles.statusText,
                orderStatus === "Delivered" ? styles.delivered : styles.pending,
              ]}
            >
              {orderStatus}
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TrackOrder;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,

    marginBottom: 20,
  },
  stepContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  stepText: {
    fontSize: 16,
    color: "#000",
  },
  completed: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: 20,
    padding: 15,

    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  statusText: {
    fontWeight: "bold",
  },
  delivered: {
    color: "#4CAF50",
  },
  pending: {
    color: "#FFA500",
  },
});
