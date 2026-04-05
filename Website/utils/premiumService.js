import axiosClient from "../axiosClient";

const premiumService = {
  /**
   * Get the current user's premium subscription status.
   * @returns {{ isPremium: boolean, expiresAt: string|null }}
   */
  async getStatus() {
    try {
      const { data } = await axiosClient.get("/api/subscription/status");
      return {
        isPremium: data?.isPremium ?? data?.isSubscribed ?? false,
        expiresAt: data?.expiresAt ?? data?.endDate ?? null,
      };
    } catch {
      return { isPremium: false, expiresAt: null };
    }
  },

  /**
   * Get premium benefits info for the current user.
   */
  async getBenefitsInfo() {
    try {
      const { data } = await axiosClient.get("/api/premium/benefits-info");
      return data;
    } catch {
      return {
        isPremium: false,
        benefits: {
          nilesMultiplier: "2x",
          freeDelivery: "Available for premium users",
          exclusiveDeals: "Up to 15% off",
          monthlySavings: "Calculated based on your orders",
        },
      };
    }
  },

  /**
   * Calculate premium discount for a given order total.
   * @param {number} orderTotal
   * @returns {{ originalTotal, discountAmount, discountPercentage, newTotal, savings }}
   */
  async calculateDiscount(orderTotal) {
    try {
      const { data } = await axiosClient.post(
        "/api/premium/calculate-discount",
        { orderTotal },
      );
      return data;
    } catch {
      return {
        originalTotal: orderTotal,
        discountAmount: 0,
        discountPercentage: 0,
        newTotal: orderTotal,
        savings: 0,
      };
    }
  },

  /**
   * Calculate Nile Miles earned for a given order total.
   * @param {number} orderTotal
   */
  async calculateMiles(orderTotal) {
    try {
      const { data } = await axiosClient.post("/api/premium/calculate-miles", {
        orderTotal,
      });
      return data;
    } catch {
      const baseMiles = Math.floor(orderTotal / 10);
      return {
        orderTotal,
        baseMiles,
        actualMiles: baseMiles,
        multiplier: 1,
        bonus: 0,
      };
    }
  },

  /**
   * Get exclusive deals available to premium users.
   */
  async getPremiumDeals() {
    try {
      const { data } = await axiosClient.get("/api/premium/deals");
      return data;
    } catch {
      return { isPremium: false, deals: [] };
    }
  },
};

export { premiumService };
export default premiumService;
