/* eslint-disable no-unused-vars */
/**
 * GroupBuySection.jsx  (Web)
 *
 * Embedded section on ProductDetailPage.
 * Shows:
 *  - Pricing tier ladder
 *  - Active joinable groups for this product
 *  - "Start a group" modal
 *  - "Join" button per group
 *
 * Props:
 *   product - { $id, name, price, images, tiers?, priceStrategy? }
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Zap,
  Share2,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useGroupBuy } from "../../Context/GroupBuyContext";
import GroupBuyCountdown from "./GroupBuyCountdown";
import GroupBuyPricingTiers from "./GroupBuyPricingTiers";
import GroupBuyStartModal from "./GroupBuyStartModal";

// Avatar cluster for participant previews
function AvatarCluster({ participants = [], max = 5 }) {
  const shown = participants.slice(0, max);
  const extra = participants.length - shown.length;
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  return (
    <div className="flex items-center">
      {shown.map((uid, i) => (
        <div
          key={uid}
          className={`w-7 h-7 rounded-full border-2 border-[var(--nf-border)] flex items-center justify-center text-[color:var(--nf-text-primary)] text-[10px] font-bold -ml-2 first:ml-0 ${colors[i % colors.length]}`}
        >
          {uid.slice(0, 2).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-7 h-7 rounded-full border-2 border-[var(--nf-border)] bg-[var(--nf-bg-subtle)] flex items-center justify-center text-[color:var(--nf-text-primary)] text-[10px] font-bold -ml-2">
          +{extra}
        </div>
      )}
    </div>
  );
}

// Single group deal card
function ActiveGroupCard({ group, onJoin, joining }) {
  const navigate = useNavigate();
  const {
    $id,
    participants = [],
    maxParticipants,
    currentPrice,
    basePrice,
    expiresAt,
    status,
    savingsPercent,
    remainingSlots,
  } = group;

  const isFull = status === "completed" || remainingSlots === 0;

  return (
    <div className="flex items-center justify-between bg-[var(--nf-card-bg)] rounded-xl p-4 border border-[var(--nf-border-subtle)] hover:border-emerald-500/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <AvatarCluster participants={participants} />
          <span className="text-slate-300 text-sm">
            <span className="text-[color:var(--nf-text-primary)] font-semibold">
              {participants.length}
            </span>
            /{maxParticipants} joined
          </span>
          {expiresAt && (
            <GroupBuyCountdown
              expiresAt={expiresAt}
              compact
              className="text-xs"
            />
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-emerald-400 font-bold text-lg">
            ${Number(currentPrice).toFixed(2)}
          </span>
          {basePrice && Number(currentPrice) < Number(basePrice) && (
            <span className="text-slate-500 text-sm line-through">
              ${Number(basePrice).toFixed(2)}
            </span>
          )}
          {savingsPercent && savingsPercent !== "0%" && (
            <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              Save {savingsPercent}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-3 shrink-0">
        <button
          onClick={() => navigate(`/group/${$id}`)}
          className="text-[color:var(--nf-text-muted)] hover:text-[color:var(--nf-text-primary)] text-xs underline underline-offset-2"
        >
          View
        </button>
        <button
          onClick={() => onJoin($id)}
          disabled={isFull || joining}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isFull
              ? "bg-[var(--nf-bg-subtle)] text-[color:var(--nf-text-muted)] cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-[color:var(--nf-text-primary)]"
          }`}
        >
          {joining ? "Joining…" : isFull ? "Full" : "Join"}
        </button>
      </div>
    </div>
  );
}

export default function GroupBuySection({ product }) {
  const navigate = useNavigate();
  const { productGroups, fetchActiveGroups, joinGroupBuy, loading } =
    useGroupBuy();
  const [expanded, setExpanded] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  // Lazy-load groups when section first expands
  const handleExpand = async () => {
    setExpanded((v) => !v);
    if (!groupsLoaded && product?.$id) {
      await fetchActiveGroups(product.$id, 5);
      setGroupsLoaded(true);
    }
  };

  // Load on mount
  useState(() => {
    if (product?.$id) {
      fetchActiveGroups(product.$id, 5).then(() => setGroupsLoaded(true));
    }
  });

  const handleJoin = async (groupId) => {
    setJoiningId(groupId);
    const { data, error } = await joinGroupBuy(groupId);
    setJoiningId(null);
    if (data) navigate(`/group/${groupId}`);
    if (error) alert(error);
  };

  const tiers = product?.tiers
    ? typeof product.tiers === "string"
      ? JSON.parse(product.tiers)
      : product.tiers
    : deriveDefaultTiers(product?.price, 5);

  const activeGroups = productGroups.filter(
    (g) => g.productId === product?.$id && g.status === "pending",
  );

  return (
    <div className="bg-[var(--nf-card-bg)] border border-[var(--nf-border-subtle)] rounded-2xl overflow-hidden">
      {/* Section header */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--nf-bg-subtle)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/20 p-2 rounded-lg">
            <Users size={18} className="text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-[color:var(--nf-text-primary)] font-bold text-sm">Group Buy & Save</p>
            <p className="text-[color:var(--nf-text-muted)] text-xs">
              {activeGroups.length > 0
                ? `${activeGroups.length} active group${activeGroups.length > 1 ? "s" : ""} you can join`
                : "Start a group — the more, the cheaper"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tiers.length > 0 && (
            <span className="hidden sm:block text-emerald-400 text-xs font-bold bg-emerald-900/40 px-2 py-1 rounded-full">
              Up to {maxSavings(tiers, product?.price)}% off
            </span>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-[color:var(--nf-text-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[color:var(--nf-text-muted)]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5">
          {/* Pricing tiers */}
          <GroupBuyPricingTiers
            tiers={tiers}
            basePrice={Number(product?.price)}
            currentSize={1}
            currency="USD"
          />

          {/* Active groups */}
          {activeGroups.length > 0 && (
            <div className="space-y-2">
              <p className="text-slate-300 text-sm font-semibold">
                Join an existing group
              </p>
              {activeGroups.map((g) => (
                <ActiveGroupCard
                  key={g.$id}
                  group={g}
                  onJoin={handleJoin}
                  joining={joiningId === g.$id}
                />
              ))}
            </div>
          )}

          {/* CTA row */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[color:var(--nf-text-primary)] font-bold py-3 rounded-xl transition-colors"
            >
              <Plus size={16} />
              Start a Group
            </button>
            {activeGroups.length > 0 && (
              <Link
                to={`/group/${activeGroups[0].$id}`}
                className="flex items-center gap-2 bg-[var(--nf-bg-elevated)] hover:bg-[var(--nf-bg-subtle)] text-[color:var(--nf-text-primary)] px-4 py-3 rounded-xl transition-colors text-sm font-semibold"
              >
                <Share2 size={14} />
                Share
              </Link>
            )}
          </div>

          {/* Social proof nudge */}
          <div className="flex items-center gap-2 text-[color:var(--nf-text-muted)] text-xs">
            <Zap size={12} className="text-amber-400 shrink-0" />
            <span>
              Share with friends — each new member drops the price for the whole
              group
            </span>
          </div>
        </div>
      )}

      {/* Start group modal */}
      <GroupBuyStartModal
        open={showModal}
        onClose={() => setShowModal(false)}
        product={product}
        tiers={tiers}
      />
    </div>
  );
}

function maxSavings(tiers, basePrice) {
  if (!tiers || !basePrice) return 0;
  const best = Math.min(...tiers.map((t) => t.price ?? Infinity));
  return Math.round(((basePrice - best) / basePrice) * 100);
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
