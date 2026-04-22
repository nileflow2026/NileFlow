/**
 * Currency Converter Utility — NileFlow Currency Abstraction Layer
 *
 * Handles:
 *  - Price conversion with rounding rules
 *  - Psychological pricing (charm pricing)
 *  - Locale-aware formatting
 *  - Product enrichment (batch + single)
 */

// ---------------------------------------------------------------------------
// Currency metadata
// ---------------------------------------------------------------------------

const CURRENCY_META = {
  KES: { symbol: "KSh", locale: "en-KE", decimals: 0 },
  UGX: { symbol: "UGX", locale: "en-UG", decimals: 0 },
  TZS: { symbol: "TSh", locale: "en-TZ", decimals: 0 },
  ETB: { symbol: "Br", locale: "am-ET", decimals: 2 },
  NGN: { symbol: "₦", locale: "en-NG", decimals: 0 },
  GHS: { symbol: "GH₵", locale: "en-GH", decimals: 2 },
  RWF: { symbol: "RWF", locale: "rw-RW", decimals: 0 },
  SSP: { symbol: "SSP", locale: "en-SS", decimals: 2 },
  ZMW: { symbol: "ZK", locale: "en-ZM", decimals: 2 },
  MZN: { symbol: "MT", locale: "pt-MZ", decimals: 2 },
  BWP: { symbol: "P", locale: "en-BW", decimals: 2 },
  ZAR: { symbol: "R", locale: "en-ZA", decimals: 2 },
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  EUR: { symbol: "€", locale: "de-DE", decimals: 2 },
  GBP: { symbol: "£", locale: "en-GB", decimals: 2 },
};

// ---------------------------------------------------------------------------
// Core conversion
// ---------------------------------------------------------------------------

/**
 * Convert a raw amount from one currency to another.
 *
 * @param {object} params
 * @param {number} params.amount  Raw price (in `from` currency)
 * @param {string} params.from    Source ISO currency code
 * @param {string} params.to      Target ISO currency code
 * @param {number} params.rate    Conversion rate (from → to)
 * @param {boolean} [params.psychological=false]  Apply charm pricing
 * @returns {number} Converted amount (unformatted)
 */
function convertPrice({ amount, from, to, rate, psychological = false }) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return 0;
  if (from === to) return amount;

  const converted = amount * rate;
  return psychological
    ? applyPsychologicalPricing(converted, to)
    : roundForCurrency(converted, to);
}

/**
 * Round a converted amount according to the currency's decimal convention.
 */
function roundForCurrency(amount, currency) {
  const meta = CURRENCY_META[currency];
  if (!meta) return Math.round(amount * 100) / 100;

  if (meta.decimals === 0) return Math.round(amount);
  const factor = Math.pow(10, meta.decimals);
  return Math.round(amount * factor) / factor;
}

/**
 * Apply psychological / charm pricing to a converted amount.
 * Rule:
 *  - Amounts < 1 000 → round to nearest 9 (e.g. 89, 99, 199)
 *  - Amounts 1 000 – 9 999 → round down to nearest 100 then subtract 1 (e.g. 2 499)
 *  - Amounts ≥ 10 000 → round down to nearest 1 000 then subtract 1 (e.g. 49 999)
 */
function applyPsychologicalPricing(amount, currency) {
  const meta = CURRENCY_META[currency];
  // Only apply charm pricing to whole-number currencies
  if (!meta || meta.decimals > 0) return roundForCurrency(amount, currency);

  if (amount < 1_000) {
    const rounded = Math.round(amount / 10) * 10;
    return Math.max(rounded - 1, 1);
  }
  if (amount < 10_000) {
    const rounded = Math.round(amount / 100) * 100;
    return Math.max(rounded - 1, 99);
  }
  const rounded = Math.round(amount / 1_000) * 1_000;
  return Math.max(rounded - 1, 999);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format a numeric amount into a localised display string.
 *
 * @param {number} amount
 * @param {string} currency  ISO currency code
 * @returns {string}  e.g. "UGX 27,499" or "KSh 1,000"
 */
function formatCurrency(amount, currency) {
  const meta = CURRENCY_META[currency] ?? {
    symbol: currency,
    locale: "en",
    decimals: 2,
  };

  const formatted = new Intl.NumberFormat(meta.locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(amount);

  return `${meta.symbol} ${formatted}`;
}

// ---------------------------------------------------------------------------
// Product enrichment
// ---------------------------------------------------------------------------

/**
 * Enrich a single product document with currency fields.
 * The stored `price` is always in KES (BASE_CURRENCY).
 *
 * @param {object} product     Raw Appwrite product document
 * @param {string} currency    Target display currency
 * @param {number} rate        KES → target rate
 * @param {boolean} [psychological=false]
 * @returns {object} Product with added price shape
 */
function enrichProductWithCurrency(
  product,
  currency,
  rate,
  psychological = false,
) {
  const basePrice =
    typeof product.price === "number"
      ? product.price
      : parseFloat(product.price) || 0;

  const convertedPrice = convertPrice({
    amount: basePrice,
    from: "KES",
    to: currency,
    rate,
    psychological,
  });

  return {
    ...product,
    price: {
      basePrice,
      baseCurrency: "KES",
      convertedPrice,
      currency,
      displayValue: formatCurrency(convertedPrice, currency),
      // Legacy field kept for backward compatibility
      raw: basePrice,
    },
  };
}

/**
 * Batch-enrich an array of products (one rate lookup, O(n) transformation).
 *
 * @param {object[]} products
 * @param {string}   currency
 * @param {number}   rate
 * @param {boolean}  [psychological=false]
 * @returns {object[]}
 */
function enrichProductsWithCurrency(
  products,
  currency,
  rate,
  psychological = false,
) {
  return products.map((p) =>
    enrichProductWithCurrency(p, currency, rate, psychological),
  );
}

// ---------------------------------------------------------------------------
// Input validation (for controller-level security checks)
// ---------------------------------------------------------------------------

const SUPPORTED_CURRENCIES = new Set(Object.keys(CURRENCY_META));

/**
 * Validate a currency code is in our supported set.
 * Returns the code (uppercased) or null if invalid.
 *
 * @param {string} code
 * @returns {string|null}
 */
function validateCurrencyCode(code) {
  if (typeof code !== "string") return null;
  const upper = code.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(upper) ? upper : null;
}

module.exports = {
  convertPrice,
  roundForCurrency,
  applyPsychologicalPricing,
  formatCurrency,
  enrichProductWithCurrency,
  enrichProductsWithCurrency,
  validateCurrencyCode,
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
};
