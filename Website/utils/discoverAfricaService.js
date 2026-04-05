import axiosClient from "../axiosClient";

/**
 * Fetch African facts with optional category filter.
 * @param {{ category?: string }} [options]
 * @returns {Promise<Array>}
 */
export async function fetchAfricanFacts({ category } = {}) {
  try {
    const params = category && category !== "all" ? { category } : {};
    const { data } = await axiosClient.get("/api/african-facts", { params });
    return Array.isArray(data) ? data : (data?.facts ?? data?.data ?? []);
  } catch {
    return [];
  }
}

/**
 * Fetch a set of African proverbs.
 * @param {number} [limit=7]
 * @returns {Promise<Array>}
 */
export async function fetchAfricanProverbs(limit = 7) {
  try {
    const { data } = await axiosClient.get("/api/african-proverbs", {
      params: { limit },
    });
    return Array.isArray(data) ? data : (data?.proverbs ?? data?.data ?? []);
  } catch {
    return [];
  }
}

/**
 * Fetch summary statistics about Africa on the platform.
 * @returns {Promise<object>}
 */
export async function fetchAfricanStats() {
  try {
    const { data } = await axiosClient.get("/api/african-stats");
    return data ?? {};
  } catch {
    return {};
  }
}
