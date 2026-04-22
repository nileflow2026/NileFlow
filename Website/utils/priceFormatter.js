/**
 * priceFormatter — NileFlow Currency Abstraction Layer (Website)
 *
 * Utility functions for price formatting, independent of React context.
 * Use inside React components via useCurrency() from CurrencyProvider.
 * Use these pure functions in non-React contexts (SSR, emails, etc.).
 */

import { CURRENCY_META } from "../Context/CurrencyProvider";

// ---------------------------------------------------------------------------
// Core formatter
// ---------------------------------------------------------------------------

/**
 * Format a numeric amount into a localised currency string.
 *
 * @param {number|string} amount     The price amount to format.
 * @param {string}        [currency="KES"]  ISO 4217 currency code.
 * @returns {string}  e.g. "KSh 1,000" or "UGX 27,499"
 */
export function formatPrice(amount, currency = "KES") {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";

  const meta = CURRENCY_META[currency.toUpperCase()] ?? {
    symbol: currency,
    locale: "en",
    decimals: 2,
  };

  const formatted = new Intl.NumberFormat(meta.locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(num);

  return `${meta.symbol} ${formatted}`;
}

// ---------------------------------------------------------------------------
// Price-object helper (for backend CAL enriched products)
// ---------------------------------------------------------------------------

/**
 * Extract the best display value from a price field that may be either:
 *  - A plain number (raw KES, pre-CAL)
 *  - An enriched price object { displayValue, convertedPrice, currency, ... }
 *
 * Falls back to formatPrice(raw, "KES") so legacy data always renders.
 *
 * @param {number|object} priceField
 * @param {string}        [fallbackCurrency="KES"]
 * @returns {string}
 */
export function resolveDisplayPrice(priceField, fallbackCurrency = "KES") {
  if (priceField == null) return "—";

  // Enriched price object from backend CAL
  if (typeof priceField === "object") {
    if (priceField.displayValue) return priceField.displayValue;
    if (typeof priceField.convertedPrice === "number") {
      return formatPrice(priceField.convertedPrice, priceField.currency ?? fallbackCurrency);
    }
    if (typeof priceField.basePrice === "number") {
      return formatPrice(priceField.basePrice, "KES");
    }
    return "—";
  }

  // Raw number or numeric string
  return formatPrice(Number(priceField), fallbackCurrency);
}

// ---------------------------------------------------------------------------
// Psychological / charm pricing (client-side fallback)
// ---------------------------------------------------------------------------

/**
 * Apply charm pricing to an already-converted amount.
 * Useful when you want to display a psychological price in the UI.
 *
 * @param {number} amount    Converted price in target currency
 * @param {string} currency  Target ISO code
 * @returns {number}
 */
export function applyCharmPricing(amount, currency = "KES") {
  const meta = CURRENCY_META[currency];
  if (!meta || meta.decimals > 0) return amount; // only whole-number currencies

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

/**
 * Format with charm pricing applied.
 *
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCharmPrice(amount, currency = "KES") {
  return formatPrice(applyCharmPricing(amount, currency), currency);
}

