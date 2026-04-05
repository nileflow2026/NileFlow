/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import axiosClient from "../api";
import { fetchUserId, fetchUserName } from "./GlobalProvider";

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
        JSON.stringify(items)
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
        `@wishlist_items_${id}`
      );
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  };

  const loadCartFromStorage = async () => {
    try {
      const id = await fetchUserId();
      if (!id) {
        setCart([]);
        return;
      }

      const res = await axiosClient.get(`/cart/load/${id}`);

      if (res.status === 200) {
        setCart(res.data);

        // Cache for offline support
        await AsyncStorage.setItem(
          `@cart_items_${id}`,
          JSON.stringify(res.data)
        );
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      // Try loading from AsyncStorage as fallback
      try {
        const id = await fetchUserId();
        const localCart = await AsyncStorage.getItem(`@cart_items_${id}`);
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          setCart([]);
        }
      } catch (err) {
        setCart([]);
      }
    }
  };

  const loadUserId = async () => {
    setLoadingUser(true); // Start loading
    try {
      const id = await fetchUserId(); // Fetch the user ID
      setUserId(id); // Set the user ID in your app's state
      await loadCartFromStorage(); // Load the cart using the user ID
    } catch (error) {
      console.error("Error fetching user ID:", error);
    } finally {
      setLoadingUser(false); // Reset loading state
    }
  };

  const addToCart = async (product, userId) => {
    try {
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
        setCart((prev) => [...prev, data.item]);
        Toast.show({
          type: "success",
          text1: "Added to Cart",
          visibilityTime: 2000,
          autoHide: true,
        });
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
            item.productId !== cartItemId
        );
        setCart(updatedCart);

        // Update AsyncStorage cache
        const id = await fetchUserId();
        await AsyncStorage.setItem(
          `@cart_items_${id}`,
          JSON.stringify(updatedCart)
        );

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
          item.productId === cartItemId
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
            : item
        );
        setCart(updatedCart);

        // Update AsyncStorage cache
        await AsyncStorage.setItem(
          `@cart_items_${id}`,
          JSON.stringify(updatedCart)
        );

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

  const fetchCartItems = async () => {
    try {
      const id = await fetchUserId();
      if (!id) {
        setCart([]);
        setLoadingCart(false);
        return;
      }

      const res = await axiosClient.get(`/cart/fetch/${id}`);

      if (res.status === 200) {
        setCart(res.data);

        // Update AsyncStorage cache
        await AsyncStorage.setItem(
          `@cart_items_${id}`,
          JSON.stringify(res.data)
        );
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Try loading from AsyncStorage as fallback
      try {
        const id = await fetchUserId();
        const localCart = await AsyncStorage.getItem(`@cart_items_${id}`);
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          setCart([]);
        }
      } catch (err) {
        setCart([]);
      }
    } finally {
      setLoadingCart(false);
    }
  };

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
    [cart, wishlist]
  );

  return (
    <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
