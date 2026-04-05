/**
 * Lightweight analytics helper for premium feature events.
 * Logs to console in development; extend with a real analytics
 * provider (e.g. Posthog, Mixpanel) without changing call sites.
 */

const isDev = import.meta.env.DEV;

const log = (event, payload) => {
  if (isDev) {
    console.log("[analytics]", event, payload ?? "");
  }
};

export const trackPremiumEvent = {
  refreshSummary() {
    log("premium:refresh_summary");
  },

  viewMonthlySummary(data) {
    log("premium:view_monthly_summary", data);
  },

  shareSavings(platform, totalSavings) {
    log("premium:share_savings", { platform, totalSavings });
  },
};
