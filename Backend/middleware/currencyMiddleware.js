/**
 * Currency Middleware — NileFlow Currency Abstraction Layer
 *
 * Injects req.currency and req.countryCode by:
 *  1. Explicit override: query param `?currency=UGX` or header `x-currency`
 *  2. IP-based geolocation  (ipapi.co — free, no key required)
 *  3. Browser Accept-Language header
 *  4. Default: KES
 *
 * Usage in routes:
 *   router.get("/products", currencyMiddleware, getProducts);
 */

const { validateCurrencyCode } = require("../utils/currencyConverter");

// ---------------------------------------------------------------------------
// Country → Currency mapping (East & West Africa focused)
// ---------------------------------------------------------------------------
const COUNTRY_CURRENCY_MAP = {
  KE: "KES", // Kenya
  UG: "UGX", // Uganda
  TZ: "TZS", // Tanzania
  ET: "ETB", // Ethiopia
  NG: "NGN", // Nigeria
  GH: "GHS", // Ghana
  RW: "RWF", // Rwanda
  SS: "SSP", // South Sudan
  ZM: "ZMW", // Zambia
  MZ: "MZN", // Mozambique
  BW: "BWP", // Botswana
  ZA: "ZAR", // South Africa
  SD: "SDG", // Sudan
  SO: "SOS", // Somalia
  ER: "ERN", // Eritrea
  DJ: "DJF", // Djibouti
  // Fallback to widely-used currencies for the rest of the world
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
};

// Accept-Language prefix → currency (coarse mapping for common locales)
const LOCALE_CURRENCY_MAP = {
  "en-KE": "KES",
  "en-UG": "UGX",
  "en-TZ": "TZS",
  "en-NG": "NGN",
  "en-GH": "GHS",
  "sw-KE": "KES",
  "sw-TZ": "TZS",
  "am-ET": "ETB",
  "rw-RW": "RWF",
};

// ---------------------------------------------------------------------------
// Geo-detection from IP (non-blocking; times out gracefully)
// ---------------------------------------------------------------------------
const GEO_TIMEOUT_MS = 2_500;
const GEO_CACHE = new Map(); // in-process cache to avoid repeated lookups
const GEO_CACHE_TTL_MS = 30 * 60 * 1_000; // 30 minutes per IP

/**
 * Extract the real client IP from common proxy headers.
 */
function extractClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; first entry is the client
    return forwarded.split(",")[0].trim();
  }
  return (
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    null
  );
}

/**
 * Query ipapi.co for a country code.
 * Returns a 2-letter ISO country code or null on failure/timeout.
 */
async function detectCountryFromIP(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return null;

  // In-process cache hit
  const cached = GEO_CACHE.get(ip);
  if (cached && Date.now() - cached.ts < GEO_CACHE_TTL_MS) {
    return cached.country;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

  try {
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: controller.signal,
      headers: { "User-Agent": "NileFlow/1.0" },
    });
    clearTimeout(timer);

    if (!response.ok) return null;

    const country = (await response.text()).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(country)) {
      GEO_CACHE.set(ip, { country, ts: Date.now() });
      return country;
    }
    return null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Parse the best-matching currency from the Accept-Language header.
 * Returns a validated currency code or null.
 */
function detectCurrencyFromLocale(acceptLanguage) {
  if (!acceptLanguage) return null;

  // Parse quality values: "en-UG,en;q=0.9,sw;q=0.8"
  const locales = acceptLanguage
    .split(",")
    .map((part) => {
      const [locale, q] = part.trim().split(";q=");
      return { locale: locale.trim(), q: parseFloat(q ?? "1") };
    })
    .sort((a, b) => b.q - a.q);

  for (const { locale } of locales) {
    const currency = LOCALE_CURRENCY_MAP[locale];
    if (currency) return currency;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * currencyMiddleware
 *
 * Attaches:
 *   req.currency    {string}  ISO 4217 currency code (e.g. "UGX")
 *   req.countryCode {string}  ISO 3166-1 alpha-2 country code (e.g. "UG")
 *   req.exchangeRateSource {string}  How currency was determined
 */
async function currencyMiddleware(req, res, next) {
  try {
    // --- 1. Explicit client override (query param or custom header) ---------
    const explicitCurrency =
      validateCurrencyCode(req.query.currency) ||
      validateCurrencyCode(req.headers["x-currency"]);

    if (explicitCurrency) {
      req.currency = explicitCurrency;
      req.countryCode = null;
      req.exchangeRateSource = "explicit";
      return next();
    }

    // --- 2. IP-based geolocation -------------------------------------------
    const clientIP = extractClientIP(req);
    const countryCode = await detectCountryFromIP(clientIP);

    if (countryCode) {
      const ipCurrency = COUNTRY_CURRENCY_MAP[countryCode];
      if (ipCurrency && validateCurrencyCode(ipCurrency)) {
        req.currency = ipCurrency;
        req.countryCode = countryCode;
        req.exchangeRateSource = "ip-geo";
        return next();
      }
    }

    // --- 3. Accept-Language header -----------------------------------------
    const localeCurrency = detectCurrencyFromLocale(
      req.headers["accept-language"],
    );
    if (localeCurrency) {
      req.currency = localeCurrency;
      req.countryCode = countryCode || null;
      req.exchangeRateSource = "locale";
      return next();
    }

    // --- 4. Default: KES ---------------------------------------------------
    req.currency = "KES";
    req.countryCode = countryCode || "KE";
    req.exchangeRateSource = "default";
    return next();
  } catch (err) {
    // Never let currency detection block a request
    console.error("[CurrencyMiddleware] Error:", err.message);
    req.currency = "KES";
    req.countryCode = "KE";
    req.exchangeRateSource = "error-fallback";
    return next();
  }
}

module.exports = {
  currencyMiddleware,
  COUNTRY_CURRENCY_MAP,
  detectCurrencyFromLocale,
  extractClientIP,
};
