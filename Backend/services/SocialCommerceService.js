/**
 * Social Commerce Service
 * Core business logic for posts, feed, engagement, and follows.
 * Interfaces with Appwrite for data persistence.
 */

const { db, ID, storage } = require("../src/appwrite");
const { env } = require("../src/env");
const { Query } = require("node-appwrite");

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const POSTS_COLLECTION = env.SOCIAL_POSTS_COLLECTION_ID;
const LIKES_COLLECTION = env.SOCIAL_LIKES_COLLECTION_ID;
const COMMENTS_COLLECTION = env.SOCIAL_COMMENTS_COLLECTION_ID;
const SHARES_COLLECTION = env.SOCIAL_SHARES_COLLECTION_ID;
const FOLLOWS_COLLECTION = env.SOCIAL_FOLLOWS_COLLECTION_ID;
const STORAGE_BUCKET = env.StorageId || env.APPWRITE_STORAGE_BUCKET_ID;

// ===================== POSTS =====================

/**
 * Create a new social post
 */
async function createPost(data) {
  const postId = ID.unique();
  const doc = await db.createDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
    userId: data.userId,
    username: data.username,
    userAvatar: data.userAvatar || null,
    type: data.type || "image",
    caption: data.caption || "",
    mediaUrl: data.mediaUrl || null,
    mediaType: data.mediaType || null,
    thumbnailUrl: data.thumbnailUrl || null,
    productId: data.productId || null,
    productName: data.productName || null,
    productPrice: data.productPrice || null,
    productImage: data.productImage || null,
    productDiscount: data.productDiscount || null,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    trending: null,
    hashtags: data.hashtags ? JSON.stringify(data.hashtags) : null,
    isActive: true,
    referralCode: data.referralCode || null,
    campus: data.campus || null,
  });

  return doc;
}

/**
 * Get a single post by ID
 */
async function getPostById(postId) {
  return db.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
}

/**
 * Get paginated feed (chronological, newest first)
 * Returns { posts, total, hasMore }
 */
async function getFeed({ limit = 10, cursor = null, userId = null }) {
  const queries = [
    Query.equal("isActive", true),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const result = await db.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries);

  // If a userId is provided, check which posts are liked by this user
  let likedPostIds = new Set();
  if (userId && result.documents.length > 0) {
    const postIds = result.documents.map((d) => d.$id);
    try {
      const likesResult = await db.listDocuments(
        DATABASE_ID,
        LIKES_COLLECTION,
        [
          Query.equal("userId", userId),
          Query.equal("postId", postIds),
          Query.limit(postIds.length),
        ],
      );
      likedPostIds = new Set(likesResult.documents.map((l) => l.postId));
    } catch {
      // Likes collection may not exist yet
    }
  }

  const posts = result.documents.map((doc) => ({
    id: doc.$id,
    ...doc,
    isLiked: likedPostIds.has(doc.$id),
    hashtags: doc.hashtags ? JSON.parse(doc.hashtags) : [],
    product: doc.productId
      ? {
          id: doc.productId,
          name: doc.productName,
          price: doc.productPrice,
          image: doc.productImage,
          discount: doc.productDiscount,
        }
      : null,
  }));

  return {
    posts,
    total: result.total,
    hasMore: result.documents.length === limit,
    lastId:
      result.documents.length > 0
        ? result.documents[result.documents.length - 1].$id
        : null,
  };
}

/**
 * Get posts by a specific user
 */
async function getUserPosts({ userId, limit = 20, cursor = null }) {
  const queries = [
    Query.equal("userId", userId),
    Query.equal("isActive", true),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const result = await db.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries);

  return {
    posts: result.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
      hashtags: doc.hashtags ? JSON.parse(doc.hashtags) : [],
      product: doc.productId
        ? {
            id: doc.productId,
            name: doc.productName,
            price: doc.productPrice,
            image: doc.productImage,
            discount: doc.productDiscount,
          }
        : null,
    })),
    total: result.total,
    hasMore: result.documents.length === limit,
    lastId:
      result.documents.length > 0
        ? result.documents[result.documents.length - 1].$id
        : null,
  };
}

/**
 * Delete (soft-delete) a post
 */
async function deletePost(postId, userId) {
  const post = await db.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
  if (post.userId !== userId) {
    throw new Error("Unauthorized: you can only delete your own posts");
  }
  return db.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
    isActive: false,
  });
}

/**
 * Increment view count for a post
 */
async function incrementViews(postId) {
  const post = await db.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
  return db.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
    viewsCount: (post.viewsCount || 0) + 1,
  });
}

// ===================== LIKES =====================

/**
 * Like a post. Returns { liked: true, likesCount }
 */
async function likePost(postId, userId) {
  // Check if already liked
  const existing = await db.listDocuments(DATABASE_ID, LIKES_COLLECTION, [
    Query.equal("postId", postId),
    Query.equal("userId", userId),
    Query.limit(1),
  ]);

  if (existing.documents.length > 0) {
    return { liked: true, alreadyLiked: true };
  }

  // Create like document
  await db.createDocument(DATABASE_ID, LIKES_COLLECTION, ID.unique(), {
    postId,
    userId,
  });

  // Increment post likes count
  const post = await db.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
  const newCount = (post.likesCount || 0) + 1;
  await db.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
    likesCount: newCount,
  });

  return { liked: true, likesCount: newCount };
}

/**
 * Unlike a post. Returns { liked: false, likesCount }
 */
async function unlikePost(postId, userId) {
  const existing = await db.listDocuments(DATABASE_ID, LIKES_COLLECTION, [
    Query.equal("postId", postId),
    Query.equal("userId", userId),
    Query.limit(1),
  ]);

  if (existing.documents.length === 0) {
    return { liked: false, alreadyUnliked: true };
  }

  await db.deleteDocument(
    DATABASE_ID,
    LIKES_COLLECTION,
    existing.documents[0].$id,
  );

  // Decrement post likes count
  const post = await db.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
  const newCount = Math.max((post.likesCount || 0) - 1, 0);
  await db.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
    likesCount: newCount,
  });

  return { liked: false, likesCount: newCount };
}

// ===================== COMMENTS =====================

/**
 * Add a comment to a post
 */
async function addComment(data) {
  const commentId = ID.unique();
  const doc = await db.createDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION,
    commentId,
    {
      postId: data.postId,
      userId: data.userId,
      username: data.username,
      userAvatar: data.userAvatar || null,
      text: data.text,
      parentCommentId: data.parentCommentId || null,
      likesCount: 0,
      isActive: true,
    },
  );

  // Increment post comments count
  const post = await db.getDocument(DATABASE_ID, POSTS_COLLECTION, data.postId);
  await db.updateDocument(DATABASE_ID, POSTS_COLLECTION, data.postId, {
    commentsCount: (post.commentsCount || 0) + 1,
  });

  return {
    id: doc.$id,
    ...doc,
  };
}

/**
 * Get comments for a post (paginated)
 */
async function getComments({ postId, limit = 20, cursor = null }) {
  const queries = [
    Query.equal("postId", postId),
    Query.equal("isActive", true),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const result = await db.listDocuments(
    DATABASE_ID,
    COMMENTS_COLLECTION,
    queries,
  );

  return {
    comments: result.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
    })),
    total: result.total,
    hasMore: result.documents.length === limit,
  };
}

/**
 * Delete a comment (soft-delete)
 */
async function deleteComment(commentId, userId) {
  const comment = await db.getDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION,
    commentId,
  );
  if (comment.userId !== userId) {
    throw new Error("Unauthorized: you can only delete your own comments");
  }

  await db.updateDocument(DATABASE_ID, COMMENTS_COLLECTION, commentId, {
    isActive: false,
  });

  // Decrement post comments count
  const post = await db.getDocument(
    DATABASE_ID,
    POSTS_COLLECTION,
    comment.postId,
  );
  await db.updateDocument(DATABASE_ID, POSTS_COLLECTION, comment.postId, {
    commentsCount: Math.max((post.commentsCount || 0) - 1, 0),
  });

  return { deleted: true };
}

// ===================== SHARES =====================

/**
 * Record a share event
 */
async function recordShare(postId, userId, platform) {
  await db.createDocument(DATABASE_ID, SHARES_COLLECTION, ID.unique(), {
    postId,
    userId,
    platform: platform || "unknown",
  });

  // Increment post shares count
  const post = await db.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
  const newCount = (post.sharesCount || 0) + 1;
  await db.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
    sharesCount: newCount,
  });

  return { shared: true, sharesCount: newCount };
}

// ===================== FOLLOWS =====================

/**
 * Follow a user
 */
async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  // Check if already following
  const existing = await db.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION, [
    Query.equal("followerId", followerId),
    Query.equal("followingId", followingId),
    Query.limit(1),
  ]);

  if (existing.documents.length > 0) {
    return { following: true, alreadyFollowing: true };
  }

  await db.createDocument(DATABASE_ID, FOLLOWS_COLLECTION, ID.unique(), {
    followerId,
    followingId,
  });

  return { following: true };
}

/**
 * Unfollow a user
 */
async function unfollowUser(followerId, followingId) {
  const existing = await db.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION, [
    Query.equal("followerId", followerId),
    Query.equal("followingId", followingId),
    Query.limit(1),
  ]);

  if (existing.documents.length === 0) {
    return { following: false, alreadyUnfollowed: true };
  }

  await db.deleteDocument(
    DATABASE_ID,
    FOLLOWS_COLLECTION,
    existing.documents[0].$id,
  );

  return { following: false };
}

/**
 * Get follower/following counts for a user
 */
async function getFollowCounts(userId) {
  const [followers, following] = await Promise.all([
    db.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION, [
      Query.equal("followingId", userId),
      Query.limit(1),
    ]),
    db.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION, [
      Query.equal("followerId", userId),
      Query.limit(1),
    ]),
  ]);

  return {
    followersCount: followers.total,
    followingCount: following.total,
  };
}

/**
 * Check if user A follows user B
 */
async function isFollowing(followerId, followingId) {
  const result = await db.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION, [
    Query.equal("followerId", followerId),
    Query.equal("followingId", followingId),
    Query.limit(1),
  ]);
  return result.documents.length > 0;
}

/**
 * Get list of followers for a user
 */
async function getFollowers({ userId, limit = 20, cursor = null }) {
  const queries = [
    Query.equal("followingId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (cursor) queries.push(Query.cursorAfter(cursor));

  const result = await db.listDocuments(
    DATABASE_ID,
    FOLLOWS_COLLECTION,
    queries,
  );
  return {
    followers: result.documents.map((d) => ({
      id: d.$id,
      userId: d.followerId,
      followedAt: d.$createdAt,
    })),
    total: result.total,
    hasMore: result.documents.length === limit,
  };
}

/**
 * Get list of users that a user follows
 */
async function getFollowing({ userId, limit = 20, cursor = null }) {
  const queries = [
    Query.equal("followerId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (cursor) queries.push(Query.cursorAfter(cursor));

  const result = await db.listDocuments(
    DATABASE_ID,
    FOLLOWS_COLLECTION,
    queries,
  );
  return {
    following: result.documents.map((d) => ({
      id: d.$id,
      userId: d.followingId,
      followedAt: d.$createdAt,
    })),
    total: result.total,
    hasMore: result.documents.length === limit,
  };
}

// ===================== MEDIA UPLOAD =====================

/**
 * Upload media file to Appwrite Storage
 * Returns the file URL
 */
async function uploadMedia(file) {
  const bucketId = STORAGE_BUCKET;
  if (!bucketId) {
    throw new Error("Storage bucket not configured");
  }

  const fileId = ID.unique();
  const uploaded = await storage.createFile(bucketId, fileId, file);

  const fileUrl = `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${env.APPWRITE_PROJECT_ID}`;
  return {
    fileId: uploaded.$id,
    fileUrl,
  };
}

// ===================== TRENDING =====================

/**
 * Get trending posts based on engagement velocity
 * Simple algorithm: weighted score of recent likes, comments, shares
 */
async function getTrendingPosts({ limit = 10, campus = null }) {
  const queries = [
    Query.equal("isActive", true),
    Query.orderDesc("likesCount"),
    Query.limit(limit * 3), // Fetch more to filter
  ];

  if (campus) {
    queries.push(Query.equal("campus", campus));
  }

  const result = await db.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries);

  // Score posts by engagement velocity
  const now = Date.now();
  const scored = result.documents.map((doc) => {
    const ageHours =
      (now - new Date(doc.$createdAt).getTime()) / (1000 * 60 * 60);
    const decayFactor = Math.max(0.1, 1 / (1 + ageHours / 24)); // Decay over 24h

    const engagementScore =
      (doc.likesCount || 0) * 1 +
      (doc.commentsCount || 0) * 3 +
      (doc.sharesCount || 0) * 5 +
      (doc.viewsCount || 0) * 0.1;

    return {
      id: doc.$id,
      ...doc,
      trendingScore: engagementScore * decayFactor,
      hashtags: doc.hashtags ? JSON.parse(doc.hashtags) : [],
      product: doc.productId
        ? {
            id: doc.productId,
            name: doc.productName,
            price: doc.productPrice,
            image: doc.productImage,
            discount: doc.productDiscount,
          }
        : null,
    };
  });

  // Sort by trending score and return top N
  scored.sort((a, b) => b.trendingScore - a.trendingScore);
  return scored.slice(0, limit);
}

// ===================== CREATOR PROFILE =====================

/**
 * Get creator profile stats
 */
async function getCreatorStats(userId) {
  // Get all active posts by this user
  const posts = await db.listDocuments(DATABASE_ID, POSTS_COLLECTION, [
    Query.equal("userId", userId),
    Query.equal("isActive", true),
    Query.limit(100),
  ]);

  const followCounts = await getFollowCounts(userId);

  let totalViews = 0;
  let totalLikes = 0;
  let totalShares = 0;
  let totalComments = 0;

  for (const post of posts.documents) {
    totalViews += post.viewsCount || 0;
    totalLikes += post.likesCount || 0;
    totalShares += post.sharesCount || 0;
    totalComments += post.commentsCount || 0;
  }

  return {
    postsCount: posts.total,
    totalViews,
    totalLikes,
    totalShares,
    totalComments,
    ...followCounts,
  };
}

module.exports = {
  // Posts
  createPost,
  getPostById,
  getFeed,
  getUserPosts,
  deletePost,
  incrementViews,
  // Likes
  likePost,
  unlikePost,
  // Comments
  addComment,
  getComments,
  deleteComment,
  // Shares
  recordShare,
  // Follows
  followUser,
  unfollowUser,
  getFollowCounts,
  isFollowing,
  getFollowers,
  getFollowing,
  // Media
  uploadMedia,
  // Trending
  getTrendingPosts,
  // Creator
  getCreatorStats,
};
