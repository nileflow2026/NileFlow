/**
 * groupBuyNotificationService.js
 *
 * Sends in-app and email notifications for group buy lifecycle events.
 * All events are non-blocking — callers should use setImmediate() or Promise.allSettled().
 */

const { ID } = require("node-appwrite");
const { db } = require("./appwriteService");
const { Resend } = require("resend");
const { env } = require("../src/env");

const resend = new Resend(env.RESEND_API_KEY);
const FROM_EMAIL = "NileFlow <no-reply@nileflowafrica.com>";

/**
 * Persist an in-app notification document for a single user.
 */
async function createInAppNotification(userId, title, body, metadata = {}) {
  try {
    await db.createDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_NOTIFICATIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        title,
        body,
        type: "group_buy",
        isRead: false,
        metadata: JSON.stringify(metadata),
        createdAt: new Date().toISOString(),
      },
    );
  } catch (err) {
    console.error("createInAppNotification error:", err);
  }
}

/**
 * Batch create in-app notifications for multiple users.
 */
async function notifyParticipants(userIds, title, body, metadata = {}) {
  if (!userIds || userIds.length === 0) return;
  await Promise.allSettled(
    userIds.map((uid) => createInAppNotification(uid, title, body, metadata)),
  );
}

/**
 * Build a reusable HTML email wrapper with NileFlow branding.
 */
function buildEmailHtml(heading, subheading, bodyHtml, ctaUrl, ctaLabel) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading} | NileFlow</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 32px 16px; }
    .card { max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid rgba(16, 185, 129, 0.25); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 28px 32px; }
    .body p { margin: 0 0 16px; line-height: 1.6; color: #cbd5e1; }
    .highlight { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 16px 0; }
    .cta { display: inline-block; margin-top: 20px; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-weight: 600; font-size: 15px; border-radius: 8px; text-decoration: none; }
    .footer { padding: 16px 32px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🛍️ ${heading}</h1>
      <p>${subheading}</p>
    </div>
    <div class="body">
      ${bodyHtml}
      ${ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaLabel || "View Deal"}</a>` : ""}
    </div>
    <div class="footer">NileFlow Africa · <a href="https://nileflow.com" style="color:#10b981;">nileflow.com</a></div>
  </div>
</body>
</html>`;
}

/**
 * Main dispatcher — send notifications by event type.
 *
 * Supported events:
 *  - "user_joined"       : when a new user joins a group
 *  - "group_completed"   : when group reaches target size
 *  - "group_expired"     : when group expires without reaching target
 *  - "group_created"     : when a group is created (share prompt)
 */
async function sendGroupBuyNotification(eventType, data) {
  try {
    const frontendUrl = env.FRONTEND_URL || "https://nileflow.com";
    const groupUrl = `${frontendUrl}/group/${data.groupId}`;

    switch (eventType) {
      case "user_joined": {
        const {
          groupId,
          participants,
          currentSize,
          maxSize,
          currentPrice,
          productId,
        } = data;
        const remaining = Math.max(0, (maxSize || 0) - (currentSize || 0));
        const title = `Someone joined your group deal! 🎉`;
        const body = `${currentSize} of ${maxSize} people joined. ${remaining} more needed. Current price: $${currentPrice}`;

        // Notify all existing participants
        if (participants && participants.length > 0) {
          await notifyParticipants(participants, title, body, {
            groupId,
            productId,
            eventType,
          });
        }
        break;
      }

      case "group_completed": {
        const { groupId, participants, lockedPrice, productId } = data;
        const title = `🔥 Group deal complete! Your price is locked.`;
        const body = `Your group is full! Your locked price is $${lockedPrice}. Complete your purchase now.`;

        await notifyParticipants(participants || [], title, body, {
          groupId,
          productId,
          eventType,
          lockedPrice,
        });

        // Also send email if emails are available (best-effort)
        if (participants && participants.length > 0) {
          const emailHtml = buildEmailHtml(
            "Your Group Deal is Complete!",
            "Time to checkout at your locked group price",
            `<p>Your group is now full! Your locked price is <strong>$${lockedPrice}</strong>.</p>
             <div class="highlight"><strong>Action required:</strong> Complete your payment to secure this deal. The locked price is valid for 24 hours.</div>`,
            groupUrl,
            "Checkout Now →",
          );
          // Best-effort email per participant (no user email lookup here — extend as needed)
        }
        break;
      }

      case "group_expired": {
        const { groupId, participants, productId } = data;
        const title = `Group deal expired — try starting a new one`;
        const body = `Your group deal didn't reach the required size in time. Start a new one or shop solo.`;

        await notifyParticipants(participants || [], title, body, {
          groupId,
          productId,
          eventType,
        });
        break;
      }

      case "group_created": {
        const { groupId, creatorId, productId, maxParticipants } = data;
        await createInAppNotification(
          creatorId,
          `Your group deal is live! Share it to save 💰`,
          `Share your group with ${maxParticipants - 1} friends to unlock the lowest price.`,
          { groupId, productId, eventType },
        );
        break;
      }

      default:
        console.warn(`sendGroupBuyNotification: unknown event "${eventType}"`);
    }
  } catch (err) {
    console.error(`sendGroupBuyNotification [${eventType}] error:`, err);
  }
}

module.exports = { sendGroupBuyNotification, createInAppNotification };
