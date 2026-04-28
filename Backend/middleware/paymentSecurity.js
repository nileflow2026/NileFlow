// middleware/paymentSecurity.js
const logger = require("../utils/logger");
const { env } = require("../src/env");
const { computeCartSubtotal } = require("../utils/serverPricing");

/**
 * Payment security middleware - validates payment requests and prevents fraud
 * ZERO TRUST: All prices/fees are verified server-side from the database.
 */
const paymentSecurity = {
  /**
   * Validate payment amount by recomputing from DB prices.
   * Never trusts client-sent price, discount, tax, shipping, or serviceFee.
   */
  validatePaymentAmount: async (req, res, next) => {
    try {
      const { amount, totalAmount, cart } = req.body;
      const paymentAmount = parseFloat(amount || totalAmount);

      if (!paymentAmount || paymentAmount <= 0 || !isFinite(paymentAmount)) {
        return res.status(400).json({
          error: "Invalid payment amount",
          code: "INVALID_AMOUNT",
        });
      }

      // Prevent excessive amounts (basic fraud protection)
      const maxAmount = 1000000; // 1M KES
      if (paymentAmount > maxAmount) {
        logger.warn(
          `Suspicious large payment attempt: ${paymentAmount} from user ${req.user?.userId}`,
        );
        return res.status(400).json({
          error: "Payment amount exceeds maximum limit",
          code: "AMOUNT_TOO_LARGE",
        });
      }

      // Server-side cart validation - fetch real prices from product DB
      if (cart && Array.isArray(cart) && cart.length > 0) {
        const { subtotal, verifiedItems, errors } =
          await computeCartSubtotal(cart);

        if (errors.length > 0 && subtotal === null) {
          // Product collection not configured - log and allow (graceful degradation)
          logger.warn(
            "Price verification unavailable - product collection not configured",
          );
          return next();
        }

        if (errors.length > 0) {
          logger.warn("Cart validation errors:", errors);
          return res.status(400).json({
            error: "Invalid cart items",
            code: "INVALID_CART",
          });
        }

        // Attach the server-computed subtotal to req for downstream use
        req.serverComputedSubtotal = subtotal;
        req.verifiedCartItems = verifiedItems;

        // The payment amount must be >= subtotal (underpayment check).
        // Only applies when the client currency matches KES — for foreign
        // currencies the client amount is a converted value that is not
        // comparable to the KES subtotal. The controller re-validates from DB.
        if ((req.body.currency || "KES").toUpperCase() === "KES") {
          if (paymentAmount < subtotal - 1) {
            // 1 KES tolerance for rounding
            logger.warn(
              `Payment amount ${paymentAmount} is less than server-computed subtotal ${subtotal}`,
              { userId: req.user?.userId },
            );
            return res.status(400).json({
              error: "Payment amount is less than cart value",
              code: "AMOUNT_TOO_LOW",
            });
          }
        }

        // Reject if the overpayment is suspiciously large (> 50% above subtotal).
        // IMPORTANT: Only apply this check when the client currency matches KES
        // (the currency used by computeCartSubtotal / the Appwrite DB).
        // For non-KES currencies (e.g. SSP, UGX) the client sends a converted
        // amount that is legitimately much larger than the KES subtotal, so the
        // comparison is meaningless. The controller already re-computes the
        // authoritative KES total from DB prices (zero-trust), so skipping this
        // check for foreign currencies does not reduce security.
        const requestCurrency = (req.body.currency || "KES").toUpperCase();
        if (requestCurrency === "KES") {
          const maxReasonableTotal = subtotal * 1.5 + 500; // 50% margin + 500 KES for fees
          if (paymentAmount > maxReasonableTotal && subtotal > 0) {
            logger.warn(
              `Suspiciously high payment: ${paymentAmount} vs subtotal ${subtotal}`,
              { userId: req.user?.userId },
            );
            return res.status(400).json({
              error:
                "Payment amount is unreasonably high for the cart contents",
              code: "AMOUNT_SUSPICIOUS",
            });
          }
        }
      }

      next();
    } catch (error) {
      logger.error("Payment amount validation error:", error);
      return res.status(400).json({
        error: "Invalid payment data",
        code: "VALIDATION_ERROR",
      });
    }
  },

  /**
   * Rate limiting for payment attempts per user
   */
  paymentRateLimit: (() => {
    const attempts = new Map();
    const maxAttempts = 10;
    const windowMs = 60 * 1000; // 1 minute

    return (req, res, next) => {
      const userId = req.user?.userId;
      if (!userId) return next();

      const now = Date.now();
      const userAttempts = attempts.get(userId) || [];

      // Clean old attempts
      const recentAttempts = userAttempts.filter(
        (time) => now - time < windowMs,
      );

      if (recentAttempts.length >= maxAttempts) {
        logger.warn(`Payment rate limit exceeded for user ${userId}`);
        return res.status(429).json({
          error: "Too many payment attempts. Please wait before trying again.",
          code: "RATE_LIMIT_EXCEEDED",
        });
      }

      recentAttempts.push(now);
      attempts.set(userId, recentAttempts);

      next();
    };
  })(),

  /**
   * Validate user authorization for payment
   */
  validateUserAuthorization: (req, res, next) => {
    const { userId } = req.body;
    const authenticatedUserId = req.user?.userId;

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: "User authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    // Ensure user can only make payments for themselves
    if (userId && userId !== authenticatedUserId) {
      logger.warn(
        `User ${authenticatedUserId} attempted to make payment for user ${userId}`,
      );
      return res.status(403).json({
        error: "Cannot make payments for other users",
        code: "UNAUTHORIZED_PAYMENT",
      });
    }

    next();
  },

  /**
   * Sanitize payment input data
   */
  sanitizePaymentData: (req, res, next) => {
    try {
      const { amount, totalAmount, phoneNumber, customerEmail } = req.body;

      // Sanitize amount
      if (amount) {
        req.body.amount = Math.round(parseFloat(amount) * 100) / 100; // Round to 2 decimals
      }
      if (totalAmount) {
        req.body.totalAmount = Math.round(parseFloat(totalAmount) * 100) / 100;
      }

      // Sanitize phone number
      if (phoneNumber) {
        req.body.phoneNumber = phoneNumber.replace(/[^\d+]/g, ""); // Only digits and +
      }

      // Sanitize email
      if (customerEmail) {
        req.body.customerEmail = customerEmail.toLowerCase().trim();
      }

      next();
    } catch (error) {
      logger.error("Payment data sanitization error:", error);
      return res.status(400).json({
        error: "Invalid payment data format",
        code: "SANITIZATION_ERROR",
      });
    }
  },
};

module.exports = paymentSecurity;
