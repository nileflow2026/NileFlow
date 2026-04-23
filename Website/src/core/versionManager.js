// __APP_VERSION__ is injected at build time by vite.config.js (git SHA).
// The typeof guard prevents a ReferenceError if the build didn't run the define
// replacement (e.g. cached build, non-Vite runner). In that case we simply
// skip update checks so the app never crashes.
/* global __APP_VERSION__ */
const CURRENT_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : null;

/**
 * Fetches the server-side version and compares it with the running build.
 * Returns { hasUpdate: boolean, force: boolean }.
 */
export async function checkForUpdate() {
  // If we don't have a version to compare against, bail out silently.
  if (!CURRENT_VERSION) return { hasUpdate: false };

  try {
    const res = await fetch("/api/version", { cache: "no-store" });
    if (!res.ok) return { hasUpdate: false };
    const data = await res.json();

    if (data.version && data.version !== CURRENT_VERSION) {
      return { hasUpdate: true, force: !!data.forceUpdate };
    }

    return { hasUpdate: false };
  } catch (err) {
    console.error("[VersionManager] Version check failed", err);
    return { hasUpdate: false };
  }
}
