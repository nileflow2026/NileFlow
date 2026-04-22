/**
 * Currency Routes — NileFlow Currency Abstraction Layer
 *
 * GET /api/currency/detect        → Detect user currency from IP / locale
 * GET /api/currency/rates         → All current rates (KES base)
 * POST /api/currency/refresh      → Force refresh rates (admin only)
 * GET /api/currency/convert       → Convert a single amount
 */

const express = require("express");
const router = express.Router();

const { currencyMiddleware } = require("../middleware/currencyMiddleware");
const { getAllRates, refreshCache, getRate } = require("../services/exchangeRateService");
const { validateCurrencyCode, formatCurrency, convertPrice } = require("../utils/currencyConverter");
const authenticateToken = require("../middleware/authMiddleware");

// ---------------------------------------------------------------------------
// GET /api/currency/detect
// ---------------------------------------------------------------------------
router.get("/detect", currencyMiddleware, (req, res) => {
  res.json({
    success: true,
    currency: req.currency,
    countryCode: req.countryCode,
    source: req.exchangeRateSource,
  });
});

// ---------------------------------------------------------------------------
// GET /api/currency/rates
// ---------------------------------------------------------------------------
router.get("/rates", async (req, res) => {
  try {
    const rates = await getAllRates();
    res.json({ success: true, base: "KES", rates });
  } catch (err) {
    console.error("[CurrencyRoutes] /rates error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch exchange rates" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/currency/refresh (admin only)
// ---------------------------------------------------------------------------
router.post("/refresh", authenticateToken, async (req, res) => {
  // Restrict to admin role
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  try {
    const rates = await refreshCache();
    res.json({ success: true, message: "Exchange rates refreshed", count: Object.keys(rates).length });
  } catch (err) {
    console.error("[CurrencyRoutes] /refresh error:", err.message);
    res.status(500).json({ success: false, message: "Failed to refresh exchange rates" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/currency/convert?amount=1000&from=KES&to=UGX
// ---------------------------------------------------------------------------
router.get("/convert", async (req, res) => {
  const { amount, from = "KES", to } = req.query;

  const parsedAmount = parseFloat(amount);
  if (!Number.isFinite(parsedAmount)) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const validFrom = validateCurrencyCode(from);
  const validTo = validateCurrencyCode(to);
  if (!validFrom || !validTo) {
    return res.status(400).json({ success: false, message: "Invalid currency code" });
  }

  try {
    const rate = await getRate(validFrom, validTo);
    const converted = convertPrice({ amount: parsedAmount, from: validFrom, to: validTo, rate });
    res.json({
      success: true,
      amount: parsedAmount,
      from: validFrom,
      to: validTo,
      rate,
      convertedAmount: converted,
      displayValue: formatCurrency(converted, validTo),
    });
  } catch (err) {
    console.error("[CurrencyRoutes] /convert error:", err.message);
    res.status(500).json({ success: false, message: "Conversion failed" });
  }
});

module.exports = router;
