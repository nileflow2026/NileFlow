/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const Redeem = () => {
  const { theme, themeStyles } = useTheme();
  const { user } = useGlobalContext();
  const [nileMilesData, setNileMilesData] = useState({
    currentMiles: 0,
    earnedHistory: [],
    redeemed: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const router = useRouter();
  const isDarkMode = theme === "dark";

  // Premium African marketplace theme
  const premiumColors = {
    primary: "#fbbf24", // amber-400
    secondary: "#d97706", // amber-600
    accent: "#10b981", // emerald-500
    background: "#0f172a", // slate-900
    surface: "#1e293b", // slate-800
    text: "#f8fafc", // slate-50
    textSecondary: "#cbd5e1", // slate-300
  };

  const REWARDS = [
    {
      key: "a_pen",
      name: "Premium Pen",
      miles: 50,
      icon: "edit",
      color: ["#3b82f6", "#1d4ed8"], // blue
      description: "Limited edition African design pen",
    },
    {
      key: "free_delivery",
      name: "Free Delivery",
      miles: 250,
      icon: "local-shipping",
      color: ["#10b981", "#059669"], // emerald
      description: "Express delivery on any order",
    },
    {
      key: "5_percent_off",
      name: "5% Discount",
      miles: 500,
      icon: "discount",
      color: ["#8b5cf6", "#7c3aed"], // purple
      description: "5% off your next purchase",
    },
    {
      key: "premium_sale",
      name: "Premium Access",
      miles: 1000,
      icon: "star",
      color: ["#fbbf24", "#d97706"], // amber
      description: "Early access to premium sales",
    },
    {
      key: "hoodie",
      name: "Premium Hoodie",
      miles: 2000,
      icon: "checkroom",
      color: ["#ef4444", "#dc2626"], // red
      description: "Exclusive African design hoodie",
    },
    {
      key: "gold_member",
      name: "Gold Membership",
      miles: 5000,
      icon: "workspace-premium",
      color: ["#eab308", "#ca8a04"], // yellow
      description: "One year gold membership",
    },
  ];

  const getNextReward = (miles) => {
    const sorted = [...REWARDS].sort((a, b) => a.miles - b.miles);
    for (const reward of sorted) {
      if (miles < reward.miles) return reward;
    }
    return null;
  };

  const getProgressToNext = (miles) => {
    const next = getNextReward(miles);
    if (!next) {
      return { percent: 100, nextReward: null, milesLeft: 0 };
    }
    const target = next.miles;
    const percent = Math.min((miles / target) * 100, 100);
    const milesLeft = Math.max(target - miles, 0);
    return { percent: Math.round(percent), nextReward: next, milesLeft };
  };

  const showToast = (message, type = "success") => {
    Alert.alert(
      type === "success" ? "Success!" : type === "error" ? "Error!" : "Info",
      message,
      [{ text: "OK" }]
    );
  };

  useEffect(() => {
    const fetchNileMiles = async () => {
      setLoading(true);
      try {
        console.log("📡 Fetching with userId:", user.id);
        const res = await axiosClient.get(
          `/api/nilemiles/nilemiles/status?userId=${user.id}`
        );
        console.log("✅ Raw response:", res);
        console.log("📦 Data:", res.data);
        setNileMilesData(res.data);
      } catch (error) {
        console.error("❌ Failed to load Nile Miles:", error);
        showToast("Failed to load Nile Miles", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchNileMiles();
    } else {
      console.warn("⚠️ No user ID found, skipping fetch.");
      setLoading(false);
    }
  }, [user]);

  const handleRedeem = async (rewardKey) => {
    if (!user.id) {
      showToast("Please log in to redeem rewards", "error");
      return;
    }

    const reward = REWARDS.find((r) => r.key === rewardKey);
    if (!reward) {
      showToast("Invalid reward selected", "error");
      return;
    }

    if (nileMilesData.currentMiles < reward.miles) {
      showToast("Insufficient miles for this reward", "error");
      return;
    }

    setRedeeming(true);
    try {
      const res = await axiosClient.post("/api/nilemiles/redeem", {
        userId: user.id,
        rewardKey,
      });

      if (res.data.success) {
        showToast(`Success! You redeemed: ${res.data.reward}`, "success");
        // Refresh miles
        setNileMilesData((prev) => ({
          ...prev,
          currentMiles: prev.currentMiles - reward.miles,
          redeemed: [
            ...prev.redeemed,
            {
              rewardName: res.data.reward,
              milesUsed: reward.miles,
              date: new Date().toISOString(),
            },
          ],
        }));
        setSelectedReward(null);
      }
    } catch (error) {
      console.error("Redeem failed:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.error || "Could not redeem reward.";
      showToast(`Failed: ${errorMsg}`, "error");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={premiumColors.primary} />
              <Text style={styles.loadingTitle}>Loading Your Miles</Text>
              <Text style={styles.loadingDescription}>
                Retrieving your premium rewards...
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.accessContainer}>
            <LinearGradient
              colors={["rgba(239, 68, 68, 0.1)", "rgba(217, 119, 6, 0.1)"]}
              style={styles.accessIcon}
            >
              <MaterialIcons name="security" size={40} color="#ef4444" />
            </LinearGradient>
            <Text style={styles.accessTitle}>Access Required</Text>
            <Text style={styles.accessDescription}>
              Please log in to access premium rewards and redeem your Nile
              Miles.
            </Text>
            <TouchableOpacity
              style={styles.accessButton}
              onPress={() => router.push("/(auth)/sign-in")}
            >
              <LinearGradient
                colors={[premiumColors.primary, premiumColors.secondary]}
                style={styles.accessButtonGradient}
              >
                <Text style={styles.accessButtonText}>Sign In to Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { percent, nextReward, milesLeft } = getProgressToNext(
    nileMilesData.currentMiles
  );

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0f172a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.5)"]}
                style={styles.backButtonGradient}
              >
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={24}
                  color={premiumColors.primary}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <LinearGradient
                colors={["rgba(251, 191, 36, 0.1)", "rgba(16, 185, 129, 0.1)"]}
                style={styles.headerBadge}
              >
                <MaterialIcons
                  name="auto-awesome"
                  size={16}
                  color={premiumColors.primary}
                />
                <Text style={styles.headerBadgeText}>Premium Rewards</Text>
              </LinearGradient>
              <Text style={styles.headerTitle}>
                Nile <Text style={styles.headerTitleAccent}>Miles</Text>
              </Text>
            </View>
          </View>

          {/* Current Miles Display */}
          <View style={styles.milesSection}>
            <LinearGradient
              colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
              style={styles.milesCard}
            >
              <View style={styles.milesDisplay}>
                <Text style={styles.milesLabel}>Your Current Balance</Text>
                <View style={styles.milesValueContainer}>
                  <MaterialIcons
                    name="stars"
                    size={32}
                    color={premiumColors.primary}
                  />
                  <Text style={styles.milesValue}>
                    {nileMilesData.currentMiles}
                  </Text>
                  <Text style={styles.milesUnit}>Miles</Text>
                </View>
                <Text style={styles.milesDescription}>
                  Available to redeem for premium rewards
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {nextReward
                      ? `Next: ${nextReward.name} • ${milesLeft} miles needed`
                      : "All rewards unlocked"}
                  </Text>
                  <Text style={styles.progressPercentage}>{percent}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <LinearGradient
                    colors={[
                      premiumColors.primary,
                      "#fde047",
                      premiumColors.accent,
                    ]}
                    style={[styles.progressBarFill, { width: `${percent}%` }]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressStart}>0</Text>
                  <Text style={styles.progressEnd}>
                    {nextReward
                      ? nextReward.miles
                      : REWARDS[REWARDS.length - 1].miles}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialIcons name="gps-fixed" size={20} color="#3b82f6" />
                  <Text style={styles.statValue}>{REWARDS.length}</Text>
                  <Text style={styles.statLabel}>Available Rewards</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons
                    name="trending-up"
                    size={20}
                    color={premiumColors.accent}
                  />
                  <Text style={styles.statValue}>
                    {nileMilesData.redeemed?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Redeemed</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons
                    name="emoji-events"
                    size={20}
                    color={premiumColors.primary}
                  />
                  <Text style={styles.statValue}>{REWARDS.length}</Text>
                  <Text style={styles.statLabel}>Total Rewards</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={20}
                    color="#8b5cf6"
                  />
                  <Text style={styles.statValue}>∞</Text>
                  <Text style={styles.statLabel}>Never Expire</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Rewards Grid */}
          <View style={styles.rewardsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Premium Rewards</Text>
                <Text style={styles.sectionSubtitle}>
                  Redeem your miles for exclusive benefits
                </Text>
              </View>
              <View style={styles.sectionBadge}>
                <MaterialIcons
                  name="military-tech"
                  size={20}
                  color={premiumColors.primary}
                />
                <Text style={styles.sectionBadgeText}>Exclusive</Text>
              </View>
            </View>

            <View style={styles.rewardsGrid}>
              {REWARDS.map((reward) => {
                const canRedeem = nileMilesData.currentMiles >= reward.miles;
                return (
                  <TouchableOpacity
                    key={reward.key}
                    style={[
                      styles.rewardCard,
                      !canRedeem && styles.rewardCardDisabled,
                    ]}
                    onPress={() => canRedeem && setSelectedReward(reward)}
                    disabled={!canRedeem}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(30, 41, 59, 0.9)",
                        "rgba(15, 23, 42, 0.9)",
                      ]}
                      style={styles.rewardCardGradient}
                    >
                      {/* Quick Win Badge */}
                      {reward.miles <= 100 && (
                        <View style={styles.quickWinBadge}>
                          <LinearGradient
                            colors={[premiumColors.accent, "#059669"]}
                            style={styles.quickWinBadgeGradient}
                          >
                            <Text style={styles.quickWinBadgeText}>
                              Quick Win
                            </Text>
                          </LinearGradient>
                        </View>
                      )}

                      {/* Reward Icon */}
                      <LinearGradient
                        colors={
                          canRedeem ? reward.color : ["#6b7280", "#4b5563"]
                        }
                        style={styles.rewardIcon}
                      >
                        <MaterialIcons
                          name={reward.icon}
                          size={24}
                          color="white"
                        />
                      </LinearGradient>

                      <View style={styles.rewardContent}>
                        <Text
                          style={[
                            styles.rewardName,
                            !canRedeem && styles.rewardNameDisabled,
                          ]}
                        >
                          {reward.name}
                        </Text>
                        <Text style={styles.rewardDescription}>
                          {reward.description}
                        </Text>
                      </View>

                      {/* Miles Required */}
                      <View style={styles.rewardFooter}>
                        <View style={styles.rewardMiles}>
                          <MaterialIcons
                            name="stars"
                            size={16}
                            color={premiumColors.primary}
                          />
                          <Text
                            style={[
                              styles.rewardMilesValue,
                              !canRedeem && styles.rewardMilesDisabled,
                            ]}
                          >
                            {reward.miles}
                          </Text>
                          <Text style={styles.rewardMilesUnit}>Miles</Text>
                        </View>

                        <View
                          style={[
                            styles.rewardStatus,
                            canRedeem
                              ? styles.rewardStatusAvailable
                              : styles.rewardStatusUnavailable,
                          ]}
                        >
                          <MaterialIcons
                            name={canRedeem ? "flash-on" : "schedule"}
                            size={12}
                            color={canRedeem ? premiumColors.accent : "#6b7280"}
                          />
                          <Text
                            style={[
                              styles.rewardStatusText,
                              canRedeem && styles.rewardStatusTextAvailable,
                            ]}
                          >
                            {canRedeem ? "Available" : "Need more"}
                          </Text>
                        </View>
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity
                        style={[
                          styles.rewardButton,
                          !canRedeem && styles.rewardButtonDisabled,
                        ]}
                        onPress={() => canRedeem && setSelectedReward(reward)}
                        disabled={!canRedeem || redeeming}
                      >
                        <LinearGradient
                          colors={
                            canRedeem
                              ? [premiumColors.primary, premiumColors.secondary]
                              : ["#374151", "#1f2937"]
                          }
                          style={styles.rewardButtonGradient}
                        >
                          <MaterialIcons
                            name="card-giftcard"
                            size={16}
                            color="white"
                          />
                          <Text style={styles.rewardButtonText}>
                            {canRedeem ? "Redeem Now" : "Insufficient Miles"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      {/* Hover Effect */}
                      <View style={styles.rewardCardHover} />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Redemption History */}
          {nileMilesData.redeemed?.length > 0 ? (
            <View style={styles.historySection}>
              <View style={styles.historySectionHeader}>
                <Text style={styles.historySectionTitle}>
                  Redemption History
                </Text>
                <Text style={styles.historySectionSubtitle}>
                  Your recent reward redemptions
                </Text>
              </View>

              <LinearGradient
                colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                style={styles.historyContainer}
              >
                {nileMilesData.redeemed
                  .filter((item) => item?.date && !isNaN(new Date(item.date)))
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <LinearGradient
                        colors={[
                          "rgba(251, 191, 36, 0.1)",
                          "rgba(217, 119, 6, 0.05)",
                        ]}
                        style={styles.historyIcon}
                      >
                        <MaterialIcons
                          name="card-giftcard"
                          size={16}
                          color={premiumColors.primary}
                        />
                      </LinearGradient>
                      <View style={styles.historyContent}>
                        <Text style={styles.historyRewardName}>
                          {item.rewardName}
                        </Text>
                        <View style={styles.historyDetails}>
                          <View style={styles.historyMiles}>
                            <MaterialIcons
                              name="stars"
                              size={12}
                              color={premiumColors.primary}
                            />
                            <Text style={styles.historyMilesText}>
                              {item.milesUsed} miles
                            </Text>
                          </View>
                          <Text style={styles.historyDate}>
                            {new Date(item.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.historyStatus}>
                        <MaterialIcons
                          name="check-circle"
                          size={12}
                          color={premiumColors.accent}
                        />
                        <Text style={styles.historyStatusText}>Redeemed</Text>
                      </View>
                    </View>
                  ))}
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.noHistoryContainer}>
              <LinearGradient
                colors={["rgba(251, 191, 36, 0.1)", "rgba(217, 119, 6, 0.1)"]}
                style={styles.noHistoryIcon}
              >
                <MaterialIcons
                  name="history"
                  size={32}
                  color={premiumColors.primary}
                />
              </LinearGradient>
              <Text style={styles.noHistoryTitle}>No Redemption History</Text>
              <Text style={styles.noHistoryDescription}>
                You haven't redeemed any rewards yet. Start by earning miles
                through purchases!
              </Text>
            </View>
          )}

          {/* How to Earn Section */}
          <View style={styles.earnSection}>
            <LinearGradient
              colors={["rgba(251, 191, 36, 0.1)", "rgba(16, 185, 129, 0.1)"]}
              style={styles.earnContainer}
            >
              <Text style={styles.earnTitle}>How to Earn More Miles</Text>
              <View style={styles.earnGrid}>
                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.5)"]}
                  style={styles.earnCard}
                >
                  <LinearGradient
                    colors={[premiumColors.primary, premiumColors.secondary]}
                    style={styles.earnIcon}
                  >
                    <MaterialIcons
                      name="shopping-bag"
                      size={20}
                      color="white"
                    />
                  </LinearGradient>
                  <Text style={styles.earnCardTitle}>Make Purchases</Text>
                  <Text style={styles.earnCardDescription}>
                    Earn 10 miles for every $1 spent
                  </Text>
                </LinearGradient>

                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.5)"]}
                  style={styles.earnCard}
                >
                  <LinearGradient
                    colors={[premiumColors.accent, "#059669"]}
                    style={styles.earnIcon}
                  >
                    <MaterialIcons name="star" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.earnCardTitle}>Write Reviews</Text>
                  <Text style={styles.earnCardDescription}>
                    Get 100 miles per review
                  </Text>
                </LinearGradient>

                <LinearGradient
                  colors={["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.5)"]}
                  style={styles.earnCard}
                >
                  <LinearGradient
                    colors={["#3b82f6", "#1d4ed8"]}
                    style={styles.earnIcon}
                  >
                    <MaterialIcons name="group" size={20} color="white" />
                  </LinearGradient>
                  <Text style={styles.earnCardTitle}>Refer Friends</Text>
                  <Text style={styles.earnCardDescription}>
                    500 miles per referral
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal
          visible={selectedReward !== null}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]}
                style={styles.modalContent}
              >
                {selectedReward && (
                  <>
                    <View style={styles.modalHeader}>
                      <LinearGradient
                        colors={selectedReward.color}
                        style={styles.modalIcon}
                      >
                        <MaterialIcons
                          name={selectedReward.icon}
                          size={32}
                          color="white"
                        />
                      </LinearGradient>
                      <Text style={styles.modalTitle}>Confirm Redemption</Text>
                      <Text style={styles.modalSubtitle}>
                        Redeem {selectedReward.miles} miles for
                      </Text>
                    </View>

                    <LinearGradient
                      colors={[
                        "rgba(251, 191, 36, 0.1)",
                        "rgba(217, 119, 6, 0.1)",
                      ]}
                      style={styles.modalRewardInfo}
                    >
                      <Text style={styles.modalRewardName}>
                        {selectedReward.name}
                      </Text>
                      <Text style={styles.modalRewardDescription}>
                        {selectedReward.description}
                      </Text>
                    </LinearGradient>

                    <View style={styles.modalCalculation}>
                      <View style={styles.modalCalculationRow}>
                        <Text style={styles.modalCalculationLabel}>
                          Current miles:
                        </Text>
                        <Text style={styles.modalCalculationValue}>
                          {nileMilesData.currentMiles}
                        </Text>
                      </View>
                      <View style={styles.modalCalculationRow}>
                        <Text style={styles.modalCalculationLabel}>Cost:</Text>
                        <Text style={styles.modalCalculationCost}>
                          -{selectedReward.miles}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.modalCalculationRow,
                          styles.modalCalculationTotal,
                        ]}
                      >
                        <Text style={styles.modalCalculationLabel}>
                          Remaining miles:
                        </Text>
                        <Text style={styles.modalCalculationRemaining}>
                          {nileMilesData.currentMiles - selectedReward.miles}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setSelectedReward(null)}
                      >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalConfirmButton}
                        onPress={() => handleRedeem(selectedReward.key)}
                        disabled={redeeming}
                      >
                        <LinearGradient
                          colors={[
                            premiumColors.primary,
                            premiumColors.secondary,
                          ]}
                          style={styles.modalConfirmGradient}
                        >
                          {redeeming ? (
                            <>
                              <ActivityIndicator size="small" color="white" />
                              <Text style={styles.modalConfirmText}>
                                Processing...
                              </Text>
                            </>
                          ) : (
                            <>
                              <MaterialIcons
                                name="check-circle"
                                size={16}
                                color="white"
                              />
                              <Text style={styles.modalConfirmText}>
                                Confirm Redeem
                              </Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Redeem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
    marginTop: 16,
  },
  loadingDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    marginTop: 8,
    textAlign: "center",
  },
  // Access Required State
  accessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  accessIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  accessTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 12,
    textAlign: "center",
  },
  accessDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  accessButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  accessButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  accessButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 16,
  },
  backButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  headerContent: {
    flex: 1,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  headerTitleAccent: {
    color: "#fbbf24",
  },
  // Miles Section
  milesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  milesCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  milesDisplay: {
    alignItems: "center",
    marginBottom: 24,
  },
  milesLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 8,
  },
  milesValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  milesValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fbbf24",
    marginHorizontal: 8,
  },
  milesUnit: {
    fontSize: 18,
    color: "#cbd5e1",
  },
  milesDescription: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  // Progress Section
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    flex: 1,
  },
  progressPercentage: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(107, 114, 128, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStart: {
    fontSize: 10,
    color: "#9ca3af",
  },
  progressEnd: {
    fontSize: 10,
    color: "#9ca3af",
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#cbd5e1",
    textAlign: "center",
  },
  // Rewards Section
  rewardsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 4,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionBadgeText: {
    color: "#fbbf24",
    fontWeight: "600",
    marginLeft: 4,
  },
  rewardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rewardCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  rewardCardDisabled: {
    opacity: 0.7,
  },
  rewardCardGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    position: "relative",
    overflow: "hidden",
  },
  quickWinBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  quickWinBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomRightRadius: 12,
  },
  quickWinBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    marginBottom: 12,
  },
  rewardContent: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  rewardNameDisabled: {
    color: "#6b7280",
  },
  rewardDescription: {
    fontSize: 12,
    color: "#cbd5e1",
    lineHeight: 16,
  },
  rewardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rewardMiles: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardMilesValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fbbf24",
    marginLeft: 4,
  },
  rewardMilesDisabled: {
    color: "#6b7280",
  },
  rewardMilesUnit: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  rewardStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardStatusAvailable: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  rewardStatusUnavailable: {
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.3)",
  },
  rewardStatusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    marginLeft: 4,
  },
  rewardStatusTextAvailable: {
    color: "#10b981",
  },
  rewardButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  rewardButtonDisabled: {
    opacity: 0.5,
  },
  rewardButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  rewardButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 6,
  },
  rewardCardHover: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 2,
    backgroundColor: "#fbbf24",
    borderRadius: 1,
  },
  // History Section
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  historySectionHeader: {
    marginBottom: 16,
  },
  historySectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  historySectionSubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 4,
  },
  historyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    overflow: "hidden",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(251, 191, 36, 0.2)",
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  historyContent: {
    flex: 1,
  },
  historyRewardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  historyDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyMiles: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  historyMilesText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
    marginLeft: 4,
  },
  historyDate: {
    fontSize: 12,
    color: "#3b82f6",
  },
  historyStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#10b981",
    marginLeft: 4,
  },
  // No History
  noHistoryContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  noHistoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  noHistoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  noHistoryDescription: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20,
  },
  // Earn Section
  earnSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  earnContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  earnTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 16,
  },
  earnGrid: {
    gap: 12,
  },
  earnCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    marginBottom: 8,
  },
  earnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  earnCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
    textAlign: "center",
  },
  earnCardDescription: {
    fontSize: 12,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  modalHeader: {
    alignItems: "center",
    padding: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
  },
  modalRewardInfo: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    marginBottom: 20,
  },
  modalRewardName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fbbf24",
    textAlign: "center",
    marginBottom: 8,
  },
  modalRewardDescription: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20,
  },
  modalCalculation: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalCalculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  modalCalculationTotal: {
    borderTopWidth: 1,
    borderTopColor: "rgba(251, 191, 36, 0.3)",
    marginTop: 8,
    paddingTop: 16,
  },
  modalCalculationLabel: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  modalCalculationValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  modalCalculationCost: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ef4444",
  },
  modalCalculationRemaining: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
  },
  modalButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalConfirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalConfirmText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
