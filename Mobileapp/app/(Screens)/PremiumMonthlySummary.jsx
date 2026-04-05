/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import { premiumService } from "../../utils/premiumService";

/**
 * PremiumMonthlySummary - Shows monthly savings for premium users
 * Displays how much value they've received from their subscription
 */
const PremiumMonthlySummary = () => {
  const { isPremium, loading: statusLoading } = usePremiumStatus();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!isPremium) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await premiumService.getMonthlySummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [isPremium]);

  if (statusLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#6366f1" />
          <View style={styles.loadingContent}>
            <View style={styles.loadingHeader} />
            <View style={styles.loadingGrid}>
              <View style={styles.loadingItem} />
              <View style={styles.loadingItem} />
              <View style={styles.loadingItem} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!isPremium) {
    return null;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load monthly summary</Text>
      </View>
    );
  }

  if (!summary) {
    return null;
  }

  const {
    totalSavings,
    deliverySavings,
    milesBonus,
    exclusiveDeals,
    subscriptionCost = 200,
  } = summary;
  const netSavings = totalSavings - subscriptionCost;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.mainCard}
      >
        {/* Background Decorations */}
        <View style={[styles.backgroundDecoration, styles.topDecoration]} />
        <View style={[styles.backgroundDecoration, styles.bottomDecoration]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Ionicons name="cash" size={28} color="#FCD34D" />
              <Text style={styles.title}>This Month's Savings</Text>
            </View>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={32} color="#FCD34D" />
          </View>
        </View>

        {/* Savings Breakdown */}
        <View style={styles.savingsGrid}>
          {/* Fast Delivery Card */}
          <TouchableOpacity style={styles.savingsCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.blueIcon]}>
                <Ionicons name="car" size={24} color="white" />
              </View>
              <Text style={styles.cardLabel}>Fast Delivery</Text>
            </View>
            <Text style={styles.cardValue}>
              {deliverySavings} <Text style={styles.currency}>Ksh</Text>
            </Text>
            <Text style={styles.cardDescription}>Saved on shipping costs</Text>
          </TouchableOpacity>

          {/* Bonus Miles Card */}
          <TouchableOpacity style={styles.savingsCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.amberIcon]}>
                <Ionicons name="star" size={24} color="white" />
              </View>
              <Text style={styles.cardLabel}>Bonus Miles</Text>
            </View>
            <Text style={styles.cardValue}>
              {milesBonus} <Text style={styles.currency}>miles</Text>
            </Text>
            <Text style={styles.cardDescription}>Extra from 2x multiplier</Text>
          </TouchableOpacity>

          {/* Premium Deals Card */}
          <TouchableOpacity style={styles.savingsCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.emeraldIcon]}>
                <Ionicons name="pricetag" size={24} color="white" />
              </View>
              <Text style={styles.cardLabel}>Premium Deals</Text>
            </View>
            <Text style={styles.cardValue}>
              {exclusiveDeals} <Text style={styles.currency}>Ksh</Text>
            </Text>
            <Text style={styles.cardDescription}>Exclusive discounts</Text>
          </TouchableOpacity>
        </View>

        {/* Total Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Value Received</Text>
            <Text style={styles.summaryValue}>{totalSavings} Ksh</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summarySubLabel}>Subscription Cost</Text>
            <Text style={styles.summaryCost}>- {subscriptionCost} Ksh</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Net Savings</Text>
            <Text
              style={[
                styles.summaryTotalValue,
                { color: netSavings >= 0 ? "#10b981" : "#f59e0b" },
              ]}
            >
              {netSavings >= 0 ? "+" : ""}
              {netSavings} Ksh
            </Text>
          </View>
        </View>

        {/* Insight */}
        {netSavings > 0 && (
          <View style={[styles.insightCard, styles.positiveInsight]}>
            <View style={[styles.insightIcon, styles.positiveIcon]}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Excellent Value! 🎉</Text>
              <Text style={styles.insightText}>
                Your premium membership has already paid for itself this month!
                Keep shopping to maximize your savings.
              </Text>
            </View>
          </View>
        )}

        {netSavings < 0 && (
          <View style={[styles.insightCard, styles.neutralInsight]}>
            <View style={[styles.insightIcon, styles.neutralIcon]}>
              <Ionicons name="information-circle" size={24} color="white" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Keep Shopping! 💡</Text>
              <Text style={styles.insightText}>
                Make a few more purchases this month to maximize your premium
                value!
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    margin: 16,
    marginBottom: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  backgroundDecoration: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.1,
  },
  topDecoration: {
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    backgroundColor: "rgba(234, 179, 8, 0.3)",
  },
  bottomDecoration: {
    bottom: -48,
    left: -48,
    width: 96,
    height: 96,
    backgroundColor: "rgba(217, 119, 6, 0.3)",
  },
  loadingContainer: {
    padding: 16,
  },
  loadingCard: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  loadingContent: {
    width: "100%",
    marginTop: 16,
  },
  loadingHeader: {
    height: 24,
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    borderRadius: 4,
    width: "33%",
    marginBottom: 16,
  },
  loadingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadingItem: {
    height: 80,
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    borderRadius: 8,
    width: cardWidth,
  },
  errorContainer: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderColor: "rgba(239, 68, 68, 0.5)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    position: "relative",
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  subtitle: {
    color: "rgba(254, 243, 199, 0.7)",
    fontSize: 14,
  },
  headerIcon: {
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    borderRadius: 16,
    padding: 16,
    borderColor: "rgba(217, 119, 6, 0.5)",
    borderWidth: 1,
  },
  savingsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    flexWrap: "wrap",
  },
  savingsCard: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 16,
    padding: 16,
    width: cardWidth,
    marginBottom: 16,
    borderColor: "rgba(217, 119, 6, 0.3)",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
  },
  blueIcon: {
    backgroundColor: "#2563EB",
  },
  amberIcon: {
    backgroundColor: "#D97706",
  },
  emeraldIcon: {
    backgroundColor: "#059669",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FCD34D",
    flex: 1,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  currency: {
    fontSize: 14,
    color: "rgba(254, 243, 199, 0.7)",
  },
  cardDescription: {
    fontSize: 10,
    color: "rgba(254, 243, 199, 0.7)",
  },
  summaryCard: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderColor: "rgba(217, 119, 6, 0.3)",
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "rgba(217, 119, 6, 0.3)",
    paddingTop: 16,
    marginBottom: 0,
  },
  summaryLabel: {
    color: "#FCD34D",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
  },
  summarySubLabel: {
    color: "rgba(254, 243, 199, 0.7)",
    fontSize: 14,
  },
  summaryCost: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  summaryTotalLabel: {
    fontWeight: "bold",
    color: "#FCD34D",
    fontSize: 16,
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  insightCard: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  positiveInsight: {
    borderColor: "#059669",
    borderWidth: 2,
  },
  neutralInsight: {
    borderColor: "#2563EB",
    borderWidth: 2,
  },
  insightIcon: {
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  positiveIcon: {
    backgroundColor: "#059669",
  },
  neutralIcon: {
    backgroundColor: "#2563EB",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
    color: "#FCD34D",
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(254, 243, 199, 0.7)",
  },
});

export default PremiumMonthlySummary;
