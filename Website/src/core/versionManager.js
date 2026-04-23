// __APP_VERSION__ is injected at build time by vite.config.js (git SHA).
// No manual .env update needed — changes automatically on every build.
/* global __APP_VERSION__ */
const CURRENT_VERSION = __APP_VERSION__;

/**
 * Fetches the server-side version and compares it with the running build.
 * Returns { hasUpdate: boolean, force: boolean }.
 */
export async function checkForUpdate() {
  try {
    const res = await fetch("/api/version", { cache: "no-store" });
    if (!res.ok) return { hasUpdate: false };
    const data = await res.json();

    if (data.version !== CURRENT_VERSION) {
      return { hasUpdate: true, force: !!data.forceUpdate };
    }

    return { hasUpdate: false };
  } catch (err) {
    console.error("[VersionManager] Version check failed", err);
    return { hasUpdate: false };
  }
}
