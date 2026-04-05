/* eslint-disable no-unused-vars */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../Context/CartContext_NEW";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Cart calculations
  const subtotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const formattedSubtotal = `KES ${subtotal.toFixed(2)}`;
  const formattedShipping = `KES ${shipping.toFixed(2)}`;
  const formattedTax = `KES ${tax.toFixed(2)}`;
  const formattedTotal = `KES ${total.toFixed(2)}`;

  const handleCheckout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/(Screens)/Payments");
    }, 1000);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#0f172a", "#1e293b"] : ["#f8fafc", "#fbbf24"]}
      style={styles.gradientBg}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
          Shopping Cart
        </Text>
        <Text
          style={styles.headerSubtitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          Review your premium African products before checkout
        </Text>

        {/* Cart Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: "#3b2f1e" }]}>
            <Text style={styles.summaryValue}>{cart.length}</Text>
            <Text
              style={styles.summaryLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Premium Items
            </Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: "#1e3a2a" }]}>
            <Text style={styles.summaryValue}>
              {subtotal > 100 ? "FREE" : formattedShipping}
            </Text>
            <Text
              style={styles.summaryLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Shipping
            </Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: "#1e293b" }]}>
            <Text style={styles.summaryValue}>100%</Text>
            <Text
              style={styles.summaryLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Authentic
            </Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: "#3b1e1e" }]}>
            <Text style={styles.summaryValue}>30D</Text>
            <Text
              style={styles.summaryLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Returns
            </Text>
          </View>
        </View>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyCartText}>
              Discover premium African products waiting to be added to your
              cart. Start exploring our curated collection.
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push("/(Screens)/Explore")}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cartItemsContainer}>
            {cart.map((item) => (
              <View
                key={item.id || item.$id || item.productId}
                style={styles.cartItemBox}
              >
                <View style={styles.cartItemRow}>
                  <Image
                    source={{
                      uri:
                        item.productImage ||
                        item.image ||
                        "https://placehold.co/100x100",
                    }}
                    style={styles.cartItemImage}
                  />
                  <View style={styles.cartItemInfo}>
                    <Text
                      style={styles.cartItemName}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.productName}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      KES {(item.price || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.cartItemQuantity}>
                      {item.quantity} × KES {(item.price || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.cartItemActions}>
                    <TouchableOpacity
                      onPress={() =>
                        handleQuantityChange(
                          item.id || item.$id || item.productId,
                          (item.quantity || 1) - 1
                        )
                      }
                      style={[
                        styles.quantityButton,
                        item.quantity <= 1 && styles.quantityButtonDisabled,
                      ]}
                      disabled={item.quantity <= 1}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartItemQuantityValue}>
                      {item.quantity || 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleQuantityChange(
                          item.id || item.$id || item.productId,
                          (item.quantity || 1) + 1
                        )
                      }
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        removeFromCart(item.id || item.$id || item.productId)
                      }
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cartItemTotalBox}>
                  <Text style={styles.cartItemTotalLabel}>Total:</Text>
                  <Text style={styles.cartItemTotalValue}>
                    KES {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Order Summary */}
        {cart.length > 0 && (
          <View style={styles.orderSummaryBox}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Subtotal</Text>
              <Text style={styles.orderSummaryValue}>{formattedSubtotal}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Shipping</Text>
              <Text style={styles.orderSummaryValue}>
                {shipping === 0 ? "FREE" : formattedShipping}
              </Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Tax</Text>
              <Text style={styles.orderSummaryValue}>{formattedTax}</Text>
            </View>
            <View style={styles.orderSummaryRowTotal}>
              <Text style={styles.orderSummaryTotalLabel}>Total</Text>
              <Text style={styles.orderSummaryTotalValue}>
                {formattedTotal}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  gradientBg: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fbbf24",
    textAlign: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    minWidth: 0,
    width: 0,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#e5e7eb",
    marginTop: 4,
    flexWrap: "wrap",
    width: "100%",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  emptyCartContainer: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 32,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 16,
  },
  shopButton: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#18181b",
    fontWeight: "bold",
    fontSize: 16,
  },
  cartItemsContainer: {
    marginBottom: 32,
  },
  cartItemBox: {
    backgroundColor: "#27272a",
    borderRadius: 18,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cartItemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#18181b",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    flexWrap: "wrap",
    width: "100%",
    paddingRight: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    color: "#fbbf24",
    fontWeight: "bold",
  },
  cartItemQuantity: {
    fontSize: 13,
    color: "#e5e7eb",
    marginTop: 2,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  quantityButton: {
    backgroundColor: "#18181b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#444",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 18,
  },
  cartItemQuantityValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginHorizontal: 6,
  },
  removeButton: {
    marginLeft: 8,
    backgroundColor: "#b91c1c",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  cartItemTotalBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  cartItemTotalLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    marginRight: 8,
  },
  cartItemTotalValue: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 16,
  },
  orderSummaryBox: {
    backgroundColor: "#18181b",
    borderRadius: 18,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  orderSummaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fbbf24",
    marginBottom: 16,
    textAlign: "center",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 8,
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderSummaryLabel: {
    color: "#e5e7eb",
    fontSize: 15,
  },
  orderSummaryValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  orderSummaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  orderSummaryTotalLabel: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 18,
  },
  orderSummaryTotalValue: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 22,
  },
  checkoutButton: {
    backgroundColor: "#fbbf24",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  checkoutButtonText: {
    color: "#18181b",
    fontWeight: "bold",
    fontSize: 18,
    flexWrap: "wrap",
    width: "100%",
    textAlign: "center",
  },
});

export default Cart;
