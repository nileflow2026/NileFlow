const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { currencyMiddleware } = require("../middleware/currencyMiddleware");
const {
  getCustomerProfile,
  updateCurrencyRates,
  getCustomerOrders,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  getProducts,
  incrementProductRatingsCount,
  submitReview,
  getProductReviews,
  submitRating,
  updateUserAvatar,
  getCategories,
  getProductsForMobile,
  getFeaturedProducts,
  getDealProducts,
  getHeroProducts,
  getProductsByCategory,
  getMobileCategories,
  getCategorie,
  getCategoryById,
  getProducts2,
  getPopularSearches,
  getGlobalDealCountdown,
  getDealAnalytics,
  getProductImages,
} = require("../controllers/UserControllers/ClientController");
const {
  handleCancelRequest,
} = require("../controllers/UserControllers/orderController");

// Add this at the TOP of your routes file, before any routes
/* router.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  console.log(`📥 Path: ${req.path}`);
  console.log(`📥 Params:`, req.params);
  console.log(`📥 Query:`, req.query);
  next();
}); */

// Protected route
router.get("/profile", authenticateToken, getCustomerProfile);
router.get("/update-currencies", authenticateToken, updateCurrencyRates);
router.get("/customer-orders", authenticateToken, getCustomerOrders);
router.post("/customer-searches", saveRecentSearch);
router.get("/customer-recent-search", getRecentSearches);
router.get("/popular-searches", getPopularSearches);
router.get("/fetch-product", currencyMiddleware, getProducts);
router.get("/fetch-product-mobile", currencyMiddleware, getProductsForMobile);
router.post("/increment-rating", incrementProductRatingsCount);
router.post("/submit-review", authenticateToken, submitReview);
router.delete("/clear-recent-search", authenticateToken, clearRecentSearches);
router.get("/fetch-reviews/:productId", getProductReviews);
router.post("/sumbitRating", authenticateToken, submitRating);
router.post("/updatedAvatar", authenticateToken, updateUserAvatar);

router.get("/categories", getCategories);
router.get("/categories/getcategories", getCategorie);
router.get("/categories/:categoryId", getCategoryById);
router.get("/mobile-categories", getMobileCategories);
router.get("/mobile-products", currencyMiddleware, getProducts2);
router.get(
  "/products/category/:categoryId",
  currencyMiddleware,
  getProductsByCategory,
);
router.get("/featured-products", getFeaturedProducts);
router.get("/deal-products", currencyMiddleware, getDealProducts);
router.get("/deal-analytics", getDealAnalytics);
router.get("/deal-countdown", getGlobalDealCountdown);
router.get("/hero-products", getHeroProducts);

// Single product images (fetches from both main + vendor collections)
router.get("/product/:productId/images", getProductImages);

// Order cancellation request
router.post("/orders/cancel-request", authenticateToken, handleCancelRequest);

module.exports = router;
