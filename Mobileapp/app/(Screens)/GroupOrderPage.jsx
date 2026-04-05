/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// screens/GroupOrderPage.js
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Text, View } from "react-native";
import axiosClient from "../../api";
import { client, Config } from "../../Appwrite";
import { useGlobalContext } from "../../Context/GlobalProvider";
import CountdownTimer from "../components/CountdownTimer";
import ParticipantList from "../components/ParticipantList";
import ShareButton from "../components/ShareButton";

export default function GroupOrderPage() {
  const { orderId } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef({ attempt: 0, timer: null });
  const currentUserId = user?.$id || user?.userId || null;

  // Fetch initial document
  const fetchOrder = async () => {
    try {
      const res = await axiosClient.get(`/api/group-orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error("fetchOrder error", err);
      Alert.alert("Error", "Failed to fetch group order.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Appwrite realtime messages
  const handleRealtimeMessage = (msg) => {
    try {
      // Appwrite Realtime returns an object: { type, channels, events, payload }
      // payload will be the document; event examples: document.create, document.update, document.delete
      const { payload, events } = msg;
      if (!payload || !payload.$id) return;
      // Only process messages for this orderId
      if (payload.$id !== orderId) return;

      // If document deleted -> clear
      if (
        events &&
        events.includes("databases.*.collections.*.documents.delete")
      ) {
        setOrder(null);
        return;
      }

      // For update/create — payload is the latest document
      setOrder(payload);
    } catch (err) {
      console.error("handleRealtimeMessage error", err);
    }
  };

  // Subscribe to Appwrite Realtime for this collection's documents
  const startRealtime = () => {
    try {
      // Channel pattern: `databases.{databaseId}.collections.{collectionId}.documents`
      const channel = `databases.${Config.databaseId}.collections.grouporders.documents.${orderId}`;
      const subscription = client.subscribe(channel, (response) => {
        // Appwrite returns JSON strings in some SDKs; guard against that
        const msg =
          typeof response === "string" ? JSON.parse(response) : response;
        handleRealtimeMessage(msg);
      });

      wsRef.current = subscription;
      reconnectRef.current.attempt = 0; // reset backoff on successful subscribe
      return subscription;
    } catch (err) {
      console.error("startRealtime error", err);
      scheduleReconnect();
    }
  };

  const stopRealtime = () => {
    try {
      if (wsRef.current && wsRef.current.unsubscribe) {
        wsRef.current.unsubscribe();
      } else if (wsRef.current) {
        // some SDKs return a function to unsubscribe
        wsRef.current();
      }
      wsRef.current = null;
      if (reconnectRef.current.timer) {
        clearTimeout(reconnectRef.current.timer);
        reconnectRef.current.timer = null;
      }
    } catch (err) {
      console.error("stopRealtime error", err);
    }
  };

  const scheduleReconnect = () => {
    const maxAttempts = 6;
    reconnectRef.current.attempt = (reconnectRef.current.attempt || 0) + 1;
    const attempt = reconnectRef.current.attempt;
    if (attempt > maxAttempts) {
      console.warn("Realtime: max reconnect attempts reached");
      return;
    }
    // exponential backoff: base 1000ms * 2^(attempt-1)
    const delay = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
    reconnectRef.current.timer = setTimeout(() => {
      startRealtime();
    }, delay);
  };

  useEffect(() => {
    fetchOrder();

    // Start realtime subscription after initial fetch (to ensure initial state)
    const subscription = startRealtime();

    // Cleanup on unmount
    return () => {
      stopRealtime();
    };
  }, [orderId]);

  // Join action (keeps as simple POST; backend will validate and update doc which triggers realtime)
  const joinOrder = async () => {
    if (!order || order.status !== "pending") {
      Alert.alert("Cannot join", "Order is not open");
      return;
    }
    setJoining(true);
    try {
      const res = await axiosClient.post(`/api/group-orders/${orderId}/join`, {
        userId: currentUserId,
      });
      const payload = res.data;
      // Optimistic update
      setOrder((prev) => {
        if (!prev) return prev;
        if (prev.participants.includes(currentUserId)) return prev;
        return {
          ...prev,
          participants: [...prev.participants, currentUserId],
        };
      });
    } catch (err) {
      const errorMsg = err?.response?.data?.error || "Failed to join order.";
      Alert.alert("Join failed", errorMsg);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <ActivityIndicator className="flex-1" />;

  if (!order)
    return (
      <View style={{ padding: 20 }}>
        <Text>Order not found or removed.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Group Buy</Text>
      <Text style={{ marginTop: 8 }}>Product: {order.productId}</Text>
      <Text style={{ marginTop: 6, fontSize: 18 }}>
        Current Price: ${order.currentPrice}
      </Text>
      <Text>Status: {order.status}</Text>

      <CountdownTimer expiresAt={order.expiresAt} />

      <ParticipantList participants={order.participants || []} />

      <Button
        title={joining ? "Joining..." : "Join Group"}
        onPress={joinOrder}
        disabled={joining || order.status !== "pending"}
      />

      <ShareButton orderId={order.$id} />
    </View>
  );
}
