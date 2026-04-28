import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCurrentUser,
  getCustomerOrders,
  useGlobalContext,
} from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { themeStyles } = useTheme();
  const { user } = useGlobalContext();

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

  const CURRENCY_SYMBOLS = {
    KES: "KSh",
    UGX: "UGX",
    TZS: "TSh",
    ETB: "ETB",
    NGN: "₦",
    GHS: "GH₵",
    RWF: "RWF",
    SSP: "SSP",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };
  const CURRENCY_DECIMALS = {
    KES: 0,
    UGX: 0,
    TZS: 0,
    RWF: 0,
    SSP: 0,
    ETB: 2,
    NGN: 2,
    GHS: 2,
    USD: 2,
    GBP: 2,
    EUR: 2,
  };

  const fmtOrderAmount = (amount, currency) => {
    const code = (currency || "KES").toUpperCase();
    const symbol = CURRENCY_SYMBOLS[code] || code;
    const decimals = CURRENCY_DECIMALS[code] ?? 2;
    const n = typeof amount === "number" ? amount : parseFloat(amount) || 0;
    return `${symbol} ${n.toLocaleString("en", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return ["#10b981", "#059669"]; // emerald
      case "shipped":
        return ["#3b82f6", "#1d4ed8"]; // blue
      case "processing":
        return ["#f59e0b", "#d97706"]; // amber
      case "pending":
        return ["#eab308", "#ca8a04"]; // yellow
      case "cancelled":
        return ["#ef4444", "#dc2626"]; // red
      default:
        return ["#6b7280", "#4b5563"]; // gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "check-circle";
      case "shipped":
        return "local-shipping";
      case "processing":
        return "refresh";
      case "pending":
        return "schedule";
      case "cancelled":
        return "cancel";
      default:
        return "package";
    }
  };

  const getStatusProgress = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return 100;
      case "shipped":
        return 75;
      case "processing":
        return 50;
      case "pending":
        return 25;
      default:
        return 0;
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const ordersData = await getCustomerOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("❌ Error fetching orders:", error.message);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.id);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Filter orders by status
  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.status?.toLowerCase() === selectedStatus.toLowerCase(),
        );

  // Status counts for filter badges
  const statusCounts = {
    all: orders.length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered")
      .length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    processing: orders.filter((o) => o.status?.toLowerCase() === "processing")
      .length,
    pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
    cancelled: orders.filter((o) => o.status?.toLowerCase() === "cancelled")
      .length,
  };

  const handleTrackOrder = (order) => {
    const estimatedDelivery = moment(order.createdAt)
      .add(2, "days")
      .format("MMMM Do YYYY");

    router.push({
      pathname: "/(Screens)/TrackOrder",
      params: {
        orderId: order.$id,
        orderTime: new Date(order.createdAt).toLocaleString(),
        paymentTime: new Date(order.createdAt).toLocaleString(),
        orderStatus: order.status || "Processing",
        estimatedDelivery: estimatedDelivery,
      },
    });
  };

  const handleCancelOrder = (order) => {
    Alert.alert(
      "Cancel Order",
      `Are you sure you want to cancel order #${order.$id?.slice(-8)}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            // TODO: Implement order cancellation
            Alert.alert(
              "Order Cancelled",
              "Your order has been cancelled successfully.",
            );
          },
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0f172a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[premiumColors.primary]}
              tintColor={premiumColors.primary}
            />
          }
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={["rgba(251, 191, 36, 0.1)", "rgba(217, 119, 6, 0.05)"]}
              style={styles.premiumBadge}
            >
              <MaterialIcons
                name="inventory"
                size={18}
                color={premiumColors.primary}
              />
              <Text style={styles.badgeText}>Premium Orders</Text>
              <MaterialIcons name="auto-awesome" size={16} color="#fde047" />
            </LinearGradient>

            <Text style={styles.heroTitle}>
              Your <Text style={styles.heroTitleAccent}>Orders</Text>
            </Text>

            <Text style={styles.heroSubtitle}>Premium Purchase History</Text>

            <Text style={styles.heroDescription}>
              Track and manage your premium African product purchases with our
              exclusive order tracking system.
            </Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={["rgba(251, 191, 36, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                style={styles.statCard}
              >
                <MaterialIcons
                  name="shopping-bag"
                  size={20}
                  color={premiumColors.primary}
                />
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(16, 185, 129, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                style={styles.statCard}
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={premiumColors.accent}
                />
                <Text style={styles.statValue}>{statusCounts.delivered}</Text>
                <Text style={styles.statLabel}>Delivered</Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(59, 130, 246, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                style={styles.statCard}
              >
                <MaterialIcons
                  name="local-shipping"
                  size={20}
                  color="#3b82f6"
                />
                <Text style={styles.statValue}>{statusCounts.shipped}</Text>
                <Text style={styles.statLabel}>In Transit</Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(239, 68, 68, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                style={styles.statCard}
              >
                <MaterialIcons name="schedule" size={20} color="#ef4444" />
                <Text style={styles.statValue}>{statusCounts.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {Object.entries(statusCounts).map(([status, count]) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.filterButton,
                    selectedStatus === status && styles.filterButtonActive,
                  ]}
                >
                  <LinearGradient
                    colors={
                      selectedStatus === status
                        ? getStatusColor(status)
                        : ["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.5)"]
                    }
                    style={styles.filterButtonGradient}
                  >
                    <MaterialIcons
                      name={getStatusIcon(status)}
                      size={16}
                      color={
                        selectedStatus === status
                          ? "white"
                          : premiumColors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedStatus === status &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>({count})</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={premiumColors.primary} />
                <Text style={styles.loadingTitle}>Loading Your Orders</Text>
                <Text style={styles.loadingDescription}>
                  Retrieving your premium purchase history...
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <LinearGradient
                    colors={[
                      "rgba(251, 191, 36, 0.1)",
                      "rgba(16, 185, 129, 0.1)",
                    ]}
                    style={styles.emptyIcon}
                  >
                    <MaterialIcons
                      name="inventory"
                      size={40}
                      color={premiumColors.primary}
                    />
                  </LinearGradient>
                  <Text style={styles.emptyTitle}>
                    {selectedStatus === "all"
                      ? "No Orders Found"
                      : `No ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders`}
                  </Text>
                  <Text style={styles.emptyDescription}>
                    {selectedStatus === "all"
                      ? "Your premium orders will appear here. Start your African shopping journey with our exclusive collection."
                      : `You don't have any ${selectedStatus} orders at the moment.`}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() =>
                      Alert.alert("Shop", "Redirecting to premium products...")
                    }
                  >
                    <LinearGradient
                      colors={[premiumColors.primary, premiumColors.secondary]}
                      style={styles.emptyButtonGradient}
                    >
                      <MaterialIcons
                        name="shopping-bag"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.emptyButtonText}>
                        Explore Premium Products
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ordersContainer}>
                  {filteredOrders.map((order, index) => {
                    const estimatedDelivery = moment(order.createdAt)
                      .add(2, "days")
                      .format("MMMM Do YYYY");

                    const statusColors = getStatusColor(order.status);
                    const progress = getStatusProgress(order.status);

                    return (
                      <View key={order.$id} style={styles.orderCard}>
                        <LinearGradient
                          colors={[
                            "rgba(30, 41, 59, 0.9)",
                            "rgba(15, 23, 42, 0.9)",
                          ]}
                          style={styles.orderCardGradient}
                        >
                          {/* Order Header */}
                          <View style={styles.orderHeader}>
                            <View style={styles.orderHeaderLeft}>
                              <LinearGradient
                                colors={statusColors}
                                style={styles.statusIcon}
                              >
                                <MaterialIcons
                                  name={getStatusIcon(order.status)}
                                  size={20}
                                  color="white"
                                />
                              </LinearGradient>
                              <View style={styles.orderHeaderInfo}>
                                <Text style={styles.orderTitle}>
                                  Order #{order.$id?.slice(-8)}
                                </Text>
                                <Text style={styles.orderDate}>
                                  {moment(order.createdAt).format(
                                    "MMM D, YYYY",
                                  )}
                                </Text>
                              </View>
                            </View>

                            <LinearGradient
                              colors={[
                                `${statusColors[0]}30`,
                                `${statusColors[1]}20`,
                              ]}
                              style={styles.statusBadge}
                            >
                              <Text style={styles.statusBadgeText}>
                                {order.status?.charAt(0).toUpperCase() +
                                  order.status?.slice(1)}
                              </Text>
                            </LinearGradient>
                          </View>

                          {/* Progress Bar */}
                          <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                              <Text style={styles.progressLabel}>
                                Order Progress
                              </Text>
                              <Text style={styles.progressPercentage}>
                                {progress}%
                              </Text>
                            </View>
                            <View style={styles.progressBar}>
                              <LinearGradient
                                colors={statusColors}
                                style={[
                                  styles.progressFill,
                                  { width: `${progress}%` },
                                ]}
                              />
                            </View>
                          </View>

                          {/* Order Details */}
                          <View style={styles.orderDetails}>
                            <View style={styles.orderDetailsRow}>
                              <View style={styles.orderDetail}>
                                <MaterialIcons
                                  name="credit-card"
                                  size={16}
                                  color={premiumColors.primary}
                                />
                                <View style={styles.orderDetailText}>
                                  <Text style={styles.orderDetailLabel}>
                                    Amount
                                  </Text>
                                  <Text style={styles.orderDetailValue}>
                                    {fmtOrderAmount(
                                      order.amount,
                                      order.currency,
                                    )}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.orderDetail}>
                                <MaterialIcons
                                  name="location-on"
                                  size={16}
                                  color={premiumColors.accent}
                                />
                                <View style={styles.orderDetailText}>
                                  <Text style={styles.orderDetailLabel}>
                                    Delivery
                                  </Text>
                                  <Text style={styles.orderDetailValue}>
                                    {order.status === "delivered"
                                      ? "Delivered"
                                      : "In Progress"}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            {/* Estimated Delivery */}
                            {order.status !== "delivered" &&
                              order.status !== "cancelled" && (
                                <LinearGradient
                                  colors={[
                                    "rgba(251, 191, 36, 0.1)",
                                    "rgba(217, 119, 6, 0.05)",
                                  ]}
                                  style={styles.deliveryInfo}
                                >
                                  <MaterialIcons
                                    name="schedule"
                                    size={16}
                                    color={premiumColors.primary}
                                  />
                                  <View style={styles.deliveryInfoText}>
                                    <Text style={styles.deliveryInfoLabel}>
                                      Estimated Delivery
                                    </Text>
                                    <Text style={styles.deliveryInfoValue}>
                                      {estimatedDelivery}
                                    </Text>
                                  </View>
                                </LinearGradient>
                              )}
                          </View>

                          {/* Action Buttons */}
                          <View style={styles.orderActions}>
                            <TouchableOpacity
                              style={styles.primaryAction}
                              onPress={() => handleTrackOrder(order)}
                            >
                              <LinearGradient
                                colors={[
                                  premiumColors.primary,
                                  premiumColors.secondary,
                                ]}
                                style={styles.primaryActionGradient}
                              >
                                <MaterialIcons
                                  name="local-shipping"
                                  size={18}
                                  color="white"
                                />
                                <Text style={styles.primaryActionText}>
                                  Track Order
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            {/* Cancel Button for eligible orders */}
                            {(order.status?.toLowerCase() === "pending" ||
                              order.status?.toLowerCase() === "processing") && (
                              <TouchableOpacity
                                style={styles.secondaryAction}
                                onPress={() => handleCancelOrder(order)}
                              >
                                <LinearGradient
                                  colors={["#ef4444", "#dc2626"]}
                                  style={styles.secondaryActionGradient}
                                >
                                  <MaterialIcons
                                    name="cancel"
                                    size={18}
                                    color="white"
                                  />
                                  <Text style={styles.secondaryActionText}>
                                    Cancel
                                  </Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.moreAction}>
                              <MaterialIcons
                                name="chevron-right"
                                size={20}
                                color={premiumColors.primary}
                              />
                            </TouchableOpacity>
                          </View>

                          {/* Premium Badge for high-value orders */}
                          {order.amount > 100 && (
                            <View style={styles.premiumOrderBadge}>
                              <LinearGradient
                                colors={[
                                  premiumColors.primary,
                                  premiumColors.secondary,
                                ]}
                                style={styles.premiumBadgeGradient}
                              >
                                <MaterialIcons
                                  name="star"
                                  size={12}
                                  color="white"
                                />
                                <Text style={styles.premiumBadgeText}>
                                  Premium Order
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                        </LinearGradient>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Order Summary */}
              <LinearGradient
                colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.8)"]}
                style={styles.summaryContainer}
              >
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryGrid}>
                  <LinearGradient
                    colors={["rgba(251, 191, 36, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                    style={styles.summaryCard}
                  >
                    <MaterialIcons
                      name="security"
                      size={24}
                      color={premiumColors.primary}
                    />
                    <Text style={styles.summaryCardTitle}>
                      Premium Protection
                    </Text>
                    <Text style={styles.summaryCardDescription}>
                      All orders are protected
                    </Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={["rgba(16, 185, 129, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                    style={styles.summaryCard}
                  >
                    <MaterialIcons
                      name="local-shipping"
                      size={24}
                      color={premiumColors.accent}
                    />
                    <Text style={styles.summaryCardTitle}>
                      Express Shipping
                    </Text>
                    <Text style={styles.summaryCardDescription}>
                      Fast delivery across Africa
                    </Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.1)", "rgba(0, 0, 0, 0.1)"]}
                    style={styles.summaryCard}
                  >
                    <MaterialIcons
                      name="support-agent"
                      size={24}
                      color="#3b82f6"
                    />
                    <Text style={styles.summaryCardTitle}>Premium Support</Text>
                    <Text style={styles.summaryCardDescription}>
                      24/7 order assistance
                    </Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Orders;

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
  // Hero Section
  heroSection: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  badgeText: {
    color: "#fbbf24",
    fontWeight: "600",
    marginHorizontal: 8,
    fontSize: 14,
  },
  heroTitle: {
    fontSize: width > 400 ? 36 : 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#f8fafc",
  },
  heroTitleAccent: {
    color: "#fbbf24",
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#fbbf24",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 4,
    textAlign: "center",
  },
  // Filter Section
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterButton: {
    marginRight: 12,
    borderRadius: 16,
  },
  filterButtonActive: {
    elevation: 4,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  filterButtonText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  filterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
    marginTop: 20,
    textAlign: "center",
  },
  loadingDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    marginTop: 8,
    textAlign: "center",
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  // Orders Container
  ordersContainer: {
    paddingHorizontal: 20,
  },
  orderCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  orderCardGradient: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  // Order Header
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(251, 191, 36, 0.3)",
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderHeaderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  // Progress Bar
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  progressPercentage: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(107, 114, 128, 0.5)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  // Order Details
  orderDetails: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderDetail: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderDetailText: {
    marginLeft: 8,
  },
  orderDetailLabel: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  orderDetailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 2,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  deliveryInfoText: {
    marginLeft: 8,
  },
  deliveryInfoLabel: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  deliveryInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fbbf24",
    marginTop: 2,
  },
  // Order Actions
  orderActions: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 0,
  },
  primaryAction: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryActionText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryAction: {
    marginRight: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  secondaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryActionText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  moreAction: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  // Premium Badge
  premiumOrderBadge: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  premiumBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  premiumBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  // Summary Container
  summaryContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fbbf24",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryGrid: {
    gap: 12,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    marginBottom: 8,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginLeft: 12,
    flex: 1,
  },
  summaryCardDescription: {
    fontSize: 12,
    color: "#cbd5e1",
    marginLeft: 12,
    flex: 1,
  },
});
