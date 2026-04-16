/**
 * GroupBuyCountdown.jsx  (Web)
 *
 * Real-time countdown timer for group buy deals.
 * Props:
 *   expiresAt   - ISO date string
 *   onExpired   - optional callback
 *   compact     - single-line inline mode
 *   className   - extra Tailwind classes
 */
import { useEffect, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function getRemaining(expiresAt) {
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
    totalSecs: s,
  };
}

export default function GroupBuyCountdown({
  expiresAt,
  onExpired,
  compact = false,
  className = "",
}) {
  const [rem, setRem] = useState(() =>
    expiresAt ? getRemaining(expiresAt) : null,
  );

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const r = getRemaining(expiresAt);
      setRem(r);
      if (!r) onExpired?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  if (!rem) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-red-400 font-semibold text-sm ${className}`}
      >
        ⏰ Deal Expired
      </span>
    );
  }

  const { days, hours, mins, secs, totalSecs } = rem;
  const isUrgent = totalSecs < 3600;

  if (compact) {
    const display =
      days > 0
        ? `${days}d ${pad(hours)}h ${pad(mins)}m`
        : `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold text-sm ${
          isUrgent ? "text-red-400" : "text-amber-400"
        } ${className}`}
      >
        ⏰ {display} left
      </span>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs text-[color:var(--nf-text-muted)] uppercase tracking-widest font-medium">
        Deal ends in
      </p>
      <div className="flex items-center gap-2">
        {days > 0 && (
          <TimeUnit value={pad(days)} label="Days" urgent={isUrgent} />
        )}
        <TimeUnit value={pad(hours)} label="Hrs" urgent={isUrgent} />
        <TimeUnit value={pad(mins)} label="Min" urgent={isUrgent} />
        <TimeUnit value={pad(secs)} label="Sec" urgent={isUrgent} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, urgent }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[52px] border ${
        urgent
          ? "bg-red-950/60 border-red-500/40 text-red-300"
          : "bg-amber-950/60 border-amber-500/30 text-amber-300"
      }`}
    >
      <span className="text-2xl font-bold tabular-nums leading-tight">
        {value}
      </span>
      <span className="text-[10px] text-[color:var(--nf-text-muted)] uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}
