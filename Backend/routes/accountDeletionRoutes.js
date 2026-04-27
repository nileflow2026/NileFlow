/**
 * accountDeletionRoutes.js
 * ========================
 * Routes for the Account & Data Deletion system.
 *
 * Public:
 *   GET  /api/account/deletion/status/:userId  — GDPR/Play Store compliance endpoint
 *
 * Authenticated (user must be logged in):
 *   POST /api/account/deletion/send-otp        — Request OTP for deletion
 *   POST /api/account/deletion/request         — Verify OTP + initiate deletion
 *   POST /api/account/deletion/cancel          — Cancel pending deletion
 *
 * Admin:
 *   POST /api/account/deletion/admin/force-purge — Force-retry a failed purge
 */

"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendOtp,
  initiateRequest,
  getStatus,
  cancelRequest,
  adminForcePurge,
} = require("../controllers/UserControllers/deletionController");

const router = express.Router();

// ─────────────────────────────────────────────
// Rate limiters
// ─────────────────────────────────────────────

// OTP send: 3 requests per hour per IP
const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Key by authenticated userId if available, else by IP
    return req.user?.userId || req.ip;
  },
  message: {
    error: "Too many OTP requests. You may request a new code after 1 hour.",
    code: "OTP_RATE_LIMITED",
  },
  skip: (req) => {
    // Never skip in production
    return false;
  },
});

// Initiation: 5 per hour per IP to prevent brute-force
const initiationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  message: {
    error: "Too many deletion attempts. Please try again after 1 hour.",
    code: "RATE_LIMITED",
  },
});

// Status: 30 per minute per IP (public endpoint, must not be abused)
const statusLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many status requests.",
    code: "RATE_LIMITED",
  },
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

/**
 * POST /api/account/deletion/send-otp
 * Sends an OTP to the user's registered email.
 * Supports both authenticated requests and email-only (policy page).
 */
router.post(
  "/send-otp",
  otpSendLimiter,
  // authMiddleware is optional here — support unauthenticated policy page requests
  (req, res, next) => {
    // Try to attach user from JWT if present, but don't block if missing
    const authMiddlewareOptional = async (req, res, next) => {
      try {
        const accessToken =
          req.cookies?.accessToken ||
          (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null);
        if (accessToken) {
          const { verifyAccessToken } = require("../utils/tokenManager");
          const decoded = verifyAccessToken(accessToken);
          req.user = {
            userId: decoded.sub,
            role: decoded.role,
            email: decoded.email || null,
          };
        }
      } catch {
        // Token invalid/missing — continue without user context
        req.user = null;
      }
      next();
    };
    authMiddlewareOptional(req, res, next);
  },
  sendOtp,
);

/**
 * POST /api/account/deletion/request
 * Verifies OTP and initiates the deletion request.
 * Supports both authenticated and email-only flows.
 */
router.post(
  "/request",
  initiationLimiter,
  (req, res, next) => {
    const authMiddlewareOptional = async (req, res, next) => {
      try {
        const accessToken =
          req.cookies?.accessToken ||
          (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null);
        if (accessToken) {
          const { verifyAccessToken } = require("../utils/tokenManager");
          const decoded = verifyAccessToken(accessToken);
          req.user = {
            userId: decoded.sub,
            role: decoded.role,
            email: decoded.email || null,
          };
        }
      } catch {
        req.user = null;
      }
      next();
    };
    authMiddlewareOptional(req, res, next);
  },
  initiateRequest,
);

/**
 * GET /api/account/deletion/status/:userId
 * Public endpoint — Play Store / GDPR compliance.
 * Returns current deletion status.
 */
router.get(
  "/status/:userId",
  statusLimiter,
  (req, res, next) => {
    // Try optional auth
    const tryAuth = async (req, res, next) => {
      try {
        const accessToken =
          req.cookies?.accessToken ||
          (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null);
        if (accessToken) {
          const { verifyAccessToken } = require("../utils/tokenManager");
          const decoded = verifyAccessToken(accessToken);
          req.user = {
            userId: decoded.sub,
            role: decoded.role,
            email: decoded.email || null,
          };
        }
      } catch {
        req.user = null;
      }
      next();
    };
    tryAuth(req, res, next);
  },
  getStatus,
);

/**
 * POST /api/account/deletion/cancel
 * Cancels a pending deletion (authenticated users only).
 */
router.post("/cancel", authMiddleware, cancelRequest);

/**
 * POST /api/account/deletion/admin/force-purge
 * Admin-only: force retry a failed purge.
 */
router.post("/admin/force-purge", authMiddleware, adminForcePurge);

module.exports = router;
