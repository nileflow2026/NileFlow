/**
 * PricingTiersDisplay.jsx
 *
 * Visual pricing tier ladder shown on product pages and group buy screens.
 * Props:
 *   tiers           - array of { minParticipants, price, label? }  OR  { min, price }
 *   basePrice       - number (full solo price)
 *   currentSize     - number (current participant count)
 *   currency        - string (default "USD")
 */
import { Text, View } from "react-native";

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    price,
  );
}

export default function PricingTiersDisplay({
  tiers = [],
  basePrice,
  currentSize = 1,
  currency = "USD",
}) {
  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort(
    (a, b) =>
      (a.minParticipants ?? a.min ?? 0) - (b.minParticipants ?? b.min ?? 0),
  );

  return (
    <View className="mt-4 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
      <Text className="text-white font-bold text-base mb-3">
        💰 Group Pricing — the more, the cheaper
      </Text>

      {/* Header row */}
      <View className="flex-row mb-2 px-1">
        <Text className="text-slate-400 text-xs flex-1">People</Text>
        <Text className="text-slate-400 text-xs w-24 text-right">
          Price each
        </Text>
        <Text className="text-slate-400 text-xs w-16 text-right">Save</Text>
      </View>

      {sorted.map((tier, idx) => {
        const threshold = tier.minParticipants ?? tier.min ?? 0;
        const price = tier.price ?? basePrice;
        const savings =
          basePrice && basePrice > 0
            ? Math.round(((basePrice - price) / basePrice) * 100)
            : 0;
        const isActive = currentSize >= threshold;
        const isCurrentTier = (() => {
          // current tier is the last one where threshold <= currentSize
          const next = sorted[idx + 1];
          const nextThreshold = next
            ? (next.minParticipants ?? next.min ?? Infinity)
            : Infinity;
          return currentSize >= threshold && currentSize < nextThreshold;
        })();

        return (
          <View
            key={`tier-${idx}`}
            className={`flex-row items-center rounded-xl px-3 py-2.5 mb-1.5 ${
              isCurrentTier
                ? "bg-emerald-900/50 border border-emerald-500/50"
                : isActive
                  ? "bg-slate-700/40 border border-slate-600/30"
                  : "bg-slate-800/30 border border-slate-700/20"
            }`}
          >
            {/* People count */}
            <View className="flex-1 flex-row items-center gap-2">
              {isCurrentTier && (
                <Text className="text-emerald-400 text-xs font-bold">▶</Text>
              )}
              <Text
                className={`text-sm font-semibold ${
                  isCurrentTier ? "text-emerald-300" : "text-slate-300"
                }`}
              >
                {tier.label ?? `${threshold}+ people`}
              </Text>
            </View>

            {/* Price */}
            <Text
              className={`w-24 text-right text-sm font-bold ${
                isCurrentTier ? "text-emerald-300" : "text-white"
              }`}
            >
              {formatPrice(price, currency)}
            </Text>

            {/* Savings badge */}
            <View className="w-16 items-end">
              {savings > 0 ? (
                <View className="bg-emerald-900/60 rounded-full px-2 py-0.5">
                  <Text className="text-emerald-400 text-xs font-bold">
                    -{savings}%
                  </Text>
                </View>
              ) : (
                <Text className="text-slate-500 text-xs">—</Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Current price callout */}
      <View className="mt-2 pt-3 border-t border-slate-700/50">
        <Text className="text-slate-400 text-xs">
          Current group price with {currentSize}{" "}
          {currentSize === 1 ? "person" : "people"}:{" "}
          <Text className="text-emerald-400 font-bold">
            {formatPrice(
              (() => {
                const match = [...sorted]
                  .reverse()
                  .find(
                    (t) => currentSize >= (t.minParticipants ?? t.min ?? 0),
                  );
                return match?.price ?? basePrice;
              })(),
              currency,
            )}
          </Text>
        </Text>
      </View>
    </View>
  );
}
