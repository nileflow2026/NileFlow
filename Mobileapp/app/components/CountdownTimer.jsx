/**
 * CountdownTimer.jsx — production-ready group buy countdown.
 * Props:
 *   expiresAt   - ISO string
 *   onExpired   - optional callback when timer hits zero
 *   compact     - show compact single-line mode
 */
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseRemaining(expiresAt) {
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return null;
  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return { days, hours, mins, secs, totalSecs };
}

export default function CountdownTimer({
  expiresAt,
  onExpired,
  compact = false,
}) {
  const [remaining, setRemaining] = useState(() => parseRemaining(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const r = parseRemaining(expiresAt);
      setRemaining(r);
      if (!r) onExpired?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  if (!remaining) {
    return (
      <View className="bg-red-900/30 rounded-lg px-3 py-1.5 self-start">
        <Text className="text-red-400 font-bold text-sm">⏰ Deal Expired</Text>
      </View>
    );
  }

  const { days, hours, mins, secs, totalSecs } = remaining;
  const isUrgent = totalSecs < 3600; // < 1 hour = urgent

  if (compact) {
    const display =
      days > 0
        ? `${days}d ${pad(hours)}h left`
        : `${pad(hours)}:${pad(mins)}:${pad(secs)} left`;
    return (
      <Text
        className={`font-semibold text-sm ${isUrgent ? "text-red-400" : "text-amber-400"}`}
      >
        ⏰ {display}
      </Text>
    );
  }

  return (
    <View className="mt-3">
      <Text className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-medium">
        Deal ends in
      </Text>
      <View className="flex-row gap-2">
        {days > 0 && (
          <TimeUnit value={pad(days)} label="Days" urgent={isUrgent} />
        )}
        <TimeUnit value={pad(hours)} label="Hrs" urgent={isUrgent} />
        <TimeUnit value={pad(mins)} label="Min" urgent={isUrgent} />
        <TimeUnit value={pad(secs)} label="Sec" urgent={isUrgent} />
      </View>
    </View>
  );
}

function TimeUnit({ value, label, urgent }) {
  return (
    <View
      className={`items-center justify-center rounded-xl px-3 py-2 min-w-[48px] ${
        urgent
          ? "bg-red-950/60 border border-red-500/40"
          : "bg-amber-950/60 border border-amber-500/30"
      }`}
    >
      <Text
        className={`text-2xl font-bold tabular-nums ${
          urgent ? "text-red-300" : "text-amber-300"
        }`}
      >
        {value}
      </Text>
      <Text className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
        {label}
      </Text>
    </View>
  );
}
