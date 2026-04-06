/**
 * Social Commerce Routes
 * All social feed, engagement, and creator endpoints.
 *
 * Public routes (no auth needed):
 *   GET /feed          - Browse the feed
 *   GET /trending      - Trending posts
 *   GET /posts/:postId - Single post
 *
 * Authenticated routes:
 *   POST   /posts                      - Create post
 *   DELETE /posts/:postId              - Delete post
 *   POST   /posts/:postId/like         - Like
 *   DELETE /posts/:postId/like         - Unlike
 *   POST   /posts/:postId/comments     - Comment
 *   GET    /posts/:postId/comments     - Get comments
 *   DELETE /comments/:commentId        - Delete comment
 *   POST   /posts/:postId/share        - Record share
 *   POST   /posts/:postId/view         - Record view
 *   POST   /users/:userId/follow       - Follow
 *   DELETE /users/:userId/follow       - Unfollow
 *   GET    /users/:userId/followers    - Follower list
 *   GET    /users/:userId/following    - Following list
 *   GET    /users/:userId/follow-status- Follow status
 *   GET    /users/:userId/posts        - User's posts
 *   GET    /users/:userId/profile      - User profile
 *   GET    /creator/stats              - Creator dashboard stats
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../Config/multer");
const socialController = require("../controllers/UserControllers/SocialCommerceController");

// Optional auth middleware - attaches user if logged in, but doesn't block
const optionalAuth = (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    req.user = null;
    return next();
  }
  // Delegate to real auth middleware
  return authMiddleware(req, res, next);
};

// ========== PUBLIC ROUTES ==========
router.get("/feed", optionalAuth, socialController.getFeed);
router.get("/trending", socialController.getTrending);
router.get("/posts/:postId", socialController.getPost);
router.get("/posts/:postId/comments", socialController.getComments);
router.get("/users/:userId/posts", socialController.getUserPosts);

// ========== AUTHENTICATED ROUTES ==========

// Posts
router.post("/posts", authMiddleware, socialController.createPost);
router.delete("/posts/:postId", authMiddleware, socialController.deletePost);
router.post("/posts/:postId/view", optionalAuth, socialController.viewPost);

// Likes
router.post("/posts/:postId/like", authMiddleware, socialController.likePost);
router.delete(
  "/posts/:postId/like",
  authMiddleware,
  socialController.unlikePost,
);

// Comments
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  socialController.addComment,
);
router.delete(
  "/comments/:commentId",
  authMiddleware,
  socialController.deleteComment,
);

// Shares
router.post("/posts/:postId/share", authMiddleware, socialController.sharePost);

// Follows
router.post(
  "/users/:userId/follow",
  authMiddleware,
  socialController.followUser,
);
router.delete(
  "/users/:userId/follow",
  authMiddleware,
  socialController.unfollowUser,
);
router.get("/users/:userId/followers", socialController.getFollowers);
router.get("/users/:userId/following", socialController.getFollowing);
router.get(
  "/users/:userId/follow-status",
  authMiddleware,
  socialController.getFollowStatus,
);

// User Profile
router.get(
  "/users/:userId/profile",
  optionalAuth,
  socialController.getUserProfile,
);

// Creator
router.get("/creator/stats", authMiddleware, socialController.getCreatorStats);

// Media Upload
router.post(
  "/upload-media",
  authMiddleware,
  upload.single("file"),
  socialController.uploadMedia,
);

module.exports = router;
