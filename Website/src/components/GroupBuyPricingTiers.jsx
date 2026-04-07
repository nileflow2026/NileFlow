/**
 * GroupBuyPricingTiers.jsx  (Web)
 *
 * Visual "price ladder" component. Shows how price drops as group grows.
 * Props:
 *   tiers        - array: [{minParticipants, price, label?}] or [{min, price}]
 *   basePrice    - number (solo price)
 *   currentSize  - number of current participants
 *   currency     - string ("USD")
 */
import { Users } from "lucide-react";

function fmt(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export default function GroupBuyPricingTiers({
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
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-emerald-400" />
        <span className="text-white font-bold text-sm">
          Group Pricing — more people, lower price
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 text-xs text-slate-500 uppercase tracking-wider px-3 mb-2">
        <span>People</span>
        <span className="text-right">Price / person</span>
        <span className="text-right">Save</span>
      </div>

      {/* Tier rows */}
      <div className="space-y-1.5">
        {sorted.map((tier, idx) => {
          const threshold = tier.minParticipants ?? tier.min ?? 0;
          const price = tier.price ?? basePrice;
          const savings =
            basePrice && basePrice > 0
              ? Math.round(((basePrice - price) / basePrice) * 100)
              : 0;
          const isActive = currentSize >= threshold;
          const next = sorted[idx + 1];
          const nextThreshold = next
            ? (next.minParticipants ?? next.min ?? Infinity)
            : Infinity;
          const isCurrent =
            currentSize >= threshold && currentSize < nextThreshold;

          return (
            <div
              key={idx}
              className={`grid grid-cols-3 items-center rounded-xl px-3 py-2.5 border transition-all ${
                isCurrent
                  ? "bg-emerald-900/50 border-emerald-500/50 ring-1 ring-emerald-500/30"
                  : isActive
                    ? "bg-slate-700/40 border-slate-600/30"
                    : "bg-slate-800/30 border-slate-700/20 opacity-70"
              }`}
            >
              <span
                className={`text-sm font-semibold flex items-center gap-1.5 ${
                  isCurrent ? "text-emerald-300" : "text-slate-300"
                }`}
              >
                {isCurrent && (
                  <span className="text-emerald-400 text-xs">▶</span>
                )}
                {tier.label ?? `${threshold}+ people`}
              </span>

              <span
                className={`text-right text-sm font-bold ${
                  isCurrent ? "text-emerald-300" : "text-white"
                }`}
              >
                {fmt(price, currency)}
              </span>

              <div className="flex justify-end">
                {savings > 0 ? (
                  <span className="bg-emerald-900/60 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    -{savings}%
                  </span>
                ) : (
                  <span className="text-slate-600 text-xs">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current group price summary */}
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <p className="text-slate-400 text-xs">
          With {currentSize} {currentSize === 1 ? "person" : "people"}, current
          price is{" "}
          <span className="text-emerald-400 font-bold">
            {fmt(
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
          </span>{" "}
          per person
        </p>
      </div>
    </div>
  );
}
