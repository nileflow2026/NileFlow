import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../Context/ThemeProvider";
import useSocialFeed from "../../../hooks/useSocialFeed";
import FeedItem from "./FeedItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * SocialFeed - Core vertical scrolling feed component
 * TikTok-style infinite scroll with social commerce features
 * Fetches live data from the social commerce API
 */
export default function SocialFeed() {
  const { themeStyles } = useTheme();
  const {
    feedData,
    loading,
    refreshing,
    error,
    hasMore,
    loadFeed,
    loadMore,
    refresh,
    toggleLike,
    recordShare,
    recordView,
  } = useSocialFeed();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const viewedPosts = useRef(new Set());

  // Initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (viewableItems.length > 0) {
        const idx = viewableItems[0].index || 0;
        setCurrentIndex(idx);

        // Record view for newly visible posts
        const visibleItem = viewableItems[0].item;
        if (visibleItem && !viewedPosts.current.has(visibleItem.id)) {
          viewedPosts.current.add(visibleItem.id);
          recordView(visibleItem.id);
        }
      }
    },
    [recordView],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLike = useCallback(
    (itemId, isLiked) => {
      // isLiked = the NEW state the user wants
      // So if isLiked=true, user wants to like (currently not liked)
      toggleLike(itemId, !isLiked);
    },
    [toggleLike],
  );

  const handleShare = useCallback(
    (item) => {
      recordShare(item.id, "native");
    },
    [recordShare],
  );

  const handleAddToCart = useCallback((product) => {
    // Cart logic handled in FeedItem component
  }, []);

  const renderFeedItem = useCallback(
    ({ item, index }) => (
      <FeedItem
        item={item}
        index={index}
        isVisible={index === currentIndex}
        onLike={handleLike}
        onShare={handleShare}
        onAddToCart={handleAddToCart}
      />
    ),
    [currentIndex, handleLike, handleShare, handleAddToCart],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const keyExtractor = useCallback((item) => item.id, []);

  // Error state
  if (error && feedData.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeStyles.background },
        ]}
      >
        <Text style={[styles.errorText, { color: themeStyles.text }]}>
          {error}
        </Text>
      </View>
    );
  }

  // Initial loading state
  if (loading && feedData.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeStyles.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeStyles.primary} />
        <Text style={[styles.loadingText, { color: themeStyles.text }]}>
          Loading your feed...
        </Text>
      </View>
    );
  }

  // Empty state
  if (!loading && feedData.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeStyles.background },
        ]}
      >
        <Text style={[styles.emptyText, { color: themeStyles.text }]}>
          No posts yet. Be the first to share!
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <FlatList
        ref={flatListRef}
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={themeStyles.primary}
          />
        }
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />

      {loading && feedData.length > 0 && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.6,
    textAlign: "center",
  },
  loadingIndicator: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 10,
    marginHorizontal: 100,
    borderRadius: 20,
    alignSelf: "center",
  },
  loadingMoreText: {
    color: "#fff",
    fontSize: 14,
  },
});
