/* eslint-disable react-refresh/only-export-components */
/**
 * CurrencyProvider — NileFlow Currency Abstraction Layer (Website)
 *
 * Responsibilities:
 *  - Detect user's local currency via backend /api/currency/detect
 *  - Pre-fetch all exchange rates on mount (non-blocking)
 *  - Expose convertPrice(), displayPrice(), and changeCurrency()
 *  - Cache currency preference in localStorage
 *  - Graceful fallback to KES on any failure
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Currency metadata (mirrors backend CURRENCY_META)
// ---------------------------------------------------------------------------
export const CURRENCY_META = {
  KES: { symbol: "KSh", locale: "en-KE", decimals: 0 },
  UGX: { symbol: "UGX", locale: "en-UG", decimals: 0 },
  TZS: { symbol: "TSh", locale: "en-TZ", decimals: 0 },
  ETB: { symbol: "Br",  locale: "am-ET", decimals: 2 },
  NGN: { symbol: "₦",   locale: "en-NG", decimals: 0 },
  GHS: { symbol: "GH₵", locale: "en-GH", decimals: 2 },
  RWF: { symbol: "RWF", locale: "rw-RW", decimals: 0 },
  SSP: { symbol: "SSP", locale: "en-SS", decimals: 2 },
  ZMW: { symbol: "ZK",  locale: "en-ZM", decimals: 2 },
  MZN: { symbol: "MT",  locale: "pt-MZ", decimals: 2 },
  BWP: { symbol: "P",   locale: "en-BW", decimals: 2 },
  ZAR: { symbol: "R",   locale: "en-ZA", decimals: 2 },
  USD: { symbol: "$",   locale: "en-US", decimals: 2 },
  EUR: { symbol: "€",   locale: "de-DE", decimals: 2 },
  GBP: { symbol: "£",   locale: "en-GB", decimals: 2 },
};

const BASE_CURRENCY = "KES";
const RATES_STORAGE_KEY = "nileflow:rates";
const RATES_TTL_MS = 4 * 60 * 60 * 1_000; // 4 hours

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const CurrencyContext = createContext(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSupportedCurrency(code) {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  return CURRENCY_META[upper] ? upper : null;
}

function formatAmount(amount, currency) {
  const meta = CURRENCY_META[currency] ?? { symbol: currency, locale: "en", decimals: 2 };
  const formatted = new Intl.NumberFormat(meta.locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(amount);
  return `${meta.symbol} ${formatted}`;
}

function loadCachedRates() {
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    const { rates, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > RATES_TTL_MS) return null;
    return rates;
  } catch {
    return null;
  }
}

function saveCachedRates(rates) {
  try {
    localStorage.setItem(
      RATES_STORAGE_KEY,
      JSON.stringify({ rates, cachedAt: Date.now() })
    );
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

// Hardcoded fallback rates in case backend is unreachable
const FALLBACK_RATES = {
  KES: 1, UGX: 27.5, TZS: 3.25, ETB: 0.65, NGN: 10.2,
  GHS: 0.083, RWF: 13.8, SSP: 15.9, ZMW: 0.26, MZN: 0.77,
  BWP: 0.083, ZAR: 0.11, USD: 0.0077, EUR: 0.0071, GBP: 0.0061,
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(BASE_CURRENCY);
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [detected, setDetected] = useState(false);
  const initDone = useRef(false);

  // ── Fetch all rates from backend ──────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/currency/rates");
      if (!res.ok) throw new Error("rate fetch failed");
      const data = await res.json();
      if (data.rates && typeof data.rates === "object") {
        setRates(data.rates);
        saveCachedRates(data.rates);
        return data.rates;
      }
    } catch {
      // Use localStorage cache if available, else keep FALLBACK_RATES
      const cached = loadCachedRates();
      if (cached) setRates(cached);
    }
    return null;
  }, []);

  // ── Detect user's currency automatically from location ─────────────────────
  const detectCurrency = useCallback(async () => {
    // 1. Backend IP-based geo-detection
    try {
      const res = await fetch("/api/currency/detect");
      if (res.ok) {
        const data = await res.json();
        const detected = getSupportedCurrency(data.currency);
        if (detected) return detected;
      }
    } catch {
      // ignore
    }

    // 2. Browser locale
    const lang = navigator.language || "";
    const localeMap = {
      "en-KE": "KES", "sw-KE": "KES", "en-UG": "UGX",
      "en-TZ": "TZS", "sw-TZ": "TZS", "en-NG": "NGN",
      "en-GH": "GHS", "am-ET": "ETB", "rw-RW": "RWF",
    };
    const fromLocale = getSupportedCurrency(localeMap[lang] || localeMap[lang.split("-")[0]]);
    if (fromLocale) return fromLocale;

    // 3. Default
    return BASE_CURRENCY;
  }, []);

  // ── Initialization ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const init = async () => {
      setLoading(true);

      // Load cached rates immediately so first render isn't blocked
      const cachedRates = loadCachedRates();
      if (cachedRates) setRates(cachedRates);

      // Run both in parallel
      const [detectedCurrency] = await Promise.all([
        detectCurrency(),
        fetchRates(),
      ]);

      const finalCurrency = getSupportedCurrency(detectedCurrency) || BASE_CURRENCY;
      setCurrency(finalCurrency);
      setDetected(true);
      setLoading(false);
    };

    init();
  }, [detectCurrency, fetchRates]);

  // ── Conversion helpers ────────────────────────────────────────────────────
  /**
   * Convert a KES price to the active currency and return a display string.
   * If the product already carries a `.price` object (from the backend CAL),
   * use that directly — no re-conversion needed.
   *
   * @param {number|object} priceOrObj  Raw KES amount OR an enriched price object
   * @returns {string}  e.g. "UGX 27,499"
   */
  const displayPrice = useCallback(
    (priceOrObj) => {
      if (priceOrObj == null) return "—";

      // Enriched price object from backend CAL
      if (typeof priceOrObj === "object" && priceOrObj.displayValue) {
        return priceOrObj.displayValue;
      }

      // Raw KES amount
      const amount = typeof priceOrObj === "number"
        ? priceOrObj
        : parseFloat(priceOrObj);

      if (!Number.isFinite(amount)) return "—";

      const rate = rates[currency] ?? 1;
      const converted = Math.round(amount * rate * (currency === "KES" ? 1 : 1));
      return formatAmount(converted, currency);
    },
    [currency, rates]
  );

  /**
   * Low-level: convert a raw amount between two arbitrary currencies.
   *
   * @param {number} amount
   * @param {string} [from="KES"]
   * @param {string} [to=currency]
   * @returns {number} converted amount (unformatted)
   */
  const convertPrice = useCallback(
    (amount, from = BASE_CURRENCY, to = currency) => {
      if (!Number.isFinite(amount)) return 0;
      if (from === to) return amount;
      // from → KES → to
      const fromRate = rates[from] ?? 1;
      const toRate = rates[to] ?? 1;
      const inKES = from === BASE_CURRENCY ? amount : amount / fromRate;
      return inKES * toRate;
    },
    [currency, rates]
  );

  const value = useMemo(
    () => ({
      currency,
      rates,
      loading,
      detected,
      displayPrice,
      convertPrice,
      formatAmount,
      currencyMeta: CURRENCY_META[currency] ?? CURRENCY_META.KES,
      // Legacy compatibility
      exchangeRate: rates[currency] ?? 1,
    }),
    [currency, rates, loading, detected, displayPrice, convertPrice]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * useCurrency — consume the currency context.
 * Must be used inside <CurrencyProvider>.
 */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}

