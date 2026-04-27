import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../Context/GlobalProvider";
import i18n from "../../i18n";

const { width } = Dimensions.get("window");

const sectionTitleFontSize = width < 350 ? 16 : 18;
const itemTextFontSize = width < 350 ? 14 : 16;
const itemPadding = width < 350 ? 12 : 16;
const iconSize = width < 350 ? 18 : 20;
const logoutPadding = width < 350 ? 12 : 16;
const logoutFontSize = width < 350 ? 14 : 16;

const AccountSettings = () => {
  const router = useRouter();
  const { user, setUser, setIsLogged } = useGlobalContext();

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
    }
  };

  const accountItems = [
    {
      title: "Orders",
      route: "/Orders",
      icon: require("../../assets/icons/order.png"),
      type: "image",
    },
    {
      title: "Payment Methods",
      route: "/PaymentMethods",
      icon: require("../../assets/icons/payment.png"),
      type: "image",
    },
    {
      title: "Addresses",
      route: "/Addresses",
      icon: require("../../assets/icons/address.png"),
      type: "image",
    },
  ];

  const preferenceItems = [
    {
      title: "Return Policy",
      route: "/ReturnPolicy",
      icon: "assignment-return",
      type: "material",
    },
    {
      title: "Language",
      route: "/Language",
      icon: "language",
      type: "material",
    },
    {
      title: "Currency",
      route: "/Currency",
      icon: "currency-exchange",
      type: "material",
    },
  ];

  const supportItems = [
    {
      title: "Help Center",
      route: "/HelpCenter",
      icon: "question-circle",
      type: "fontawesome",
    },
    {
      title: "Report a Problem",
      route: "/ReportaProblem",
      icon: "exclamation-triangle",
      type: "fontawesome",
    },
    {
      title: "About",
      route: "/About",
      icon: "info-circle",
      type: "fontawesome",
    },
  ];

  const renderItem = ({ title, route, icon, type }, index, isLast) => (
    <Pressable
      key={index}
      onPress={() => router.push(route)}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    >
      {type === "image" && (
        <Image
          source={icon}
          style={{ width: 24, height: 24, marginRight: 12, tintColor: "white" }}
        />
      )}
      {type === "material" && (
        <MaterialIcons
          name={icon}
          size={iconSize}
          color="white"
          style={{ marginRight: 16 }}
        />
      )}
      {type === "fontawesome" && (
        <FontAwesome5
          name={icon}
          size={iconSize}
          color="white"
          style={{ marginRight: 16 }}
        />
      )}
      <Text style={styles.menuText}>{title}</Text>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color="rgba(245, 158, 11, 0.6)"
        style={{ marginLeft: "auto" }}
      />
    </Pressable>
  );

  return (
    <LinearGradient
      colors={["#111827", "#000000", "#111827"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F59E0B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Account Settings</Text>
            <Text style={styles.headerSubtitle}>
              Manage your account preferences
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <LinearGradient
              colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
              style={styles.card}
            >
              {accountItems.map((item, index) =>
                renderItem(item, index, index === accountItems.length - 1),
              )}
            </LinearGradient>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <LinearGradient
              colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
              style={styles.card}
            >
              {preferenceItems.map((item, index) =>
                renderItem(item, index, index === preferenceItems.length - 1),
              )}
            </LinearGradient>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{i18n.t("Support")}</Text>
            <LinearGradient
              colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
              style={styles.card}
            >
              {supportItems.map((item, index) =>
                renderItem(item, index, index === supportItems.length - 1),
              )}
            </LinearGradient>
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: width < 350 ? 18 : 20,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: sectionTitleFontSize,
    fontWeight: "600",
    color: "#FCD34D",
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: itemPadding,
    paddingHorizontal: 16,
    backgroundColor: "rgba(17, 24, 39, 0.3)",
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  menuText: {
    fontSize: itemTextFontSize,
    color: "white",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: logoutPadding,
  },
  logoutText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: logoutFontSize,
  },
});

export default AccountSettings;
