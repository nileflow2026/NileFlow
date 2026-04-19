const { ID, Query } = require("node-appwrite");
const { db } = require("../../services/appwriteService");
const { env } = require("../../src/env");
const {
  retryUpdateDocumentWithOptimisticLock,
  computeCurrentPrice,
  computePriceByTiers,
  getSavingsAmount,
  getSavingsPercent,
} = require("../../utils/groupOrderUtils");
const {
  sendGroupBuyNotification,
} = require("../../services/groupBuyNotificationService");

/**
 * Safely parse a tiers value that may be a JSON string, an array, or null.
 */
function parseTiers(tiers) {
  if (!tiers) return null;
  if (Array.isArray(tiers)) return tiers;
  if (typeof tiers === "string") {
    try {
      return JSON.parse(tiers);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Create Group Order
 * Body: { productId, creatorId, maxParticipants, basePrice, priceStrategy, tiers(optional), ttlHours(optional) }
 */
async function createGroupOrder(req, res) {
  try {
    const {
      productId,
      creatorId,
      maxParticipants,
      basePrice,
      priceStrategy = "tiered",
      tiers = null,
      ttlHours = 24,
      productName = "",
      productImage = "",
    } = req.body;
    console.log("req.body:", req.body);

    if (!productId || !creatorId || !maxParticipants || !basePrice) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const parsedTiers = parseTiers(tiers);

    const expiresAt = new Date(
      Date.now() + Number(ttlHours) * 60 * 60 * 1000,
    ).toISOString();
    const initialPrice = computeCurrentPrice({
      basePrice: Number(basePrice),
      strategy: priceStrategy,
      tiers: parsedTiers,
      participantsCount: 1,
    });

    const payload = {
      productId: String(productId),
      productName: String(productName),
      productImage: String(productImage),
      creatorId: String(creatorId),
      participants: [String(creatorId)],
      maxParticipants: Number(maxParticipants),
      basePrice: Number(basePrice),
      currentPrice: initialPrice,
      priceStrategy: String(priceStrategy),
      // Store tiers as a JSON string — Appwrite attribute type is string
      ...(parsedTiers ? { tiers: JSON.stringify(parsedTiers) } : {}),
      status: "pending",
      expiresAt,
    };

    const order = await db.createDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      ID.unique(),
      payload,
    );

    return res.status(201).json(order);
  } catch (err) {
    console.error("createGroupOrder ERROR:", err.message);
    console.error("createGroupOrder FULL ERROR:", JSON.stringify(err, null, 2));
    console.error("createGroupOrder STACK:", err.stack);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error." });
  }
}

/**
 * Get single group order — enriched with savings and share link
 */
async function getGroupOrder(req, res) {
  try {
    const id = req.params.id;
    const order = await db.getDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      id,
    );
    if (!order) return res.status(404).json({ error: "Not found" });

    const frontendUrl = env.FRONTEND_URL || "https://nileflow.com";
    const shareLink = `${frontendUrl}/group/${order.$id}`;
    return res.json({
      ...order,
      savingsAmount: getSavingsAmount(order.basePrice, order.currentPrice),
      savingsPercent: getSavingsPercent(order.basePrice, order.currentPrice),
      remainingSlots: Math.max(
        0,
        (order.maxParticipants || 0) - (order.participants?.length || 0),
      ),
      isExpired: order.expiresAt
        ? new Date(order.expiresAt) <= new Date()
        : false,
      shareLink,
      shareMessage: `Join my group buy on NileFlow & save ${getSavingsPercent(order.basePrice, order.currentPrice)}! ${shareLink}`,
    });
  } catch (err) {
    console.error("getGroupOrder:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * List group orders — supports filtering by productId, creatorId, status.
 * Also supports GET /group-orders/active?productId=XYZ for the public feed.
 */
async function listGroupOrders(req, res) {
  try {
    const { productId, creatorId, status, limit = 25 } = req.query;
    const queries = [Query.limit(Number(limit))];

    if (productId) queries.push(Query.equal("productId", productId));
    if (creatorId) queries.push(Query.equal("creatorId", creatorId));
    if (status) queries.push(Query.equal("status", status));

    // Default: show newest first
    queries.push(Query.orderDesc("$createdAt"));

    const result = await db.listDocuments(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      queries,
    );

    // Enrich each group with savings metadata
    const enriched = (result.documents || []).map((g) => ({
      ...g,
      savingsAmount: getSavingsAmount(g.basePrice, g.currentPrice),
      savingsPercent: getSavingsPercent(g.basePrice, g.currentPrice),
      remainingSlots: Math.max(
        0,
        (g.maxParticipants || 0) - (g.participants?.length || 0),
      ),
      isExpired: g.expiresAt && new Date(g.expiresAt) <= new Date(),
    }));

    return res.json({ total: result.total, documents: enriched });
  } catch (err) {
    console.error("listGroupOrders:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Update (admin or owner)
 * PATCH body: any fields to update (e.g., maxParticipants)
 */
async function updateGroupOrder(req, res) {
  try {
    const id = req.params.id;
    const updates = req.body;
    // Basic validation could go here
    const updated = await db.updateDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      id,
      updates,
    );
    return res.json(updated);
  } catch (err) {
    console.error("updateGroupOrder:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Cancel group order (owner or admin)
 */
async function cancelGroupOrder(req, res) {
  try {
    const id = req.params.id;
    // set status to 'cancelled'
    const updated = await db.updateDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      id,
      { status: "cancelled" },
    );
    return res.json(updated);
  } catch (err) {
    console.error("cancelGroupOrder:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Join group order (concurrency-aware, atomic via optimistic lock)
 * Body: { userId }
 */
async function joinGroupOrder(req, res) {
  try {
    const id = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    let finalizedGroup = null;

    const result = await retryUpdateDocumentWithOptimisticLock(
      id,
      async (order) => {
        if (!order) throw { code: 404, msg: "Order not found" };
        if (order.status !== "pending")
          throw { code: 400, msg: "This group deal is no longer open" };
        if (order.expiresAt && new Date(order.expiresAt) <= new Date())
          throw { code: 400, msg: "This group deal has expired" };
        if (order.participants && order.participants.includes(userId))
          throw { code: 400, msg: "You have already joined this group" };
        if (order.participants.length >= order.maxParticipants)
          throw { code: 400, msg: "This group is full" };

        const newParticipants = [...order.participants, userId];
        const participantsCount = newParticipants.length;

        const newPrice = computeCurrentPrice({
          basePrice: order.basePrice,
          strategy: order.priceStrategy,
          tiers: parseTiers(order.tiers),
          participantsCount,
        });

        const isComplete = participantsCount >= order.maxParticipants;
        const newStatus = isComplete ? "completed" : "pending";

        if (isComplete) {
          finalizedGroup = {
            ...order,
            participants: newParticipants,
            currentPrice: newPrice,
            status: "completed",
          };
        }

        return {
          participants: newParticipants,
          currentPrice: newPrice,
          status: newStatus,
        };
      },
    );

    // Fire-and-forget notifications (don't block the response)
    setImmediate(async () => {
      try {
        if (finalizedGroup) {
          await sendGroupBuyNotification("group_completed", {
            groupId: id,
            participants: result.participants,
            productId: result.productId,
            lockedPrice: result.currentPrice,
          });
        } else {
          await sendGroupBuyNotification("user_joined", {
            groupId: id,
            userId,
            productId: result.productId,
            currentSize: result.participants.length,
            maxSize: result.maxParticipants,
            currentPrice: result.currentPrice,
          });
        }
      } catch (notifErr) {
        console.error("joinGroupOrder notification error:", notifErr);
      }
    });

    const frontendUrl = env.FRONTEND_URL || "https://nileflow.com";
    return res.json({
      ...result,
      savingsAmount: getSavingsAmount(result.basePrice, result.currentPrice),
      savingsPercent: getSavingsPercent(result.basePrice, result.currentPrice),
      remainingSlots: Math.max(
        0,
        (result.maxParticipants || 0) - (result.participants?.length || 0),
      ),
      shareLink: `${frontendUrl}/group/${id}`,
    });
  } catch (err) {
    console.error("joinGroupOrder:", err);
    if (err.code) return res.status(err.code).json({ error: err.msg });
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Leave group order
 * Body: { userId }
 */
async function leaveGroupOrder(req, res) {
  try {
    const id = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const result = await retryUpdateDocumentWithOptimisticLock(
      id,
      async (order) => {
        if (!order) throw { code: 404, msg: "Order not found" };
        if (!order.participants.includes(userId))
          throw { code: 400, msg: "User not in group" };
        // remove user
        const newParticipants = order.participants.filter((u) => u !== userId);
        const participantsCount = newParticipants.length;
        // ensure at least creator remains; behavior: if creator leaves -> transfer ownership or cancel
        if (order.creatorId === userId) {
          // simple policy: if creator leaves and others remain, set new creator to first participant
          const newCreator = newParticipants[0] || null;
          // recompute price
          const newPrice = computeCurrentPrice({
            basePrice: order.basePrice,
            strategy: order.priceStrategy,
            tiers: parseTiers(order.tiers),
            participantsCount,
          });
          const newStatus = participantsCount === 0 ? "cancelled" : "pending";
          const update = {
            participants: newParticipants,
            currentPrice: newPrice,
            status: newStatus,
          };
          if (newCreator) update.creatorId = newCreator;
          return update;
        } else {
          const newPrice = computeCurrentPrice({
            basePrice: order.basePrice,
            strategy: order.priceStrategy,
            tiers: parseTiers(order.tiers),
            participantsCount,
          });
          const newStatus = participantsCount === 0 ? "cancelled" : "pending";
          return {
            participants: newParticipants,
            currentPrice: newPrice,
            status: newStatus,
          };
        }
      },
    );

    return res.json(result);
  } catch (err) {
    console.error("leaveGroupOrder:", err);
    if (err.code) return res.status(err.code).json({ error: err.msg });
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Expire orders — called by internal cron or POST /group-orders/expire-check
 * Uses proper Appwrite Query syntax to find pending orders past their expiresAt.
 */
async function expireGroupOrders(req, res) {
  try {
    const now = new Date().toISOString();

    const expiredCandidates = await db.listDocuments(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      [
        Query.equal("status", "pending"),
        Query.lessThan("expiresAt", now),
        Query.limit(100),
      ],
    );

    const updated = [];
    for (const order of expiredCandidates.documents || []) {
      try {
        const updatedDoc = await db.updateDocument(
          env.APPWRITE_DATABASE_ID,
          env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
          order.$id,
          { status: "expired" },
        );
        updated.push(updatedDoc);

        // Notify participants of expiry
        setImmediate(async () => {
          try {
            await sendGroupBuyNotification("group_expired", {
              groupId: order.$id,
              participants: order.participants,
              productId: order.productId,
            });
          } catch (e) {
            console.error("expireGroupOrders notification error:", e);
          }
        });
      } catch (e) {
        console.error("expire update failed for", order.$id, e);
      }
    }

    return res.json({ expiredCount: updated.length, updated });
  } catch (err) {
    console.error("expireGroupOrders:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Get active group orders for a specific product  (public endpoint)
 * GET /api/group-orders/active?productId=XYZ&limit=10
 */
async function getActiveGroupsForProduct(req, res) {
  try {
    const { productId, limit = 10 } = req.query;
    if (!productId)
      return res.status(400).json({ error: "productId required" });

    const now = new Date().toISOString();
    const queries = [
      Query.equal("productId", productId),
      Query.equal("status", "pending"),
      Query.greaterThan("expiresAt", now),
      Query.orderAsc("expiresAt"),
      Query.limit(Number(limit)),
    ];

    const result = await db.listDocuments(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      queries,
    );

    const enriched = (result.documents || []).map((g) => ({
      ...g,
      savingsAmount: getSavingsAmount(g.basePrice, g.currentPrice),
      savingsPercent: getSavingsPercent(g.basePrice, g.currentPrice),
      remainingSlots: Math.max(
        0,
        (g.maxParticipants || 0) - (g.participants?.length || 0),
      ),
      shareLink: `${env.FRONTEND_URL || "https://nileflow.com"}/group/${g.$id}`,
    }));

    return res.json({ total: result.total, documents: enriched });
  } catch (err) {
    console.error("getActiveGroupsForProduct:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Get share metadata for a group buy link  (open graph / deep link)
 * GET /api/group-orders/:id/share
 */
async function getGroupShareData(req, res) {
  try {
    const id = req.params.id;
    const order = await db.getDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      id,
    );
    if (!order) return res.status(404).json({ error: "Not found" });

    const frontendUrl = env.FRONTEND_URL || "https://nileflow.com";
    const shareLink = `${frontendUrl}/group/${id}`;
    const savingsPct = getSavingsPercent(order.basePrice, order.currentPrice);
    const remainingSlots = Math.max(
      0,
      (order.maxParticipants || 0) - (order.participants?.length || 0),
    );
    const timeLeftMs = order.expiresAt
      ? new Date(order.expiresAt) - new Date()
      : 0;
    const hoursLeft = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60)));

    const shareMessages = {
      whatsapp: `🛍️ Join my group deal on NileFlow!\nSave ${savingsPct} if we get ${remainingSlots} more people.\n⏰ ${hoursLeft}h left!\n${shareLink}`,
      telegram: `🔥 Group Buy Alert! Save ${savingsPct} — only ${remainingSlots} slots left. ${shareLink}`,
      facebook: `Grab this deal before it expires! Save ${savingsPct} with group buying on NileFlow. ${shareLink}`,
      twitter: `Just found an epic group deal on @NileFlow — save ${savingsPct}! Join now before it expires 🔥 ${shareLink}`,
      generic: `Join my group buy on NileFlow & save ${savingsPct}! ${shareLink}`,
    };

    return res.json({
      shareLink,
      shareMessages,
      ogTitle: `Group Deal — Save ${savingsPct} on NileFlow`,
      ogDescription: `${remainingSlots} spots left. Deal expires in ${hoursLeft} hours.`,
      currentPrice: order.currentPrice,
      basePrice: order.basePrice,
      savingsPercent: savingsPct,
      remainingSlots,
      hoursLeft,
      status: order.status,
    });
  } catch (err) {
    console.error("getGroupShareData:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  createGroupOrder,
  getGroupOrder,
  listGroupOrders,
  updateGroupOrder,
  cancelGroupOrder,
  joinGroupOrder,
  leaveGroupOrder,
  expireGroupOrders,
  getActiveGroupsForProduct,
  getGroupShareData,
};
