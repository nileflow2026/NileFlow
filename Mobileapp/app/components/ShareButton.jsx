/**
 * ShareButton.jsx — social sharing for group buy deals.
 * Props:
 *   orderId        - group buy document ID
 *   shareData      - optional pre-fetched share data (from /api/group-orders/:id/share)
 *   savingsPercent - e.g. "20%"
 *   compact        - render as icon-only button
 */
import { Share } from "react-native";
import { Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";

const FRONTEND_URL = "https://nileflow.com";

export default function ShareButton({
  orderId,
  shareData = null,
  savingsPercent = "",
  compact = false,
}) {
  const groupUrl = shareData?.shareLink ?? `${FRONTEND_URL}/group/${orderId}`;

  const getShareMessage = (platform = "generic") => {
    if (shareData?.shareMessages?.[platform]) {
      return shareData.shareMessages[platform];
    }
    const savings = savingsPercent ? ` Save ${savingsPercent}!` : "";
    return `Join my group deal on NileFlow!${savings}\n${groupUrl}`;
  };

  // Native share sheet (iOS / Android)
  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: getShareMessage("generic"),
        url: groupUrl,     // iOS uses url; Android uses message
        title: "Group Deal on NileFlow",
      });
    } catch (err) {
      console.error("ShareButton native share error:", err);
    }
  };

  // Deep link to WhatsApp
  const handleWhatsApp = () => {
    const text = encodeURIComponent(getShareMessage("whatsapp"));
    Linking.openURL(`https://wa.me/?text=${text}`).catch(() =>
      handleNativeShare()
    );
  };

  // Deep link to Telegram
  const handleTelegram = () => {
    const text = encodeURIComponent(getShareMessage("telegram"));
    Linking.openURL(`https://t.me/share/url?url=${encodeURIComponent(groupUrl)}&text=${text}`).catch(
      () => handleNativeShare()
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handleNativeShare}
        className="flex-row items-center gap-1 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-3 py-1.5"
        accessibilityLabel="Share group deal"
      >
        <Text className="text-emerald-400 text-sm font-semibold">📤 Share & Save</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mt-4 gap-2">
      <Text className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">
        Share this deal
      </Text>
      <View className="flex-row gap-2 flex-wrap">
        <SocialButton emoji="💬" label="WhatsApp" color="bg-green-900/40 border-green-500/30" onPress={handleWhatsApp} />
        <SocialButton emoji="✈️" label="Telegram" color="bg-blue-900/40 border-blue-500/30"  onPress={handleTelegram} />
        <SocialButton emoji="📤" label="More"     color="bg-slate-700/60 border-slate-500/30" onPress={handleNativeShare} />
      </View>
    </View>
  );
}

function SocialButton({ emoji, label, color, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-xl px-4 py-2.5 border ${color}`}
      accessibilityLabel={`Share via ${label}`}
    >
      <Text className="text-base">{emoji}</Text>
      <Text className="text-white font-medium text-sm">{label}</Text>
    </TouchableOpacity>
  );
}

