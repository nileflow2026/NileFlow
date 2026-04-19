// utils/serverPricing.js
// ZERO TRUST: Server-side price computation - never trust client-sent prices
const { db } = require("../services/appwriteService");
const { env } = require("../src/env");
const logger = require("./logger");

/**
 * Fetch the authoritative price for a single product from the database.
 * @param {string} productId
 * @returns {Promise<{price: number, productName: string} | null>}
 */
async function getProductPrice(productId) {
  if (!env.APPWRITE_PRODUCT_COLLECTION_ID) {
    logger.warn(
      "APPWRITE_PRODUCT_COLLECTION_ID not configured - cannot verify prices",
    );
    return null;
  }

  try {
    const product = await db.getDocument(
      env.APPWRITE_DATABASE_ID,
      env.APPWRITE_PRODUCT_COLLECTION_ID,
      productId,
    );
    return {
      price: parseFloat(product.price),
      productName: product.productName || product.name,
    };
  } catch (error) {
    logger.error(
      `Failed to fetch product price for ${productId}:`,
      error.message,
    );
    return null;
  }
}

/**
 * Given a cart array (with productId + quantity), fetch all prices from the DB
 * and compute the authoritative subtotal. Returns null for any product
 * that cannot be found (indicating a tampered or stale cart).
 *
 * @param {Array<{productId: string, quantity: number}>} cartItems
 * @returns {Promise<{subtotal: number, verifiedItems: Array, errors: Array}>}
 */
async function computeCartSubtotal(cartItems) {
  if (!env.APPWRITE_PRODUCT_COLLECTION_ID) {
    return {
      subtotal: null,
      verifiedItems: [],
      errors: [
        "Product collection not configured - price verification unavailable",
      ],
    };
  }

  const verifiedItems = [];
  const errors = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const productId = item.productId;
    const quantity = parseInt(item.quantity || 1, 10);

    if (!productId) {
      errors.push("Cart item missing productId");
      continue;
    }

    if (quantity < 1 || quantity > 1000) {
      errors.push(`Invalid quantity ${quantity} for product ${productId}`);
      continue;
    }

    const productData = await getProductPrice(productId);

    if (!productData) {
      errors.push(`Product not found: ${productId}`);
      continue;
    }

    const lineTotal = productData.price * quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      productId,
      productName: productData.productName,
      dbPrice: productData.price,
      clientPrice: parseFloat(item.price || 0),
      quantity,
      lineTotal,
      priceMismatch:
        Math.abs(productData.price - parseFloat(item.price || 0)) > 0.01,
    });
  }

  // Log any price mismatches (potential tampering or stale cache)
  const mismatches = verifiedItems.filter((v) => v.priceMismatch);
  if (mismatches.length > 0) {
    logger.warn(
      "PRICE MISMATCH DETECTED - client sent different prices than DB:",
      {
        mismatches: mismatches.map((m) => ({
          productId: m.productId,
          dbPrice: m.dbPrice,
          clientPrice: m.clientPrice,
        })),
      },
    );
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    verifiedItems,
    errors,
  };
}

/**
 * Get the current KSH-to-USD exchange rate from platform settings,
 * falling back to the env var, then to a safe default.
 * In production this should be replaced with a real-time FX API.
 *
 * @returns {Promise<number>} KSH per 1 USD
 */
async function getExchangeRate() {
  // 1. Try platform settings (cached in PlatformSettingsService)
  try {
    const {
      platformSettingsService,
    } = require("../services/platformSettingsService");
    if (platformSettingsService) {
      const setting = await platformSettingsService.getSetting(
        "exchange_rate_ksh_usd",
      );
      if (setting && setting.settingValue) {
        const rate = parseFloat(setting.settingValue);
        if (rate > 0) return rate;
      }
    }
  } catch {
    // Platform settings not available - fall through
  }

  // 2. Try environment variable
  if (process.env.EXCHANGE_RATE_KSH_USD) {
    const rate = parseFloat(process.env.EXCHANGE_RATE_KSH_USD);
    if (rate > 0) return rate;
  }

  // 3. Safe default (should be updated regularly)
  const DEFAULT_RATE = 130;
  logger.warn(
    `Using default exchange rate: 1 USD = ${DEFAULT_RATE} KSH. ` +
      "Set EXCHANGE_RATE_KSH_USD env var or platform setting for accuracy.",
  );
  return DEFAULT_RATE;
}

/**
 * Convert KSH to USD using the current exchange rate
 * @param {number} amountKSH
 * @returns {Promise<{amountUSD: number, rate: number}>}
 */
async function convertKshToUsd(amountKSH) {
  const rate = await getExchangeRate();
  return {
    amountUSD: parseFloat((amountKSH / rate).toFixed(2)),
    rate,
  };
}

// Server-defined subscription plan prices (single source of truth)
const SUBSCRIPTION_PLANS = {
  premium_monthly: {
    amount: 200,
    currency: "KSH",
    durationDays: 30,
    name: "Nile Premium - 1 Month",
  },
};

/**
 * Get the server-defined price for a subscription plan
 * @param {string} planId - defaults to "premium_monthly"
 * @returns {{ amount: number, currency: string, durationDays: number, name: string } | null}
 */
function getSubscriptionPlanPrice(planId = "premium_monthly") {
  return SUBSCRIPTION_PLANS[planId] || null;
}

module.exports = {
  getProductPrice,
  computeCartSubtotal,
  getExchangeRate,
  convertKshToUsd,
  getSubscriptionPlanPrice,
  SUBSCRIPTION_PLANS,
};
