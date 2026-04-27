/**
 * DeletionService.js
 * ==================
 * Deletion Orchestration Service — account & data lifecycle management.
 *
 * Responsibilities:
 *  1. OTP generation + email dispatch
 *  2. OTP verification + request creation
 *  3. Immediate account lock (disable login, revoke sessions)
 *  4. Scheduled cascading purge (executed by cron after grace period)
 *  5. Status queries
 *  6. Request cancellation (within grace period)
 *  7. Edge-case guards (active orders, vendor accounts, financial records)
 *
 * Security:
 *  - OTP is bcrypt-hashed before storage
 *  - OTP is rate-limited (3 sends per hour per user)
 *  - OTP has max 5 verify attempts before lockout
 *  - Idempotent — safe to call multiple times
 *  - All actions are audit-logged (non-personal entries only)
 */

"use strict";

const { ID, Query } = require("node-appwrite");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cron = require("node-cron");
const { Resend } = require("resend");
const { db, users, storage } = require("./appwriteService");
const { env } = require("../src/env");
const logger = require("../utils/logger");

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const DB_ID = env.APPWRITE_DATABASE_ID;
const DELETION_COLL =
  process.env.APPWRITE_DELETION_REQUESTS_COLLECTION_ID || "";
const GRACE_PERIOD_DAYS = parseInt(
  process.env.DELETION_GRACE_PERIOD_DAYS || "7",
  10,
);
const OTP_TTL_MINUTES = 15;
const OTP_MAX_ATTEMPTS = 5;
const OTP_SEND_LIMIT = 3; // per hour per user
const BCRYPT_ROUNDS = 10;
const ANONYMISED_PREFIX = "DELETED_USER";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────
// Helper — safe document deletion in bulk
// ─────────────────────────────────────────────

async function deleteDocumentsByUserId(collectionId, userIdField, userId) {
  if (!collectionId) return 0;
  let deleted = 0;
  let cursor = null;

  do {
    const queries = [Query.equal(userIdField, userId), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const page = await db.listDocuments(DB_ID, collectionId, queries);
    for (const doc of page.documents) {
      try {
        await db.deleteDocument(DB_ID, collectionId, doc.$id);
        deleted++;
      } catch (e) {
        logger.warn("DeletionService: doc delete failed", {
          collectionId,
          docId: doc.$id,
          err: e.message,
        });
      }
    }

    if (page.documents.length === 100) {
      cursor = page.documents[page.documents.length - 1].$id;
    } else {
      cursor = null;
    }
  } while (cursor);

  return deleted;
}

// ─────────────────────────────────────────────
// Helper — anonymise userId references
// ─────────────────────────────────────────────

function buildAnonymisedId(userId) {
  const hash = crypto
    .createHash("sha256")
    .update(userId)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return `${ANONYMISED_PREFIX}_${hash}`;
}

async function anonymiseDocumentsByUserId(
  collectionId,
  userIdField,
  emailField,
  userId,
) {
  if (!collectionId) return 0;
  const anonId = buildAnonymisedId(userId);
  let updated = 0;
  let cursor = null;

  do {
    const queries = [Query.equal(userIdField, userId), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const page = await db.listDocuments(DB_ID, collectionId, queries);
    for (const doc of page.documents) {
      const patch = { [userIdField]: anonId };
      if (emailField && doc[emailField]) {
        patch[emailField] = `${anonId}@deleted.nileflow`;
      }
      try {
        await db.updateDocument(DB_ID, collectionId, doc.$id, patch);
        updated++;
      } catch (e) {
        logger.warn("DeletionService: doc anonymise failed", {
          collectionId,
          docId: doc.$id,
          err: e.message,
        });
      }
    }

    if (page.documents.length === 100) {
      cursor = page.documents[page.documents.length - 1].$id;
    } else {
      cursor = null;
    }
  } while (cursor);

  return updated;
}

// ─────────────────────────────────────────────
// Helper — audit log append
// ─────────────────────────────────────────────

function appendAuditEvent(existingLogJson, eventType, meta = {}) {
  let log = [];
  try {
    log = JSON.parse(existingLogJson || "[]");
  } catch {
    log = [];
  }
  log.push({
    event: eventType,
    ts: new Date().toISOString(),
    ...meta,
  });
  // Keep last 50 events to avoid exceeding Appwrite field size
  if (log.length > 50) log = log.slice(-50);
  return JSON.stringify(log);
}

// ─────────────────────────────────────────────
// Helper — send OTP email
// ─────────────────────────────────────────────

async function sendOtpEmail(email, otp, username = "User") {
  await resend.emails.send({
    from: "Nile Flow <no-reply@nileflowafrica.com>",
    to: email,
    subject: "Your Account Deletion Verification Code",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Deletion OTP</title>
</head>
<body style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;margin:0;padding:40px 20px;color:#e2e8f0;">
  <div style="max-width:520px;margin:0 auto;background:#1e293b;border:1px solid rgba(239,68,68,0.3);border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:22px;color:#fff;letter-spacing:1px;">⚠️ ACCOUNT DELETION</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Nile Flow Africa</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#cbd5e1;">Hello <strong>${username}</strong>,</p>
      <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
        We received a request to permanently delete your Nile Flow account and all associated data.
        Use the verification code below to confirm this action.
      </p>
      <div style="background:#0f172a;border:2px dashed rgba(239,68,68,0.4);border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
        <p style="margin:0;font-size:40px;font-weight:700;color:#ef4444;letter-spacing:8px;">${otp}</p>
        <p style="margin:12px 0 0;color:#64748b;font-size:12px;">Expires in ${OTP_TTL_MINUTES} minutes</p>
      </div>
      <div style="background:rgba(239,68,68,0.08);border-left:3px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
        <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">
          ⚠️ <strong>This action is irreversible.</strong> Once confirmed, your account, orders history,
          and all personal data will be permanently removed after a 7-day grace period.
          If you did NOT request this, please secure your account immediately.
        </p>
      </div>
      <p style="margin:0;color:#64748b;font-size:12px;">
        If you did not request account deletion, ignore this email. Your account remains safe.
      </p>
    </div>
    <div style="background:#0f172a;padding:16px;text-align:center;">
      <p style="margin:0;color:#475569;font-size:11px;">© 2026 Nile Flow Africa. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

// ─────────────────────────────────────────────
// Helper — send deletion confirmation email
// ─────────────────────────────────────────────

async function sendDeletionConfirmationEmail(email, username, scheduledDate) {
  const formattedDate = new Date(scheduledDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await resend.emails.send({
    from: "Nile Flow <no-reply@nileflowafrica.com>",
    to: email,
    subject: "Account Deletion Scheduled — Nile Flow Africa",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="font-family:'Inter',sans-serif;background:#0f172a;margin:0;padding:40px 20px;color:#e2e8f0;">
  <div style="max-width:520px;margin:0 auto;background:#1e293b;border:1px solid rgba(239,68,68,0.2);border-radius:16px;overflow:hidden;">
    <div style="background:#991b1b;padding:28px;text-align:center;">
      <h1 style="margin:0;font-size:20px;color:#fff;">Account Deletion Scheduled</h1>
    </div>
    <div style="padding:28px;">
      <p>Hello <strong>${username}</strong>,</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
        Your account deletion request has been received. Your account has been locked and
        all data will be permanently removed on <strong style="color:#fca5a5;">${formattedDate}</strong>.
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
        During this grace period, you can cancel the deletion by contacting support or visiting your account settings.
      </p>
      <div style="background:#0f172a;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#64748b;font-size:12px;">Scheduled deletion date</p>
        <p style="margin:4px 0 0;color:#ef4444;font-size:16px;font-weight:600;">${formattedDate}</p>
      </div>
      <p style="color:#64748b;font-size:12px;">
        If you believe this was a mistake, please contact us immediately at support@nileflowafrica.com.
      </p>
    </div>
    <div style="background:#0f172a;padding:16px;text-align:center;">
      <p style="margin:0;color:#475569;font-size:11px;">© 2026 Nile Flow Africa</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

// ─────────────────────────────────────────────
// Helper — get existing deletion request for user
// ─────────────────────────────────────────────

async function getExistingRequest(userId) {
  if (!DELETION_COLL) return null;
  const result = await db.listDocuments(DB_ID, DELETION_COLL, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return result.total > 0 ? result.documents[0] : null;
}

// ─────────────────────────────────────────────
// Helper — check active orders
// ─────────────────────────────────────────────

async function hasActiveOrders(userId) {
  if (!env.APPWRITE_ORDERS_COLLECTION) return false;
  try {
    const activeStatuses = [
      "pending",
      "processing",
      "shipped",
      "out_for_delivery",
    ];
    const result = await db.listDocuments(
      DB_ID,
      env.APPWRITE_ORDERS_COLLECTION,
      [
        Query.equal("userId", userId),
        Query.equal("status", activeStatuses),
        Query.limit(1),
      ],
    );
    return result.total > 0;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Helper — check vendor status
// ─────────────────────────────────────────────

async function isVendorAccount(userId) {
  try {
    const user = await users.get(userId);
    return user?.prefs?.role === "vendor";
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Helper — check paid orders for financial retention
// ─────────────────────────────────────────────

async function hasPaymentRecords(userId) {
  if (!env.APPWRITE_ORDERS_COLLECTION) return false;
  try {
    const result = await db.listDocuments(
      DB_ID,
      env.APPWRITE_ORDERS_COLLECTION,
      [
        Query.equal("userId", userId),
        Query.equal("paymentStatus", "paid"),
        Query.limit(1),
      ],
    );
    return result.total > 0;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// MAIN SERVICE
// ─────────────────────────────────────────────

class DeletionService {
  /**
   * Step 1a — Send OTP to user's email for identity verification.
   * Rate-limited: max 3 sends per hour per user.
   */
  static async sendOtp(userId, email) {
    if (!DELETION_COLL) {
      throw new Error(
        "APPWRITE_DELETION_REQUESTS_COLLECTION_ID not configured.",
      );
    }

    let request = await getExistingRequest(userId);

    // Block if already processing or completed
    if (
      request &&
      (request.status === "processing" || request.status === "completed")
    ) {
      throw Object.assign(
        new Error("A deletion request is already in progress or completed."),
        { code: "DELETION_ALREADY_ACTIVE" },
      );
    }

    // Rate limit OTP sends
    if (request) {
      const windowStart = request.otpWindowStart
        ? new Date(request.otpWindowStart)
        : null;
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      if (windowStart && windowStart > oneHourAgo) {
        const sendCount = request.otpSendCount || 0;
        if (sendCount >= OTP_SEND_LIMIT) {
          const retryAfter = Math.ceil(
            (windowStart.getTime() + 60 * 60 * 1000 - now.getTime()) / 60000,
          );
          throw Object.assign(
            new Error(
              `Too many OTP requests. Try again in ${retryAfter} minute(s).`,
            ),
            { code: "OTP_RATE_LIMITED", retryAfterMinutes: retryAfter },
          );
        }
      } else {
        // Reset window
        await db.updateDocument(DB_ID, DELETION_COLL, request.$id, {
          otpSendCount: 0,
          otpWindowStart: now.toISOString(),
        });
        request.otpSendCount = 0;
      }
    }

    // Generate 6-digit OTP
    const otpCode = String(crypto.randomInt(100000, 999999));
    const otpHash = await bcrypt.hash(otpCode, BCRYPT_ROUNDS);
    const otpExpiry = new Date(
      Date.now() + OTP_TTL_MINUTES * 60 * 1000,
    ).toISOString();
    const now = new Date();

    if (request) {
      // Update existing pending record
      const newAuditLog = appendAuditEvent(request.auditLog, "OTP_SENT");
      await db.updateDocument(DB_ID, DELETION_COLL, request.$id, {
        otpHash,
        otpExpiry,
        otpAttempts: 0,
        otpSendCount: (request.otpSendCount || 0) + 1,
        otpWindowStart: request.otpWindowStart || now.toISOString(),
        auditLog: newAuditLog,
      });
    } else {
      // Create new staging record
      await db.createDocument(DB_ID, DELETION_COLL, ID.unique(), {
        userId,
        email,
        status: "otp_pending",
        requestedAt: now.toISOString(),
        scheduledDeletionDate: new Date(
          now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString(),
        otpHash,
        otpExpiry,
        otpAttempts: 0,
        otpSendCount: 1,
        otpWindowStart: now.toISOString(),
        activeOrdersBlocked: false,
        isVendor: false,
        hasPaymentRecords: false,
        auditLog: appendAuditEvent("[]", "OTP_SENT"),
      });
    }

    // Fetch username for email personalisation
    let username = "User";
    try {
      const appwriteUser = await users.get(userId);
      username = appwriteUser.name || "User";
    } catch {
      // non-fatal
    }

    await sendOtpEmail(email, otpCode, username);
    logger.info("DeletionService: OTP sent", { userId });

    return { success: true, message: "Verification code sent to your email." };
  }

  /**
   * Step 1b — Verify OTP and initiate the deletion request.
   * After successful verification: account is locked immediately.
   */
  static async verifyOtpAndInitiate(userId, email, otpCode) {
    if (!DELETION_COLL) {
      throw new Error(
        "APPWRITE_DELETION_REQUESTS_COLLECTION_ID not configured.",
      );
    }

    const request = await getExistingRequest(userId);

    if (!request || request.status === "completed") {
      throw Object.assign(
        new Error(
          "No pending deletion request found. Please request an OTP first.",
        ),
        { code: "NO_PENDING_REQUEST" },
      );
    }

    if (request.status === "pending" || request.status === "processing") {
      throw Object.assign(
        new Error("Deletion request already confirmed and in progress."),
        { code: "DELETION_ALREADY_ACTIVE" },
      );
    }

    // Check OTP attempt limit
    if ((request.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      throw Object.assign(
        new Error("Maximum OTP attempts exceeded. Please request a new code."),
        { code: "OTP_LOCKED" },
      );
    }

    // Check OTP expiry
    if (!request.otpExpiry || new Date(request.otpExpiry) < new Date()) {
      throw Object.assign(
        new Error("OTP has expired. Please request a new code."),
        {
          code: "OTP_EXPIRED",
        },
      );
    }

    // Verify OTP
    const valid = await bcrypt.compare(String(otpCode), request.otpHash);

    if (!valid) {
      const newAttempts = (request.otpAttempts || 0) + 1;
      const newAuditLog = appendAuditEvent(request.auditLog, "OTP_FAILED", {
        attemptNumber: newAttempts,
      });
      await db.updateDocument(DB_ID, DELETION_COLL, request.$id, {
        otpAttempts: newAttempts,
        auditLog: newAuditLog,
      });
      const remaining = OTP_MAX_ATTEMPTS - newAttempts;
      throw Object.assign(
        new Error(
          `Invalid code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "No attempts remaining — request a new code."}`,
        ),
        { code: "OTP_INVALID", remainingAttempts: remaining },
      );
    }

    // OTP valid — run edge-case checks
    const [activeOrders, vendor, paymentRecs] = await Promise.all([
      hasActiveOrders(userId),
      isVendorAccount(userId),
      hasPaymentRecords(userId),
    ]);

    if (activeOrders) {
      const newAuditLog = appendAuditEvent(
        request.auditLog,
        "BLOCKED_ACTIVE_ORDERS",
      );
      await db.updateDocument(DB_ID, DELETION_COLL, request.$id, {
        activeOrdersBlocked: true,
        auditLog: newAuditLog,
      });
      throw Object.assign(
        new Error(
          "You have active orders in progress. Please wait for all orders to complete before deleting your account.",
        ),
        { code: "ACTIVE_ORDERS_BLOCKING" },
      );
    }

    const scheduledDeletionDate = new Date(
      Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const retentionNote = paymentRecs
      ? "Financial records anonymised (not deleted) per legal retention requirements."
      : null;

    const newAuditLog = appendAuditEvent(
      request.auditLog,
      "REQUEST_CONFIRMED",
      {
        isVendor: vendor,
        hasPaymentRecords: paymentRecs,
      },
    );

    // Update to confirmed pending status
    await db.updateDocument(DB_ID, DELETION_COLL, request.$id, {
      status: "pending",
      scheduledDeletionDate,
      otpHash: null,
      otpExpiry: null,
      otpAttempts: 0,
      isVendor: vendor,
      hasPaymentRecords: paymentRecs,
      retentionNote,
      auditLog: newAuditLog,
    });

    // Immediate lock: disable Appwrite auth account
    await DeletionService.lockAccount(userId, request.$id, request.auditLog);

    // Send confirmation email
    let username = "User";
    try {
      const appwriteUser = await users.get(userId);
      username = appwriteUser.name || "User";
    } catch {
      // non-fatal
    }

    try {
      await sendDeletionConfirmationEmail(
        email,
        username,
        scheduledDeletionDate,
      );
    } catch (e) {
      logger.warn("DeletionService: confirmation email failed", {
        userId,
        err: e.message,
      });
    }

    logger.info("DeletionService: deletion confirmed", {
      userId,
      scheduledDeletionDate,
      isVendor: vendor,
      hasPaymentRecords: paymentRecs,
    });

    return {
      success: true,
      status: "pending",
      requestedAt: request.requestedAt,
      scheduledDeletionDate,
      message: `Account deletion scheduled. All data will be removed on ${new Date(scheduledDeletionDate).toDateString()}.`,
      gracePeriodDays: GRACE_PERIOD_DAYS,
    };
  }

  /**
   * Step 2 — Immediate lock: disable Appwrite user, mark prefs.
   * Called right after OTP verification.
   */
  static async lockAccount(userId, requestDocId, currentAuditLog) {
    const auditEvents = [];

    // Disable user in Appwrite Auth (blocks all logins)
    try {
      await users.updateStatus(userId, false);
      auditEvents.push("AUTH_DISABLED");
    } catch (e) {
      logger.error("DeletionService: auth disable failed", {
        userId,
        err: e.message,
      });
    }

    // Update user preferences to mark deletion pending
    try {
      const appwriteUser = await users.get(userId);
      const currentPrefs = appwriteUser.prefs || {};
      await users.updatePrefs(userId, {
        ...currentPrefs,
        deletion_pending: true,
        deletion_requested_at: new Date().toISOString(),
      });
      auditEvents.push("PREFS_MARKED_DELETION_PENDING");
    } catch (e) {
      logger.warn("DeletionService: prefs update failed", {
        userId,
        err: e.message,
      });
    }

    // Delete all active Appwrite sessions
    try {
      const sessions = await users.listSessions(userId);
      const deletions = sessions.sessions.map((s) =>
        users.deleteSession(userId, s.$id).catch(() => {}),
      );
      await Promise.all(deletions);
      auditEvents.push(`SESSIONS_REVOKED_COUNT_${sessions.sessions.length}`);
    } catch (e) {
      logger.warn("DeletionService: session revoke failed", {
        userId,
        err: e.message,
      });
    }

    // Delete refresh tokens from DB collection
    if (env.APPWRITE_REFRESH_TOKEN_COLLECTION_ID) {
      try {
        await deleteDocumentsByUserId(
          env.APPWRITE_REFRESH_TOKEN_COLLECTION_ID,
          "userId",
          userId,
        );
        auditEvents.push("REFRESH_TOKENS_DELETED");
      } catch (e) {
        logger.warn("DeletionService: refresh token delete failed", {
          userId,
          err: e.message,
        });
      }
    }

    // Persist audit events
    if (requestDocId) {
      try {
        let newAuditLog = currentAuditLog || "[]";
        for (const ev of auditEvents) {
          newAuditLog = appendAuditEvent(newAuditLog, ev);
        }
        await db.updateDocument(DB_ID, DELETION_COLL, requestDocId, {
          auditLog: newAuditLog,
        });
      } catch {
        // non-fatal
      }
    }

    logger.info("DeletionService: account locked", { userId, auditEvents });
  }

  /**
   * Step 3 — Full cascading purge. Called by cron after grace period.
   * Idempotent — safe to retry.
   */
  static async executePurge(requestDoc) {
    const { userId, hasPaymentRecords: hasPaid, isVendor: vendor } = requestDoc;
    const audit = [];

    logger.info("DeletionService: starting purge", { userId });

    // Mark as processing
    await db
      .updateDocument(DB_ID, DELETION_COLL, requestDoc.$id, {
        status: "processing",
        auditLog: appendAuditEvent(requestDoc.auditLog, "PURGE_STARTED"),
      })
      .catch(() => {});

    // ── 1. Delete cart documents ──────────────────────────────────────
    if (env.APPWRITE_CART_COLLECTION_ID) {
      const n = await deleteDocumentsByUserId(
        env.APPWRITE_CART_COLLECTION_ID,
        "userId",
        userId,
      ).catch(() => 0);
      audit.push(`CART_DELETED_${n}`);
    }

    // ── 2. Delete notifications ───────────────────────────────────────
    if (env.APPWRITE_NOTIFICATIONS_COLLECTION_ID) {
      const n = await deleteDocumentsByUserId(
        env.APPWRITE_NOTIFICATIONS_COLLECTION_ID,
        "userId",
        userId,
      ).catch(() => 0);
      audit.push(`NOTIFICATIONS_DELETED_${n}`);
    }

    // ── 3. Delete reviews ────────────────────────────────────────────
    if (process.env.APPWRITE_REVIEW_COLLECTION_ID) {
      const n = await deleteDocumentsByUserId(
        process.env.APPWRITE_REVIEW_COLLECTION_ID,
        "userId",
        userId,
      ).catch(() => 0);
      audit.push(`REVIEWS_DELETED_${n}`);
    }

    // ── 4. Social posts, likes, comments, shares, follows ────────────
    const socialCollections = [
      {
        id: process.env.SOCIAL_POSTS_COLLECTION_ID,
        field: "userId",
        label: "SOCIAL_POSTS",
      },
      {
        id: process.env.SOCIAL_LIKES_COLLECTION_ID,
        field: "userId",
        label: "SOCIAL_LIKES",
      },
      {
        id: process.env.SOCIAL_COMMENTS_COLLECTION_ID,
        field: "userId",
        label: "SOCIAL_COMMENTS",
      },
      {
        id: process.env.SOCIAL_SHARES_COLLECTION_ID,
        field: "userId",
        label: "SOCIAL_SHARES",
      },
      {
        id: process.env.SOCIAL_FOLLOWS_COLLECTION_ID,
        field: "followerId",
        label: "SOCIAL_FOLLOWS_SENT",
      },
      {
        id: process.env.SOCIAL_FOLLOWS_COLLECTION_ID,
        field: "followingId",
        label: "SOCIAL_FOLLOWS_RECEIVED",
      },
    ];

    for (const sc of socialCollections) {
      if (!sc.id) continue;
      const n = await deleteDocumentsByUserId(sc.id, sc.field, userId).catch(
        () => 0,
      );
      audit.push(`${sc.label}_DELETED_${n}`);
    }

    // ── 5. Behavioural / recommendation data ─────────────────────────
    const behaviorCollections = [
      {
        id: process.env.USER_SESSIONS_COLLECTION_ID,
        field: "userId",
        label: "USER_SESSIONS",
      },
      {
        id: process.env.EXPLORATION_PATTERNS_COLLECTION_ID,
        field: "userId",
        label: "EXPLORATION_PATTERNS",
      },
      {
        id: process.env.CONTEXT_PROFILES_COLLECTION_ID,
        field: "userId",
        label: "CONTEXT_PROFILES",
      },
      {
        id: process.env.RECOMMENDATION_FEEDBACK_COLLECTION_ID,
        field: "userId",
        label: "RECOMMENDATION_FEEDBACK",
      },
      {
        id: process.env.APPWRITE_SESSIONS_COLLECTION_ID,
        field: "userId",
        label: "APP_SESSIONS",
      },
    ];

    for (const bc of behaviorCollections) {
      if (!bc.id) continue;
      const n = await deleteDocumentsByUserId(bc.id, bc.field, userId).catch(
        () => 0,
      );
      audit.push(`${bc.label}_DELETED_${n}`);
    }

    // ── 6. Subscriptions ─────────────────────────────────────────────
    if (env.APPWRITE_SUBSCRIPTIONS_COLLECTION_ID) {
      const n = await deleteDocumentsByUserId(
        env.APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
        "userId",
        userId,
      ).catch(() => 0);
      audit.push(`SUBSCRIPTIONS_DELETED_${n}`);
    }

    // ── 7. Orders — anonymise if financial records exist, else delete ─
    if (env.APPWRITE_ORDERS_COLLECTION) {
      if (hasPaid) {
        // Legal retention: anonymise instead of delete
        const n = await anonymiseDocumentsByUserId(
          env.APPWRITE_ORDERS_COLLECTION,
          "userId",
          "customerEmail",
          userId,
        ).catch(() => 0);
        audit.push(`ORDERS_ANONYMISED_${n}`);
      } else {
        const n = await deleteDocumentsByUserId(
          env.APPWRITE_ORDERS_COLLECTION,
          "userId",
          userId,
        ).catch(() => 0);
        audit.push(`ORDERS_DELETED_${n}`);
      }
    }

    // ── 8. Cancelled orders ──────────────────────────────────────────
    if (env.APPWRITE_CANCELLED_ORDERS_COLLECTION_ID) {
      const n = await anonymiseDocumentsByUserId(
        env.APPWRITE_CANCELLED_ORDERS_COLLECTION_ID,
        "userId",
        "customerEmail",
        userId,
      ).catch(() => 0);
      audit.push(`CANCELLED_ORDERS_ANONYMISED_${n}`);
    }

    // ── 9. Vendor — remove vendor products if vendor account ─────────
    if (vendor) {
      if (process.env.VENDOR_PRODUCTS_COLLECTION_ID) {
        const n = await deleteDocumentsByUserId(
          process.env.VENDOR_PRODUCTS_COLLECTION_ID,
          "vendorId",
          userId,
        ).catch(() => 0);
        audit.push(`VENDOR_PRODUCTS_DELETED_${n}`);
      }
      if (process.env.VENDOR_SESSIONS_COLLECTION_ID) {
        const n = await deleteDocumentsByUserId(
          process.env.VENDOR_SESSIONS_COLLECTION_ID,
          "vendorId",
          userId,
        ).catch(() => 0);
        audit.push(`VENDOR_SESSIONS_DELETED_${n}`);
      }
    }

    // ── 10. Storage files ────────────────────────────────────────────
    if (process.env.APPWRITE_STORAGE_ID) {
      try {
        const bucketId = process.env.APPWRITE_STORAGE_ID;
        let filesDeleted = 0;
        let cursor = null;

        do {
          const queries = [Query.limit(100)];
          if (cursor) queries.push(Query.cursorAfter(cursor));

          // List files in the bucket (server-side, we filter by metadata)
          const fileList = await storage.listFiles(bucketId, queries);

          const userFiles = fileList.files.filter(
            (f) => f.name.startsWith(`${userId}_`) || f.$id.startsWith(userId),
          );

          for (const file of userFiles) {
            try {
              await storage.deleteFile(bucketId, file.$id);
              filesDeleted++;
            } catch {
              // non-fatal
            }
          }

          cursor =
            fileList.files.length === 100
              ? fileList.files[fileList.files.length - 1].$id
              : null;
        } while (cursor);

        audit.push(`STORAGE_FILES_DELETED_${filesDeleted}`);
      } catch (e) {
        logger.warn("DeletionService: storage deletion failed", {
          userId,
          err: e.message,
        });
        audit.push("STORAGE_DELETION_FAILED");
      }
    }

    // ── 11. User profile document ────────────────────────────────────
    if (env.APPWRITE_USER_COLLECTION_ID) {
      const n = await deleteDocumentsByUserId(
        env.APPWRITE_USER_COLLECTION_ID,
        "userId",
        userId,
      ).catch(() => 0);
      audit.push(`USER_PROFILE_DELETED_${n}`);
    }

    // ── 12. Appwrite auth account ────────────────────────────────────
    try {
      await users.delete(userId);
      audit.push("AUTH_ACCOUNT_DELETED");
    } catch (e) {
      logger.error("DeletionService: auth account delete failed", {
        userId,
        err: e.message,
      });
      audit.push("AUTH_ACCOUNT_DELETE_FAILED");
    }

    // ── 13. Mark deletion request as completed ───────────────────────
    const finalAuditLog = audit.reduce(
      (acc, ev) => appendAuditEvent(acc, ev),
      requestDoc.auditLog || "[]",
    );
    const completedAuditLog = appendAuditEvent(
      finalAuditLog,
      "PURGE_COMPLETED",
    );

    await db
      .updateDocument(DB_ID, DELETION_COLL, requestDoc.$id, {
        status: "completed",
        completedAt: new Date().toISOString(),
        auditLog: completedAuditLog,
      })
      .catch(() => {});

    logger.info("DeletionService: purge complete", { userId, audit });
    return { success: true, userId, audit };
  }

  /**
   * Get deletion status for a user.
   * Returns null if no request exists.
   */
  static async getStatus(userId) {
    if (!DELETION_COLL) return null;

    const request = await getExistingRequest(userId);
    if (!request) return null;

    return {
      status: request.status,
      requestedAt: request.requestedAt,
      scheduledDeletionDate: request.scheduledDeletionDate,
      completedAt: request.completedAt || null,
      cancelledAt: request.cancelledAt || null,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      activeOrdersBlocked: request.activeOrdersBlocked || false,
      isVendor: request.isVendor || false,
      retentionNote: request.retentionNote || null,
    };
  }

  /**
   * Cancel a pending deletion request (only allowed within grace period).
   */
  static async cancelRequest(userId, reason = "") {
    if (!DELETION_COLL) {
      throw new Error(
        "APPWRITE_DELETION_REQUESTS_COLLECTION_ID not configured.",
      );
    }

    const request = await getExistingRequest(userId);

    if (!request) {
      throw Object.assign(new Error("No deletion request found."), {
        code: "NO_REQUEST",
      });
    }

    if (request.status === "completed") {
      throw Object.assign(
        new Error("Deletion already completed and cannot be reversed."),
        { code: "ALREADY_COMPLETED" },
      );
    }

    if (request.status === "processing") {
      throw Object.assign(
        new Error(
          "Deletion is in processing phase and cannot be cancelled at this stage.",
        ),
        { code: "ALREADY_PROCESSING" },
      );
    }

    if (request.status === "cancelled") {
      throw Object.assign(new Error("Request is already cancelled."), {
        code: "ALREADY_CANCELLED",
      });
    }

    // Re-enable the Appwrite user account
    try {
      await users.updateStatus(userId, true);
    } catch (e) {
      logger.warn("DeletionService: re-enable user failed", {
        userId,
        err: e.message,
      });
    }

    // Remove deletion_pending flag from prefs
    try {
      const appwriteUser = await users.get(userId);
      const prefs = appwriteUser.prefs || {};
      delete prefs.deletion_pending;
      delete prefs.deletion_requested_at;
      await users.updatePrefs(userId, prefs);
    } catch {
      // non-fatal
    }

    const cancelledAuditLog = appendAuditEvent(
      request.auditLog,
      "REQUEST_CANCELLED",
      { reason: reason.slice(0, 200) },
    );

    await db.updateDocument(DB_ID, DELETION_COLL, request.$id, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: reason.slice(0, 300) || null,
      auditLog: cancelledAuditLog,
    });

    logger.info("DeletionService: request cancelled", { userId, reason });

    return {
      success: true,
      message: "Account deletion cancelled. Your account has been restored.",
    };
  }

  /**
   * Initialize CRON job — runs daily at 3:00 AM.
   * Processes all pending requests whose grace period has elapsed.
   */
  static initializeCron() {
    if (!DELETION_COLL) {
      logger.warn(
        "DeletionService: APPWRITE_DELETION_REQUESTS_COLLECTION_ID not set — cron disabled",
      );
      return;
    }

    // Run every day at 03:00 AM
    cron.schedule("0 3 * * *", async () => {
      logger.info("DeletionService: cron started — checking pending deletions");

      try {
        const now = new Date().toISOString();

        // Find all pending requests where grace period has elapsed
        const pending = await db.listDocuments(DB_ID, DELETION_COLL, [
          Query.equal("status", "pending"),
          Query.lessThanEqual("scheduledDeletionDate", now),
          Query.limit(50),
        ]);

        logger.info(
          `DeletionService: found ${pending.total} request(s) due for purge`,
        );

        for (const req of pending.documents) {
          try {
            await DeletionService.executePurge(req);
          } catch (e) {
            logger.error("DeletionService: purge failed for request", {
              requestId: req.$id,
              userId: req.userId,
              err: e.message,
            });
            // Mark as failed so it can be retried or investigated
            await db
              .updateDocument(DB_ID, DELETION_COLL, req.$id, {
                auditLog: appendAuditEvent(req.auditLog, "PURGE_ERROR", {
                  error: e.message,
                }),
              })
              .catch(() => {});
          }
        }
      } catch (e) {
        logger.error("DeletionService: cron error", { err: e.message });
      }
    });

    logger.info("DeletionService: cron initialized — runs daily at 03:00 AM");
  }
}

module.exports = DeletionService;
