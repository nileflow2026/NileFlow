/**
 * GroupBuyCard.jsx
 *
 * A compact card for listing active group deals.
 * Used on:
 *  - Product detail page (list of joinable groups)
 *  - Home/feed page
 *
 * Props:
 *   group     - group buy document from API
 *   onPress   - callback(group)
 *   onJoin    - callback(groupId)
 */
import { Image, Text, TouchableOpacity, View } from "react-native";
import CountdownTimer from "./CountdownTimer";
import ParticipantList from "./ParticipantList";

export default function GroupBuyCard({ group, onPress, onJoin }) {
  if (!group) return null;

  const {
    $id,
    productName,
    productImage,
    basePrice,
    currentPrice,
    participants = [],
    maxParticipants,
    expiresAt,
    status,
    savingsPercent,
    remainingSlots,
  } = group;

  const isFull = remainingSlots === 0 || status === "completed";
  const isExpired = status === "expired";

  return (
    <TouchableOpacity
      onPress={() => onPress?.(group)}
      activeOpacity={0.85}
      className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden mb-3"
    >
      {/* Header — savings badge */}
      {savingsPercent && savingsPercent !== "0%" && (
        <View className="bg-emerald-600 px-4 py-1.5 flex-row items-center gap-2">
          <Text className="text-white font-bold text-sm">
            🔥 Save {savingsPercent} with group buying
          </Text>
        </View>
      )}

      <View className="p-4">
        <View className="flex-row gap-3">
          {/* Product image */}
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              className="w-16 h-16 rounded-xl bg-slate-700"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-slate-700 items-center justify-center">
              <Text className="text-3xl">🛍️</Text>
            </View>
          )}

          {/* Info */}
          <View className="flex-1">
            {productName && (
              <Text
                className="text-white font-semibold text-sm"
                numberOfLines={1}
              >
                {productName}
              </Text>
            )}

            {/* Pricing */}
            <View className="flex-row items-baseline gap-2 mt-1">
              <Text className="text-emerald-400 font-bold text-lg">
                ${Number(currentPrice).toFixed(2)}
              </Text>
              {basePrice && currentPrice < basePrice && (
                <Text className="text-slate-500 text-sm line-through">
                  ${Number(basePrice).toFixed(2)}
                </Text>
              )}
              <Text className="text-slate-400 text-xs">/ person</Text>
            </View>

            {/* Countdown */}
            {expiresAt && !isExpired && (
              <CountdownTimer expiresAt={expiresAt} compact />
            )}
          </View>
        </View>

        {/* Participants */}
        <ParticipantList
          participants={participants}
          maxParticipants={maxParticipants}
          showProgress
        />

        {/* CTA */}
        <TouchableOpacity
          onPress={() => onJoin?.($id)}
          disabled={isFull || isExpired}
          className={`mt-4 rounded-xl py-3 items-center ${
            isFull || isExpired
              ? "bg-slate-600"
              : "bg-emerald-600 active:bg-emerald-700"
          }`}
        >
          <Text className="text-white font-bold text-sm">
            {isExpired
              ? "Deal Expired"
              : isFull
                ? "Group Full"
                : `Join & Save ${savingsPercent || ""}`}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
