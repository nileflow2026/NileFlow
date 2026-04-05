import { ResizeMode, Video } from "expo-av";
import {
  Heart,
  MessageCircle,
  Play,
  Share2,
  ShoppingCart,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../../Context/CartContext_NEW";
import { useSocial } from "../../../Context/SocialContext";
import { useTheme } from "../../../Context/ThemeProvider";
import CommentsSheet from "./CommentsSheet";
import SocialShare from "./SocialShare";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * FeedItem - Core social commerce feed component
 * Handles videos, images, product cards with TikTok-style interactions
 * Optimized for infinite scroll and engagement
 */
export default function FeedItem({
  item,
  isVisible,
  onLike,
  onShare,
  onAddToCart,
  index,
}) {
  const { themeStyles, theme } = useTheme();
  const { addToCart } = useCart();
  const { earnMiles } = useSocial();

  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(
    item.likesCount || item.likes || 0,
  );
  const [isPlaying, setIsPlaying] = useState(isVisible);
  const [isMuted, setIsMuted] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef(null);
  const likeAnimValue = useRef(new Animated.Value(1)).current;
  const cartAnimValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && item.type === "video") {
        videoRef.current.playAsync();
        setIsPlaying(true);
      } else {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
      }
    }
  }, [isVisible, item.type]);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    // Heart animation
    Animated.sequence([
      Animated.timing(likeAnimValue, {
        duration: 100,
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimValue, {
        duration: 100,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Earn Nile Miles for liking
    if (newLikedState) {
      const milesEarned = earnMiles("LIKE");
      if (milesEarned > 0) {
        console.log(`Earned ${milesEarned} Nile Miles for liking!`);
      }
    }

    onLike?.(item.id, newLikedState);
  };

  const handleAddToCart = async () => {
    if (!item.product || isAddingToCart) return;

    setIsAddingToCart(true);

    // Cart animation
    Animated.sequence([
      Animated.timing(cartAnimValue, {
        duration: 150,
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.timing(cartAnimValue, {
        duration: 150,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await addToCart(item.product);
      onAddToCart?.(item.product);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    try {
      const doShare = SocialShare({ item, onShare });
      if (typeof doShare === "function") {
        await doShare();
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const togglePlayPause = () => {
    if (item.type !== "video") return;

    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderTrendingBadge = () => {
    if (!item.trending) return null;

    return (
      <View style={styles.trendingBadge}>
        <Text style={styles.trendingText}>🔥 {item.trending}</Text>
      </View>
    );
  };

  const renderContent = () => {
    switch (item.type) {
      case "video":
        return (
          <Pressable onPress={togglePlayPause} style={styles.contentContainer}>
            <Video
              ref={videoRef}
              source={{ uri: item.videoUrl || item.mediaUrl }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              isLooping
              isMuted={isMuted}
              shouldPlay={isVisible && isPlaying}
            />
            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
              <Text style={styles.muteText}>{isMuted ? "🔇" : "🔊"}</Text>
            </TouchableOpacity>
            {!isPlaying && (
              <View style={styles.playButtonOverlay}>
                <Play size={60} color="white" fill="white" />
              </View>
            )}
          </Pressable>
        );

      case "image":
        return (
          <View style={styles.contentContainer}>
            <Image
              source={{ uri: item.imageUrl || item.mediaUrl }}
              style={styles.media}
            />
          </View>
        );

      case "deal_card":
        return (
          <View
            style={[
              styles.contentContainer,
              styles.dealCard,
              { backgroundColor: themeStyles.cardBackground },
            ]}
          >
            <Image
              source={{ uri: item.product.image }}
              style={styles.dealImage}
            />
            <Text style={[styles.dealTitle, { color: themeStyles.text }]}>
              {item.product.name}
            </Text>
            <Text style={styles.dealPrice}>${item.product.price}</Text>
            <Text style={styles.dealDiscount}>
              {item.product.discount}% OFF
            </Text>
          </View>
        );

      default:
        return (
          <View
            style={[
              styles.contentContainer,
              { backgroundColor: themeStyles.cardBackground },
            ]}
          >
            <Text style={[styles.textContent, { color: themeStyles.text }]}>
              {item.text}
            </Text>
          </View>
        );
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      {renderTrendingBadge()}

      {renderContent()}

      {/* User info */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: item.user?.avatar || item.userAvatar }}
          style={styles.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={[styles.username, { color: themeStyles.text }]}>
            @{item.user?.username || item.username}
          </Text>
          <Text style={[styles.caption, { color: themeStyles.text }]}>
            {item.caption}
          </Text>
        </View>
      </View>

      {/* Action buttons - Right side vertical */}
      <View style={styles.actionsContainer}>
        <Animated.View style={{ transform: [{ scale: likeAnimValue }] }}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart
              size={28}
              color={isLiked ? "#FF4458" : "white"}
              fill={isLiked ? "#FF4458" : "none"}
            />
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={28} color="white" />
          <Text style={styles.actionText}>
            {item.sharesCount || item.shares || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowComments(true)}
        >
          <MessageCircle size={28} color="white" />
          <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        {item.product && (
          <Animated.View style={{ transform: [{ scale: cartAnimValue }] }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cartButton]}
              onPress={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart
                size={28}
                color="white"
                fill={isAddingToCart ? "#4CAF50" : "none"}
              />
              <Text style={styles.actionText}>
                {isAddingToCart ? "✓" : "Add"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Comments Sheet */}
      <CommentsSheet
        postId={item.id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  playButtonOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  muteButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },
  muteText: {
    fontSize: 20,
  },
  trendingBadge: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "rgba(255,68,88,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
  },
  trendingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  userInfo: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 80,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionsContainer: {
    position: "absolute",
    right: 20,
    bottom: 120,
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginVertical: 15,
  },
  cartButton: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
    borderRadius: 25,
    padding: 10,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  // Deal card specific styles
  dealCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  dealImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  dealPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  dealDiscount: {
    fontSize: 16,
    color: "#FF4458",
    fontWeight: "bold",
  },
  textContent: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});
