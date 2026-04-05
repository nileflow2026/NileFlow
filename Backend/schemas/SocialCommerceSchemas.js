/**
 * Social Commerce Schema Definitions
 * Defines Appwrite collection schemas for the social commerce system:
 * Posts, Likes, Comments, Shares, Follows
 */

const SOCIAL_COLLECTIONS = {
  POSTS: {
    name: "social_posts",
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "username", type: "string", size: 100, required: true },
      { key: "userAvatar", type: "string", size: 500, required: false },
      { key: "type", type: "string", size: 20, required: true }, // "image", "video", "deal_card", "text"
      { key: "caption", type: "string", size: 1000, required: false },
      { key: "mediaUrl", type: "string", size: 1000, required: false },
      { key: "mediaType", type: "string", size: 20, required: false }, // "image", "video"
      { key: "thumbnailUrl", type: "string", size: 1000, required: false },
      { key: "productId", type: "string", size: 36, required: false },
      { key: "productName", type: "string", size: 200, required: false },
      { key: "productPrice", type: "float", required: false },
      { key: "productImage", type: "string", size: 1000, required: false },
      { key: "productDiscount", type: "integer", required: false },
      { key: "likesCount", type: "integer", required: false, default: 0 },
      { key: "commentsCount", type: "integer", required: false, default: 0 },
      { key: "sharesCount", type: "integer", required: false, default: 0 },
      { key: "viewsCount", type: "integer", required: false, default: 0 },
      { key: "trending", type: "string", size: 200, required: false },
      { key: "hashtags", type: "string", size: 500, required: false }, // JSON array as string
      { key: "isActive", type: "boolean", required: false, default: true },
      { key: "referralCode", type: "string", size: 50, required: false },
      { key: "campus", type: "string", size: 100, required: false },
    ],
    indexes: [
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
      { key: "idx_type", type: "key", attributes: ["type"] },
      { key: "idx_productId", type: "key", attributes: ["productId"] },
      { key: "idx_campus", type: "key", attributes: ["campus"] },
      {
        key: "idx_created_desc",
        type: "key",
        attributes: ["$createdAt"],
        orders: ["DESC"],
      },
    ],
  },

  LIKES: {
    name: "social_likes",
    attributes: [
      { key: "postId", type: "string", size: 36, required: true },
      { key: "userId", type: "string", size: 36, required: true },
    ],
    indexes: [
      { key: "idx_postId", type: "key", attributes: ["postId"] },
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      {
        key: "idx_post_user",
        type: "unique",
        attributes: ["postId", "userId"],
      },
    ],
  },

  COMMENTS: {
    name: "social_comments",
    attributes: [
      { key: "postId", type: "string", size: 36, required: true },
      { key: "userId", type: "string", size: 36, required: true },
      { key: "username", type: "string", size: 100, required: true },
      { key: "userAvatar", type: "string", size: 500, required: false },
      { key: "text", type: "string", size: 1000, required: true },
      { key: "parentCommentId", type: "string", size: 36, required: false }, // For replies
      { key: "likesCount", type: "integer", required: false, default: 0 },
      { key: "isActive", type: "boolean", required: false, default: true },
    ],
    indexes: [
      { key: "idx_postId", type: "key", attributes: ["postId"] },
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      { key: "idx_parentId", type: "key", attributes: ["parentCommentId"] },
      {
        key: "idx_post_created",
        type: "key",
        attributes: ["postId", "$createdAt"],
      },
    ],
  },

  SHARES: {
    name: "social_shares",
    attributes: [
      { key: "postId", type: "string", size: 36, required: true },
      { key: "userId", type: "string", size: 36, required: true },
      { key: "platform", type: "string", size: 50, required: false }, // "instagram", "tiktok", "copy_link", etc.
    ],
    indexes: [
      { key: "idx_postId", type: "key", attributes: ["postId"] },
      { key: "idx_userId", type: "key", attributes: ["userId"] },
    ],
  },

  FOLLOWS: {
    name: "social_follows",
    attributes: [
      { key: "followerId", type: "string", size: 36, required: true },
      { key: "followingId", type: "string", size: 36, required: true },
    ],
    indexes: [
      { key: "idx_followerId", type: "key", attributes: ["followerId"] },
      { key: "idx_followingId", type: "key", attributes: ["followingId"] },
      {
        key: "idx_follow_pair",
        type: "unique",
        attributes: ["followerId", "followingId"],
      },
    ],
  },
};

module.exports = { SOCIAL_COLLECTIONS };
