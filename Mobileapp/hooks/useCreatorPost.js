/**
 * useCreatorPost - Hook for creating social commerce posts.
 * Handles media selection, upload, product tagging, and post submission.
 * All state + logic in one place, consumed by CreatorMode screen.
 */

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import axiosClient from "../api";
import { useGlobalContext } from "../Context/GlobalProvider";
import { useSocial } from "../Context/SocialContext";
import { createPost, getCreatorStats, uploadMedia } from "../utils/socialApi";

const MAX_MEDIA = 10;
const MAX_CAPTION = 2200;
const PRODUCT_SEARCH_DEBOUNCE = 400;

export default function useCreatorPost() {
  const { user } = useGlobalContext();
  const { earnMiles } = useSocial();

  // --- Media ---
  const [mediaItems, setMediaItems] = useState([]); // [{ uri, type, width, height, duration }]
  const [uploadProgress, setUploadProgress] = useState(0); // 0-1

  // --- Caption ---
  const [caption, setCaption] = useState("");

  // --- Products ---
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // --- Submission ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(""); // "uploading" | "posting" | ""

  // --- Stats ---
  const [creatorStats, setCreatorStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    postsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const searchTimeout = useRef(null);

  // ===================== STATS =====================

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getCreatorStats();
      if (res.success) setCreatorStats(res.stats);
    } catch {
      // Stats unavailable, keep defaults
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ===================== MEDIA =====================

  const requestPermission = async (type) => {
    const fn =
      type === "camera"
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await fn();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        type === "camera"
          ? "Please allow camera access to take photos."
          : "Please allow access to your media library.",
      );
      return false;
    }
    return true;
  };

  const pickMedia = useCallback(
    async (source = "library") => {
      if (mediaItems.length >= MAX_MEDIA) {
        Alert.alert("Limit reached", `You can add up to ${MAX_MEDIA} items.`);
        return;
      }

      const permType = source === "camera" ? "camera" : "library";
      if (!(await requestPermission(permType))) return;

      const pickerFn =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await pickerFn({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: source !== "camera",
        selectionLimit: MAX_MEDIA - mediaItems.length,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (result.canceled) return;

      const newItems = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type || (asset.uri.includes("video") ? "video" : "image"),
        width: asset.width,
        height: asset.height,
        duration: asset.duration || 0,
      }));

      setMediaItems((prev) => [...prev, ...newItems].slice(0, MAX_MEDIA));
    },
    [mediaItems.length],
  );

  const removeMedia = useCallback((index) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderMedia = useCallback((fromIndex, toIndex) => {
    setMediaItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  }, []);

  // ===================== IMAGE COMPRESSION =====================

  const compressImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );
      return result.uri;
    } catch {
      return uri; // Return original if compression fails
    }
  };

  // ===================== PRODUCT SEARCH =====================

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

  // Debounced product search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (productQuery.length >= 2) searchProducts(productQuery);
      else setProductResults([]);
    }, PRODUCT_SEARCH_DEBOUNCE);
    return () => clearTimeout(searchTimeout.current);
  }, [productQuery, searchProducts]);

  const tagProduct = useCallback((product) => {
    setTaggedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    setProductQuery("");
    setProductResults([]);
  }, []);

  const removeProduct = useCallback((productId) => {
    setTaggedProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // ===================== SUBMISSION =====================

  const canSubmit =
    !isSubmitting && caption.trim().length > 0 && mediaItems.length > 0 && !!user;

  const submitPost = useCallback(async () => {
    if (!canSubmit) return false;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload all media files
      setSubmitStep("uploading");
      const mediaUrls = [];
      const totalFiles = mediaItems.length;

      for (let i = 0; i < totalFiles; i++) {
        const item = mediaItems[i];
        let uri = item.uri;

        // Compress images before upload
        if (item.type === "image") {
          uri = await compressImage(uri);
        }

        const isVideo = item.type === "video";
        const ext = isVideo ? "mp4" : "jpg";
        const mime = isVideo ? "video/mp4" : "image/jpeg";
        const fileName = `post_${Date.now()}_${i}.${ext}`;

        const result = await uploadMedia(uri, fileName, mime, (progress) => {
          const fileProgress = (i + progress) / totalFiles;
          setUploadProgress(fileProgress);
        });

        mediaUrls.push({
          url: result.fileUrl,
          fileId: result.fileId,
          type: item.type,
        });
      }

      setUploadProgress(1);

      // Step 2: Create the post
      setSubmitStep("posting");

      const primaryMedia = mediaUrls[0];
      const isVideo = primaryMedia.type === "video";
      const postType =
        mediaUrls.length > 1 ? "image" : isVideo ? "video" : "image";

      const postData = {
        type: postType,
        caption: caption.trim(),
        mediaUrl: primaryMedia.url,
        mediaType: primaryMedia.type,
        username: user.name || user.username || "Creator",
        userAvatar: user.avatar || user.avatarUrl || null,
      };

      // Attach first tagged product to the post
      if (taggedProducts.length > 0) {
        const product = taggedProducts[0];
        postData.productId = product.id;
        postData.productName = product.name;
        postData.productPrice = product.price;
        postData.productImage = product.image;
        postData.productDiscount = product.discount;
      }

      await createPost(postData);

      // Reward
      const milesEarned = earnMiles("REFERRAL"); // 50 miles for content creation

      // Reset form
      setMediaItems([]);
      setCaption("");
      setTaggedProducts([]);
      setProductQuery("");
      setProductResults([]);
      setUploadProgress(0);
      setSubmitStep("");

      // Refresh stats
      loadStats();

      return { success: true, milesEarned };
    } catch (error) {
      const msg =
        error?.response?.data?.error || "Failed to upload content. Try again.";
      Alert.alert("Error", msg);
      return { success: false };
    } finally {
      setIsSubmitting(false);
      setSubmitStep("");
    }
  }, [canSubmit, mediaItems, caption, taggedProducts, user, earnMiles, loadStats]);

  // ===================== RESET =====================

  const resetForm = useCallback(() => {
    setMediaItems([]);
    setCaption("");
    setTaggedProducts([]);
    setProductQuery("");
    setProductResults([]);
    setUploadProgress(0);
    setSubmitStep("");
  }, []);

  return {
    // Media
    mediaItems,
    pickMedia,
    removeMedia,
    reorderMedia,
    maxMedia: MAX_MEDIA,

    // Caption
    caption,
    setCaption,
    maxCaption: MAX_CAPTION,

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
    resetForm,

    // Stats
    creatorStats,
    statsLoading,
    loadStats,

    // Auth
    user,
  };
}
