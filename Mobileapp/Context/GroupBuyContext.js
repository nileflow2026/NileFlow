/**
 * GroupBuyContext.js
 *
 * Global state management for the Group Buying system.
 * Provides:
 *  - createGroupBuy(productId, options)
 *  - joinGroupBuy(groupId)
 *  - leaveGroupBuy(groupId)
 *  - fetchGroup(groupId)
 *  - fetchActiveGroups(productId)
 *  - Real-time updates via Appwrite Realtime subscription
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axiosClient from "../api";
import { client, Config } from "../Appwrite";
import { useGlobalContext } from "./GlobalProvider";

const GroupBuyContext = createContext(null);

export function GroupBuyProvider({ children }) {
  const { user } = useGlobalContext();
  const currentUserId = user?.$id || user?.userId || null;

  // Active group being viewed / tracked
  const [activeGroup, setActiveGroup] = useState(null);
  // Groups available for a product (shown on product page)
  const [productGroups, setProductGroups] = useState([]);
  // Loading / error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subscriptions = useRef(new Map()); // groupId -> unsubscribe fn

  // ── API helpers ────────────────────────────────────────────────────────────

  const fetchGroup = useCallback(async (groupId) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/api/group-orders/${groupId}`);
      setActiveGroup(res.data);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load group deal.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveGroups = useCallback(async (productId, limit = 5) => {
    try {
      const res = await axiosClient.get(
        `/api/group-orders/active?productId=${productId}&limit=${limit}`,
      );
      setProductGroups(res.data.documents || []);
      return res.data.documents || [];
    } catch (err) {
      console.error("fetchActiveGroups error:", err);
      return [];
    }
  }, []);

  const createGroupBuy = useCallback(
    async (productId, options = {}) => {
      if (!currentUserId) return { error: "You must be logged in." };
      try {
        setLoading(true);
        const payload = {
          productId,
          creatorId: currentUserId,
          maxParticipants: options.maxParticipants ?? 5,
          basePrice: options.basePrice,
          priceStrategy: options.priceStrategy ?? "tiered",
          tiers: options.tiers ?? null,
          ttlHours: options.ttlHours ?? 24,
          productName: options.productName ?? "",
          productImage: options.productImage ?? "",
        };
        const res = await axiosClient.post("/api/group-orders/create", payload);
        setActiveGroup(res.data);
        return { data: res.data, error: null };
      } catch (err) {
        const msg =
          err?.response?.data?.error || "Failed to create group deal.";
        setError(msg);
        return { error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentUserId],
  );

  const joinGroupBuy = useCallback(
    async (groupId) => {
      if (!currentUserId) return { error: "You must be logged in." };
      try {
        setLoading(true);
        const res = await axiosClient.post(
          `/api/group-orders/${groupId}/join`,
          {
            userId: currentUserId,
          },
        );
        setActiveGroup(res.data);
        return { data: res.data, error: null };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to join group deal.";
        setError(msg);
        return { error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentUserId],
  );

  const leaveGroupBuy = useCallback(
    async (groupId) => {
      if (!currentUserId) return { error: "You must be logged in." };
      try {
        const res = await axiosClient.post(
          `/api/group-orders/${groupId}/leave`,
          { userId: currentUserId },
        );
        setActiveGroup(res.data);
        return { data: res.data, error: null };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to leave group.";
        setError(msg);
        return { error: msg };
      }
    },
    [currentUserId],
  );

  const getShareData = useCallback(async (groupId) => {
    try {
      const res = await axiosClient.get(`/api/group-orders/${groupId}/share`);
      return { data: res.data, error: null };
    } catch (err) {
      return { error: "Failed to get share data." };
    }
  }, []);

  // ── Appwrite Realtime ───────────────────────────────────────────────────────

  const subscribeToGroup = useCallback((groupId) => {
    if (subscriptions.current.has(groupId)) return;
    if (!Config?.databaseId) return;

    try {
      const channel = `databases.${Config.databaseId}.collections.${Config.groupOrderCollectionId || "group_orders"}.documents.${groupId}`;
      const unsubscribe = client.subscribe(channel, (msg) => {
        try {
          const response = typeof msg === "string" ? JSON.parse(msg) : msg;
          const { payload, events } = response;
          if (!payload || payload.$id !== groupId) return;

          if (events?.some((e) => e.includes("delete"))) {
            setActiveGroup(null);
            return;
          }
          setActiveGroup((prev) => (prev?.$id === groupId ? payload : prev));
        } catch (e) {
          console.error("GroupBuy realtime parse error:", e);
        }
      });
      subscriptions.current.set(groupId, unsubscribe);
    } catch (e) {
      console.error("GroupBuy subscribe error:", e);
    }
  }, []);

  const unsubscribeFromGroup = useCallback((groupId) => {
    const unsub = subscriptions.current.get(groupId);
    if (unsub) {
      try {
        if (typeof unsub === "function") unsub();
        else if (unsub?.unsubscribe) unsub.unsubscribe();
      } catch (e) {
        console.error("GroupBuy unsubscribe error:", e);
      }
      subscriptions.current.delete(groupId);
    }
  }, []);

  // Clean up all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptions.current.forEach((unsub) => {
        try {
          if (typeof unsub === "function") unsub();
          else if (unsub?.unsubscribe) unsub.unsubscribe();
        } catch (e) {}
      });
      subscriptions.current.clear();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    activeGroup,
    productGroups,
    loading,
    error,
    currentUserId,
    fetchGroup,
    fetchActiveGroups,
    createGroupBuy,
    joinGroupBuy,
    leaveGroupBuy,
    getShareData,
    subscribeToGroup,
    unsubscribeFromGroup,
    clearError,
  };

  return (
    <GroupBuyContext.Provider value={value}>
      {children}
    </GroupBuyContext.Provider>
  );
}

export function useGroupBuy() {
  const ctx = useContext(GroupBuyContext);
  if (!ctx) {
    throw new Error("useGroupBuy must be used inside <GroupBuyProvider>");
  }
  return ctx;
}

export default GroupBuyContext;
