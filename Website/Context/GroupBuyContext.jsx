/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/**
 * GroupBuyContext.jsx  (Web Platform)
 *
 * React context for group buy state management.
 * Wraps all API calls to /api/group-orders/*
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axiosClient from "../axiosClient";
import { useCustomerAuth } from "./CustomerAuthContext";

const GroupBuyContext = createContext(null);

export function GroupBuyProvider({ children }) {
  const { user } = useCustomerAuth();
  const currentUserId = user?.$id || user?.id || null;

  const [activeGroup, setActiveGroup] = useState(null);
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Polling ref for real-time simulation (SSE / WebSocket can replace this)
  const pollRef = useRef(null);

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
      const docs = res.data.documents || [];
      setProductGroups(docs);
      return docs;
    } catch (err) {
      console.error("fetchActiveGroups:", err);
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
        // Refresh product groups list as well
        setProductGroups((prev) =>
          prev.map((g) => (g.$id === groupId ? res.data : g)),
        );
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
      return { data: null, error: "Failed to get share data." };
    }
  }, []);

  // ── Lightweight polling for real-time updates on an open group ─────────────
  const startPolling = useCallback(
    (groupId, intervalMs = 8000) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await axiosClient.get(`/api/group-orders/${groupId}`);
          setActiveGroup(res.data);
        } catch (_) {}
      }, intervalMs);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

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
    startPolling,
    stopPolling,
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
  if (!ctx)
    throw new Error("useGroupBuy must be used inside <GroupBuyProvider>");
  return ctx;
}

export default GroupBuyContext;
