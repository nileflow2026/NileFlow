/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import axiosClient, { initCurrency, setDetectedCurrency } from "../api";
import { fetchUserId, fetchUserName } from "./GlobalProvider";

// Read the detected currency (set by initCurrency) — used as query param
// on cart fetch calls so the correct enrichment is guaranteed regardless
// of whether the default header has been applied yet.
async function getActiveCurrency() {
  const currency = await initCurrency();
  return currency || "KES";
}

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [userId, setUserId] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadCartFromStorage();
    loadWishlistFromStorage();
    loadUserId();
  }, []);

  const saveWishlistToStorage = async (items, userId) => {
    if (!userId) return;
    try {
      await AsyncStorage.setItem(
        `@wishlist_items_${userId}`,
        JSON.stringify(items),
      );
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  };

  const loadWishlistFromStorage = async () => {
    try {
      const id = await fetchUserId();
      if (!id) {
        setWishlist([]);
        return;
      }

      const storedWishlist = await AsyncStorage.getItem(
        `@wishlist_items_${id}`,
      );
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  };

  const loadCartFromStorage = async () => {
    // Cart is NOT stored in AsyncStorage — cached cart items have a baked-in
    // currency (e.g. KES) that may differ from the user's current location.
    // All cart data comes from the server via fetchCartItems (called by
    // Cart.jsx's useFocusEffect) with the correct currency attached.
    // Purge any stale key left over from before this change.
    setCart([]);
    try {
      const id = await fetchUserId();
      if (id) await AsyncStorage.removeItem(`@cart_items_${id}`);
    } catch (_) {}
  };

  const loadUserId = async () => {
    setLoadingUser(true); // Start loading
    try {
      const id = await fetchUserId();
      setUserId(id);
      // Don't call loadCartFromStorage here — it already runs at mount.
      // Calling it again here causes a race condition that can overwrite
      // correctly-enriched cart state with stale data.
    } catch (error) {
      console.error("Error fetching user ID:", error);
    } finally {
      setLoadingUser(false); // Reset loading state
    }
  };

  const addToCart = async (product, userId) => {
    try {
      // Lock in the currency from the product's own enriched price IMMEDIATELY.
      // This ensures that even if a stale in-flight fetchCartItems response
      // arrives later, the correct currency is already re-asserted here.
      if (
        product.price &&
        typeof product.price === "object" &&
        product.price.currency
      ) {
        setDetectedCurrency(product.price.currency);
      }

      console.log("Adding to cart:", {
        userId,
        productId: product.$id || product.id,
        productName: product.productName,
      });

      // Validate userId
      if (!userId) {
        console.error("User ID is missing.");
        Toast.show({
          type: "error",
          text1: "You must be logged in to add to cart.",
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      // Validate product ID
      const productId = product.$id || product.id;
      if (!productId) {
        console.error("Product ID is missing.");
        Toast.show({
          type: "error",
          text1: "Product ID is missing.",
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      const userName = await fetchUserName();

      const res = await axiosClient.post("/cart/add", {
        userId,
        productId: productId,
        productName: product.productName,
        price: product.price,
        image: product.image,
        userName,
      });

      const data = res.data;
      if (data.success) {
        // OPTIMISTIC UPDATE: The product already has an enriched price object
        // (e.g. { currency: "SSP", displayValue: "SSP 28,592", raw: 800 })
        // set by the backend when Explore/ProductDetails fetched it.
        // Use it directly so the Cart shows the correct currency immediately
        // without waiting for a round-trip backend re-fetch.
        const enrichedPrice =
          product.price && typeof product.price === "object"
            ? product.price
            : data.item.price;

        setCart((prev) => {
          // If item already exists (duplicate add), don't add again
          const alreadyIn = prev.some(
            (i) => i.productId === productId || i.$id === data.item.$id,
          );
          if (alreadyIn) return prev;
          return [...prev, { ...data.item, price: enrichedPrice }];
        });

        Toast.show({
          type: "success",
          text1: "Added to Cart",
          visibilityTime: 2000,
          autoHide: true,
        });
        // No background fetchCartItems here — the optimistic update already shows
        // the correct enriched price. Cart.jsx's useFocusEffect will sync when
        // the user navigates to the Cart tab.
      } else {
        Toast.show({
          type: "error",
          text1: data.error || "Error adding to cart",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error adding to cart",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await axiosClient.delete(`/cart/remove/${cartItemId}`);

      if (res.status === 200) {
        const updatedCart = cart.filter(
          (item) =>
            item.$id !== cartItemId &&
            item.id !== cartItemId &&
            item.productId !== cartItemId,
        );
        setCart(updatedCart);

        Toast.show({
          type: "info",
          text1: "Removed from Cart",
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      Toast.show({
        type: "error",
        text1: "Failed to remove from cart",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const addToWishlist = async (product) => {
    if (wishlist.find((item) => item.$id === product.$id)) {
      Toast.show({
        type: "info",
        text1: "Already in Wishlist",
        visibilityTime: 2000,
        autoHide: true,
      });
      return;
    }

    const updatedWishlist = [...wishlist, product];
    setWishlist(updatedWishlist);
    saveWishlistToStorage(updatedWishlist, userId);
    Toast.show({
      type: "success",
      text1: "Added to Wishlist",
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const removeFromWishlist = async (productId) => {
    const updatedWishlist = wishlist.filter((item) => item.$id !== productId);
    setWishlist(updatedWishlist);
    saveWishlistToStorage(updatedWishlist, userId);
    Toast.show({
      type: "info",
      text1: "Removed from Wishlist",
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const id = await fetchUserId();

      // Find the cart item to get the productId if we received document ID
      const cartItem = cart.find(
        (item) =>
          item.id === cartItemId ||
          item.$id === cartItemId ||
          item.productId === cartItemId,
      );

      if (!cartItem) {
        console.error("Cart item not found locally");
        return;
      }

      // Use productId for backend call (backend expects productId, not document ID)
      const productIdToUpdate = cartItem.productId;

      const res = await axiosClient.put(`/cart/update/${productIdToUpdate}`, {
        quantity: newQuantity,
        userId: id,
      });

      if (res.status === 200) {
        const updated = res.data;
        const updatedCart = cart.map((item) =>
          item.id === cartItemId ||
          item.$id === cartItemId ||
          item.productId === cartItemId
            ? { ...item, quantity: updated.quantity }
            : item,
        );
        setCart(updatedCart);

        Toast.show({
          type: "success",
          text1: "Quantity updated",
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update quantity",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const fetchCartItems = useCallback(async () => {
    try {
      const id = await fetchUserId();
      if (!id) {
        setCart([]);
        setLoadingCart(false);
        return;
      }

      // Use the globally detected currency (set by setDetectedCurrency in Explore).
      // By the time the user reaches the Cart tab, Explore has already called
      // setDetectedCurrency("SSP"), so initCurrency() returns "SSP" instantly.
      // Do NOT read from cart items — old AsyncStorage items at index 0 may have
      // a stale "KES" currency that would cause the wrong enrichment.
      const currency = await getActiveCurrency();

      const res = await axiosClient.get(`/cart/fetch/${id}`, {
        params: { currency },
      });

      if (res.status === 200) {
        setCart(res.data);
        // Do NOT call setDetectedCurrency here — a stale KES response from an
        // in-flight request that started before Explore set "SSP" would override
        // the correct currency. Currency is set by Explore and addToCart only.
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // On failure, keep whatever cart state is already in memory.
      // Do NOT fall back to AsyncStorage here — it may contain stale
      // KES-enriched items that would overwrite a correct SSP optimistic
      // update. AsyncStorage fallback is handled by loadCartFromStorage
      // (initial load only).
    } finally {
      setLoadingCart(false);
    }
  }, []); // stable reference — currency comes from initCurrency() singleton, not closure

  // Validate cart stock before checkout
  const validateCartStock = async () => {
    try {
      const id = await fetchUserId();
      const response = await axiosClient.post("/cart/validate-stock", {
        cart: cart,
        userId: id,
      });
      return response.data;
    } catch (error) {
      console.error("Error validating cart stock:", error);
      return { isValid: false, errors: ["Failed to validate stock"] };
    }
  };

  const clearCart = async () => {
    try {
      const id = await fetchUserId();
      if (!id) {
        console.error("User ID not found");
        return;
      }

      // 1. Clear frontend state
      setCart([]);

      // 2. Clear AsyncStorage
      await AsyncStorage.removeItem(`@cart_items_${id}`);

      // 3. Clear backend cart
      try {
        await axiosClient.delete(`/cart/clear/${id}`);
        console.log("✅ Backend cart cleared");
      } catch (backendError) {
        console.error("Backend cart clear failed:", backendError);
        // Continue anyway - we'll sync on next load
      }

      Toast.show({
        type: "info",
        text1: "Cart cleared",
        visibilityTime: 2000,
        autoHide: true,
      });
    } catch (err) {
      console.error("Error clearing cart:", err);
      Toast.show({
        type: "error",
        text1: "Failed to clear cart",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const cartValue = useMemo(
    () => ({
      cart,
      addToCart,
      addToWishlist,
      removeFromCart,
      removeFromWishlist,
      clearCart,
      setCart,
      updateQuantity,
      fetchCartItems,
      validateCartStock,
      wishlist,
    }),
    [cart, wishlist],
  );

  return (
    <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
