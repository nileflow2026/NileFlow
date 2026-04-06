/**
 * Social Commerce Controller
 * HTTP handlers for the social commerce API.
 * All authenticated routes get req.user.userId from authMiddleware.
 */

const { InputFile } = require("node-appwrite");
const socialService = require("../../services/SocialCommerceService");

// ===================== POSTS =====================

/**
 * POST /api/social/posts
 * Create a new social post
 */
const createPost = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      type,
      caption,
      mediaUrl,
      mediaType,
      thumbnailUrl,
      productId,
      productName,
      productPrice,
      productImage,
      productDiscount,
      hashtags,
      referralCode,
      campus,
      username,
      userAvatar,
    } = req.body;

    if (!type || !["image", "video", "deal_card", "text"].includes(type)) {
      return res.status(400).json({
        error: "Invalid post type. Must be image, video, deal_card, or text.",
      });
    }

    if (type !== "text" && !mediaUrl) {
      return res
        .status(400)
        .json({ error: "mediaUrl required for non-text posts." });
    }

    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({ error: "Caption is required." });
    }

    if (caption.length > 1000) {
      return res
        .status(400)
        .json({ error: "Caption cannot exceed 1000 characters." });
    }

    const post = await socialService.createPost({
      userId,
      username: username || "Anonymous",
      userAvatar,
      type,
      caption: caption.trim(),
      mediaUrl,
      mediaType,
      thumbnailUrl,
      productId,
      productName,
      productPrice: productPrice ? parseFloat(productPrice) : null,
      productImage,
      productDiscount: productDiscount ? parseInt(productDiscount) : null,
      hashtags: Array.isArray(hashtags) ? hashtags.slice(0, 10) : [],
      referralCode,
      campus,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Failed to create post." });
  }
};

/**
 * GET /api/social/feed
 * Get paginated social feed
 * Query params: limit, cursor
 */
const getFeed = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const cursor = req.query.cursor || null;
    // userId is optional for logged-in users (to check liked state)
    const userId = req.user?.userId || null;

    const feed = await socialService.getFeed({ limit, cursor, userId });

    res.json({ success: true, ...feed });
  } catch (error) {
    console.error("Error fetching feed:", error.message);
    res.status(500).json({ error: "Failed to fetch feed." });
  }
};

/**
 * GET /api/social/posts/:postId
 * Get a single post
 */
const getPost = async (req, res) => {
  try {
    const post = await socialService.getPostById(req.params.postId);
    res.json({ success: true, post });
  } catch (error) {
    if (error.code === 404) {
      return res.status(404).json({ error: "Post not found." });
    }
    console.error("Error fetching post:", error.message);
    res.status(500).json({ error: "Failed to fetch post." });
  }
};

/**
 * GET /api/social/users/:userId/posts
 * Get posts by a specific user
 */
const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor || null;

    const result = await socialService.getUserPosts({ userId, limit, cursor });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching user posts:", error.message);
    res.status(500).json({ error: "Failed to fetch user posts." });
  }
};

/**
 * DELETE /api/social/posts/:postId
 * Soft-delete a post (owner only)
 */
const deletePost = async (req, res) => {
  try {
    const { userId } = req.user;
    await socialService.deletePost(req.params.postId, userId);
    res.json({ success: true, message: "Post deleted." });
  } catch (error) {
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ error: error.message });
    }
    console.error("Error deleting post:", error.message);
    res.status(500).json({ error: "Failed to delete post." });
  }
};

/**
 * POST /api/social/posts/:postId/view
 * Increment view count
 */
const viewPost = async (req, res) => {
  try {
    await socialService.incrementViews(req.params.postId);
    res.json({ success: true });
  } catch (error) {
    // Non-critical - don't fail the request
    console.error("Error recording view:", error.message);
    res.json({ success: true });
  }
};

// ===================== LIKES =====================

/**
 * POST /api/social/posts/:postId/like
 */
const likePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await socialService.likePost(req.params.postId, userId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error liking post:", error.message);
    res.status(500).json({ error: "Failed to like post." });
  }
};

/**
 * DELETE /api/social/posts/:postId/like
 */
const unlikePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await socialService.unlikePost(req.params.postId, userId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error unliking post:", error.message);
    res.status(500).json({ error: "Failed to unlike post." });
  }
};

// ===================== COMMENTS =====================

/**
 * POST /api/social/posts/:postId/comments
 */
const addComment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { text, parentCommentId, username, userAvatar } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    if (text.length > 1000) {
      return res
        .status(400)
        .json({ error: "Comment cannot exceed 1000 characters." });
    }

    const comment = await socialService.addComment({
      postId: req.params.postId,
      userId,
      username: username || "Anonymous",
      userAvatar,
      text: text.trim(),
      parentCommentId,
    });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ error: "Failed to add comment." });
  }
};

/**
 * GET /api/social/posts/:postId/comments
 */
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor || null;

    const result = await socialService.getComments({ postId, limit, cursor });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
};

/**
 * DELETE /api/social/comments/:commentId
 */
const deleteComment = async (req, res) => {
  try {
    const { userId } = req.user;
    await socialService.deleteComment(req.params.commentId, userId);
    res.json({ success: true, message: "Comment deleted." });
  } catch (error) {
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ error: error.message });
    }
    console.error("Error deleting comment:", error.message);
    res.status(500).json({ error: "Failed to delete comment." });
  }
};

// ===================== SHARES =====================

/**
 * POST /api/social/posts/:postId/share
 */
const sharePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const { platform } = req.body;
    const result = await socialService.recordShare(
      req.params.postId,
      userId,
      platform,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error recording share:", error.message);
    res.status(500).json({ error: "Failed to record share." });
  }
};

// ===================== FOLLOWS =====================

/**
 * POST /api/social/users/:userId/follow
 */
const followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;
    const result = await socialService.followUser(followerId, followingId);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message.includes("Cannot follow yourself")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error following user:", error.message);
    res.status(500).json({ error: "Failed to follow user." });
  }
};

/**
 * DELETE /api/social/users/:userId/follow
 */
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;
    const result = await socialService.unfollowUser(followerId, followingId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error unfollowing user:", error.message);
    res.status(500).json({ error: "Failed to unfollow user." });
  }
};

/**
 * GET /api/social/users/:userId/followers
 */
const getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor || null;
    const result = await socialService.getFollowers({ userId, limit, cursor });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching followers:", error.message);
    res.status(500).json({ error: "Failed to fetch followers." });
  }
};

/**
 * GET /api/social/users/:userId/following
 */
const getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor || null;
    const result = await socialService.getFollowing({ userId, limit, cursor });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching following:", error.message);
    res.status(500).json({ error: "Failed to fetch following." });
  }
};

/**
 * GET /api/social/users/:userId/follow-status
 * Check if the authenticated user follows a target user
 */
const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;
    const following = await socialService.isFollowing(followerId, followingId);
    const counts = await socialService.getFollowCounts(followingId);
    res.json({ success: true, following, ...counts });
  } catch (error) {
    console.error("Error checking follow status:", error.message);
    res.status(500).json({ error: "Failed to check follow status." });
  }
};

// ===================== TRENDING =====================

/**
 * GET /api/social/trending
 */
const getTrending = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const campus = req.query.campus || null;
    const posts = await socialService.getTrendingPosts({ limit, campus });
    res.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching trending:", error.message);
    res.status(500).json({ error: "Failed to fetch trending posts." });
  }
};

// ===================== CREATOR PROFILE =====================

/**
 * GET /api/social/creator/stats
 * Get stats for the authenticated creator
 */
const getCreatorStats = async (req, res) => {
  try {
    const { userId } = req.user;
    const stats = await socialService.getCreatorStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching creator stats:", error.message);
    res.status(500).json({ error: "Failed to fetch creator stats." });
  }
};

/**
 * GET /api/social/users/:userId/profile
 * Get public profile for any user
 */
const getUserProfile = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const [stats, followCounts] = await Promise.all([
      socialService.getCreatorStats(targetUserId),
      socialService.getFollowCounts(targetUserId),
    ]);

    // Check if current user follows this profile
    let isFollowing = false;
    if (req.user?.userId && req.user.userId !== targetUserId) {
      isFollowing = await socialService.isFollowing(
        req.user.userId,
        targetUserId,
      );
    }

    res.json({
      success: true,
      profile: {
        userId: targetUserId,
        ...stats,
        ...followCounts,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

// ===================== MEDIA UPLOAD =====================

/**
 * POST /api/social/upload-media
 * Upload a media file (image or video) to storage
 */
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const file = InputFile.fromBuffer(req.file.buffer, req.file.originalname);
    const result = await socialService.uploadMedia(file);

    res.json({
      success: true,
      fileId: result.fileId,
      fileUrl: result.fileUrl,
    });
  } catch (error) {
    console.error("Error uploading media:", error.message);
    res.status(500).json({ error: "Failed to upload media." });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  getUserPosts,
  deletePost,
  viewPost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
  sharePost,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getTrending,
  getCreatorStats,
  getUserProfile,
  uploadMedia,
};
