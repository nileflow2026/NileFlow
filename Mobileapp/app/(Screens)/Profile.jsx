/* eslint-disable no-unused-vars */
import { FontAwesome5 } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Award,
  Camera,
  ChevronRight,
  CreditCard,
  Crown,
  Gift,
  Heart,
  History,
  Mail,
  MapPin,
  Package,
  Phone,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  User,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import { useFavorites } from "../../Context/FavoritesContext";
import {
  getCustomerOrders,
  useGlobalContext,
} from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import i18n from "../../i18n";
import PremiumMonthlySummary from "./PremiumMonthlySummary";

const { width, height } = Dimensions.get("window");

const ProfilePage = () => {
  const { user, setUser, isLogged, setIsLogged } = useGlobalContext();
  const { favorites } = useFavorites();
  const { theme, themeStyles } = useTheme();
  const { isPremium } = usePremiumStatus();
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [nileMilesData, setNileMilesData] = useState({
    currentMiles: 0,
    earnedHistory: [],
    redeemed: [],
    tier: "Bronze",
  });
  const [nileMilesLoading, setNileMilesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Responsive sizing
  const sectionTitleFontSize = width < 350 ? 16 : 18;
  const itemTextFontSize = width < 350 ? 14 : 16;
  const itemPadding = width < 350 ? 12 : 16;
  const iconSize = width < 350 ? 18 : 20;
  const logoutPadding = width < 350 ? 12 : 16;
  const logoutFontSize = width < 350 ? 14 : 16;

  const fetchNileMiles = useCallback(async () => {
    if (!user || !user.id) {
      console.warn("⚠️ No user ID found, skipping Nile Miles fetch.");
      return;
    }
    
    try {
      /* console.log("📡 Fetching with userId:", user.id); */
      const res = await axiosClient.get(
        `/api/nilemiles/nilemiles/status?userId=${user.id}`
      );
      /* console.log("✅ Raw response:", res);
      console.log("📦 Data:", res.data); */
      setNileMilesData(res.data);
    } catch (error) {
      console.error("❌ Failed to load Nile Miles:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNileMiles();
  }, [fetchNileMiles]);

  // Fetch actual orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLogged) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        const customerOrders = await getCustomerOrders();
        setOrders(customerOrders || []);
      } catch (error) {
        console.error("Error fetching customer orders:", error);
        setOrders([]);
        Alert.alert(
          "Error",
          "Failed to load your orders. Please try again later."
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [isLogged]);

  const handleImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow photo library access."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const uri = asset.uri;

      // Show picked image immediately
      setPreviewImage(uri);

      // Upload to backend
      setIsUploading(true);

      const formData = new FormData();
      formData.append("avatar", {
        uri,
        type: "image/jpeg",
        name: `avatar_${user?.id || "unknown"}_${Date.now()}.jpg`,
      });
      formData.append("userId", user?.id || "");

      console.log("🔄 Uploading avatar for user ID:", user?.id);
      console.log("🔄 FormData created with URI:", uri);

      // Test connectivity first
      try {
        console.log("🔍 Testing server connectivity...");
        await axiosClient.get("/api/customerauth/getCustomerProfile");
        console.log("✅ Server connectivity OK");
      } catch (connectError) {
        console.error("❌ Server connectivity failed:", connectError);
        throw new Error(
          "Cannot connect to server. Please check your network connection."
        );
      }

      const res = await axiosClient.post(
        `/api/customerprofile/updatedAvatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Avatar upload successful:", res.data);

      if (user) {
        const updatedUser = {
          ...user,
          avatarUrl: res.data.avatarUrl,
          avatarFileId: res.data.avatarFileId,
        };
        setUser(updatedUser);
      }

      Alert.alert("Profile Updated", "Your profile picture has been updated.");
    } catch (error) {
      console.error("❌ Upload failed:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      let errorMessage = "Could not update profile picture.";

      if (error.message === "Network Error") {
        errorMessage =
          "Network connection failed. Please check if the server is running and try again.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "Upload endpoint not found. Please check the server configuration.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid upload data. Please try selecting the image again.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update user with new image
      const updatedUser = {
        ...user,
        avatarUrl: profileImage.uri,
      };
      setUser(updatedUser);

      // Clear preview
      setProfileImage(null);
      setPreviewImage(null);

      Alert.alert("Success", "Profile image updated successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "Gold":
        return ["#D97706", "#B45309"];
      case "Silver":
        return ["#9CA3AF", "#6B7280"];
      case "Bronze":
        return ["#92400E", "#EAB308"];
      default:
        return ["#D97706", "#EAB308"];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // Refresh Nile Miles data
    await fetchNileMiles();

    // Refresh orders data if user is logged in
    if (isLogged) {
      try {
        const customerOrders = await getCustomerOrders();
        setOrders(customerOrders || []);
      } catch (error) {
        console.error("Error refreshing customer orders:", error);
      }
    }

    setRefreshing(false);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem(`@cart_items_${user?.$id}`);

      setUser(null);
      setIsLogged(false);

      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Logout Failed", "Something went wrong. Please try again.");
      console.error("Logout error:", error);
    }
  };

  // Create user data with fallbacks for non-logged users
  const demoUser = {
    name: isLogged && user?.username ? user.username : "Guest User",
    email: isLogged && user?.email ? user.email : "guest@nileflow.com",
    profileImage:
      previewImage ||
      (isLogged &&
      user?.avatarUrl &&
      typeof user.avatarUrl === "string" &&
      user.avatarUrl.trim() !== ""
        ? user.avatarUrl
        : null) ||
      (isLogged &&
      user?.profileImage &&
      typeof user.profileImage === "string" &&
      user.profileImage.trim() !== ""
        ? user.profileImage
        : null) ||
      "https://fra.cloud.appwrite.io/v1/storage/buckets/692a3b700039c02fb4bc/files/695439130011158bb8af/view?project=6926c7df002fa7831d94",
    phone: isLogged && user?.phone ? user.phone : "+254 700 000 000",
    address:
      isLogged && user?.address
        ? user.address
        : "Nile Flow Hub, Nairobi, Kenya",
  };

  const TabButton = ({ title, isActive, onPress, icon: Icon }) => (
    <TouchableOpacity onPress={onPress} style={styles.tabContainer}>
      <LinearGradient
        colors={
          isActive
            ? ["#D97706", "#B45309"]
            : ["rgba(17, 24, 39, 0.5)", "rgba(0, 0, 0, 0.5)"]
        }
        style={[styles.tabButton, isActive && styles.activeTab]}
      >
        {Icon && <Icon size={16} color={isActive ? "white" : "#9CA3AF"} />}
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Nile Miles Card */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={["#D97706", "#B45309"]}
              style={styles.iconContainer}
            >
              <TrendingUp size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>Nile Miles</Text>
              <Text style={styles.cardSubtitle}>Premium Loyalty Program</Text>
            </View>
          </View>
          <LinearGradient
            colors={getTierColor(nileMilesData?.tier || "Bronze")}
            style={styles.tierBadge}
          >
            <Award size={20} color="white" />
            <Text style={styles.tierText}>
              {nileMilesData?.tier || "Bronze"} Tier
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.milesStats}>
          <LinearGradient
            colors={["rgba(217, 119, 6, 0.3)", "rgba(180, 83, 9, 0.2)"]}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {nileMilesData?.currentMiles || 0}
            </Text>
            <Text style={styles.statLabel}>Current Miles</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(5, 150, 105, 0.3)", "rgba(4, 120, 87, 0.2)"]}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {nileMilesData?.earnedHistory?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(37, 99, 235, 0.3)", "rgba(29, 78, 216, 0.2)"]}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {nileMilesData?.redeemed?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Redeemed</Text>
          </LinearGradient>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress to Gold Tier</Text>
            <Text style={styles.progressPercent}>
              {(((nileMilesData?.currentMiles || 0) / 5000) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#EAB308", "#F59E0B"]}
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(((nileMilesData?.currentMiles || 0) / 5000) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.redeemButton}
          onPress={() => router.push("/Redeem")}
        >
          <LinearGradient
            colors={["#D97706", "#B45309"]}
            style={styles.redeemGradient}
          >
            <Gift size={20} color="white" />
            <Text style={styles.redeemText}>Redeem Miles</Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Order History */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              style={styles.iconContainer}
            >
              <History size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>Order History</Text>
              <Text style={styles.cardSubtitle}>Recent premium orders</Text>
            </View>
          </View>
          <Text style={styles.orderCount}>
            {isLogged
              ? `${orders?.length || 0} orders`
              : "Sign in to view orders"}
          </Text>
        </View>

        <View style={styles.ordersContainer}>
          {isLogged && orders && orders.length > 0 ? (
            orders.slice(0, 3).map((order, index) => (
              <View
                key={order.$id || order.id || index}
                style={styles.orderItem}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <Package size={16} color="#EAB308" />
                    <Text style={styles.orderId}>
                      {(order.$id || order.id || `order_${index}`)
                        .toString()
                        .slice(-8)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      (order.status || order.orderStatus) === "Delivered" &&
                        styles.deliveredBadge,
                      (order.status || order.orderStatus) === "Shipped" &&
                        styles.shippedBadge,
                      (order.status || order.orderStatus) === "Processing" &&
                        styles.processingBadge,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {order.status || order.orderStatus || "Processing"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderDate}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Date not available"}
                </Text>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderAmount}>
                    {order.currency || "USD"}{" "}
                    {(order.amount || order.total || 0).toFixed
                      ? (order.amount || order.total || 0).toFixed(2)
                      : parseFloat(order.amount || order.total || 0).toFixed(2)}
                  </Text>
                  <View style={styles.orderStatusContainer}>
                    <Truck size={16} color="#60A5FA" />
                    <Text style={styles.orderStatus}>
                      {order.orderStatus ||
                        order.shipping_status ||
                        "In Progress"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <ShoppingBag size={64} color="rgba(234, 179, 8, 0.3)" />
              <Text style={styles.emptyOrdersTitle}>
                {isLogged ? "No Orders Yet" : "Sign In to View Orders"}
              </Text>
              <Text style={styles.emptyOrdersText}>
                {isLogged
                  ? "Start your premium African shopping journey"
                  : "Please sign in to access your order history and start shopping"}
              </Text>
              <TouchableOpacity
                style={styles.startShoppingButton}
                onPress={() => router.push(isLogged ? "/" : "/sign-in")}
              >
                <LinearGradient
                  colors={["#D97706", "#B45309"]}
                  style={styles.startShoppingGradient}
                >
                  {isLogged ? (
                    <Sparkles size={20} color="white" />
                  ) : (
                    <User size={20} color="white" />
                  )}
                  <Text style={styles.startShoppingText}>
                    {isLogged ? "Start Shopping" : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderWishlistTab = () => (
    <View style={styles.tabContent}>
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={["#DC2626", "#B91C1C"]}
              style={styles.iconContainer}
            >
              <Heart size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>My Wishlist</Text>
              <Text style={styles.cardSubtitle}>
                {favorites?.length || 0}{" "}
                {(favorites?.length || 0) === 1 ? "item" : "items"} saved
              </Text>
            </View>
          </View>
        </View>

        {favorites && favorites.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.wishlistScroll}
          >
            {favorites.map((product) => (
              <View key={product.$id || product.id} style={styles.wishlistItem}>
                <Image
                  source={{ uri: product.image || product.thumbnail }}
                  style={styles.wishlistImage}
                />
                <Text style={styles.wishlistTitle} numberOfLines={2}>
                  {product.title || product.name}
                </Text>
                <Text style={styles.wishlistPrice}>
                  ${product.price || "0.00"}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyWishlistContainer}>
            <Heart size={64} color="rgba(220, 38, 38, 0.3)" />
            <Text style={styles.emptyWishlistTitle}>
              Your Wishlist is Empty
            </Text>
            <Text style={styles.emptyWishlistText}>
              Save your favorite items by clicking the heart icon on any product
            </Text>
            <TouchableOpacity
              style={styles.startShoppingButton}
              onPress={() => router.push("/")}
            >
              <LinearGradient
                colors={["#D97706", "#B45309"]}
                style={styles.startShoppingGradient}
              >
                <ShoppingBag size={20} color="white" />
                <Text style={styles.startShoppingText}>Start Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderOrdersTab = () => (
    <View style={styles.tabContent}>
      {/* Order History */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              style={styles.iconContainer}
            >
              <History size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>My Orders</Text>
              <Text style={styles.cardSubtitle}>Complete order history</Text>
            </View>
          </View>
          <Text style={styles.orderCount}>
            {isLogged
              ? `${orders?.length || 0} orders`
              : "Sign in to view orders"}
          </Text>
        </View>

        <View style={styles.ordersContainer}>
          {isLogged && orders && orders.length > 0 ? (
            orders.map((order, index) => (
              <View
                key={order.$id || order.id || index}
                style={styles.orderItem}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <Package size={16} color="#EAB308" />
                    <Text style={styles.orderId}>
                      {(order.$id || order.id || `order_${index}`)
                        .toString()
                        .slice(-8)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      (order.status || order.orderStatus) === "Delivered" &&
                        styles.deliveredBadge,
                      (order.status || order.orderStatus) === "Shipped" &&
                        styles.shippedBadge,
                      (order.status || order.orderStatus) === "Processing" &&
                        styles.processingBadge,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {order.status || order.orderStatus || "Processing"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderDate}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Date not available"}
                </Text>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderAmount}>
                    {order.currency || "USD"}{" "}
                    {(order.amount || order.total || 0).toFixed
                      ? (order.amount || order.total || 0).toFixed(2)
                      : parseFloat(order.amount || order.total || 0).toFixed(2)}
                  </Text>
                  <View style={styles.orderStatusContainer}>
                    <Truck size={16} color="#60A5FA" />
                    <Text style={styles.orderStatus}>
                      {order.orderStatus ||
                        order.shipping_status ||
                        "In Progress"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <ShoppingBag size={64} color="rgba(234, 179, 8, 0.3)" />
              <Text style={styles.emptyOrdersTitle}>
                {isLogged ? "No Orders Yet" : "Sign In to View Orders"}
              </Text>
              <Text style={styles.emptyOrdersText}>
                {isLogged
                  ? "Start your premium African shopping journey"
                  : "Please sign in to access your order history and start shopping"}
              </Text>
              <TouchableOpacity
                style={styles.startShoppingButton}
                onPress={() => router.push(isLogged ? "/" : "/sign-in")}
              >
                <LinearGradient
                  colors={["#D97706", "#B45309"]}
                  style={styles.startShoppingGradient}
                >
                  {isLogged ? (
                    <Sparkles size={20} color="white" />
                  ) : (
                    <User size={20} color="white" />
                  )}
                  <Text style={styles.startShoppingText}>
                    {isLogged ? "Start Shopping" : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderMilesTab = () => (
    <View style={styles.tabContent}>
      {/* Nile Miles Card */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={["#D97706", "#B45309"]}
              style={styles.iconContainer}
            >
              <TrendingUp size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>Nile Miles</Text>
              <Text style={styles.cardSubtitle}>Premium Loyalty Program</Text>
            </View>
          </View>
          <LinearGradient
            colors={getTierColor(nileMilesData?.tier || "Bronze")}
            style={styles.tierBadge}
          >
            <Award size={20} color="white" />
            <Text style={styles.tierText}>
              {nileMilesData?.tier || "Bronze"} Tier
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.milesStats}>
          <LinearGradient
            colors={["rgba(217, 119, 6, 0.3)", "rgba(180, 83, 9, 0.2)"]}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {nileMilesData?.currentMiles || 0}
            </Text>
            <Text style={styles.statLabel}>Current Miles</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(5, 150, 105, 0.3)", "rgba(4, 120, 87, 0.2)"]}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {nileMilesData?.earnedHistory?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(37, 99, 235, 0.3)", "rgba(29, 78, 216, 0.2)"]}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {nileMilesData?.redeemed?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Redeemed</Text>
          </LinearGradient>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress to Gold Tier</Text>
            <Text style={styles.progressPercent}>
              {(((nileMilesData?.currentMiles || 0) / 5000) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#EAB308", "#F59E0B"]}
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(((nileMilesData?.currentMiles || 0) / 5000) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.redeemButton}
          onPress={() => router.push("/redeem")}
        >
          <LinearGradient
            colors={["#D97706", "#B45309"]}
            style={styles.redeemGradient}
          >
            <Gift size={20} color="white" />
            <Text style={styles.redeemText}>Redeem Miles</Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Miles History */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={["#059669", "#047857"]}
              style={styles.iconContainer}
            >
              <Award size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>Miles History</Text>
              <Text style={styles.cardSubtitle}>
                Earned and redeemed points
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.ordersContainer}>
          {nileMilesData?.earnedHistory &&
          nileMilesData.earnedHistory.length > 0 ? (
            nileMilesData.earnedHistory.slice(0, 5).map((history, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <Sparkles size={16} color="#10B981" />
                    <Text style={styles.orderId}>
                      +{history.points || history.miles || 0} Miles
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles.deliveredBadge]}>
                    <Text style={styles.statusText}>Earned</Text>
                  </View>
                </View>

                <Text style={styles.orderDate}>
                  {history.date
                    ? new Date(history.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Date not available"}
                </Text>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderAmount}>
                    {history.reason || history.description || "Purchase reward"}
                  </Text>
                  <View style={styles.orderStatusContainer}>
                    <TrendingUp size={16} color="#10B981" />
                    <Text
                      style={[
                        styles.orderStatus,
                        { color: "rgba(16, 185, 129, 0.7)" },
                      ]}
                    >
                      Active
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <TrendingUp size={64} color="rgba(217, 119, 6, 0.3)" />
              <Text style={styles.emptyOrdersTitle}>
                {isLogged ? "No Miles History Yet" : "Sign In to View Miles"}
              </Text>
              <Text style={styles.emptyOrdersText}>
                {isLogged
                  ? "Start earning miles by making purchases and engaging with our platform"
                  : "Please sign in to access your miles history and start earning rewards"}
              </Text>
              <TouchableOpacity
                style={styles.startShoppingButton}
                onPress={() => router.push(isLogged ? "/" : "/sign-in")}
              >
                <LinearGradient
                  colors={["#D97706", "#B45309"]}
                  style={styles.startShoppingGradient}
                >
                  {isLogged ? (
                    <Sparkles size={20} color="white" />
                  ) : (
                    <User size={20} color="white" />
                  )}
                  <Text style={styles.startShoppingText}>
                    {isLogged ? "Start Earning" : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 32 }}
        >
          <View style={{ marginTop: 40, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: sectionTitleFontSize,
                fontWeight: "600",
                color: "#FCD34D",
                marginBottom: 16,
              }}
            >
              Account
            </Text>
            {[
              {
                title: "Orders",
                route: "/Orders",
                icon: require("../../assets/icons/order.png"),
              },
              {
                title: "Payment Methods",
                route: "/Payments",
                icon: require("../../assets/icons/payment.png"),
              },
              {
                title: "Addresses",
                route: "/Addresses",
                icon: require("../../assets/icons/address.png"),
              },
            ].map(({ title, route, icon }, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(route)}
                style={{
                  borderRadius: 12,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: itemPadding,
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  borderWidth: 1,
                  borderColor: "rgba(217, 119, 6, 0.3)",
                }}
              >
                <Image
                  source={icon}
                  style={{
                    width: 24,
                    height: 24,
                    marginRight: 12,
                    tintColor: "white",
                  }}
                />
                <Text
                  style={{
                    fontSize: itemTextFontSize,
                    color: "white",
                  }}
                >
                  {title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: sectionTitleFontSize,
                fontWeight: "600",
                color: "#FCD34D",
                marginBottom: 16,
              }}
            >
              {"Preferences"}
            </Text>
            {[
              {
                title: "Return Policy",
                route: "/ReturnPolicy",
                icon: "assignment-return",
              },
              {
                title: "Language",
                route: "/Language",
                icon: "language",
              },
              {
                title: "Currency",
                route: "/Currency",
                icon: "currency-exchange",
              },
            ].map(({ title, route, icon }, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(route)}
                style={{
                  borderRadius: 12,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: itemPadding,
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  borderWidth: 1,
                  borderColor: "rgba(217, 119, 6, 0.3)",
                }}
              >
                <MaterialIcons
                  name={icon}
                  size={iconSize}
                  color="white"
                  style={{ marginRight: 16 }}
                />
                <Text
                  style={{
                    fontSize: itemTextFontSize,
                    color: "white",
                  }}
                >
                  {title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: sectionTitleFontSize,
                fontWeight: "600",
                color: "#FCD34D",
                marginBottom: 16,
              }}
            >
              {i18n.t("Support")}
            </Text>
            {[
              {
                title: "Help Center",
                route: "/HelpCenter",
                icon: "question-circle",
              },
              {
                title: "Report a Problem",
                route: "/ReportaProblem",
                icon: "exclamation-triangle",
              },
              { title: "About", route: "/About", icon: "info-circle" },
            ].map(({ title, route, icon }, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(route)}
                style={{
                  borderRadius: 12,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: itemPadding,
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  borderWidth: 1,
                  borderColor: "rgba(217, 119, 6, 0.3)",
                }}
              >
                <FontAwesome5
                  name={icon}
                  size={iconSize}
                  color="white"
                  style={{ marginRight: 16 }}
                />
                <Text
                  style={{
                    fontSize: itemTextFontSize,
                    color: "white",
                  }}
                >
                  {title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={{ marginTop: 24, paddingHorizontal: 16, marginBottom: 40 }}
          >
            <TouchableOpacity
              onPress={logout}
              style={{
                backgroundColor: "#DC2626",
                borderRadius: 12,
                padding: logoutPadding,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: logoutFontSize,
                }}
              >
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );

  const renderProfileInfo = () => (
    <View style={styles.rightColumn}>
      {/* Profile Info Card */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Information</Text>
        </View>

        <View style={styles.profileInfoContainer}>
          <View style={styles.profileInfoItem}>
            <LinearGradient
              colors={["#D97706", "#B45309"]}
              style={styles.profileInfoIcon}
            >
              <User size={24} color="white" />
            </LinearGradient>
            <View style={styles.profileInfoText}>
              <Text style={styles.profileInfoLabel}>Full Name</Text>
              <Text style={styles.profileInfoValue}>{demoUser.name}</Text>
            </View>
          </View>

          <View style={styles.profileInfoItem}>
            <LinearGradient
              colors={["#059669", "#047857"]}
              style={styles.profileInfoIcon}
            >
              <Mail size={24} color="white" />
            </LinearGradient>
            <View style={styles.profileInfoText}>
              <Text style={styles.profileInfoLabel}>Email Address</Text>
              <Text style={styles.profileInfoValue}>{demoUser.email}</Text>
            </View>
          </View>

          <View style={styles.profileInfoItem}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              style={styles.profileInfoIcon}
            >
              <Phone size={24} color="white" />
            </LinearGradient>
            <View style={styles.profileInfoText}>
              <Text style={styles.profileInfoLabel}>Phone Number</Text>
              <Text style={styles.profileInfoValue}>{demoUser.phone}</Text>
            </View>
          </View>

          <View style={styles.profileInfoItem}>
            <LinearGradient
              colors={["#DC2626", "#B91C1C"]}
              style={styles.profileInfoIcon}
            >
              <MapPin size={24} color="white" />
            </LinearGradient>
            <View style={styles.profileInfoText}>
              <Text style={styles.profileInfoLabel}>Location</Text>
              <Text style={styles.profileInfoValue}>{demoUser.address}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileButton}>
          <LinearGradient
            colors={["rgba(17, 24, 39, 0.5)", "rgba(0, 0, 0, 0.5)"]}
            style={styles.editProfileGradient}
          >
            <Settings size={20} color="#EAB308" />
            <Text style={styles.editProfileText}>Edit Profile Information</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <LinearGradient
        colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Quick Actions</Text>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setActiveTab("wishlist")}
          >
            <View style={styles.quickActionLeft}>
              <LinearGradient
                colors={["#DC2626", "#B91C1C"]}
                style={styles.quickActionIcon}
              >
                <Heart size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Wishlist</Text>
            </View>
            <ChevronRight size={20} color="#EAB308" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push("/addresses")}
          >
            <View style={styles.quickActionLeft}>
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={styles.quickActionIcon}
              >
                <CreditCard size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Payment Methods</Text>
            </View>
            <ChevronRight size={20} color="#60A5FA" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push("/help-center")}
          >
            <View style={styles.quickActionLeft}>
              <LinearGradient
                colors={["#059669", "#047857"]}
                style={styles.quickActionIcon}
              >
                <Shield size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Security</Text>
            </View>
            <ChevronRight size={20} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setActiveTab("settings")}
          >
            <View style={styles.quickActionLeft}>
              <LinearGradient
                colors={["#7C3AED", "#6D28D9"]}
                style={styles.quickActionIcon}
              >
                <Settings size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color="#A855F7" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient
      colors={["#111827", "#000000", "#111827"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Hero Section */}
          <LinearGradient
            colors={[
              "rgba(146, 64, 14, 0.2)",
              "rgba(17, 24, 39, 0.2)",
              "rgba(5, 150, 105, 0.2)",
            ]}
            style={styles.heroSection}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <LinearGradient
                  colors={["#EAB308", "#10B981"]}
                  style={styles.profileImageGlow}
                />
                <Image
                  source={{ uri: demoUser.profileImage }}
                  style={styles.profileImage}
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={
                    isLogged ? handleImagePicker : () => router.push("/sign-in")
                  }
                >
                  <LinearGradient
                    colors={["#D97706", "#B45309"]}
                    style={styles.cameraGradient}
                  >
                    <Camera size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                {isUploading && (
                  <ActivityIndicator
                    style={{ position: "absolute", top: "40%", left: "40%" }}
                    color="#f59e0b"
                  />
                )}
              </View>

              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.userName}>{demoUser.name}</Text>
                  {isLogged ? (
                    <LinearGradient
                      colors={["#059669", "#047857"]}
                      style={styles.premiumBadge}
                    >
                      <Text style={styles.premiumText}>PREMIUM</Text>
                    </LinearGradient>
                  ) : (
                    <TouchableOpacity onPress={() => router.push("/sign-in")}>
                      <LinearGradient
                        colors={["#DC2626", "#B91C1C"]}
                        style={styles.premiumBadge}
                      >
                        <Text style={styles.premiumText}>SIGN IN</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.userEmail}>{demoUser.email}</Text>
                <Text style={styles.memberSince}>Member since 2023</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <LinearGradient
                colors={["rgba(217, 119, 6, 0.2)", "transparent"]}
                style={styles.statItem}
              >
                <Text style={styles.statNumber}>
                  {isLogged ? orders?.length || 0 : "-"}
                </Text>
                <Text style={styles.statLabel}>Orders</Text>
              </LinearGradient>
              <LinearGradient
                colors={["rgba(5, 150, 105, 0.2)", "transparent"]}
                style={styles.statItem}
              >
                <Text style={styles.statNumber}>
                  {isLogged ? nileMilesData?.currentMiles || 0 : "-"}
                </Text>
                <Text style={styles.statLabel}>Miles</Text>
              </LinearGradient>
              <LinearGradient
                colors={["rgba(37, 99, 235, 0.2)", "transparent"]}
                style={styles.statItem}
              >
                <Text style={styles.statNumber}>{isLogged ? "100%" : "-"}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </LinearGradient>
            </View>
          </LinearGradient>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            <TabButton
              title="overview"
              isActive={activeTab === "overview"}
              onPress={() => setActiveTab("overview")}
            />
            <TabButton
              title="orders"
              isActive={activeTab === "orders"}
              onPress={() => setActiveTab("orders")}
            />
            <TabButton
              title="miles"
              isActive={activeTab === "miles"}
              onPress={() => setActiveTab("miles")}
            />
            <TabButton
              title="premium"
              isActive={activeTab === "premium"}
              onPress={() => setActiveTab("premium")}
              icon={Crown}
            />
            <TabButton
              title="settings"
              isActive={activeTab === "settings"}
              onPress={() => setActiveTab("settings")}
            />
            <TabButton
              title="wishlist"
              isActive={activeTab === "wishlist"}
              onPress={() => setActiveTab("wishlist")}
            />
          </ScrollView>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {activeTab === "overview" ? (
              // Show two-column layout for overview
              <>
                <View style={styles.leftColumn}>{renderOverviewTab()}</View>
                {renderProfileInfo()}
              </>
            ) : (
              // Show full-width layout for other tabs
              <View style={styles.fullWidthColumn}>
                {activeTab === "wishlist" && renderWishlistTab()}
                {activeTab === "orders" && renderOrdersTab()}
                {activeTab === "miles" && renderMilesTab()}
                {activeTab === "premium" &&
                  (isPremium ? (
                    <PremiumMonthlySummary />
                  ) : (
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          <View
                            style={[
                              styles.iconContainer,
                              { backgroundColor: "#EAB308" },
                            ]}
                          >
                            <Crown size={24} color="white" />
                          </View>
                          <View>
                            <Text style={styles.cardTitle}>
                              Premium Required
                            </Text>
                            <Text style={styles.cardSubtitle}>
                              Upgrade to access premium features
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text
                        style={{
                          color: "#9CA3AF",
                          textAlign: "center",
                          marginTop: 16,
                        }}
                      >
                        Subscribe to Premium to view your monthly savings
                        summary and exclusive insights.
                      </Text>
                    </View>
                  ))}
                {activeTab === "settings" && renderSettingsTab()}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  heroSection: {
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 24,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImageGlow: {
    position: "absolute",
    inset: -8,
    borderRadius: 80,
    opacity: 0.3,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "#111827",
  },
  cameraButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  cameraGradient: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 12,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  premiumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  premiumText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 18,
    color: "#D1D5DB",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: "rgba(254, 243, 199, 0.7)",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FCD34D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(254, 243, 199, 0.8)",
  },
  tabsContainer: {
    marginBottom: 32,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    gap: 8,
  },
  activeTab: {
    borderColor: "#EAB308",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  activeTabText: {
    color: "white",
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  leftColumn: {
    marginBottom: 32,
  },
  fullWidthColumn: {
    width: "100%",
  },
  rightColumn: {
    gap: 32,
  },
  tabContent: {
    gap: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FCD34D",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(254, 243, 199, 0.7)",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  tierText: {
    color: "white",
    fontWeight: "bold",
  },
  milesStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    alignItems: "center",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    color: "#FCD34D",
    fontSize: 16,
  },
  progressPercent: {
    color: "#FCD34D",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBar: {
    height: 12,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  redeemButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  redeemGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  redeemText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  imageUploadContainer: {
    gap: 24,
  },
  imagePreviewContainer: {
    alignItems: "center",
    position: "relative",
  },
  imagePreview: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(234, 179, 8, 0.3)",
    borderStyle: "dashed",
  },
  checkIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadControls: {
    gap: 16,
  },
  selectImageButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  selectImageGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  selectImageText: {
    color: "white",
    fontWeight: "bold",
  },
  imageHelpText: {
    fontSize: 14,
    color: "rgba(254, 243, 199, 0.7)",
    textAlign: "center",
  },
  uploadButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  uploadText: {
    color: "white",
    fontWeight: "bold",
  },
  uploadTextDisabled: {
    color: "#9CA3AF",
  },
  orderCount: {
    color: "rgba(254, 243, 199, 0.7)",
    fontSize: 16,
  },
  ordersContainer: {
    gap: 16,
  },
  orderItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(146, 64, 14, 0.1)",
    gap: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderId: {
    color: "#FCD34D",
    fontFamily: "monospace",
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  deliveredBadge: {
    backgroundColor: "rgba(5, 150, 105, 0.3)",
    borderColor: "rgba(4, 120, 87, 0.3)",
  },
  shippedBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.3)",
    borderColor: "rgba(29, 78, 216, 0.3)",
  },
  processingBadge: {
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    borderColor: "rgba(180, 83, 9, 0.3)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  orderDate: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  orderStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderStatus: {
    color: "rgba(96, 165, 250, 0.7)",
    fontSize: 14,
  },
  emptyOrdersContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyOrdersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  emptyOrdersText: {
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  startShoppingButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },
  startShoppingGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  startShoppingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  wishlistScroll: {
    marginBottom: 16,
  },
  wishlistItem: {
    width: 160,
    marginRight: 16,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 12,
    padding: 12,
  },
  wishlistImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  wishlistTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  wishlistPrice: {
    color: "#EAB308",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyWishlistContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyWishlistTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  emptyWishlistText: {
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  profileInfoContainer: {
    gap: 24,
    marginBottom: 24,
  },
  profileInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    gap: 16,
  },
  profileInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoText: {
    flex: 1,
  },
  profileInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FCD34D",
    marginBottom: 4,
  },
  profileInfoValue: {
    fontSize: 14,
    color: "rgba(254, 243, 199, 0.7)",
  },
  editProfileButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  editProfileGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    gap: 8,
  },
  editProfileText: {
    color: "#EAB308",
    fontWeight: "600",
  },
  quickActionsContainer: {
    gap: 16,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    color: "#FCD34D",
    fontWeight: "600",
  },
  settingsIconButton: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)", // Added for debugging
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    width: 24,
    height: 24,
  },
});

export default ProfilePage;
