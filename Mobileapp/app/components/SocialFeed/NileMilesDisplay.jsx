/* eslint-disable react/no-unescaped-entities */
import { Coins, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSocial } from "../../../Context/SocialContext";
import { useTheme } from "../../../Context/ThemeProvider";

/**
 * NileMilesDisplay - Shows user's Miles, level, and rewards
 * Core gamification component for social engagement
 */
export default function NileMilesDisplay({ style, showDetails = false }) {
  const {
    nileMiles,
    userLevel,
    getLevelProgress,
    getUserBadges,
    dailyActions,
    DAILY_LIMITS,
  } = useSocial();
  const { themeStyles, theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [animValue] = useState(new Animated.Value(1));

  const progress = getLevelProgress();
  const badges = getUserBadges();

  // Animate when miles change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(animValue, {
        duration: 200,
        toValue: 1.1,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        duration: 200,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [nileMiles]);

  const formatMiles = (miles) => {
    if (miles >= 1000) {
      return `${(miles / 1000).toFixed(1)}k`;
    }
    return miles.toString();
  };

  const renderCompactView = () => (
    <TouchableOpacity
      style={[
        styles.compactContainer,
        { backgroundColor: themeStyles.cardBackground },
        style,
      ]}
      onPress={() => setShowModal(true)}
    >
      <Animated.View
        style={[styles.milesRow, { transform: [{ scale: animValue }] }]}
      >
        <Coins size={20} color="#FFD700" />
        <Text style={[styles.milesText, { color: themeStyles.text }]}>
          {formatMiles(nileMiles)}
        </Text>
      </Animated.View>

      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>L{userLevel}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDetailedView = () => (
    <View
      style={[
        styles.detailedContainer,
        { backgroundColor: themeStyles.cardBackground },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.milesSection}>
          <Coins size={24} color="#FFD700" />
          <Text style={[styles.milesTitle, { color: themeStyles.text }]}>
            {nileMiles} Miles
          </Text>
        </View>

        <View style={styles.levelSection}>
          <Star size={20} color="#FF6B6B" />
          <Text style={[styles.levelTitle, { color: themeStyles.text }]}>
            Level {userLevel}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={[styles.progressText, { color: themeStyles.text }]}>
          Progress to Level {userLevel + 1}
        </Text>
        <View
          style={[styles.progressBar, { backgroundColor: themeStyles.border }]}
        >
          <View
            style={[styles.progressFill, { width: `${progress.percentage}%` }]}
          />
        </View>
        <Text
          style={[styles.progressNumbers, { color: themeStyles.secondaryText }]}
        >
          {progress.current} / {progress.required} Miles
        </Text>
      </View>

      {/* Daily Actions */}
      <View style={styles.dailySection}>
        <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
          Today's Progress
        </Text>
        <View style={styles.actionRow}>
          <ActionProgress
            icon="❤️"
            label="Likes"
            current={dailyActions.likes}
            max={DAILY_LIMITS.likes}
            theme={themeStyles}
          />
          <ActionProgress
            icon="📤"
            label="Shares"
            current={dailyActions.shares}
            max={DAILY_LIMITS.shares / 5}
            theme={themeStyles}
          />
          <ActionProgress
            icon="📺"
            label="Videos"
            current={dailyActions.videosWatched}
            max={DAILY_LIMITS.videosWatched / 2}
            theme={themeStyles}
          />
        </View>
      </View>

      {/* Badges */}
      {badges.length > 0 && (
        <View style={styles.badgesSection}>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
            Your Badges
          </Text>
          <View style={styles.badgesRow}>
            {badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: themeStyles.background },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={[styles.closeText, { color: themeStyles.text }]}>
              ✕
            </Text>
          </TouchableOpacity>

          {renderDetailedView()}

          <View style={styles.earnMoreSection}>
            <Text style={[styles.earnMoreTitle, { color: themeStyles.text }]}>
              Earn More Miles
            </Text>
            <Text
              style={[
                styles.earnMoreText,
                { color: themeStyles.secondaryText },
              ]}
            >
              • Like posts: 1 Mile each{"\n"}• Share content: 5 Miles each{"\n"}
              • Watch videos: 2 Miles per 30s{"\n"}• Refer friends: 50 Miles
              each
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {showDetails ? renderDetailedView() : renderCompactView()}
      {renderModal()}
    </>
  );
}

const ActionProgress = ({ icon, label, current, max, theme }) => (
  <View style={styles.actionItem}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
    <Text style={[styles.actionCount, { color: theme.secondaryText }]}>
      {current}/{max}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  milesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  milesText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  levelBadge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  levelText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailedContainer: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  milesSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  milesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  levelSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressNumbers: {
    fontSize: 12,
    textAlign: "right",
  },
  dailySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionItem: {
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  badgesSection: {
    marginTop: 16,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  closeText: {
    fontSize: 20,
  },
  earnMoreSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
  },
  earnMoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  earnMoreText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
