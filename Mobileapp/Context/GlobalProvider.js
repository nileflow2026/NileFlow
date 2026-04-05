/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import axiosClient from "@/api";
import { account, Config, databases, ID, Query, storage } from "@/Appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import * as mime from "react-native-mime-types";

const GlobalContext = createContext({
  isLogged: false,
  setIsLogged: () => {},
  user: null,
  setUser: () => {},
  loading: true,
  isGuest: false,
  setIsGuest: () => {},
  startGuestSessionFlow: () => Promise.resolve(),
  handleLogout: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

export const getCurrentUser = async () => {
  /* console.log('➡️ getCurrentUser called...'); */

  try {
    console.log(
      "➡️ Making GET request to /api/customerauth/getCustomerProfile..."
    );

    // Use the cookie-based endpoint that matches your backend
    const response = await axiosClient.get(
      "/api/customerauth/getCustomerProfile"
    );

    // Adjust here depending on your API's response structure:
    const user = response.data?.user || response.data;
    console.log("⬅️ User data received:", user);

    if (!user || typeof user !== "object") {
      console.warn("Invalid user data received");
      return null; // Return null instead of throwing error
    }

    // Sanitize avatar fields to ensure they're strings or null (not arrays)
    const sanitizedUser = {
      ...user,
      avatar: Array.isArray(user.avatar)
        ? user.avatar.length > 0
          ? user.avatar[0]
          : null
        : user.avatar,
      avatarUrl: Array.isArray(user.avatarUrl)
        ? user.avatarUrl.length > 0
          ? user.avatarUrl[0]
          : null
        : user.avatarUrl,
    };

    console.log("✅ Sanitized user data:", sanitizedUser);
    return sanitizedUser;
  } catch (error) {
    console.log(
      "Error fetching current user:",
      error.response?.data?.error || error.message
    );
    return null; // Return null instead of throwing error - allow browsing without auth
  }
};

export const signUp = async (
  email,
  password,
  username,
  phone,
  { setUser, setIsLogged, setIsGuest }
) => {
  // Note: If you want to include phone number in signup, add it to parameters and req.body
  try {
    console.log("Signing up user:", { email, username, phone });

    // Generate deviceId for mobile tracking
    let deviceId = await AsyncStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = Math.random().toString(36).substr(2, 16);
      await AsyncStorage.setItem("deviceId", deviceId);
    }

    // Backend signup API call
    const response = await axiosClient.post(
      "/api/customerauth/signup/customer",
      {
        email,
        password,
        username,
        phone, // If you want to send a hardcoded phone or get it from props
        deviceId,
      }
    );

    // Backend response structure: { message, user: { id, email, username, role, avatar }, profile }
    // Note: tokens are set as HTTP cookies, not in response body
    const { user, profile } = response.data;

    // Store user data securely
    await AsyncStorage.setItem("user", JSON.stringify(user)); // Store the user object

    // Clear guest session if applicable
    const isGuest = await AsyncStorage.getItem("isGuest");
    if (isGuest === "true") {
      await AsyncStorage.removeItem("isGuest");
      console.log("✅ Guest session cleared after signup");
    }

    // Update local state directly with data from signup response
    setUser(user);
    setIsLogged(true);
    setIsGuest(false);

    // Return relevant data
    return { user, profile };
  } catch (error) {
    console.error(
      "Signup error:",
      error.response?.data?.error || error.message || error
    );
    // Rethrow a simplified error message for the UI
    throw new Error(
      error.response?.data?.error || "Signup failed. Please try again."
    );
  }
};

export const signIn = async (email, password) => {
  try {
    console.log("Attempting to sign in user:", email);

    // Generate deviceId for mobile tracking
    let deviceId = await AsyncStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = Math.random().toString(36).substr(2, 16);
      await AsyncStorage.setItem("deviceId", deviceId);
    }

    // Send login credentials to your backend API
    const response = await axiosClient.post(
      "/api/customerauth/signin/customer",
      {
        email,
        password,
        deviceId,
      }
    );

    // Backend response structure: { message, user: { userId, email, username, role, avatar } }
    // Note: tokens are set as HTTP cookies, not in response body
    const { user } = response.data;

    // Clear guest status upon successful login
    await AsyncStorage.removeItem("isGuest");
    // Store the received user data
    await AsyncStorage.setItem("user", JSON.stringify(user));

    console.log("✅ Signin successful for user:", user.email);
    // Return the relevant data to the calling context
    return { user };
  } catch (error) {
    console.error(
      "Signin error details:",
      error.response?.data || error.message || error
    );
    // Re-throw a specific error message from the backend or a generic one
    throw new Error(
      error.response?.data?.error ||
        "Signin failed. Please check your credentials."
    );
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
    console.log("User signed out");
  } catch (error) {
    console.error("Error in signOut:", error);
    throw new Error(`Sign-out failed: ${error.message}`);
  }
};

export const createGuestSession = async () => {
  try {
    const session = await account.createAnonymousSession();
    console.log("Guest session created:", session);
    // You might want to store some indication in local storage that the user is a guest
    await AsyncStorage.setItem("isGuest", "true");
    return session;
  } catch (error) {
    console.error("Error creating guest session:", error);
    throw new Error("Failed to create guest session.");
  }
};

export const isGuestUser = async () => {
  return AsyncStorage.getItem("isGuest") === "true";
};

export const getGuestUser = async () => {
  if (await isGuestUser()) {
    try {
      return await account.get(); // This will return the current anonymous session
    } catch (error) {
      console.error("Error getting guest user:", error);
      return null;
    }
  }
  return null;
};

export const createNotification = async ({
  message,
  type,
  username,
  email,
  userId,
}) => {
  try {
    const response = await axiosClient.post(
      "/api/customernotifications/createnotification",
      {
        message,
        type,
        username,
        email,
        userId,
      }
    );

    return response.data.notification;
  } catch (error) {
    console.error("❌ Failed to send notification:", error.message);
    throw error;
  }
};

export const saveRecentSearch = async (userId, query) => {
  try {
    // The userId is now passed as an argument, so you don't need fetchUserId() here.
    console.log("Saving recent search for userId:", userId, "query:", query);

    const response = await axiosClient.post(
      `/api/customerprofile/customer-searches`,
      {
        userId,
        query,
      }
    );

    console.log(response.data.message);
  } catch (error) {
    console.error("Failed to save recent search:", error.message);
    throw error; // Re-throw the error so it can be caught in the component
  }
};

export const getRecentSearches = async () => {
  try {
    const userId = await fetchUserId();
    const response = await axiosClient.get(
      "/api/customerprofile/customer-recent-search",
      {
        params: {
          userId: userId, // 👈 send userId as a query parameter
        },
      }
    );
    return response.data.searches || [];
  } catch (error) {
    console.error(
      "Error fetching recent searches:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const clearRecentSearches = async () => {
  try {
    const response = await axiosClient.delete(
      "/api/customerprofile/clear-recent-search"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error clearing recent searches:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCustomerNotification = async () => {
  console.log("➡️ getCustomerNotification called...");

  try {
    console.log(
      "➡️ Making GET request to /api/customernotifications/customernotification..."
    );

    const response = await axiosClient.get(
      "/api/customernotifications/customernotification"
    );

    console.log("⬅️ Notification response received:", response.data);

    const notifications = response.data?.result;

    if (!Array.isArray(notifications)) {
      console.warn("⚠️ Invalid notifications data received:", notifications);
      throw new Error("Invalid notifications data received");
    }

    console.log("✅ Notifications processed:", notifications.length, "items");
    return notifications; // ✅ Return just the array
  } catch (error) {
    console.error("❌ Error fetching userNotifications:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Return empty array instead of throwing error to prevent crashes
    return [];
  }
};

export const submitReview = async ({
  productId,
  reviewText,
  rating,
  imageFileId,
}) => {
  const response = await axiosClient.post(
    "/api/customerprofile/submit-review",
    {
      productId,
      reviewText,
      rating,
      imageId: imageFileId || "",
    }
  );

  return response.data;
};

export const incrementProductRatingsCount = async (productId) => {
  try {
    const response = await axiosClient.post(
      "/api/customerprofile/increment-rating",
      { productId } // Request body
    );

    console.log("Ratings count updated:", response.data.ratingsCount);
    return response.data;
  } catch (error) {
    console.error(
      "Error incrementing product ratings count:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCustomerOrders = async () => {
  const response = await axiosClient.get(
    "/api/customerprofile/customer-orders"
  );
  return response.data.orders;
};

export const fetchReviews = async (productId) => {
  try {
    const response = await axiosClient.get(
      `/api/customerprofile/fetch-reviews/${productId}`
    );
    /* console.log('Review data:', response.data) */
    return response.data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
};

export const fetchUserId = async () => {
  try {
    const user = await getCurrentUser(); // Fetch the authenticated user
    if (!user) {
      console.log("No user logged in - returning null");
      return null; // Return null instead of throwing error
    }
    return user.id; // Return the user ID from correct field (id, not userId)
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null; // Return null instead of throwing error
  }
};

export const fetchUserName = async () => {
  try {
    const user = await getCurrentUser(); // Get the logged-in user details
    if (!user) {
      return "Guest";
    }
    console.log("user", user);
    return user.username || "Guest";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Anonymous";
  }
};

/* export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("❌ Notification permission denied.");
    return;
  }
};
requestNotificationPermissions();

export const sendNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💰 Exchange Rates Updated!",
      body: "Currency rates have been refreshed.",
    },
    trigger: null,
  });
}; */

export const updateCurrencyRates = async () => {
  try {
    console.log("Updating currency rates...");
    const response = await axiosClient.get(
      "/api/update-currencies/update-currencies"
    );

    /* sendNotification(); */
    return response.data;
  } catch (error) {
    console.error("❌ Error updating currency rates:", error);
  }
};

const uploadImageToStorage = async (imageFile) => {
  try {
    // Create a File object with both parts: file data and file name
    const file = new File([imageFile], imageFile.name, {
      type: imageFile.type,
    });

    // Upload the file to Appwrite storage
    const fileId = await storage.createFile(file); // Upload the file

    // Store fileId in review (instead of imageUrl)
    return fileId; // Return the fileId
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

export async function uploadFile(file) {
  if (!file) {
    console.warn("uploadFile: No file provided.");
    return null;
  }

  const { uri, name } = file;
  const mimeType = mime.lookup(uri) || "image/jpeg";
  const uniqueFileId = ID.unique();

  console.log("uploadFile (FormData+ID): Received file:", file);
  console.log("uploadFile (FormData+ID): Attempting to upload:", {
    uri,
    mimeType,
    name,
    uniqueFileId,
  });
  console.log("uploadFile (FormData+ID): Storage ID:", Config.StorageId);
  console.log("uploadFile (FormData+ID): Project ID:", Config.projectId);

  try {
    const formData = new FormData();
    formData.append("fileId", uniqueFileId); // Include fileId in the form data
    formData.append("file", {
      uri,
      type: mimeType,
      name,
    });

    const response = await fetch(
      `${Config.endpoint}/storage/buckets/${Config.StorageId}/files`,
      {
        method: "POST",
        headers: {
          "X-Appwrite-Project": Config.projectId,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "uploadFile (FormData+ID): fetch failed:",
        response.status,
        errorText
      );
      throw new Error(`Fetch error: ${response.status} - ${errorText}`);
    }

    const uploadedFile = await response.json();
    console.log(
      "uploadFile (FormData+ID): Appwrite upload successful:",
      uploadedFile
    );
    return uploadedFile.$id;
  } catch (error) {
    console.error("uploadFile (FormData+ID): Error uploading file:", error);
    console.log("uploadFile (FormData+ID): Error details:", error);
    Alert.alert(
      "Upload Error",
      "Failed to upload the image. Please try again."
    );
    return null;
  }
}

// Get File Preview
const getImageViewURL = (fileId) => {
  if (!fileId) {
    return null; // Or a default placeholder image URL
  }
  try {
    return storage.getFileView(Config.StorageId, fileId);
  } catch (error) {
    console.error("Error generating image view URL:", error);
    return null; // Or a default placeholder image URL
  }
};

export const getlatestProducts = async () => {
  try {
    const result = await databases.listDocuments(
      Config.databaseId,
      Config.productCollectionId,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    );
    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ✅ New fetchProducts aligned with backend controller
export const fetchProducts = async (
  category = "",
  searchTerm = "",
  setLoading // Pass setLoading from component
) => {
  try {
    if (typeof setLoading === "function") setLoading(true);

    // Build query params dynamically
    const params = new URLSearchParams();
    if (category && category.trim() !== "" && category !== "all") {
      params.append("category", category.trim());
    }
    if (searchTerm && searchTerm.trim() !== "") {
      params.append("search", searchTerm.trim());
    }

    const response = await axiosClient.get(
      `/api/customerprofile/fetch-product-mobile?${params.toString()}`
    );

    const data = response.data;

    if (!data.success || !Array.isArray(data.products)) {
      console.error("Invalid backend response:", data);
      return [];
    }

    return data.products; // ✅ Backend returns all products
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  } finally {
    if (typeof setLoading === "function") setLoading(false);
  }
};

// fetchProducts.js
// Pagination-ready + backward compatible with your current backend

export const fetchProduct = async ({
  category = "",
  searchTerm = "",
  limit = 20,
  cursor = null,
  signal, // optional: AbortController for debouncing/cancellation
}) => {
  try {
    const params = new URLSearchParams();

    // Filters
    if (
      category &&
      category.trim() !== "" &&
      category.toLowerCase() !== "all"
    ) {
      params.append("category", category.trim());
    }
    if (searchTerm && searchTerm.trim() !== "") {
      params.append("search", searchTerm.trim());
    }

    // Pagination (requires backend change I outlined)
    if (limit) params.append("limit", String(limit));
    if (cursor) params.append("cursor", cursor);

    const url = `/api/customerprofile/fetch-product-mobile?${params.toString()}`;
    const response = await axiosClient.get(url, { signal });

    // Support both the new (paginated) and old (all-in-one) payloads
    const data = response.data || {};
    if (data.success && Array.isArray(data.products)) {
      return {
        products: data.products,
        nextCursor: data.nextCursor ?? null, // null when backend hasn’t been upgraded yet
        total: data.total ?? data.products.length,
      };
    }

    console.error("Invalid backend response:", data);
    return { products: [], nextCursor: null, total: 0 };
  } catch (error) {
    // If aborted, just return quietly
    if (error?.name === "CanceledError" || error?.name === "AbortError") {
      return { products: [], nextCursor: null, total: 0 };
    }
    console.error("Error fetching products:", error);
    return { products: [], nextCursor: null, total: 0 };
  }
};

export const getProducts = async () => {
  try {
    const response = await axiosClient.get(
      "/api/customerprofile/fetch-product"
    );

    if (response.data.success) {
      console.log("✅ Products fetched:", response.data.products.length);
      return response.data.products; // <-- return array directly
    } else {
      console.warn("⚠️ Failed to fetch products:", response.data.error);
      return [];
    }
  } catch (error) {
    console.error("❌ Error in fetchProducts:", error);
    return [];
  }
};

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkGuestStatus = async () => {
      try {
        const guest = await AsyncStorage.getItem("isGuest");
        setIsGuest(guest === "true");
      } catch (error) {
        console.error("Error checking guest status:", error);
      }
    };
    checkGuestStatus();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsLogged(true);

          // Handle any user object key renaming if needed here
          if (currentUser.key) {
            const { key, ...rest } = currentUser;
            setUser({ ...rest, appwriteKey: key });
          } else {
            setUser(currentUser);
          }

          setIsGuest(false); // User is logged in, not guest
        } else {
          setIsLogged(false);
          setUser(null);
        }
      } catch (error) {
        setIsLogged(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // A new function to check for an existing session
  const checkActiveAppwriteSession = async () => {
    try {
      const user = await getGuestUser(); // Attempt to get the current user
      return user; // Return the user object if successful
    } catch (error) {
      // If there's an error, it likely means no active session
      console.warn("No active Appwrite session found.");
      return null; // Return null to indicate no session
    }
  };

  const startGuestSessionFlow = async () => {
    // No longer automatically create guest sessions
    // Users can browse without authentication
    setLoading(true);
    try {
      // 1. Check for an active session first
      const activeSessionUser = await checkActiveAppwriteSession();

      if (activeSessionUser) {
        // 2. If a session is found, handle the user state
        console.log("Active session already exists. Handling user data.");
        setIsLogged(true);
        setUser(activeSessionUser);
        // Determine if the existing session is a guest session
        setIsGuest(activeSessionUser.provider === "anonymous");
        return activeSessionUser;
      } else {
        // 3. No session found - user can browse without authentication
        console.log(
          "No active session. User can browse without authentication."
        );
        setIsLogged(false);
        setIsGuest(false);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Failed to handle user session:", error);
      // Don't throw error - allow browsing without auth
      setIsLogged(false);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /*  const startGuestSessionFlow = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser.provider === 'anonymous') {
        await AsyncStorage.setItem('isGuest', 'true');
        setIsGuest(true);
      }

      return currentUser;
      
    } catch (error) {
      try {
      const guestSession = await createGuestSession();
      setIsGuest(true);
      return guestSession;

      } catch (error) {
      throw new Error('Failed to Create a new guest Session.')
    }
  }

} */

  /*   const startGuestSessionFlow = async () => {
    try {
      const currentUser = await account.get();
      if (currentUser && currentUser.provider !== 'anonymous') {
        console.log('Regular user session active. Consider prompting logout.');
        throw new Error('Regular user session active.');
      } else if (currentUser && currentUser.provider === 'anonymous') {
        console.log('Existing anonymous session found. Reusing.');
        await AsyncStorage.setItem('isGuest', 'true');
        setIsGuest(true);
        return currentUser;
      } else {
        // Implement your guest session creation logic here:
        // const guestUser = await createGuestSession();
        // await AsyncStorage.setItem('isGuest', 'true');
        // setIsGuest(true);
        // return guestUser;
        throw new Error('Guest session creation not implemented.');
      }
    } catch (error) {
      console.error('Error starting guest session flow:', error);
      throw error;
    }
  }; */

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookies
      await axiosClient.post("/api/customerauth/logout/customer");

      // Clear local storage
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("isGuest");

      setIsLogged(false);
      setUser(null);
      setIsGuest(false);

      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);

      // Even if logout fails, clear local state
      try {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("isGuest");
        setIsLogged(false);
        setUser(null);
        setIsGuest(false);
      } catch (clearError) {
        console.error("Error clearing local storage:", clearError);
      }
    }
  };

  const contextValue = useMemo(
    () => ({
      isLogged,
      setIsLogged,
      user,
      setUser,
      loading,
      isGuest,
      setIsGuest,
      startGuestSessionFlow,
      handleLogout,
    }),
    [isLogged, user, loading, isGuest]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
