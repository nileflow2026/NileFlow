import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api";

const SocialContext = createContext();

/**
 * SocialProvider - Manages social interactions and Nile Miles
 * Core engagement system for social commerce features
 * Syncs with backend API and falls back to local storage
 */
export const SocialProvider = ({ children }) => {
  const [nileMiles, setNileMiles] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [dailyActions, setDailyActions] = useState({
    likes: 0,
    shares: 0,
    videosWatched: 0,
    lastReset: new Date().toDateString(),
  });
  const [synced, setSynced] = useState(false);

  // Nile Miles earning rates
  const MILES_RATES = {
    LIKE: 1,
    SHARE: 5,
    VIDEO_WATCH: 2, // per 30 seconds watched
    REFERRAL: 50,
    FIRST_PURCHASE: 100,
    DAILY_LOGIN: 10,
  };

  // Daily limits for earning Miles
  const DAILY_LIMITS = {
    likes: 50, // Max 50 Miles from likes per day
    shares: 100, // Max 100 Miles from shares per day
    videosWatched: 60, // Max 60 Miles from watching videos per day
  };

  useEffect(() => {
    loadSocialData();
    resetDailyActionsIfNeeded();
  }, []);

  const loadSocialData = async () => {
    try {
      // Try to fetch from backend first
      const res = await axiosClient.get("/api/nilemiles/nilemiles/status");
      if (res.data && typeof res.data.totalMiles === "number") {
        const backendMiles = res.data.totalMiles || 0;
        const level = calculateLevel(backendMiles);
        setNileMiles(backendMiles);
        setUserLevel(level);
        setSynced(true);
        // Cache locally
        await AsyncStorage.setItem("nileMiles", backendMiles.toString());
        await AsyncStorage.setItem("userLevel", level.toString());
      }
    } catch {
      // Backend unavailable, fall back to local cache
      try {
        const savedMiles = await AsyncStorage.getItem("nileMiles");
        const savedLevel = await AsyncStorage.getItem("userLevel");
        if (savedMiles) setNileMiles(parseInt(savedMiles));
        if (savedLevel) setUserLevel(parseInt(savedLevel));
      } catch (localError) {
        console.error("Error loading local social data:", localError);
      }
    }

    // Always load daily actions from local storage
    try {
      const savedActions = await AsyncStorage.getItem("dailyActions");
      if (savedActions) setDailyActions(JSON.parse(savedActions));
    } catch {
      // Ignore
    }
  };

  const saveSocialData = async (miles, level, actions) => {
    try {
      await AsyncStorage.setItem("nileMiles", miles.toString());
      await AsyncStorage.setItem("userLevel", level.toString());
      await AsyncStorage.setItem("dailyActions", JSON.stringify(actions));
    } catch (error) {
      console.error("Error saving social data:", error);
    }
  };

  const resetDailyActionsIfNeeded = () => {
    const today = new Date().toDateString();
    if (dailyActions.lastReset !== today) {
      const resetActions = {
        likes: 0,
        shares: 0,
        videosWatched: 0,
        lastReset: today,
      };
      setDailyActions(resetActions);
    }
  };

  const earnMiles = (action, amount = 1) => {
    const today = new Date().toDateString();
    let newActions = { ...dailyActions };

    // Check if it's a new day
    if (newActions.lastReset !== today) {
      newActions = {
        likes: 0,
        shares: 0,
        videosWatched: 0,
        lastReset: today,
      };
    }

    let milesEarned = 0;
    let actionKey = "";

    switch (action) {
      case "LIKE":
        actionKey = "likes";
        if (newActions.likes < DAILY_LIMITS.likes) {
          milesEarned = MILES_RATES.LIKE * amount;
          newActions.likes += amount;
        }
        break;

      case "SHARE":
        actionKey = "shares";
        if (newActions.shares < DAILY_LIMITS.shares / MILES_RATES.SHARE) {
          milesEarned = MILES_RATES.SHARE * amount;
          newActions.shares += amount;
        }
        break;

      case "VIDEO_WATCH":
        actionKey = "videosWatched";
        if (
          newActions.videosWatched <
          DAILY_LIMITS.videosWatched / MILES_RATES.VIDEO_WATCH
        ) {
          milesEarned = MILES_RATES.VIDEO_WATCH * amount;
          newActions.videosWatched += amount;
        }
        break;

      case "REFERRAL":
      case "FIRST_PURCHASE":
      case "DAILY_LOGIN":
        milesEarned = MILES_RATES[action] * amount;
        break;
    }

    if (milesEarned > 0) {
      const newMiles = nileMiles + milesEarned;
      const newLevel = calculateLevel(newMiles);

      setNileMiles(newMiles);
      setUserLevel(newLevel);
      setDailyActions(newActions);

      saveSocialData(newMiles, newLevel, newActions);

      return milesEarned;
    }

    return 0;
  };

  const spendMiles = async (amount) => {
    if (nileMiles >= amount) {
      const newMiles = nileMiles - amount;
      setNileMiles(newMiles);

      await AsyncStorage.setItem("nileMiles", newMiles.toString());
      return true;
    }
    return false;
  };

  const calculateLevel = (miles) => {
    // Level progression: 100 miles for level 1, 250 for level 2, 500 for level 3, etc.
    if (miles < 100) return 1;
    if (miles < 250) return 2;
    if (miles < 500) return 3;
    if (miles < 1000) return 4;
    if (miles < 2000) return 5;
    return Math.floor(miles / 1000) + 5;
  };

  const getLevelProgress = () => {
    const milestones = [0, 100, 250, 500, 1000, 2000];
    const currentMilestone = milestones[userLevel - 1] || 0;
    const nextMilestone =
      milestones[userLevel] || (userLevel - 5) * 1000 + 2000;

    const progress = nileMiles - currentMilestone;
    const required = nextMilestone - currentMilestone;

    return {
      current: progress,
      required: required,
      percentage: Math.min((progress / required) * 100, 100),
    };
  };

  const getUserBadges = () => {
    const badges = [];

    if (userLevel >= 3) badges.push("🔥 Rising Star");
    if (userLevel >= 5) badges.push("⭐ Campus Influencer");
    if (userLevel >= 8) badges.push("👑 Nile Legend");

    if (nileMiles >= 1000) badges.push("💎 Miles Collector");
    if (dailyActions.shares >= 5) badges.push("📤 Super Sharer");

    return badges;
  };

  const canAfford = (cost) => nileMiles >= cost;

  const value = {
    nileMiles,
    userLevel,
    dailyActions,
    earnMiles,
    spendMiles,
    getLevelProgress,
    getUserBadges,
    canAfford,
    synced,
    DAILY_LIMITS,
    MILES_RATES,
  };

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
};

export default SocialContext;
