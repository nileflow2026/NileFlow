/**
 * Social Commerce API Service
 * All frontend API calls for the social commerce feature.
 * Uses axiosClient which handles auth tokens automatically.
 */

import axiosClient from "../api";

const BASE = "/api/social";

// ===================== FEED =====================

/**
 * Fetch the social feed (paginated)
 * @param {Object} params - { limit, cursor }
 * @returns {Promise<{ posts, total, hasMore, lastId }>}
 */
export async function fetchFeed({ limit = 10, cursor = null } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosClient.get(`${BASE}/feed`, { params });
  return res.data;
}

/**
 * Fetch trending posts
 * @param {Object} params - { limit, campus }
 */
export async function fetchTrending({ limit = 10, campus = null } = {}) {
  const params = { limit };
  if (campus) params.campus = campus;
  const res = await axiosClient.get(`${BASE}/trending`, { params });
  return res.data;
}

// ===================== POSTS =====================

/**
 * Create a new post
 * @param {Object} data - Post data
 */
export async function createPost(data) {
  const res = await axiosClient.post(`${BASE}/posts`, data);
  return res.data;
}

/**
 * Get a single post
 */
export async function getPost(postId) {
  const res = await axiosClient.get(`${BASE}/posts/${postId}`);
  return res.data;
}

/**
 * Get posts by a specific user
 */
export async function getUserPosts(userId, { limit = 20, cursor = null } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosClient.get(`${BASE}/users/${userId}/posts`, {
    params,
  });
  return res.data;
}

/**
 * Delete a post
 */
export async function deletePost(postId) {
  const res = await axiosClient.delete(`${BASE}/posts/${postId}`);
  return res.data;
}

/**
 * Record a view on a post
 */
export async function viewPost(postId) {
  try {
    await axiosClient.post(`${BASE}/posts/${postId}/view`);
  } catch {
    // Non-critical, don't throw
  }
}

// ===================== LIKES =====================

/**
 * Like a post
 * @returns {Promise<{ liked, likesCount }>}
 */
export async function likePost(postId) {
  const res = await axiosClient.post(`${BASE}/posts/${postId}/like`);
  return res.data;
}

/**
 * Unlike a post
 * @returns {Promise<{ liked, likesCount }>}
 */
export async function unlikePost(postId) {
  const res = await axiosClient.delete(`${BASE}/posts/${postId}/like`);
  return res.data;
}

// ===================== COMMENTS =====================

/**
 * Add a comment to a post
 */
export async function addComment(postId, data) {
  const res = await axiosClient.post(`${BASE}/posts/${postId}/comments`, data);
  return res.data;
}

/**
 * Get comments for a post
 */
export async function getComments(postId, { limit = 20, cursor = null } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosClient.get(`${BASE}/posts/${postId}/comments`, {
    params,
  });
  return res.data;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId) {
  const res = await axiosClient.delete(`${BASE}/comments/${commentId}`);
  return res.data;
}

// ===================== SHARES =====================

/**
 * Record a share event
 */
export async function recordShare(postId, platform) {
  const res = await axiosClient.post(`${BASE}/posts/${postId}/share`, {
    platform,
  });
  return res.data;
}

// ===================== FOLLOWS =====================

/**
 * Follow a user
 */
export async function followUser(userId) {
  const res = await axiosClient.post(`${BASE}/users/${userId}/follow`);
  return res.data;
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId) {
  const res = await axiosClient.delete(`${BASE}/users/${userId}/follow`);
  return res.data;
}

/**
 * Get follower list
 */
export async function getFollowers(userId, { limit = 20, cursor = null } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosClient.get(`${BASE}/users/${userId}/followers`, {
    params,
  });
  return res.data;
}

/**
 * Get following list
 */
export async function getFollowing(userId, { limit = 20, cursor = null } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosClient.get(`${BASE}/users/${userId}/following`, {
    params,
  });
  return res.data;
}

/**
 * Get follow status + counts for a user
 */
export async function getFollowStatus(userId) {
  const res = await axiosClient.get(`${BASE}/users/${userId}/follow-status`);
  return res.data;
}

// ===================== PROFILE =====================

/**
 * Get a user's public profile (with stats)
 */
export async function getUserProfile(userId) {
  const res = await axiosClient.get(`${BASE}/users/${userId}/profile`);
  return res.data;
}

/**
 * Get creator stats for the authenticated user
 */
export async function getCreatorStats() {
  const res = await axiosClient.get(`${BASE}/creator/stats`);
  return res.data;
}
