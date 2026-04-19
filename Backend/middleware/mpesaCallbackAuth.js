// middleware/mpesaCallbackAuth.js
// Validates that M-Pesa callbacks originate from Safaricom's known IP ranges.
// In production, keep this list updated from Safaricom's documentation.

const logger = require("../utils/logger");

// Safaricom M-Pesa known callback IPs (sandbox + production)
// Source: Safaricom Daraja documentation
// Update these periodically or load from env/config
const SAFARICOM_IPS = new Set([
  // Production IPs
  "196.201.214.200",
  "196.201.214.206",
  "196.201.213.114",
  "196.201.214.207",
  "196.201.214.208",
  "196.201.213.44",
  "196.201.212.127",
  "196.201.212.128",
  "196.201.212.129",
  "196.201.212.130",
  "196.201.212.131",
  "196.201.212.132",
  "196.201.212.133",
  "196.201.212.134",
  "196.201.212.135",
  "196.201.212.136",
  // Sandbox - allow all in dev mode
]);

/**
 * Middleware to validate M-Pesa callback source IP.
 * In development/sandbox mode, logs a warning but allows all IPs.
 * In production mode, rejects requests from unknown IPs.
 */
function validateMpesaCallbackSource(req, res, next) {
  // Extract client IP (handle proxies like Render.com)
  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;

  // Normalize IPv6-mapped IPv4 (e.g., ::ffff:196.201.214.200 → 196.201.214.200)
  const normalizedIp = clientIp?.replace(/^::ffff:/, "");

  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.MPESA_ENVIRONMENT === "production";

  if (SAFARICOM_IPS.has(normalizedIp)) {
    return next();
  }

  if (!isProduction) {
    // In development/sandbox, allow but warn
    logger.warn(
      `M-Pesa callback from non-Safaricom IP: ${normalizedIp} (allowed in dev mode)`,
    );
    return next();
  }

  // Production: reject unknown IPs
  logger.error(
    `BLOCKED: M-Pesa callback from unauthorized IP: ${normalizedIp}`,
  );
  return res.status(403).json({
    ResultCode: 1,
    ResultDesc: "Unauthorized",
  });
}

module.exports = { validateMpesaCallbackSource };
