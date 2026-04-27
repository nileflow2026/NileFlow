/**
 * deletionController.js
 * =====================
 * HTTP controller for the Account Deletion system.
 *
 * Endpoints:
 *   POST   /api/account/deletion/send-otp        — Send OTP for verification
 *   POST   /api/account/deletion/request          — Verify OTP & initiate deletion
 *   GET    /api/account/deletion/status/:userId   — Get deletion status
 *   POST   /api/account/deletion/cancel           — Cancel pending deletion
 */

"use strict";

const DeletionService = require("../../services/DeletionService");
const { db, users } = require("../../src/appwrite");
const { env } = require("../../src/env");
const { Query } = require("node-appwrite");
const logger = require("../../utils/logger");
const validator = require("validator");

// ─────────────────────────────────────────────
// Helper — resolve userId from request
// Works whether the user is authenticated (via JWT middleware)
// or submitting via email (public endpoint for policy compliance).
// ─────────────────────────────────────────────
async function resolveUser(req) {
  // Prefer authenticated user from middleware
  if (req.user && req.user.userId) {
    return {
      userId: req.user.userId,
      email: req.user.email,
    };
  }

  // Fallback: resolve by email (used for unauthenticated policy requests)
  const { email } = req.body;
  if (!email || !validator.isEmail(String(email))) {
    throw Object.assign(new Error("Valid email address is required."), {
      code: "INVALID_EMAIL",
      status: 400,
    });
  }

  const sanitizedEmail = validator.normalizeEmail(String(email));

  if (!env.APPWRITE_USER_COLLECTION_ID) {
    throw Object.assign(new Error("User collection not configured."), {
      code: "CONFIG_ERROR",
      status: 500,
    });
  }

  const result = await db.listDocuments(
    env.APPWRITE_DATABASE_ID,
    env.APPWRITE_USER_COLLECTION_ID,
    [Query.equal("email", sanitizedEmail), Query.limit(1)],
  );

  if (result.total === 0) {
    // Do NOT reveal whether user exists — return success silently
    return null;
  }

  return {
    userId: result.documents[0].userId,
    email: sanitizedEmail,
  };
}

// ─────────────────────────────────────────────
// POST /api/account/deletion/send-otp
// Body: { email? } — email required only if not authenticated
// Rate limited at route level (3 per hour)
// ─────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const userInfo = await resolveUser(req);

    // Silent success to prevent user enumeration
    if (!userInfo) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a verification code has been sent.",
      });
    }

    const result = await DeletionService.sendOtp(
      userInfo.userId,
      userInfo.email,
    );
    return res.status(200).json(result);
  } catch (err) {
    logger.error("deletionController.sendOtp error", { err: err.message });

    if (
      err.code === "DELETION_ALREADY_ACTIVE" ||
      err.code === "OTP_RATE_LIMITED"
    ) {
      return res.status(429).json({
        error: err.message,
        code: err.code,
        retryAfterMinutes: err.retryAfterMinutes,
      });
    }

    return res.status(err.status || 500).json({
      error: err.message || "Failed to send verification code.",
      code: err.code || "INTERNAL_ERROR",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/account/deletion/request
// Body: { email?, otp }
// Verifies OTP and initiates deletion.
// ─────────────────────────────────────────────
const initiateRequest = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || String(otp).length !== 6 || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        error: "A valid 6-digit verification code is required.",
        code: "INVALID_OTP_FORMAT",
      });
    }

    const userInfo = await resolveUser(req);
    if (!userInfo) {
      return res.status(404).json({
        error: "Account not found.",
        code: "USER_NOT_FOUND",
      });
    }

    const result = await DeletionService.verifyOtpAndInitiate(
      userInfo.userId,
      userInfo.email,
      String(otp),
    );

    return res.status(200).json(result);
  } catch (err) {
    logger.error("deletionController.initiateRequest error", {
      err: err.message,
    });

    const errorStatusMap = {
      NO_PENDING_REQUEST: 400,
      DELETION_ALREADY_ACTIVE: 409,
      OTP_LOCKED: 429,
      OTP_EXPIRED: 410,
      OTP_INVALID: 400,
      ACTIVE_ORDERS_BLOCKING: 409,
      INVALID_EMAIL: 400,
    };

    const status = errorStatusMap[err.code] || err.status || 500;

    return res.status(status).json({
      error: err.message || "Failed to initiate deletion request.",
      code: err.code || "INTERNAL_ERROR",
      remainingAttempts: err.remainingAttempts,
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/account/deletion/status/:userId
// Public endpoint required for Play Store / GDPR compliance.
// Returns only status-level info, no personal data.
// ─────────────────────────────────────────────
const getStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || typeof userId !== "string" || userId.length > 36) {
      return res.status(400).json({
        error: "Invalid userId.",
        code: "INVALID_USER_ID",
      });
    }

    // If endpoint is authenticated, validate ownership
    if (req.user && req.user.userId && req.user.userId !== userId) {
      // Allow admins to query any user
      if (req.user.role !== "admin") {
        return res.status(403).json({
          error: "You may only query your own deletion status.",
          code: "FORBIDDEN",
        });
      }
    }

    const status = await DeletionService.getStatus(userId);

    if (!status) {
      return res.status(200).json({
        status: "none",
        message: "No deletion request found for this account.",
      });
    }

    return res.status(200).json(status);
  } catch (err) {
    logger.error("deletionController.getStatus error", { err: err.message });
    return res.status(500).json({
      error: "Failed to retrieve deletion status.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/account/deletion/cancel
// Body: { reason? }
// Cancels a pending deletion request (authenticated only).
// ─────────────────────────────────────────────
const cancelRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: "Authentication required to cancel a deletion request.",
        code: "UNAUTHENTICATED",
      });
    }

    const userId = req.user.userId;
    const reason =
      typeof req.body.reason === "string" ? req.body.reason.slice(0, 300) : "";

    const result = await DeletionService.cancelRequest(userId, reason);
    return res.status(200).json(result);
  } catch (err) {
    logger.error("deletionController.cancelRequest error", {
      err: err.message,
    });

    const errorStatusMap = {
      NO_REQUEST: 404,
      ALREADY_COMPLETED: 410,
      ALREADY_PROCESSING: 409,
      ALREADY_CANCELLED: 409,
    };

    const status = errorStatusMap[err.code] || 500;

    return res.status(status).json({
      error: err.message || "Failed to cancel deletion request.",
      code: err.code || "INTERNAL_ERROR",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/account/deletion/admin/force-purge
// Admin-only: force-purge a completed deletion that failed to clean up fully.
// Requires: admin role
// ─────────────────────────────────────────────
const adminForcePurge = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required.",
        code: "FORBIDDEN",
      });
    }

    const { userId } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "userId is required.",
        code: "MISSING_USER_ID",
      });
    }

    const status = await DeletionService.getStatus(userId);

    if (!status) {
      return res.status(404).json({
        error: "No deletion request found for this user.",
        code: "NOT_FOUND",
      });
    }

    // Get the actual document for executePurge
    const DELETION_COLL = process.env.APPWRITE_DELETION_REQUESTS_COLLECTION_ID;
    const { db: appwriteDb } = require("../../src/appwrite");
    const { Query: AQuery } = require("node-appwrite");

    const result = await appwriteDb.listDocuments(
      env.APPWRITE_DATABASE_ID,
      DELETION_COLL,
      [AQuery.equal("userId", userId), AQuery.limit(1)],
    );

    if (result.total === 0) {
      return res
        .status(404)
        .json({ error: "Request document not found.", code: "NOT_FOUND" });
    }

    const purgeResult = await DeletionService.executePurge(result.documents[0]);
    return res.status(200).json(purgeResult);
  } catch (err) {
    logger.error("deletionController.adminForcePurge error", {
      err: err.message,
    });
    return res.status(500).json({
      error: err.message || "Force purge failed.",
      code: "INTERNAL_ERROR",
    });
  }
};

module.exports = {
  sendOtp,
  initiateRequest,
  getStatus,
  cancelRequest,
  adminForcePurge,
};
