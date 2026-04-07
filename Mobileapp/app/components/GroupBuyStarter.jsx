/**
 * GroupBuyStarter.jsx
 *
 * Bottom-sheet modal for configuring and launching a new group buy.
 * Shown when a user taps "Start a Group Buy" on a product page.
 *
 * Props:
 *   visible       - bool
 *   onClose       - () => void
 *   product       - { $id, name, price, images, tiers?, priceStrategy? }
 *   onCreated     - (groupDoc) => void
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroupBuy } from "../../Context/GroupBuyContext";
import PricingTiersDisplay from "./PricingTiersDisplay";

const DEFAULT_GROUP_SIZES = [3, 5, 10, 20];

export default function GroupBuyStarter({
  visible,
  onClose,
  product,
  onCreated,
}) {
  const { createGroupBuy, loading } = useGroupBuy();
  const [selectedSize, setSelectedSize] = useState(5);
  const [customSize, setCustomSize] = useState("");
  const [ttlHours, setTtlHours] = useState(24);
  const [error, setError] = useState(null);

  const tiers =
    product?.tiers ?? deriveDefaultTiers(product?.price, selectedSize);
  const effectiveSize = customSize
    ? parseInt(customSize, 10) || selectedSize
    : selectedSize;

  async function handleCreate() {
    if (!product) return;
    setError(null);

    if (!product.price || Number(product.price) <= 0) {
      setError("Product price is required.");
      return;
    }

    const { data, error: err } = await createGroupBuy(product.$id, {
      maxParticipants: effectiveSize,
      basePrice: Number(product.price),
      priceStrategy: product.priceStrategy ?? "tiered",
      tiers,
      ttlHours,
      productName: product.name ?? "",
      productImage: product.images?.[0] ?? "",
    });

    if (err) {
      setError(err);
      return;
    }
    onCreated?.(data);
    onClose?.();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900">
        {/* Handle */}
        <View className="items-center pt-3 pb-2">
          <View className="w-10 h-1 bg-slate-600 rounded-full" />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text className="text-white text-xl font-bold mt-2">
            🛒 Start a Group Buy
          </Text>
          {product?.name && (
            <Text className="text-slate-400 text-sm mt-1" numberOfLines={1}>
              {product.name}
            </Text>
          )}

          {/* Group size selector */}
          <Text className="text-slate-300 font-semibold mt-6 mb-2">
            Group size
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {DEFAULT_GROUP_SIZES.map((sz) => (
              <TouchableOpacity
                key={sz}
                onPress={() => {
                  setSelectedSize(sz);
                  setCustomSize("");
                }}
                className={`rounded-xl px-5 py-2.5 border ${
                  selectedSize === sz && !customSize
                    ? "bg-emerald-600 border-emerald-500"
                    : "bg-slate-700/50 border-slate-600"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    selectedSize === sz && !customSize
                      ? "text-white"
                      : "text-slate-300"
                  }`}
                >
                  {sz} people
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom size input */}
          <Text className="text-slate-400 text-xs mt-3 mb-1">
            Or enter a custom size (2–200)
          </Text>
          <TextInput
            className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white"
            keyboardType="number-pad"
            placeholder="Custom group size"
            placeholderTextColor="#64748b"
            value={customSize}
            onChangeText={setCustomSize}
            maxLength={3}
          />

          {/* TTL selector */}
          <Text className="text-slate-300 font-semibold mt-6 mb-2">
            Deal duration
          </Text>
          <View className="flex-row gap-2">
            {[12, 24, 48, 72].map((hrs) => (
              <TouchableOpacity
                key={hrs}
                onPress={() => setTtlHours(hrs)}
                className={`flex-1 rounded-xl py-2.5 border items-center ${
                  ttlHours === hrs
                    ? "bg-amber-600/80 border-amber-500"
                    : "bg-slate-700/50 border-slate-600"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    ttlHours === hrs ? "text-white" : "text-slate-300"
                  }`}
                >
                  {hrs}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pricing tiers preview */}
          {product?.price && (
            <PricingTiersDisplay
              tiers={tiers}
              basePrice={Number(product.price)}
              currentSize={1}
              currency="USD"
            />
          )}

          {/* Error */}
          {error && (
            <View className="mt-4 bg-red-900/40 border border-red-500/40 rounded-xl p-3">
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* CTA */}
        <View className="px-5 pb-8 pt-4 bg-slate-900 border-t border-slate-800">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            className="bg-emerald-600 rounded-2xl py-4 items-center active:bg-emerald-700"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Create Group Deal — {effectiveSize} people
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="mt-3 items-center py-2"
          >
            <Text className="text-slate-400 text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Derive sensible default tiers when none are defined on the product.
 * Generates 3 tiers at 10%, 20%, 30% discount thresholds.
 */
function deriveDefaultTiers(basePrice, maxSize) {
  if (!basePrice || !maxSize) return [];
  const price = Number(basePrice);
  // tier 1: base (solo), tier 2: 40% of max → 10% off, tier 3: 100% of max → 25% off
  const t2 = Math.max(2, Math.ceil(maxSize * 0.4));
  const t3 = maxSize;
  return [
    {
      minParticipants: 1,
      price: parseFloat(price.toFixed(2)),
      label: "1 person (solo)",
    },
    {
      minParticipants: t2,
      price: parseFloat((price * 0.9).toFixed(2)),
      label: `${t2}+ people`,
    },
    {
      minParticipants: t3,
      price: parseFloat((price * 0.75).toFixed(2)),
      label: `${t3} people (full group)`,
    },
  ];
}
