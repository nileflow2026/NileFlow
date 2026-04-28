import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OrdersScreen = () => {
  const router = useRouter();

  const {
    orderId,
    totalAmount,
    paymentMethod,
    orderTime,
    paymentTime,
    productsAmount,
    orderStatus,
    estimatedDelivery,
    paymentRef,
    items: itemsString,
  } = useLocalSearchParams();

  const items = itemsString ? JSON.parse(itemsString) : [];

  // ── Currency helpers ──────────────────────────────────────────────
  // Derive currency from the first item's enriched price object.
  // Falls back to KES if items are un-enriched plain numbers.
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

  const activeCurrency = items[0]?.price?.currency || "KES";
  const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;
  const currencyDecimals = CURRENCY_DECIMALS[activeCurrency] ?? 2;

  // Resolve numeric value from enriched price object or plain number
  const resolvePrice = (price) => {
    if (price && typeof price === "object")
      return price.convertedPrice ?? price.raw ?? 0;
    return typeof price === "number" ? price : parseFloat(price) || 0;
  };

  // Format a plain number in the detected currency
  const fmt = (n) => {
    const num = typeof n === "number" ? n : parseFloat(n) || 0;
    return `${currencySymbol} ${num.toLocaleString("en", {
      minimumFractionDigits: currencyDecimals,
      maximumFractionDigits: currencyDecimals,
    })}`;
  };

  // Display an item's price — prefer the server's displayValue if present
  const displayItemPrice = (price) => {
    if (price && typeof price === "object" && price.displayValue)
      return price.displayValue;
    return fmt(resolvePrice(price));
  };

  // Format summary/total amounts that arrive as plain numbers
  const formatCurrency = (amount) => {
    if (!amount) return `${currencySymbol} 0`;
    return fmt(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  // Debug log - Enhanced
  console.log("OrdersScreen Data:", {
    orderId,
    totalAmount,
    totalAmountType: typeof totalAmount,
    paymentMethod,
    orderStatus,
    items: items.length,
    itemsRaw: itemsString,
    itemsParsed: items,
    productsAmount,
    productsAmountType: typeof productsAmount,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.successText}>✅ Payment Successful!</Text>
          <Text style={styles.thankYouText}>
            Thank you for your purchase 🎉
          </Text>
          <Text style={styles.orderIdText}>Order #{orderId || "N/A"}</Text>
        </View>

        {/* Status Section */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Order Status</Text>
          <Text style={styles.statusValue}>{orderStatus || "Processing"}</Text>
          <Text style={styles.deliveryText}>
            Expected: {estimatedDelivery || "N/A"}
          </Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{orderId || "N/A"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{paymentMethod || "N/A"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Ref:</Text>
            <Text style={styles.detailValue}>{paymentRef || "N/A"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Time:</Text>
            <Text style={styles.detailValue}>{orderTime || "N/A"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Time:</Text>
            <Text style={styles.detailValue}>{paymentTime || "N/A"}</Text>
          </View>
        </View>

        {/* Items Purchased */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>
            Items Purchased ({items.length}{" "}
            {items.length === 1 ? "item" : "items"})
          </Text>

          {items.length > 0 ? (
            items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemPlaceholder}>
                  {item.productImage ? (
                    <Image
                      source={{ uri: item.productImage }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.itemIcon}>📦</Text>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productName || item.name || "Product"}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {displayItemPrice(item.price)} x {item.quantity || 1}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {fmt(resolvePrice(item.price) * (item.quantity || 1))}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.itemRow}>
              <View style={styles.itemPlaceholder}>
                <Text style={styles.itemIcon}>📦</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>Sample Product</Text>
                <Text style={styles.itemPrice}>KSh 25.00 x 1</Text>
              </View>
              <Text style={styles.itemTotal}>KSh 25.00</Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Products:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(productsAmount || totalAmount)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              FREE
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() =>
              router.push({
                pathname: "/(Screens)/TrackOrder",
                params: {
                  orderId: orderId || "12345",
                  orderTime: orderTime || new Date().toLocaleString(),
                  paymentTime: paymentTime || new Date().toLocaleString(),
                  orderStatus: "Processing",
                  estimatedDelivery: estimatedDelivery || "2025-01-15",
                },
              })
            }
          >
            <Text style={styles.buttonText}>🚚 Track Your Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/(tabs)/BottomTabs")}
          >
            <Text style={styles.buttonText}>🛍️ Continue Shopping</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🛡️</Text>
            <Text style={styles.badgeText}>Secure</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⭐</Text>
            <Text style={styles.badgeText}>Premium</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🚀</Text>
            <Text style={styles.badgeText}>Fast</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🎁</Text>
            <Text style={styles.badgeText}>Gift Ready</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingTop: 60,
  },
  successText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  orderIdText: {
    fontSize: 14,
    color: "#FCD34D",
    fontWeight: "500",
  },
  statusCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  statusTitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 4,
  },
  statusValue: {
    color: "#3B82F6",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  deliveryText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 12,
  },
  totalAmount: {
    color: "#FCD34D",
    fontSize: 24,
    fontWeight: "bold",
  },
  detailsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(180, 83, 9, 0.3)",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(75, 85, 99, 0.3)",
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  itemsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(75, 85, 99, 0.2)",
  },
  itemPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  itemTotal: {
    color: "#FCD34D",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#FCD34D",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  trackButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(180, 83, 9, 0.3)",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  badge: {
    alignItems: "center",
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },
});
