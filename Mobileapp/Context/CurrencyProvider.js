/**
 * CurrencyProvider — NileFlow Currency Abstraction Layer (Mobile)
 *
 * Mirrors the Website CurrencyProvider with React Native specifics:
 *  - AsyncStorage for persistence
 *  - NetInfo for network-aware rate fetching
 *  - Expo Constants for backend URL
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
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
// Currency metadata
// ---------------------------------------------------------------------------
export const CURRENCY_META = {
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

const BASE_CURRENCY = "KES";
const RATES_STORAGE_KEY = "nileflow:rates";
const RATES_TTL_MS = 4 * 60 * 60 * 1_000; // 4 hours

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  "https://nile-flow-backend.onrender.com";

// Country → currency map for client-side IP geo fallback
const COUNTRY_CURRENCY = {
  KE: "KES",
  UG: "UGX",
  TZ: "TZS",
  ET: "ETB",
  NG: "NGN",
  GH: "GHS",
  RW: "RWF",
  SS: "SSP",
  ZM: "ZMW",
  MZ: "MZN",
  BW: "BWP",
  ZA: "ZAR",
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
};

// Country → currency map for client-side IP geo fallback
const COUNTRY_CURRENCY = {
  KE: "KES",
  UG: "UGX",
  TZ: "TZS",
  ET: "ETB",
  NG: "NGN",
  GH: "GHS",
  RW: "RWF",
  SS: "SSP",
  ZM: "ZMW",
  MZ: "MZN",
  BW: "BWP",
  ZA: "ZAR",
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
};

// Hardcoded fallback rates (KES base)
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
// Helpers
// ---------------------------------------------------------------------------
const CurrencyContext = createContext(null);

function getSupportedCurrency(code) {
  if (!code) return null;
  const upper = String(code).trim().toUpperCase();
  return CURRENCY_META[upper] ? upper : null;
}

function formatAmount(amount, currency) {
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

async function loadCachedRates() {
  try {
    const raw = await AsyncStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    const { rates, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > RATES_TTL_MS) return null;
    return rates;
  } catch {
    return null;
  }
}

async function saveCachedRates(rates) {
  try {
    await AsyncStorage.setItem(
      RATES_STORAGE_KEY,
      JSON.stringify({ rates, cachedAt: Date.now() }),
    );
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(BASE_CURRENCY);
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const initDone = useRef(false);

  // ── Fetch rates from backend ───────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/currency/rates`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("rate fetch failed");
      const data = await res.json();
      if (data.rates && typeof data.rates === "object") {
        setRates(data.rates);
        await saveCachedRates(data.rates);
        return data.rates;
      }
    } catch {
      const cached = await loadCachedRates();
      if (cached) setRates(cached);
    }
    return null;
  }, []);

  // ── Detect user currency automatically from location ─────────────────────
  const detectCurrency = useCallback(async () => {
    // 1. Backend geo-detection
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/api/currency/detect`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const d = getSupportedCurrency(data.currency);
        if (d) return d;
      }
    } catch {
      // ignore — fall through to client-side geo
    }

    // 2. Client-side IP geo fallback (ipapi.co, no API key needed)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const fromCountry = getSupportedCurrency(
          COUNTRY_CURRENCY[data.country_code],
        );
        if (fromCountry) return fromCountry;
      }
    } catch {
      // ignore
    }

    // 3. Device locale
    const localeMap = {
      "en-KE": "KES",
      "sw-KE": "KES",
      "en-UG": "UGX",
      "en-TZ": "TZS",
      "sw-TZ": "TZS",
      "en-NG": "NGN",
      "en-GH": "GHS",
      "am-ET": "ETB",
      "rw-RW": "RWF",
    };
    try {
      const { getLocales } = await import("expo-localization");
      const locales = getLocales();
      for (const loc of locales) {
        const c = getSupportedCurrency(localeMap[loc.languageTag]);
        if (c) return c;
      }
    } catch {
      // expo-localization may not be available
    }

    return BASE_CURRENCY;
  }, []);

  // ── Initialization ────────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const init = async () => {
      setLoading(true);

      // Load cached rates immediately (non-blocking render)
      const cachedRates = await loadCachedRates();
      if (cachedRates) setRates(cachedRates);

      const [detectedCurrency] = await Promise.all([
        detectCurrency(),
        fetchRates(),
      ]);

      const finalCurrency =
        getSupportedCurrency(detectedCurrency) || BASE_CURRENCY;
      setCurrency(finalCurrency);
      setLoading(false);
    };

    init();
  }, [detectCurrency, fetchRates]);

  // ── Display helpers ────────────────────────────────────────────────────
  /**
   * Display a price — handles both raw KES amounts and enriched price objects.
   */
  const displayPrice = useCallback(
    (priceOrObj) => {
      if (priceOrObj == null) return "—";
      if (!priceOrObj && priceOrObj !== 0) return "Price on request";

      // Enriched price object from backend CAL
      if (typeof priceOrObj === "object" && priceOrObj.displayValue) {
        return priceOrObj.displayValue;
      }

      const amount =
        typeof priceOrObj === "number" ? priceOrObj : parseFloat(priceOrObj);
      if (!Number.isFinite(amount)) return "—";

      const rate = rates[currency] ?? 1;
      const converted = Math.round(amount * rate);
      return formatAmount(converted, currency);
    },
    [currency, rates],
  );

  /**
   * Raw conversion between currencies (returns number).
   */
  const convertPrice = useCallback(
    (amount, from = BASE_CURRENCY, to = currency) => {
      if (!Number.isFinite(Number(amount))) return 0;
      if (from === to) return Number(amount);
      const fromRate = rates[from] ?? 1;
      const toRate = rates[to] ?? 1;
      const inKES =
        from === BASE_CURRENCY ? Number(amount) : Number(amount) / fromRate;
      return inKES * toRate;
    },
    [currency, rates],
  );

  const value = useMemo(
    () => ({
      currency,
      rates,
      loading,
      displayPrice,
      convertPrice,
      formatAmount,
      currencyMeta: CURRENCY_META[currency] ?? CURRENCY_META.KES,
      // Legacy compatibility
      exchangeRate: rates[currency] ?? 1,
    }),
    [currency, rates, loading, displayPrice, convertPrice],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
