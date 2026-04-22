/**
 * Exchange Rate Service — NileFlow Currency Abstraction Layer
 *
 * Responsibilities:
 *  - Fetch real-time rates from exchangerate-api.com (base: KES)
 *  - Cache rates in Redis with a configurable TTL (default 4 h)
 *  - Fall back to last-known rates on API failure
 *  - Expose getRate(from, to) and getAllRates() for downstream consumers
 */

const { redis } = require("./redisClient");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BASE_CURRENCY = "KES";
const CACHE_KEY = "nileflow:exchange_rates:KES";
const CACHE_TTL_SECONDS = 4 * 60 * 60; // 4 hours
const API_TIMEOUT_MS = 5_000;

/**
 * Hardcoded fallback rates (KES → target).
 * Updated manually when the service is offline.
 * All rates are approximate as of Q1 2025.
 */
const FALLBACK_RATES = {
  KES: 1,
  UGX: 27.5,
  TZS: 3.25,
  ETB: 0.65,
  NGN: 10.2,
  GHS: 0.083,
  RWF: 13.8,
  SSP: 15.9,
  ZMW: 0.26,
  MZN: 0.77,
  BWP: 0.083,
  ZAR: 0.11,
  USD: 0.0077,
  EUR: 0.0071,
  GBP: 0.0061,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fetch fresh rates from the external API.
 * Returns a plain rates object { UGX: 27.5, ... } keyed from KES.
 */
async function fetchRatesFromAPI() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // Two endpoints: keyed (v6) or free (v4)
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${BASE_CURRENCY}`
    : `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(
        `Exchange rate API responded with HTTP ${response.status}`,
      );
    }

    const data = await response.json();

    // v6 uses data.conversion_rates, v4 uses data.rates
    const rates = data.conversion_rates || data.rates;
    if (!rates || typeof rates !== "object") {
      throw new Error("Malformed exchange rate API response");
    }

    // Ensure KES itself is always 1
    rates[BASE_CURRENCY] = 1;

    return rates;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Write rates to Redis with TTL.
 */
async function cacheRates(rates) {
  try {
    await redis.set(
      CACHE_KEY,
      JSON.stringify({ rates, cachedAt: Date.now() }),
      "EX",
      CACHE_TTL_SECONDS,
    );
  } catch (err) {
    console.error("[ExchangeRateService] Failed to write cache:", err.message);
  }
}

/**
 * Read rates from Redis. Returns null on miss/error.
 */
async function readCachedRates() {
  try {
    const raw = await redis.get(CACHE_KEY);
    if (!raw) return null;
    const { rates } = JSON.parse(raw);
    return rates;
  } catch (err) {
    console.error("[ExchangeRateService] Failed to read cache:", err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return all rates (KES → every target) from cache → API → fallback.
 * Never throws — always returns a usable rates object.
 */
async function getAllRates() {
  // 1. Redis cache
  const cached = await readCachedRates();
  if (cached) return cached;

  // 2. Live API
  try {
    const fresh = await fetchRatesFromAPI();
    await cacheRates(fresh);
    console.log("[ExchangeRateService] Rates refreshed from API");
    return fresh;
  } catch (apiErr) {
    console.warn(
      "[ExchangeRateService] API fetch failed, using fallback rates:",
      apiErr.message,
    );
  }

  // 3. Hardcoded fallback
  return { ...FALLBACK_RATES };
}

/**
 * Get the conversion multiplier for a single pair.
 *
 * @param {string} from  Source currency (usually "KES")
 * @param {string} to    Target currency  (e.g. "UGX")
 * @returns {Promise<number>} conversion rate
 */
async function getRate(from, to) {
  if (from === to) return 1;

  const rates = await getAllRates();

  if (from === BASE_CURRENCY) {
    return rates[to] ?? 1;
  }

  // Cross-rate: from → KES → to
  const fromToKES = 1 / (rates[from] ?? 1);
  const kesToTarget = rates[to] ?? 1;
  return fromToKES * kesToTarget;
}

/**
 * Warm up the cache on server start (non-blocking).
 */
function warmUpCache() {
  getAllRates()
    .then(() => console.log("[ExchangeRateService] Cache warmed up"))
    .catch((err) =>
      console.warn("[ExchangeRateService] Warm-up failed:", err.message),
    );
}

/**
 * Force-refresh the cache (used by the admin cron or admin API).
 */
async function refreshCache() {
  const fresh = await fetchRatesFromAPI();
  await cacheRates(fresh);
  return fresh;
}

module.exports = {
  getAllRates,
  getRate,
  warmUpCache,
  refreshCache,
  BASE_CURRENCY,
  FALLBACK_RATES,
};
