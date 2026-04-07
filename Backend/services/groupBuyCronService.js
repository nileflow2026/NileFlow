/**
 * groupBuyCronService.js
 *
 * Node-cron based scheduler for group buy lifecycle management.
 * Registers two jobs:
 *   1. Every 5 minutes  — expire pending groups past their expiresAt
 *   2. Every 30 minutes — send urgency reminders on groups expiring within 2 hours
 *
 * Register in your server entry point:
 *   const groupBuyCronService = require('./services/groupBuyCronService');
 *   groupBuyCronService.initialize();
 */

const cron = require("node-cron");
const { Query } = require("node-appwrite");
const { db } = require("./appwriteService");
const { env } = require("../src/env");
const { sendGroupBuyNotification } = require("./groupBuyNotificationService");
const logger = require("../utils/logger");

class GroupBuyCronService {
  /**
   * Register all group buy cron jobs.
   */
  static initialize() {
    if (!env.APPWRITE_GROUP_ORDER_COLLECTION_ID) {
      logger.warn("GroupBuyCronService: APPWRITE_GROUP_ORDER_COLLECTION_ID not set. Skipping.");
      return;
    }

    // Run every 5 minutes — expire overdue groups
    cron.schedule("*/5 * * * *", () => {
      GroupBuyCronService.expireOverdueGroups().catch((e) =>
        logger.error("GroupBuyCron expireOverdueGroups error:", e)
      );
    });

    // Run every 30 minutes — urgency reminders
    cron.schedule("*/30 * * * *", () => {
      GroupBuyCronService.sendUrgencyReminders().catch((e) =>
        logger.error("GroupBuyCron sendUrgencyReminders error:", e)
      );
    });

    logger.info("GroupBuyCronService: cron jobs initialized");
  }

  /**
   * Find all pending groups whose expiresAt is in the past and mark them expired.
   */
  static async expireOverdueGroups() {
    const now = new Date().toISOString();
    let processed = 0;

    try {
      const result = await db.listDocuments(
        env.APPWRITE_DATABASE_ID,
        env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
        [
          Query.equal("status", "pending"),
          Query.lessThan("expiresAt", now),
          Query.limit(100),
        ]
      );

      const docs = result.documents || [];

      for (const group of docs) {
        try {
          await db.updateDocument(
            env.APPWRITE_DATABASE_ID,
            env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
            group.$id,
            { status: "expired" }
          );
          processed++;

          // Notify participants async
          setImmediate(() => {
            sendGroupBuyNotification("group_expired", {
              groupId: group.$id,
              participants: group.participants || [],
              productId: group.productId,
            }).catch((e) => logger.error("GroupBuyCron notification error:", e));
          });
        } catch (updateErr) {
          logger.error(`GroupBuyCron: failed to expire group ${group.$id}:`, updateErr);
        }
      }

      if (processed > 0) {
        logger.info(`GroupBuyCron: expired ${processed} group(s)`);
      }
    } catch (err) {
      logger.error("GroupBuyCron expireOverdueGroups DB error:", err);
    }
  }

  /**
   * Find pending groups expiring within 2 hours and remind participants.
   */
  static async sendUrgencyReminders() {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    try {
      const result = await db.listDocuments(
        env.APPWRITE_DATABASE_ID,
        env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
        [
          Query.equal("status", "pending"),
          Query.greaterThan("expiresAt", nowIso),
          Query.lessThan("expiresAt", twoHoursFromNow),
          Query.limit(50),
        ]
      );

      const docs = result.documents || [];

      for (const group of docs) {
        const remaining = Math.max(
          0,
          (group.maxParticipants || 0) - (group.participants?.length || 0)
        );
        if (remaining === 0) continue; // Already full

        const timeLeftMs = new Date(group.expiresAt) - now;
        const minutesLeft = Math.floor(timeLeftMs / 60000);

        setImmediate(() => {
          sendGroupBuyNotification("user_joined", {
            groupId: group.$id,
            participants: group.participants || [],
            currentSize: group.participants?.length || 0,
            maxSize: group.maxParticipants,
            currentPrice: group.currentPrice,
            productId: group.productId,
            urgency: true,
            minutesLeft,
          }).catch((e) => logger.error("GroupBuyCron urgency reminder error:", e));
        });
      }

      if (docs.length > 0) {
        logger.info(`GroupBuyCron: sent urgency reminders for ${docs.length} group(s)`);
      }
    } catch (err) {
      logger.error("GroupBuyCron sendUrgencyReminders DB error:", err);
    }
  }
}

module.exports = GroupBuyCronService;
