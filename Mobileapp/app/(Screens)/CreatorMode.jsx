/* eslint-disable no-unused-vars */
import axiosClient from "@/api";
import * as ImagePicker from "expo-image-picker";
import { Camera, Search, Upload } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useSocial } from "../../Context/SocialContext";
import { useTheme } from "../../Context/ThemeProvider";
import { createPost, getCreatorStats } from "../../utils/socialApi";
import NileMilesDisplay from "../components/SocialFeed/NileMilesDisplay";

/**
 * CreatorMode - Lite creator functionality for user-generated content
 * Allows users to create content, tag products, and earn Miles
 * Revenue-first approach focusing on conversions
 */
export default function CreatorMode() {
  const { themeStyles } = useTheme();
  const { earnMiles, nileMiles } = useSocial();
  const { user } = useGlobalContext();

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState("");
  const [taggedProduct, setTaggedProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [creatorStats, setCreatorStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    postsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // Load creator stats from API
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getCreatorStats();
        if (res.success) {
          setCreatorStats(res.stats);
        }
      } catch {
        // Stats unavailable, keep defaults
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  // Real product search via API
  const searchProducts = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setProductResults([]);
      return;
    }
    setSearchingProducts(true);
    try {
      const res = await axiosClient.get("/api/customerprofile/fetch-product", {
        params: { search: query.trim(), limit: 5 },
      });
      const products = (res.data?.products || res.data || []).map((p) => ({
        id: p.$id || p.id,
        name: p.name || p.title,
        price: p.price || 0,
        image: p.image || p.images?.[0] || null,
        discount: p.discount || 0,
      }));
      setProductResults(products);
    } catch {
      setProductResults([]);
    } finally {
      setSearchingProducts(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (productQuery.length >= 2) searchProducts(productQuery);
    }, 400);
    return () => clearTimeout(timeout);
  }, [productQuery, searchProducts]);

  const pickMedia = async (type = "mixed") => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your media library",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          type === "video"
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [9, 16], // Vertical aspect ratio
        quality: 0.8,
        videoMaxDuration: 60, // Max 60 seconds for videos
      });

      if (!result.canceled) {
        setSelectedMedia(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to select media");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow camera access");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedMedia(result.assets[0]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const uploadContent = async () => {
    if (!selectedMedia || !caption.trim()) {
      Alert.alert("Missing content", "Please add media and caption");
      return;
    }

    if (!user) {
      Alert.alert("Sign in required", "Please sign in to create content");
      return;
    }

    setIsUploading(true);

    try {
      // Determine media type
      const isVideo =
        selectedMedia.type === "video" ||
        (selectedMedia.uri && selectedMedia.uri.includes("video"));
      const mediaType = isVideo ? "video" : "image";
      const postType = isVideo ? "video" : "image";

      // Upload media file to backend storage
      let mediaUrl = null;
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: selectedMedia.uri,
          name: `post_${Date.now()}.${isVideo ? "mp4" : "jpg"}`,
          type: isVideo ? "video/mp4" : "image/jpeg",
        });
        const uploadRes = await axiosClient.post(
          "/api/social/upload-media",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        mediaUrl = uploadRes.data?.fileUrl;
      } catch {
        // If media upload endpoint isn't available, use local URI
        mediaUrl = selectedMedia.uri;
      }

      // Create the post via API
      const postData = {
        type: postType,
        caption: caption.trim(),
        mediaUrl,
        mediaType,
        username: user.name || user.username || "Creator",
        userAvatar: user.avatar || user.avatarUrl || null,
      };

      if (taggedProduct) {
        postData.productId = taggedProduct.id;
        postData.productName = taggedProduct.name;
        postData.productPrice = taggedProduct.price;
        postData.productImage = taggedProduct.image;
        postData.productDiscount = taggedProduct.discount;
      }

      await createPost(postData);

      // Reward creator for uploading content
      const uploadMiles = earnMiles("REFERRAL"); // Uses REFERRAL rate (50 miles) for content creation
      const milesMsg =
        uploadMiles > 0 ? `\nYou earned ${uploadMiles} Nile Miles!` : "";

      Alert.alert("Success!", `Content posted!${milesMsg}`);

      // Reset form
      setSelectedMedia(null);
      setCaption("");
      setTaggedProduct(null);
      setProductQuery("");
      setProductResults([]);

      // Refresh stats
      try {
        const res = await getCreatorStats();
        if (res.success) setCreatorStats(res.stats);
      } catch {
        // Ignore
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error || "Failed to upload content. Try again.";
      Alert.alert("Error", msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      {/* Header with Miles Display */}
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
        <Text style={[styles.statsTitle, { color: themeStyles.text }]}>
          Your Creator Stats
        </Text>
        <View style={styles.statsRow}>
          <StatItem
            label="Posts"
            value={creatorStats.postsCount}
            theme={themeStyles}
          />
          <StatItem
            label="Views"
            value={creatorStats.totalViews}
            theme={themeStyles}
          />
          <StatItem
            label="Likes"
            value={creatorStats.totalLikes}
            theme={themeStyles}
          />
          <StatItem
            label="Shares"
            value={creatorStats.totalShares}
            theme={themeStyles}
          />
        </View>
      </View>

      {/* Media Selection */}
      <View
        style={[
          styles.section,
          { backgroundColor: themeStyles.cardBackground },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
          Add Media
        </Text>

        {selectedMedia ? (
          <View style={styles.mediaPreview}>
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedMedia(null)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={[styles.mediaButton, { borderColor: themeStyles.border }]}
              onPress={takePhoto}
            >
              <Camera size={24} color={themeStyles.text} />
              <Text style={[styles.buttonText, { color: themeStyles.text }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaButton, { borderColor: themeStyles.border }]}
              onPress={() => pickMedia("mixed")}
            >
              <Upload size={24} color={themeStyles.text} />
              <Text style={[styles.buttonText, { color: themeStyles.text }]}>
                Upload Media
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Caption Input */}
      <View
        style={[
          styles.section,
          { backgroundColor: themeStyles.cardBackground },
        ]}
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
          placeholder="What's happening? Add your caption here..."
          placeholderTextColor={themeStyles.secondaryText}
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        <Text style={[styles.charCount, { color: themeStyles.secondaryText }]}>
          {caption.length}/1000
        </Text>
      </View>

      {/* Product Tagging */}
      <View
        style={[
          styles.section,
          { backgroundColor: themeStyles.cardBackground },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
          Tag a Product (Optional)
        </Text>

        {taggedProduct ? (
          <View style={styles.taggedProduct}>
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: themeStyles.text }]}>
                {taggedProduct.name}
              </Text>
              <Text style={styles.productPrice}>
                ${taggedProduct.price}
                {taggedProduct.discount
                  ? ` • ${taggedProduct.discount}% off`
                  : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setTaggedProduct(null)}>
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View
              style={[styles.tagButton, { borderColor: themeStyles.border }]}
            >
              <Search size={18} color={themeStyles.text} />
              <TextInput
                style={[styles.searchInput, { color: themeStyles.text }]}
                placeholder="Search products to tag..."
                placeholderTextColor={themeStyles.secondaryText}
                value={productQuery}
                onChangeText={setProductQuery}
              />
              {searchingProducts && (
                <ActivityIndicator size="small" color={themeStyles.primary} />
              )}
            </View>
            {productResults.length > 0 && (
              <FlatList
                data={productResults}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.productResult,
                      { borderColor: themeStyles.border },
                    ]}
                    onPress={() => {
                      setTaggedProduct(item);
                      setProductQuery("");
                      setProductResults([]);
                    }}
                  >
                    {item.image && (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.productThumb}
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.productName,
                          { color: themeStyles.text },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.productPrice}>${item.price}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, { opacity: isUploading ? 0.6 : 1 }]}
        onPress={uploadContent}
        disabled={isUploading}
      >
        <Text style={styles.uploadButtonText}>
          {isUploading ? "Uploading..." : "Share Content"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const StatItem = ({ label, value, theme }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
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
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
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
    fontSize: 12,
    textTransform: "uppercase",
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  mediaButtons: {
    flexDirection: "row",
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  mediaPreview: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 8,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  productResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  taggedProduct: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#4CAF50",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  uploadButton: {
    backgroundColor: "#FF4458",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
