/**
 * ParticipantList.jsx — shows participant avatars with progress bar.
 * Props:
 *   participants    - string[] of user IDs
 *   maxParticipants - number
 *   showProgress    - bool (default true)
 */
import { Text, View } from "react-native";

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-violet-500",
  "bg-amber-500",   "bg-rose-500",  "bg-cyan-500",
];

function Avatar({ userId, index }) {
  const initials = userId ? userId.slice(0, 2).toUpperCase() : "??";
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <View
      className={`w-9 h-9 rounded-full items-center justify-center ${color} border-2 border-slate-900 -ml-2 first:ml-0`}
    >
      <Text className="text-white text-xs font-bold">{initials}</Text>
    </View>
  );
}

function EmptySlot() {
  return (
    <View className="w-9 h-9 rounded-full items-center justify-center bg-slate-700 border-2 border-slate-900 border-dashed -ml-2">
      <Text className="text-slate-500 text-sm">+</Text>
    </View>
  );
}

export default function ParticipantList({
  participants = [],
  maxParticipants = 0,
  showProgress = true,
}) {
  const filled = participants.length;
  const remaining = Math.max(0, maxParticipants - filled);
  const pct = maxParticipants > 0 ? (filled / maxParticipants) * 100 : 0;

  return (
    <View className="mt-3">
      {/* Avatars row */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row ml-2">
          {participants.slice(0, 6).map((uid, i) => (
            <Avatar key={uid} userId={uid} index={i} />
          ))}
          {/* Show empty slot placeholders */}
          {participants.length < maxParticipants &&
            Array.from({ length: Math.min(remaining, 3) }).map((_, i) => (
              <EmptySlot key={`empty-${i}`} />
            ))}
        </View>
        <Text className="ml-3 text-slate-300 font-medium text-sm">
          {filled} / {maxParticipants} joined
        </Text>
      </View>

      {/* Progress bar */}
      {showProgress && maxParticipants > 0 && (
        <View className="mt-1">
          <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </View>
          <Text className="text-xs text-slate-400 mt-1">
            {remaining === 0
              ? "🎉 Group is full!"
              : `${remaining} more ${remaining === 1 ? "person" : "people"} needed`}
          </Text>
        </View>
      )}
    </View>
  );
}

