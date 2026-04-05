import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, Platform, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Cart from "../(Screens)/Cart";
import Explore from "../(Screens)/Explore";
import Feed from "../(Screens)/Feed";
import Home from "../(Screens)/Home";
import Profile from "../(Screens)/Profile";
import { icons } from "../../constants";
import { useTheme } from "../../Context/ThemeProvider";
import i18n from "../../i18n";

const BottomTab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

const TabIcon = ({ focused, icon, title, theme, notificationCount = 0 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const badgeScale = useSharedValue(notificationCount > 0 ? 1 : 0);

  // Responsive styles - reduced sizes
  const iconSize = width < 350 ? 18 : 22;
  const badgeSize = width < 350 ? 14 : 16;

  // Animation for focused state
  React.useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [focused, scale, opacity]);

  // Animation for badge
  React.useEffect(() => {
    badgeScale.value = withSpring(notificationCount > 0 ? 1 : 0);
  }, [notificationCount, badgeScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: interpolate(opacity.value, [0, 1], [10, 0]) }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* Active Indicator */}
      <Animated.View
        style={[animatedIndicatorStyle, { position: "absolute", top: -8 }]}
      >
        <View
          style={{
            width: 24,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#F59E0B",
          }}
        />
      </Animated.View>

      {/* Icon Container */}
      <Animated.View style={[animatedIconStyle, { position: "relative" }]}>
        {/* Icon Background Glow */}
        {focused && (
          <Animated.View
            style={[
              animatedGlowStyle,
              {
                position: "absolute",
                inset: -8,
                borderRadius: 20,
                backgroundColor: "rgba(245, 158, 11, 0.2)",
              },
            ]}
          />
        )}

        {/* Icon */}
        <Image
          source={icon}
          tintColor={
            focused ? "#F59E0B" : theme === "dark" ? "#9CA3AF" : "#6B7280"
          }
          resizeMode="contain"
          style={{ width: iconSize, height: iconSize }}
        />

        {/* Notification Badge */}
        {notificationCount > 0 && (
          <Animated.View
            style={[
              animatedBadgeStyle,
              { position: "absolute", top: -8, right: -8 },
            ]}
          >
            <LinearGradient
              colors={["#DC2626", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: badgeSize / 2,
                alignItems: "center",
                justifyContent: "center",
                width: badgeSize,
                height: badgeSize,
                minWidth: badgeSize,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 10, fontWeight: "bold" }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const BottomTabs = () => {
  const { theme } = useTheme();
  const tabBarHeight = width < 350 ? 60 : 70;
  const isDark = theme === "dark";

  return (
    <LinearGradient
      colors={isDark ? ["#0f172a", "#1e293b"] : ["#f8fafc", "#f1f5f9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            borderTopWidth: 0,
            height: tabBarHeight,
            paddingTop: 4,
            paddingBottom: Platform.OS === "ios" ? 20 : 12,
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={isDark ? 80 : 40}
              tint={isDark ? "dark" : "light"}
              style={{ flex: 1, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#F59E0B", "#10B981", "#F59E0B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 2, width: "100%" }}
              />
              <LinearGradient
                colors={
                  isDark
                    ? ["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]
                    : ["rgba(248, 250, 252, 0.95)", "rgba(241, 245, 249, 0.95)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1 }}
              />
            </BlurView>
          ),
        }}
      >
        <BottomTab.Screen
          name="Toptabs"
          component={Home}
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.home}
                focused={focused}
                title={i18n.t("Home")}
                theme={theme}
              />
            ),
          }}
        />

        <BottomTab.Screen
          name="Feed"
          component={Feed}
          options={{
            title: "Feed",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.feed}
                focused={focused}
                title={i18n.t("Feed")}
                theme={theme}
              />
            ),
          }}
        />

        <BottomTab.Screen
          name="Explore"
          component={Explore}
          options={{
            title: "Discover",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.search}
                focused={focused}
                title={i18n.t("Discover")}
                theme={theme}
              />
            ),
          }}
        />

        <BottomTab.Screen
          name="Cart"
          component={Cart}
          options={{
            title: "Cart",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.cart}
                focused={focused}
                title={i18n.t("Cart")}
                theme={theme}
              />
            ),
          }}
        />

        {/* {isPremium && (
          <BottomTab.Screen
            name="Create"
            component={CreatorMode}
            options={{
              title: "Create",
              tabBarIcon: ({ focused }) => (
                <TabIcon
                  icon={icons.upload}
                  focused={focused}
                  title={i18n.t("Create")}
                  theme={theme}
                />
              ),
            }}
          />
        )}
 */}
        <BottomTab.Screen
          name="Profile"
          component={Profile}
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.profile}
                focused={focused}
                title={i18n.t("Profile")}
                theme={theme}
              />
            ),
          }}
        />

        {/* <BottomTab.Screen
          name="Settings"
          component={Settings}
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.settings}
                focused={focused}
                title={i18n.t("Settings")}
                theme={theme}
              />
            ),
          }}
        /> */}
      </BottomTab.Navigator>
    </LinearGradient>
  );
};

export default BottomTabs;
