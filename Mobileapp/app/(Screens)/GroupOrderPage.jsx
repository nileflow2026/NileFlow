/**
 * GroupOrderPage.jsx — Full-featured Group Buy screen.
 *
 * Route params:
 *   orderId   - group buy document $id
 *
 * Features:
 *  - Real-time Appwrite subscription for live updates
 *  - Animated participant progress
 *  - Tiered pricing display
 *  - Social sharing (WhatsApp, Telegram, native)
 *  - Countdown timer with urgency signals
 *  - Join / Leave with optimistic UI
 *  - Checkout redirect when group completes
 */
/* eslint-disable react-hooks/exhaustive-deps */
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroupBuy } from "../../Context/GroupBuyContext";
import CountdownTimer from "../components/CountdownTimer";
import ParticipantList from "../components/ParticipantList";
import PricingTiersDisplay from "../components/PricingTiersDisplay";
import ShareButton from "../components/ShareButton";

export default function GroupOrderPage() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const {
    fetchGroup,
    joinGroupBuy,
    leaveGroupBuy,
    getShareData,
    subscribeToGroup,
    unsubscribeFromGroup,
    activeGroup: realtimeGroup,
    currentUserId,
    loading: ctxLoading,
  } = useGroupBuy();

  const [group, setGroup] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const completedRef = useRef(false);

  // ── Initial load ────────────────────────────────────────────────────────────
  const load = async () => {
    const data = await fetchGroup(orderId);
    if (data) {
      setGroup(data);
      // Also load share data
      const { data: share } = await getShareData(orderId);
      if (share) setShareData(share);
    }
    setInitializing(false);
  };

  useEffect(() => {
    load();
    subscribeToGroup(orderId);
    return () => unsubscribeFromGroup(orderId);
  }, [orderId]);

  // ── Sync realtime updates into local state ──────────────────────────────────
  useEffect(() => {
    if (realtimeGroup && realtimeGroup.$id === orderId) {
      setGroup(realtimeGroup);
    }
  }, [realtimeGroup]);

  // ── Auto-navigate when group completes ──────────────────────────────────────
  useEffect(() => {
    if (group?.status === "completed" && !completedRef.current) {
      completedRef.current = true;
      Alert.alert(
        "🎉 Group is Full!",
        `Your group price is locked at $${Number(group.currentPrice).toFixed(2)}. Proceed to checkout!`,
        [
          {
            text: "Checkout Now",
            onPress: () =>
              router.push({
                pathname: "/Payments",
                params: {
                  groupOrderId: group.$id,
                  productId: group.productId,
                  lockedPrice: group.currentPrice,
                },
              }),
          },
          { text: "Later", style: "cancel" },
        ]
      );
    }
  }, [group?.status]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleJoin = async () => {
    setActionError(null);
    setJoining(true);
    const { data, error } = await joinGroupBuy(orderId);
    if (error) {
      setActionError(error);
    } else if (data) {
      setGroup(data);
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    Alert.alert("Leave Group?", "You will lose your spot. Continue?", [
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          setLeaving(true);
          const { data, error } = await leaveGroupBuy(orderId);
          if (error) setActionError(error);
          else if (data) setGroup(data);
          setLeaving(false);
        },
      },
      { text: "Stay", style: "cancel" },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-slate-400 mt-3 text-sm">Loading group deal…</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center px-6">
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-white font-bold text-lg text-center">
          Group deal not found
        </Text>
        <Text className="text-slate-400 text-sm text-center mt-2">
          It may have been cancelled or expired.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-slate-700 rounded-xl px-6 py-3"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    productName,
    productImage,
    basePrice,
    currentPrice,
    participants = [],
    maxParticipants,
    expiresAt,
    status,
    tiers,
    priceStrategy,
    savingsAmount,
    savingsPercent,
    remainingSlots,
  } = group;

  const isMember = currentUserId && participants.includes(currentUserId);
  const isFull = status === "completed" || remainingSlots === 0;
  const isExpired = status === "expired";
  const isPending = status === "pending";

  const savingsPct = savingsPercent || shareData?.savingsPercent || "";

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 bg-slate-900 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <MaterialIcons name="arrow-back" size={24} color="#e2e8f0" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Group Deal</Text>
        {isPending && (
          <ShareButton
            orderId={orderId}
            shareData={shareData}
            savingsPercent={savingsPct}
            compact
          />
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        {(isFull || isExpired) && (
          <View
            className={`mx-4 mt-4 rounded-xl px-4 py-3 ${
              isFull ? "bg-emerald-900/60 border border-emerald-500/40" : "bg-red-900/40 border border-red-500/30"
            }`}
          >
            <Text className={`font-bold text-sm ${isFull ? "text-emerald-300" : "text-red-300"}`}>
              {isFull ? "🎉 Group Complete — Price Locked!" : "⏰ This deal has expired"}
            </Text>
          </View>
        )}

        <View className="px-4 pt-4">
          {/* Product card */}
          <View className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50">
            <View className="flex-row gap-4">
              {productImage ? (
                <Image
                  source={{ uri: productImage }}
                  className="w-20 h-20 rounded-xl bg-slate-700"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-xl bg-slate-700 items-center justify-center">
                  <Text className="text-4xl">🛍️</Text>
                </View>
              )}
              <View className="flex-1 justify-center">
                {productName && (
                  <Text className="text-white font-bold text-base" numberOfLines={2}>
                    {productName}
                  </Text>
                )}
                <View className="flex-row items-baseline gap-2 mt-2">
                  <Text className="text-emerald-400 font-bold text-2xl">
                    ${Number(currentPrice).toFixed(2)}
                  </Text>
                  {basePrice && Number(currentPrice) < Number(basePrice) && (
                    <Text className="text-slate-500 line-through text-sm">
                      ${Number(basePrice).toFixed(2)}
                    </Text>
                  )}
                </View>
                {savingsPct && savingsPct !== "0%" && (
                  <View className="bg-emerald-900/50 self-start rounded-full px-2 py-0.5 mt-1">
                    <Text className="text-emerald-400 text-xs font-bold">
                      Save {savingsPct}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Countdown */}
          {expiresAt && isPending && (
            <View className="mt-4">
              <CountdownTimer
                expiresAt={expiresAt}
                onExpired={() => setGroup((g) => g ? { ...g, status: "expired" } : g)}
              />
            </View>
          )}

          {/* Participants */}
          <View className="mt-4 bg-slate-800 rounded-2xl p-4 border border-slate-700/50">
            <Text className="text-white font-bold text-base mb-1">
              👥 Who's In
            </Text>
            <ParticipantList
              participants={participants}
              maxParticipants={maxParticipants}
              showProgress
            />
          </View>

          {/* Pricing Tiers */}
          {tiers && (
            <PricingTiersDisplay
              tiers={typeof tiers === "string" ? JSON.parse(tiers) : tiers}
              basePrice={Number(basePrice)}
              currentSize={participants.length}
            />
          )}

          {/* Social sharing */}
          {isPending && (
            <ShareButton
              orderId={orderId}
              shareData={shareData}
              savingsPercent={savingsPct}
            />
          )}

          {/* Error */}
          {actionError && (
            <View className="mt-4 bg-red-900/40 border border-red-500/40 rounded-xl p-3">
              <Text className="text-red-400 text-sm">{actionError}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed CTA footer */}
      {isPending && (
        <View className="absolute bottom-0 left-0 right-0 bg-slate-900/95 px-4 pb-8 pt-4 border-t border-slate-800">
          {isMember ? (
            <View className="gap-2">
              <View className="bg-emerald-900/50 border border-emerald-500/40 rounded-xl px-4 py-3 items-center">
                <Text className="text-emerald-300 font-bold">✅ You're in this group!</Text>
                <Text className="text-emerald-400/70 text-xs mt-0.5">
                  Share to fill the group faster
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleLeave}
                disabled={leaving}
                className="bg-slate-700 rounded-xl py-3 items-center"
              >
                <Text className="text-slate-300 font-semibold text-sm">
                  {leaving ? "Leaving…" : "Leave Group"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={joining || isFull || isExpired}
              className={`rounded-2xl py-4 items-center ${
                joining || isFull || isExpired ? "bg-slate-600" : "bg-emerald-600"
              }`}
            >
              {joining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base">
                    {isFull ? "Group Full" : `Join & Save ${savingsPct}`}
                  </Text>
                  {!isFull && (
                    <Text className="text-emerald-200 text-xs mt-0.5">
                      {remainingSlots} spot{remainingSlots !== 1 ? "s" : ""} remaining
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Completed CTA */}
      {isFull && isMember && (
        <View className="absolute bottom-0 left-0 right-0 bg-slate-900/95 px-4 pb-8 pt-4 border-t border-slate-800">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/Payments",
                params: {
                  groupOrderId: group.$id,
                  productId: group.productId,
                  lockedPrice: currentPrice,
                },
              })
            }
            className="bg-emerald-600 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-bold text-base">
              Checkout at ${Number(currentPrice).toFixed(2)} 🎉
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

