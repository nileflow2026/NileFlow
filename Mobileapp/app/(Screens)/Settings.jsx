/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { FontAwesome5 } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import { Config } from "../../Appwrite";
import { useCart } from "../../Context/CartContext_NEW";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import i18n from "../../i18n";

const { width } = Dimensions.get("window");

// ==== Helper to get Appwrite file URL ====
const getFileViewUrl = (bucketId, fileId) =>
  `${Config.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${Config.projectId}`;
const Settings = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { setCart } = useCart();
  const { theme, toggleTheme, themeStyles } = useTheme();
  const isDarkMode = theme === "dark";
  const [nileMilesData, setNileMilesData] = useState({
    currentMiles: 0,
    earnedHistory: [],
    redeemed: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchNileMiles = async () => {
    try {
      /* onsole.log("📡 Fetching with userId:", user.id); */
      const res = await axiosClient.get(
        `/api/nilemiles/nilemiles/status?userId=${user.id}`,
      );
      /* console.log("✅ Raw response:", res);
      console.log("📦 Data:", res.data); */
      setNileMilesData(res.data);
    } catch (error) {
      console.error("❌ Failed to load Nile Miles:", error);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchNileMiles();
    } else {
      console.warn("⚠️ No user ID found, skipping fetch.");
    }
  }, [user]);

  // ADD pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNileMiles();
    setRefreshing(false);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem(`@cart_items_${user?.$id}`);

      setCart([]);
      setUser(null);
      setIsLogged(false);

      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Logout Failed", "Something went wrong. Please try again.");
      console.error("Logout error:", error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow photo library access.",
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

      // show picked image immediately
      setSelectedImage(uri);

      // upload to Appwrite
      setUploading(true);

      const formData = new FormData();
      formData.append("avatar", {
        uri,
        type: "image/jpeg",
        name: `avatar_${user?.userId || "unknown"}_${Date.now()}.jpg`,
      });
      formData.append("userId", user?.userId || "");

      const token = await AsyncStorage.getItem("accessToken");

      const res = await axiosClient.post(
        `/api/customerprofile/updatedAvatar`,
        formData, // ✅ send formData directly
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // ✅ required for file upload
          },
        },
      );

      if (user) {
        const updatedUser = {
          ...user,
          avatarUrl: res.data.avatarUrl,
          avatarFileId: res.data.avatarFileId,
        };
        setUser(updatedUser);
        /* await AsyncStorage.setItem('user', JSON.stringify(updatedUser)); */
      }

      Alert.alert("Profile Updated", "Your profile picture has been updated.");
    } catch (err) {
      console.error("Upload failed", err);
      Alert.alert("Error", "Could not update profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const profileImageSize = width < 350 ? 120 : 160;
  const profileTextFontSize = width < 350 ? 18 : 20;
  const sectionTitleFontSize = width < 350 ? 16 : 18;
  const itemTextFontSize = width < 350 ? 14 : 16;
  const itemPadding = width < 350 ? 12 : 16;
  const iconSize = width < 350 ? 18 : 20;
  const logoutPadding = width < 350 ? 12 : 16;
  const logoutFontSize = width < 350 ? 14 : 16;

  return (
    <SafeAreaView
      style={{
        backgroundColor: "#0f172a",
        flex: 1,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="mb-8">
        <View className="mt-10 px-4">
          <Text
            className={`${theme === "dark" ? "text-white" : "text-black"} font-semibold`}
            style={{ fontSize: sectionTitleFontSize }}
          >
            {i18n.t("Account")}
          </Text>
          {[
            {
              title: i18n.t("Orders"),
              route: "/Orders",
              icon: require("../../assets/icons/order.png"),
            },
            {
              title: i18n.t("Favorites"),
              route: "/Favorites",
              icon: require("../../assets/icons/address.png"),
            },
            {
              title: i18n.t("Payment Methods"),
              route: "/Payments",
              icon: require("../../assets/icons/payment.png"),
            },
            {
              title: i18n.t("Addresses"),
              route: "/Addresses",
              icon: require("../../assets/icons/address.png"),
            },
          ].map(({ title, route, icon }, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(route)}
              className={`rounded-lg mt-2 flex-row items-center`}
              style={{
                padding: itemPadding,
                backgroundColor: themeStyles.accent2,
              }}
            >
              <Image
                source={icon}
                className="w-6 h-6 mr-3"
                style={{ tintColor: theme === "dark" ? "white" : "black" }}
              />
              <Text
                className={`${theme === "dark" ? "text-white" : "text-black"}`}
                style={{ fontSize: itemTextFontSize, color: "white" }}
              >
                {title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 px-4">
          <Text
            className={`${theme === "dark" ? "text-white" : "text-black"} font-semibold`}
            style={{ fontSize: sectionTitleFontSize }}
          >
            {i18n.t("Preferences")}
          </Text>
          {[
            {
              title: i18n.t("Return Policy"),
              route: "/ReturnPolicy",
              icon: "assignment-return",
            },
            { title: i18n.t("Language"), route: "/Language", icon: "language" },
            {
              title: i18n.t("Currency"),
              route: "/Currency",
              icon: "currency-exchange",
            },
          ].map(({ title, route, icon }, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(route)}
              className={` rounded-lg mt-2 flex-row items-center`}
              style={{
                padding: itemPadding,
                backgroundColor: themeStyles.accent2,
              }}
            >
              <MaterialIcons
                name={icon}
                size={iconSize}
                color={theme === "dark" ? "white" : "black"}
                className="mr-4"
              />
              <Text
                className={`${theme === "dark" ? "text-white" : "text-black"}`}
                style={{ fontSize: itemTextFontSize, color: "white" }}
              >
                {title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 px-4">
          <Text
            className={`${theme === "dark" ? "text-white" : "text-black"} font-semibold`}
            style={{ fontSize: sectionTitleFontSize }}
          >
            {i18n.t("Support")}
          </Text>
          {[
            {
              title: i18n.t("Help Center"),
              route: "/HelpCenter",
              icon: "question-circle",
            },
            {
              title: i18n.t("Report a Problem"),
              route: "/ReportaProblem",
              icon: "exclamation-triangle",
            },
            { title: i18n.t("About"), route: "/About", icon: "info-circle" },
          ].map(({ title, route, icon }, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(route)}
              className={`rounded-lg mt-2 flex-row items-center`}
              style={{
                padding: itemPadding,
                backgroundColor: themeStyles.accent2,
              }}
            >
              <FontAwesome5
                name={icon}
                size={iconSize}
                color={theme === "dark" ? "white" : "black"}
                className="mr-4"
              />
              <Text
                className={`${theme === "dark" ? "text-white" : "text-black"}`}
                style={{ fontSize: itemTextFontSize, color: "white" }}
              >
                {title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 px-4 mb-10">
          <TouchableOpacity
            onPress={logout}
            className="bg-red-500 rounded-lg"
            style={{ padding: logoutPadding }}
          >
            <Text
              className="text-white text-center font-semibold"
              style={{ fontSize: logoutFontSize }}
            >
              {i18n.t("Log out")}
            </Text>
          </TouchableOpacity>

          {/* Privacy & Data Deletion — GDPR / Play Store compliance */}
          <View
            style={{
              marginTop: 24,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.08)",
              paddingTop: 16,
            }}
          >
            <Text
              style={{
                color: "#64748b",
                fontSize: 12,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Privacy &amp; Data
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/AccountDeletion")}
              style={{
                backgroundColor: "rgba(239,68,68,0.08)",
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.25)",
                borderRadius: 10,
                padding: itemPadding,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name="delete-forever"
                  size={iconSize}
                  color="#f87171"
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text
                    style={{
                      color: "#f87171",
                      fontSize: itemTextFontSize,
                      fontWeight: "600",
                    }}
                  >
                    Delete Account &amp; Data
                  </Text>
                  <Text
                    style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}
                  >
                    GDPR &amp; Play Store compliant
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
