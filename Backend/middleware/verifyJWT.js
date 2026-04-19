// verifyJWT.js middleware
const jwt = require("jsonwebtoken");
const { env } = require("../src/env");

module.exports = function verifyJWT(req, res, next) {
  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    // Verify token using configured secret with explicit algorithm
    const secret = env.JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET is not configured");
      return res
        .status(500)
        .json({ error: "Authentication service unavailable" });
    }

    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });

    req.user = {
      id: payload.sub,
      // Provide legacy `userId` alias used across controllers
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      ...payload,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
