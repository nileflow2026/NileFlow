// redisClient.js
const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

// ---------------------------------------------------------------------------
// In-memory fallback — used when REDIS_URL is absent (e.g. local dev).
// Provides the same interface as the IORedis client so callers need no changes.
// NOTE: state is lost on process restart and is NOT shared across instances.
// ---------------------------------------------------------------------------
class InMemoryRedis {
  constructor() {
    this._store = new Map(); // key → { value, expiresAt }
    console.warn(
      "⚠️  REDIS_URL not set — using in-memory Redis stub. " +
        "Verification codes and refresh tokens will not persist across restarts.",
    );
  }

  _isExpired(entry) {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt;
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry || this._isExpired(entry)) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, exFlag, ttlSeconds) {
    const expiresAt =
      exFlag === "EX" && ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this._store.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key) {
    return this._store.delete(key) ? 1 : 0;
  }

  // Minimal eval: only handles the get-then-delete Lua pattern used below
  async eval(script, _numKeys, key) {
    const entry = this._store.get(key);
    if (!entry || this._isExpired(entry)) {
      this._store.delete(key);
      return null;
    }
    const value = entry.value;
    this._store.delete(key);
    return value;
  }

  // ioredis-compatible no-op event emitter shim
  on() {
    return this;
  }
}

// ---------------------------------------------------------------------------
// Real Redis client (used when REDIS_URL is present)
// ---------------------------------------------------------------------------
let redis;

if (redisUrl) {
  redis = new IORedis(redisUrl, {
    retryStrategy(times) {
      const delay = Math.min(times * 200, 10000);
      console.warn(
        `⚠️ Redis reconnect attempt #${times}, retrying in ${delay}ms`,
      );
      return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  });

  redis.on("connect", () => console.log("🔌 Redis: connecting..."));
  redis.on("ready", () => console.log("✅ Redis: ready for commands"));
  redis.on("error", (err) => console.error("❌ Redis error:", err.message));
  redis.on("end", () => console.log("🚪 Redis connection closed"));
  redis.on("reconnecting", (time) =>
    console.log(`🔄 Redis: reconnecting in ${time}ms`),
  );
} else {
  redis = new InMemoryRedis();
}

// ---------------------------------------------------------------------------
// Helper functions (same interface regardless of backend)
// ---------------------------------------------------------------------------
const setVerificationCode = async (email, code, ttlSeconds = 900) => {
  const key = `verify:${email}`;
  await redis.set(key, code, "EX", ttlSeconds);
};

const getAndDeleteVerificationCode = async (email) => {
  const key = `verify:${email}`;
  const script = `
    local v = redis.call("GET", KEYS[1])
    if v then redis.call("DEL", KEYS[1]) end
    return v
  `;
  return await redis.eval(script, 1, key);
};

const storeRefreshToken = async (userId, refreshToken, ttlSeconds) => {
  const key = `refresh:${userId}:${refreshToken}`;
  await redis.set(key, "1", "EX", ttlSeconds);
};

const revokeRefreshToken = async (userId, refreshToken) => {
  const key = `refresh:${userId}:${refreshToken}`;
  return await redis.del(key);
};

const checkRefreshTokenExists = async (userId, refreshToken) => {
  const key = `refresh:${userId}:${refreshToken}`;
  const v = await redis.get(key);
  return !!v;
};

module.exports = {
  redis,
  setVerificationCode,
  getAndDeleteVerificationCode,
  storeRefreshToken,
  revokeRefreshToken,
  checkRefreshTokenExists,
};
