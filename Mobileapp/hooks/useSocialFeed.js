/**
 * useSocialFeed - Hook for managing the social feed state
 * Handles fetching, pagination, optimistic updates, and engagement actions.
 */

import { useCallback, useRef, useState } from "react";
import { useGlobalContext } from "../Context/GlobalProvider";
import {
  likePost as apiLikePost,
  recordShare as apiRecordShare,
  unlikePost as apiUnlikePost,
  viewPost as apiViewPost,
  fetchFeed,
  fetchTrending,
} from "../utils/socialApi";

export default function useSocialFeed() {
  const { user } = useGlobalContext();
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef(null);
  const loadingRef = useRef(false);

  /**
   * Initial feed load
   */
  const loadFeed = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFeed({ limit: 10 });
      setFeedData(result.posts || []);
      setHasMore(result.hasMore);
      cursorRef.current = result.lastId;
    } catch (err) {
      console.error("Failed to load feed:", err);
      setError("Failed to load feed. Pull to retry.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Load more posts (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !cursorRef.current) return;
    loadingRef.current = true;

    try {
      const result = await fetchFeed({
        limit: 10,
        cursor: cursorRef.current,
      });
      setFeedData((prev) => [...prev, ...(result.posts || [])]);
      setHasMore(result.hasMore);
      cursorRef.current = result.lastId;
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore]);

  /**
   * Pull-to-refresh
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    setError(null);

    try {
      const result = await fetchFeed({ limit: 10 });
      setFeedData(result.posts || []);
      setHasMore(result.hasMore);
      cursorRef.current = result.lastId;
    } catch (err) {
      console.error("Failed to refresh feed:", err);
      setError("Failed to refresh. Try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Optimistic like toggle
   */
  const toggleLike = useCallback(async (postId, currentlyLiked) => {
    // Optimistic update
    setFeedData((prev) =>
      prev.map((item) =>
        item.id === postId
          ? {
              ...item,
              isLiked: !currentlyLiked,
              likesCount: currentlyLiked
                ? Math.max((item.likesCount || 0) - 1, 0)
                : (item.likesCount || 0) + 1,
            }
          : item,
      ),
    );

    try {
      if (currentlyLiked) {
        await apiUnlikePost(postId);
      } else {
        await apiLikePost(postId);
      }
    } catch (err) {
      // Revert on failure
      setFeedData((prev) =>
        prev.map((item) =>
          item.id === postId
            ? {
                ...item,
                isLiked: currentlyLiked,
                likesCount: currentlyLiked
                  ? (item.likesCount || 0) + 1
                  : Math.max((item.likesCount || 0) - 1, 0),
              }
            : item,
        ),
      );
      console.error("Like toggle failed:", err);
    }
  }, []);

  /**
   * Record a share
   */
  const recordShare = useCallback(async (postId, platform) => {
    // Optimistic update
    setFeedData((prev) =>
      prev.map((item) =>
        item.id === postId
          ? { ...item, sharesCount: (item.sharesCount || 0) + 1 }
          : item,
      ),
    );

    try {
      await apiRecordShare(postId, platform);
    } catch (err) {
      console.error("Share record failed:", err);
    }
  }, []);

  /**
   * Record a view
   */
  const recordView = useCallback(async (postId) => {
    try {
      await apiViewPost(postId);
    } catch {
      // Non-critical
    }
  }, []);

  /**
   * Load trending posts
   */
  const loadTrending = useCallback(
    async ({ limit = 10, campus = null } = {}) => {
      try {
        const result = await fetchTrending({ limit, campus });
        return result.posts || [];
      } catch (err) {
        console.error("Failed to load trending:", err);
        return [];
      }
    },
    [],
  );

  return {
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
    loadTrending,
    isAuthenticated: !!user,
  };
}
