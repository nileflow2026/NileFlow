/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/**
 * GroupBuyPage.jsx  (Web — /group/:id)
 *
 * Full-page group buy view.
 *  - Real-time polling
 *  - Participant avatars + progress bar
 *  - Countdown timer
 *  - Pricing tier ladder
 *  - Social sharing (WhatsApp, Telegram, Facebook, Twitter, native)
 *  - Join / Leave / Checkout CTA
 */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Users,
  Share2,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useGroupBuy } from "../../Context/GroupBuyContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import GroupBuyCountdown from "../components/GroupBuyCountdown";
import GroupBuyPricingTiers from "../components/GroupBuyPricingTiers";

// ── Avatar helpers ─────────────────────────────────────────────────────────
const COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];
function Avatar({ uid, idx }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900 -ml-2 first:ml-0 ${COLORS[idx % COLORS.length]}`}
    >
      {uid.slice(0, 2).toUpperCase()}
    </div>
  );
}
function EmptySlot() {
  return (
    <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-600 bg-slate-800 flex items-center justify-center -ml-2 text-slate-500 text-sm">
      +
    </div>
  );
}

// ── Share sheet ────────────────────────────────────────────────────────────
function ShareSheet({ shareData, groupId }) {
  const [copied, setCopied] = useState(false);
  if (!shareData) return null;
  const { shareLink, shareMessages = {}, savingsPercent } = shareData;

  const copy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const platforms = [
    {
      label: "WhatsApp",
      color: "bg-green-600 hover:bg-green-500",
      emoji: "💬",
      href: `https://wa.me/?text=${encodeURIComponent(shareMessages.whatsapp || shareLink)}`,
    },
    {
      label: "Telegram",
      color: "bg-blue-600 hover:bg-blue-500",
      emoji: "✈️",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareMessages.telegram || "")}`,
    },
    {
      label: "Facebook",
      color: "bg-indigo-600 hover:bg-indigo-500",
      emoji: "👍",
      href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    },
    {
      label: "Twitter / X",
      color: "bg-slate-700 hover:bg-slate-600",
      emoji: "🐦",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessages.twitter || shareLink)}`,
    },
  ];

  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 space-y-4">
      <div className="flex items-center gap-2">
        <Share2 size={16} className="text-emerald-400" />
        <span className="text-white font-bold text-sm">Share & Save</span>
        {savingsPercent && savingsPercent !== "0%" && (
          <span className="ml-auto text-emerald-400 text-xs bg-emerald-900/40 px-2 py-0.5 rounded-full font-bold">
            Friends save {savingsPercent} too
          </span>
        )}
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {platforms.map((p) => (
          <a
            key={p.label}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 ${p.color} text-white text-sm font-semibold py-2.5 rounded-xl transition-colors`}
          >
            <span>{p.emoji}</span>
            {p.label}
          </a>
        ))}
      </div>

      {/* Copy link */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-slate-400 text-xs truncate">
          {shareLink}
        </div>
        <button
          onClick={copy}
          className="shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Copy size={14} />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function GroupBuyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeGroup,
    fetchGroup,
    joinGroupBuy,
    leaveGroupBuy,
    getShareData,
    startPolling,
    stopPolling,
    currentUserId,
    loading: ctxLoading,
  } = useGroupBuy();

  const [group, setGroup] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const completedRef = useRef(false);

  // Load + start polling
  useEffect(() => {
    const init = async () => {
      const data = await fetchGroup(id);
      if (data) {
        setGroup(data);
        const { data: sd } = await getShareData(id);
        if (sd) setShareData(sd);
      }
      setInitializing(false);
      startPolling(id, 6000);
    };
    init();
    return () => stopPolling();
  }, [id]);

  // Sync polling updates
  useEffect(() => {
    if (activeGroup?.$id === id) setGroup(activeGroup);
  }, [activeGroup, id]);

  // Completed group notification
  useEffect(() => {
    if (group?.status === "completed" && !completedRef.current) {
      completedRef.current = true;
    }
  }, [group?.status]);

  const handleJoin = async () => {
    setActionError(null);
    setJoining(true);
    const { data, error } = await joinGroupBuy(id);
    if (error) setActionError(error);
    else if (data) setGroup(data);
    setJoining(false);
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this group deal?")) return;
    setLeaving(true);
    const { data, error } = await leaveGroupBuy(id);
    if (error) setActionError(error);
    else if (data) setGroup(data);
    setLeaving(false);
  };

  // ── Render states ─────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader
              size={32}
              className="text-emerald-400 animate-spin mx-auto"
            />
            <p className="text-slate-400 text-sm">Loading group deal…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <h1 className="text-white font-bold text-xl">
              Group Deal Not Found
            </h1>
            <p className="text-slate-400 text-sm">
              This deal may have been cancelled or expired.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
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
    savingsPercent,
    remainingSlots,
    productId,
  } = group;

  const isMember = currentUserId && participants.includes(currentUserId);
  const isFull = status === "completed" || remainingSlots === 0;
  const isExpired = status === "expired";
  const isPending = status === "pending";
  const pct =
    maxParticipants > 0 ? (participants.length / maxParticipants) * 100 : 0;
  const savingsPct = savingsPercent || shareData?.savingsPercent || "";
  const parsedTiers = tiers
    ? typeof tiers === "string"
      ? JSON.parse(tiers)
      : tiers
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Back nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {productId && (
            <Link
              to={`/products/${productId}`}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm transition-colors ml-auto"
            >
              View Product <ExternalLink size={12} />
            </Link>
          )}
        </div>

        {/* Status banner */}
        {(isFull || isExpired) && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              isFull
                ? "bg-emerald-900/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-900/30 border-red-500/30 text-red-300"
            }`}
          >
            {isFull ? <CheckCircle size={18} /> : <Clock size={18} />}
            <span className="font-semibold text-sm">
              {isFull
                ? "🎉 Group is complete! Price is locked."
                : "⏰ This deal has expired."}
            </span>
          </div>
        )}

        {/* Product card */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex gap-4">
            {productImage ? (
              <img
                src={productImage}
                alt={productName || "Product"}
                className="w-24 h-24 rounded-xl object-cover bg-slate-700 shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-slate-700 flex items-center justify-center text-5xl shrink-0">
                🛍️
              </div>
            )}
            <div className="flex-1 min-w-0">
              {productName && (
                <h1 className="text-white font-bold text-lg leading-tight line-clamp-2">
                  {productName}
                </h1>
              )}
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-emerald-400 font-bold text-2xl">
                  ${Number(currentPrice).toFixed(2)}
                </span>
                {basePrice && Number(currentPrice) < Number(basePrice) && (
                  <span className="text-slate-500 line-through text-base">
                    ${Number(basePrice).toFixed(2)}
                  </span>
                )}
              </div>
              {savingsPct && savingsPct !== "0%" && (
                <div className="inline-flex items-center gap-1 bg-emerald-900/50 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold mt-1.5">
                  🔥 Save {savingsPct}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Countdown */}
        {expiresAt && isPending && (
          <GroupBuyCountdown
            expiresAt={expiresAt}
            onExpired={() =>
              setGroup((g) => (g ? { ...g, status: "expired" } : g))
            }
          />
        )}

        {/* Participants */}
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-emerald-400" />
              <span className="text-white font-bold text-sm">Who's in</span>
            </div>
            <span className="text-slate-400 text-sm">
              {participants.length} / {maxParticipants}
            </span>
          </div>

          {/* Avatar row */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {participants.slice(0, 8).map((uid, i) => (
                <Avatar key={uid} uid={uid} idx={i} />
              ))}
              {participants.length < maxParticipants &&
                Array.from({ length: Math.min(3, remainingSlots) }).map(
                  (_, i) => <EmptySlot key={`e${i}`} />,
                )}
            </div>
            <span className="text-slate-400 text-xs">
              {remainingSlots > 0
                ? `${remainingSlots} more needed`
                : "Group complete!"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>

        {/* Pricing tiers */}
        {parsedTiers.length > 0 && (
          <GroupBuyPricingTiers
            tiers={parsedTiers}
            basePrice={Number(basePrice)}
            currentSize={participants.length}
            currency="USD"
          />
        )}

        {/* Share sheet */}
        {isPending && <ShareSheet shareData={shareData} groupId={id} />}

        {/* Action error */}
        {actionError && (
          <div className="flex items-start gap-2 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {actionError}
          </div>
        )}

        {/* CTA */}
        {isPending && (
          <div className="space-y-3">
            {isMember ? (
              <>
                <div className="flex items-center gap-3 bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <CheckCircle
                    size={18}
                    className="text-emerald-400 shrink-0"
                  />
                  <div>
                    <p className="text-emerald-300 font-semibold text-sm">
                      You're in this group!
                    </p>
                    <p className="text-emerald-400/60 text-xs">
                      Share to fill the group faster
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {leaving ? (
                    <Loader size={14} className="animate-spin" />
                  ) : null}
                  {leaving ? "Leaving…" : "Leave Group"}
                </button>
              </>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining || isFull}
                className={`w-full font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base ${
                  joining || isFull
                    ? "bg-slate-600 cursor-not-allowed text-slate-400"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {joining ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Joining…
                  </>
                ) : isFull ? (
                  "Group Full"
                ) : (
                  `Join & Save ${savingsPct} →`
                )}
              </button>
            )}
          </div>
        )}

        {/* Completed CTA */}
        {isFull && isMember && (
          <Link
            to={`/checkout?groupOrderId=${id}&productId=${productId}&lockedPrice=${currentPrice}`}
            className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors text-center text-base"
          >
            Checkout at ${Number(currentPrice).toFixed(2)} 🎉
          </Link>
        )}
      </div>

      <Footer />
    </div>
  );
}
