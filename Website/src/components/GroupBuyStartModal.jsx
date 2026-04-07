/**
 * GroupBuyStartModal.jsx  (Web)
 *
 * Modal for configuring and launching a new group buy.
 * Props:
 *   open     - bool
 *   onClose  - () => void
 *   product  - { $id, name, price, images, tiers?, priceStrategy? }
 *   tiers    - pre-parsed tiers array
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Users, Clock, Loader } from "lucide-react";
import { useGroupBuy } from "../../Context/GroupBuyContext";
import GroupBuyPricingTiers from "./GroupBuyPricingTiers";

const GROUP_SIZES = [3, 5, 10, 20];
const DURATIONS = [12, 24, 48, 72];

export default function GroupBuyStartModal({
  open,
  onClose,
  product,
  tiers = [],
}) {
  const navigate = useNavigate();
  const { createGroupBuy, loading } = useGroupBuy();
  const [size, setSize] = useState(5);
  const [ttl, setTtl] = useState(24);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState(null);

  if (!open) return null;

  const effectiveSize = custom
    ? Math.max(2, Math.min(200, parseInt(custom) || size))
    : size;
  const productTiers =
    tiers.length > 0
      ? tiers
      : deriveDefaultTiers(product?.price, effectiveSize);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!product?.$id) {
      setError("Product not found.");
      return;
    }
    if (!product?.price) {
      setError("Product price is required.");
      return;
    }

    const { data, error: err } = await createGroupBuy(product.$id, {
      maxParticipants: effectiveSize,
      basePrice: Number(product.price),
      priceStrategy: product.priceStrategy ?? "tiered",
      tiers: productTiers,
      ttlHours: ttl,
      productName: product.name ?? "",
      productImage: product.images?.[0] ?? "",
    });

    if (err) {
      setError(err);
      return;
    }
    onClose();
    navigate(`/group/${data.$id}`);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-white font-bold text-lg">Start a Group Buy</h2>
            {product?.name && (
              <p className="text-slate-400 text-sm mt-0.5 truncate max-w-xs">
                {product.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-6">
          {/* Group size */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
              <Users size={14} className="text-emerald-400" />
              Group size
            </label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setCustom("");
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    size === s && !custom
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {s} people
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="number"
                min={2}
                max={200}
                placeholder="Custom size (2–200)"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
              <Clock size={14} className="text-amber-400" />
              Deal duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setTtl(h)}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                    ttl === h
                      ? "bg-amber-600/80 border-amber-500 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Pricing preview */}
          {product?.price && (
            <GroupBuyPricingTiers
              tiers={productTiers}
              basePrice={Number(product.price)}
              currentSize={1}
              currency="USD"
            />
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/40 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" /> Creating…
              </>
            ) : (
              `Create Group — ${effectiveSize} people`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function deriveDefaultTiers(basePrice, maxSize = 5) {
  if (!basePrice) return [];
  const p = Number(basePrice);
  const t2 = Math.max(2, Math.ceil(maxSize * 0.4));
  return [
    { minParticipants: 1, price: +p.toFixed(2), label: "Solo" },
    {
      minParticipants: t2,
      price: +(p * 0.9).toFixed(2),
      label: `${t2}+ people`,
    },
    {
      minParticipants: maxSize,
      price: +(p * 0.75).toFixed(2),
      label: `${maxSize} people (full)`,
    },
  ];
}
