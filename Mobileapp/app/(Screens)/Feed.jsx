import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import NileMilesDisplay from "../components/SocialFeed/NileMilesDisplay";
import SocialFeed from "../components/SocialFeed/SocialFeed";

/**
 * Feed - Main social commerce feed screen
 * Replaces traditional home screen with TikTok-style vertical scroll
 * Core engagement hub for Nile Mart social commerce experience
 */
export default function Feed() {
  const { themeStyles, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Nile Miles display - floating on top */}
      <View style={styles.milesContainer}>
        <NileMilesDisplay />
      </View>

      <SocialFeed />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  milesContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
});
