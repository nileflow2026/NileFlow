// lib/groupOrderUtils.js

const { db } = require("../services/appwriteService");
const { env } = require("../src/env");

/**
 * computeCurrentPrice
 * Accepts { basePrice, strategy, tiers, participantsCount }
 * Returns newPrice (number)
 *
 * Strategies:
 *  - "tiered": DB-driven tiers [{min, discount}] — discount is a fraction 0-1
 *  - "linear": configurable perUserDiscount & cap from tier[0] config or defaults
 *  - "fixed":  tiers are [{minParticipants, price}] — absolute price per tier
 */
function computeCurrentPrice({
  basePrice,
  strategy = "tiered",
  tiers = null,
  participantsCount = 1,
}) {
  if (strategy === "linear") {
    // Linear: perUserDiscount and cap are taken from tiers[0].meta if present
    const meta = tiers && tiers[0] && tiers[0].meta ? tiers[0].meta : {};
    const perUser = meta.perUserDiscount != null ? meta.perUserDiscount : 0.05;
    const cap = meta.cap != null ? meta.cap : 0.3;
    const discount = Math.min((participantsCount - 1) * perUser, cap);
    return parseFloat((basePrice * (1 - discount)).toFixed(2));
  }

  if (strategy === "fixed") {
    // Fixed: tiers store absolute prices [{minParticipants, price}]
    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
      return parseFloat(basePrice.toFixed(2));
    }
    const sorted = [...tiers].sort(
      (a, b) => (a.minParticipants || a.min || 0) - (b.minParticipants || b.min || 0)
    );
    let chosen = sorted[0];
    for (const t of sorted) {
      const threshold = t.minParticipants || t.min || 0;
      if (participantsCount >= threshold) chosen = t;
    }
    const price = chosen.price != null ? chosen.price : basePrice;
    return parseFloat(Number(price).toFixed(2));
  }

  // Default "tiered" strategy — discount fraction per tier
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return parseFloat(Number(basePrice).toFixed(2));
  }
  const sorted = [...tiers].sort(
    (a, b) => (a.min || a.minParticipants || 0) - (b.min || b.minParticipants || 0)
  );
  let chosen = sorted[0];
  for (const t of sorted) {
    const threshold = t.min || t.minParticipants || 0;
    if (participantsCount >= threshold) chosen = t;
  }
  const discount = chosen.discount || 0;
  return parseFloat((Number(basePrice) * (1 - discount)).toFixed(2));
}

/**
 * computePriceByTiers
 * Alternative helper — accepts explicit tier array in the format:
 * [{minParticipants: 1, price: 10}, {minParticipants: 3, price: 8}, ...]
 * Returns the matching absolute price.
 */
function computePriceByTiers(tiers, participantsCount, fallbackPrice) {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return parseFloat(Number(fallbackPrice).toFixed(2));
  }
  const sorted = [...tiers].sort(
    (a, b) => (a.minParticipants || a.min || 0) - (b.minParticipants || b.min || 0)
  );
  let chosen = sorted[0];
  for (const t of sorted) {
    const threshold = t.minParticipants || t.min || 0;
    if (participantsCount >= threshold) chosen = t;
  }
  const price = chosen.price != null ? chosen.price : fallbackPrice;
  return parseFloat(Number(price).toFixed(2));
}

/**
 * getSavingsAmount — returns the raw currency savings vs base price
 */
function getSavingsAmount(basePrice, currentPrice) {
  return parseFloat((Number(basePrice) - Number(currentPrice)).toFixed(2));
}

/**
 * getSavingsPercent — returns savings as a percentage string e.g. "20%"
 */
function getSavingsPercent(basePrice, currentPrice) {
  if (!basePrice || basePrice === 0) return "0%";
  const pct = ((Number(basePrice) - Number(currentPrice)) / Number(basePrice)) * 100;
  return `${Math.round(pct)}%`;
}

/**
 * Optimistic lock + retry for Appwrite update: read -> transform -> try update.
 * If update fails due to concurrent modification, retry up to N times.
 *
 * transformFn(order) => returns partialUpdate (object) OR throws an error {code,msg}
 */
async function retryUpdateDocumentWithOptimisticLock(
  docId,
  transformFn,
  maxAttempts = 5,
  backoffMs = 80
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // fetch latest doc
    const order = await db.getDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
      docId
    );
    if (!order) throw { code: 404, msg: "Order not found" };

    // ask transform what to update
    const updatePatch = await transformFn(order);
    // build update object
    try {
      // Use Appwrite updateDocument - Appwrite does not provide direct compare-and-swap in SDK,
      // but we can attempt the update; if a race causes logical problem (we validated earlier), retry.
      const updated = await db.updateDocument(
        env.APPWRITE_DATABASE_ID,
        env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
        docId,
        updatePatch
      );
      return updated;
    } catch (err) {
      // Heuristic: if error indicates concurrency or conflict, retry. For Appwrite, implement retry on any failure up to max.
      if (attempt < maxAttempts - 1) {
        await sleep(backoffMs * (attempt + 1));
        continue;
      } else {
        throw err;
      }
    }
  }
  throw { code: 500, msg: "Failed to update after retries" };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  computeCurrentPrice,
  computePriceByTiers,
  getSavingsAmount,
  getSavingsPercent,
  retryUpdateDocumentWithOptimisticLock,
};
