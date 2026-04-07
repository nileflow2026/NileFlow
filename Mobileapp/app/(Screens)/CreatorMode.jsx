import * as Haptics from "expo-haptics";
import { Globe, MapPin } from "lucide-react-native";
import { useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../Context/ThemeProvider";
import useCreatorPost from "../../hooks/useCreatorPost";
import usePostSettings from "../../hooks/usePostSettings";
import AudiencePickerModal from "../components/Creator/AudiencePickerModal";
import CaptionInput from "../components/Creator/CaptionInput";
import LocationPickerModal from "../components/Creator/LocationPickerModal";
import MediaPreview from "../components/Creator/MediaPreview";
import ProductTagSection from "../components/Creator/ProductTagSection";
import SettingsRow from "../components/Creator/SettingsRow";

const ACCENT = "#FF4458";

export default function CreatorMode() {
  const { themeStyles } = useTheme();
  const {
    mediaItems,
    pickMedia,
    removeMedia,
    maxMedia,
    caption,
    setCaption,
    maxCaption,
    taggedProducts,
    productQuery,
    setProductQuery,
    productResults,
    searchingProducts,
    tagProduct,
    removeProduct,
    maxProducts,
    isSubmitting,
    uploadProgress,
    canSubmit,
    submitPost,
    user,
  } = useCreatorPost();

  const {
    location,
    selectLocation,
    locationModalVisible,
    openLocationPicker,
    closeLocationPicker,
    audience,
    selectAudience,
    audienceModalVisible,
    openAudiencePicker,
    closeAudiencePicker,
    audienceOptions,
  } = usePostSettings();

  const scrollRef = useRef(null);

  const scrollToProductSearch = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await submitPost();
    if (result?.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const msg =
        result.milesEarned > 0
          ? `\nYou earned ${result.milesEarned} Nile Miles!`
          : "";
      Alert.alert("Posted!", `Your content is live.${msg}`);
    }
  };

  const progress = Math.round(uploadProgress * 100);
  const isDark = themeStyles.name === "dark";
  const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const bg = isDark ? "#0f172a" : "#f8fafc";

  const audienceLabel =
    audienceOptions.find((o) => o.key === audience)?.label || "Public";

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]} edges={["top"]}>
      {/* ─── Top Navigation Bar (fixed) ─── */}
      <View style={[s.topBar, { borderBottomColor: divider }]}>
        <View style={s.topBarSpacer} />
        <Text style={[s.topBarTitle, { color: themeStyles.text }]}>
          New Post
        </Text>
        <TouchableOpacity
          style={[s.shareBtn, !canSubmit && s.shareBtnOff]}
          onPress={handleShare}
          disabled={!canSubmit}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.shareBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Progress Bar ─── */}
      {isSubmitting && (
        <View style={s.progressTrack}>
          <View style={[s.progressBar, { width: `${progress}%` }]} />
        </View>
      )}

      {/* ─── Single scrollable area ─── */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Media Preview — full bleed */}
          <MediaPreview
            mediaItems={mediaItems}
            onPickGallery={() => pickMedia("library")}
            onPickCamera={() => pickMedia("camera")}
            onRemove={removeMedia}
            maxCount={maxMedia}
          />

          {/* Padded content */}
          <View style={s.content}>
            <CaptionInput
              value={caption}
              onChangeText={setCaption}
              maxLength={maxCaption}
              userAvatar={user?.avatar || user?.avatarUrl}
            />

            <View style={[s.divider, { backgroundColor: divider }]} />

            <ProductTagSection
              taggedProducts={taggedProducts}
              productQuery={productQuery}
              onChangeQuery={setProductQuery}
              productResults={productResults}
              searching={searchingProducts}
              onTag={tagProduct}
              onRemove={removeProduct}
              maxProducts={maxProducts}
              onSearchFocus={scrollToProductSearch}
            />

            <View style={[s.divider, { backgroundColor: divider }]} />

            <SettingsRow
              icon={MapPin}
              label={location ? location.name : "Add Location"}
              onPress={openLocationPicker}
            />
            <View style={[s.divider, { backgroundColor: divider }]} />
            <SettingsRow
              icon={Globe}
              label="Audience"
              value={audienceLabel}
              onPress={openAudiencePicker}
            />

            {/* Tab bar spacer */}
            <View style={s.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Modals ─── */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={closeLocationPicker}
        onSelect={selectLocation}
        currentLocation={location}
      />
      <AudiencePickerModal
        visible={audienceModalVisible}
        onClose={closeAudiencePicker}
        options={audienceOptions}
        selected={audience}
        onSelect={selectAudience}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarSpacer: { width: 64 },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  shareBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    minWidth: 64,
    alignItems: "center",
  },
  shareBtnOff: { opacity: 0.35 },
  shareBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  /* Progress */
  progressTrack: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: ACCENT,
  },

  /* Content */
  content: { paddingHorizontal: 16 },
  scrollContent: { flexGrow: 1 },
  divider: { height: StyleSheet.hairlineWidth },
  bottomSpacer: { height: 40 },
});
