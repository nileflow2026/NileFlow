// middleware/authMiddleware.js
const { verifyAccessToken } = require("../utils/tokenManager");

// Exact-match allowed origins to prevent subdomain bypass
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  "https://admin.nileflowafrica.com",
  "https://vendor.nileflowafrica.com",
  "https://nileflowafrica.com",
  "https://www.nileflowafrica.com",
  "https://nileflowvendordashboard.onrender.com",
  "https://nile-flow-adminpanel.onrender.com",
  "https://nile-flow-website.onrender.com",
  "https://nile-flow-backend.onrender.com",
]);

const authMiddleware = async (req, res, next) => {
  try {
    // Set CORS headers using exact-match origin validation
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,X-Requested-With,Accept,X-CSRF-Token,Cache-Control,Pragma",
      );
    }

    // Get token from cookie
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        error: "No access token provided",
      });
    }

    // Verify token
    const decoded = verifyAccessToken(accessToken);

    // Attach user info to request
    req.user = {
      userId: decoded.sub,
      role: decoded.role,
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    // Ensure CORS headers are set even on error
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }

    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
