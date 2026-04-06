import { ShoppingBag } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import useCreatorPost from "../../hooks/useCreatorPost";
import MediaPicker from "../components/SocialFeed/MediaPicker";
import NileMilesDisplay from "../components/SocialFeed/NileMilesDisplay";
import ProductTagger from "../components/SocialFeed/ProductTagger";

export default function CreatorMode() {
  const { themeStyles } = useTheme();
  const {
    // Media
    mediaItems,
    pickMedia,
    removeMedia,
    maxMedia,
    // Caption
    caption,
    setCaption,
    maxCaption,
    // Products
    taggedProducts,
    productQuery,
    setProductQuery,
    productResults,
    searchingProducts,
    tagProduct,
    removeProduct,
    // Submission
    isSubmitting,
    submitStep,
    uploadProgress,
    canSubmit,
    submitPost,
    // Stats
    creatorStats,
    statsLoading,
  } = useCreatorPost();

  const handleShare = async () => {
    const result = await submitPost();
    if (result?.success) {
      const milesMsg =
        result.milesEarned > 0
          ? `\nYou earned ${result.milesEarned} Nile Miles!`
          : "";
      Alert.alert("Success!", `Content posted!${milesMsg}`);
    }
  };

  const progressPercent = Math.round(uploadProgress * 100);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: themeStyles.background }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeStyles.text }]}>
            Creator Mode
          </Text>
          <NileMilesDisplay showDetails={false} />
        </View>

        {/* Creator Stats */}
        <View
          style={[
            styles.statsContainer,
            { backgroundColor: themeStyles.cardBackground },
          ]}
        >
          {statsLoading ? (
            <ActivityIndicator size="small" color="#8E8E8E" />
          ) : (
            <View style={styles.statsRow}>
              <StatItem label="Posts" value={creatorStats.postsCount} theme={themeStyles} />
              <StatItem label="Views" value={creatorStats.totalViews} theme={themeStyles} />
              <StatItem label="Likes" value={creatorStats.totalLikes} theme={themeStyles} />
              <StatItem label="Shares" value={creatorStats.totalShares} theme={themeStyles} />
            </View>
          )}
        </View>

        {/* Media Picker */}
        <View
          style={[styles.section, { backgroundColor: themeStyles.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
            Add Media
          </Text>
          <MediaPicker
            mediaItems={mediaItems}
            onPickGallery={() => pickMedia("library")}
            onPickCamera={() => pickMedia("camera")}
            onRemove={removeMedia}
            maxCount={maxMedia}
          />
        </View>

        {/* Caption */}
        <View
          style={[styles.section, { backgroundColor: themeStyles.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
            Caption
          </Text>
          <TextInput
            style={[
              styles.captionInput,
              {
                color: themeStyles.text,
                borderColor: themeStyles.border,
                backgroundColor: themeStyles.background,
              },
            ]}
            placeholder="Write a caption..."
            placeholderTextColor="#8E8E8E"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={maxCaption}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: "#8E8E8E" }]}>
            {caption.length}/{maxCaption}
          </Text>
        </View>

        {/* Product Tagging */}
        <View
          style={[styles.section, { backgroundColor: themeStyles.cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <ShoppingBag size={16} color={themeStyles.text} />
            <Text style={[styles.sectionTitle, { color: themeStyles.text, marginBottom: 0 }]}>
              Tag Products
            </Text>
            <Text style={styles.optionalLabel}>Optional</Text>
          </View>
          <ProductTagger
            taggedProducts={taggedProducts}
            productQuery={productQuery}
            onChangeQuery={setProductQuery}
            productResults={productResults}
            searching={searchingProducts}
            onTag={tagProduct}
            onRemove={removeProduct}
          />
        </View>

        {/* Upload Progress */}
        {isSubmitting && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              {submitStep === "uploading"
                ? `Uploading media... ${progressPercent}%`
                : "Creating post..."}
            </Text>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressBar, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>
        )}

        {/* Share Button */}
        <TouchableOpacity
          style={[
            styles.shareButton,
            !canSubmit && styles.shareButtonDisabled,
          ]}
          onPress={handleShare}
          disabled={!canSubmit}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.shareButtonText}>Share Content</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const StatItem = ({ label, value, theme }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color: theme.text }]}>
      {typeof value === "number" && value >= 1000
        ? `${(value / 1000).toFixed(1)}k`
        : value}
    </Text>
    <Text style={[styles.statLabel, { color: theme.secondaryText || "#8E8E8E" }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 60,
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionalLabel: {
    fontSize: 12,
    color: "#8E8E8E",
    marginLeft: "auto",
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    marginTop: 6,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 13,
    color: "#8E8E8E",
    marginBottom: 6,
    textAlign: "center",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF4458",
    borderRadius: 2,
  },
  shareButton: {
    backgroundColor: "#FF4458",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  shareButtonDisabled: {
    opacity: 0.4,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
