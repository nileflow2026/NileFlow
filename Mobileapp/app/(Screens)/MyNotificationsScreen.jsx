import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "../../api";
import {
  getCustomerNotification,
  useGlobalContext,
} from "../../Context/GlobalProvider";
import { useNotification } from "../../Context/NotificationContext";
import {
  applyMuteSetting,
  MUTE_SOUND_KEY,
} from "../../hooks/usePushNotifications";

export default function MyNotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const { setNotificationCount } = useNotification();
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, important, promotions
  const [showSettings, setShowSettings] = useState(false);
  const [muteSound, setMuteSound] = useState(false);

  // Load persisted mute preference on mount
  useEffect(() => {
    AsyncStorage.getItem(MUTE_SOUND_KEY).then((val) => {
      if (val === "true") setMuteSound(true);
    });
  }, []);

  const handleToggleMute = async (newValue) => {
    setMuteSound(newValue);
    await applyMuteSetting(newValue);
  };

  useFocusEffect(
    useCallback(() => {
      const markAllAsRead = async () => {
        if (!user) return;

        try {
          await axiosClient.post("/api/customernotifications/mark-read");
          setNotificationCount(0);
        } catch (error) {
          console.error(
            "❌ Error marking notifications as read:",
            error.message,
          );
        }
      };
      markAllAsRead();
    }, [user, setNotificationCount]),
  );

  // Refresh notifications list every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getCustomerNotification()
        .then((data) => setNotifications(data))
        .catch(() => {});
    }, [user]),
  );

  useEffect(() => {
    const initNotifications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const notificationsData = await getCustomerNotification();
        setNotifications(notificationsData);
        setNotificationCount(notificationsData.length);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error.message);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();
  }, [user, setNotificationCount]);

  // Helper functions
  const handleMarkAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((note) =>
        note.$id === notificationId ? { ...note, read: true } : note,
      ),
    );

    try {
      await axiosClient.post(
        `/api/customernotifications/${notificationId}/read`,
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((note) => ({ ...note, read: true })));

    try {
      await axiosClient.post("/api/customernotifications/mark-all-read");
      setNotificationCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setNotifications((prev) =>
              prev.filter((note) => note.$id !== notificationId),
            );
            try {
              await axiosClient.delete(
                `/api/customernotifications/${notificationId}`,
              );
            } catch (error) {
              console.error("Failed to delete notification:", error);
            }
          },
        },
      ],
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setNotifications([]);
            try {
              await axiosClient.post("/api/customernotifications/clear-all");
              setNotificationCount(0);
            } catch (error) {
              console.error("Failed to clear all:", error);
            }
          },
        },
      ],
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "important") return notification.priority === "high";
    if (filter === "promotions") return notification.type === "promotion";
    return true;
  });

  const getNotificationIcon = (type, priority) => {
    if (priority === "high") return "priority-high";
    if (type === "order") return "local-shipping";
    if (type === "promotion") return "local-offer";
    if (type === "message") return "message";
    return "notifications";
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "high") return ["#dc2626", "#991b1b"];
    if (type === "order") return ["#d97706", "#92400e"];
    if (type === "promotion") return ["#ca8a04", "#a16207"];
    if (type === "message") return ["#2563eb", "#1d4ed8"];
    return ["#059669", "#047857"];
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#111827", "#000000", "#111827"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Controls Bar */}
          <LinearGradient
            colors={["#1f2937", "#000000", "#1f2937"]}
            style={styles.controlsBar}
          >
            <View style={styles.filterButtons}>
              <TouchableOpacity
                onPress={() => setFilter("all")}
                style={[
                  styles.filterButton,
                  filter === "all" && styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "all" && styles.activeFilterButtonText,
                  ]}
                >
                  All Notifications
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilter("unread")}
                style={[
                  styles.filterButton,
                  filter === "unread" && styles.activeFilterButtonUnread,
                ]}
              >
                <MaterialIcons
                  name="visibility"
                  size={16}
                  color={filter === "unread" ? "#ffffff" : "#9ca3af"}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "unread" && styles.activeFilterButtonText,
                  ]}
                >
                  Unread
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilter("important")}
                style={[
                  styles.filterButton,
                  filter === "important" && styles.activeFilterButtonImportant,
                ]}
              >
                <MaterialIcons
                  name="stars"
                  size={16}
                  color={filter === "important" ? "#ffffff" : "#9ca3af"}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "important" && styles.activeFilterButtonText,
                  ]}
                >
                  Important
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => setShowSettings(!showSettings)}
                style={styles.settingsButton}
              >
                <MaterialIcons name="settings" size={20} color="#fbbf24" />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.markAllButton}
              >
                <MaterialIcons name="done-all" size={20} color="#ffffff" />
                <Text style={styles.markAllButtonText}>Mark All Read</Text>
              </TouchableOpacity>
            </View>

            {/* Settings Panel */}
            {showSettings && (
              <View style={styles.settingsPanel}>
                <View style={styles.settingsGrid}>
                  <LinearGradient
                    colors={["#1f2937", "#000000"]}
                    style={styles.settingCard}
                  >
                    <View style={styles.settingHeader}>
                      <Text style={styles.settingTitle}>
                        Notification Sound
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleToggleMute(!muteSound)}
                        style={[
                          styles.soundToggle,
                          muteSound
                            ? styles.soundToggleMuted
                            : styles.soundToggleActive,
                        ]}
                      >
                        <MaterialIcons
                          name={muteSound ? "volume-off" : "volume-up"}
                          size={20}
                          color={muteSound ? "#ef4444" : "#10b981"}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.settingDescription}>
                      {muteSound ? "Sounds are muted" : "Sounds are enabled"}
                    </Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={["#1f2937", "#000000"]}
                    style={styles.settingCard}
                  >
                    <Text style={styles.settingTitle}>Quick Actions</Text>
                    <TouchableOpacity
                      onPress={handleClearAll}
                      style={styles.clearButton}
                    >
                      <MaterialIcons
                        name="delete-sweep"
                        size={16}
                        color="#fca5a5"
                      />
                      <Text style={styles.clearButtonText}>
                        Clear All Notifications
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            )}
          </LinearGradient>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#fbbf24" />
                <MaterialIcons
                  name="notifications"
                  size={40}
                  color="#fbbf24"
                  style={styles.loadingIcon}
                />
              </View>
              <Text style={styles.loadingTitle}>Loading Notifications</Text>
              <Text style={styles.loadingDescription}>
                Fetching your premium alerts...
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsContainer}>
              {/* Notifications List */}
              <View style={styles.notificationsList}>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <LinearGradient
                      key={notification.$id}
                      colors={getNotificationColor(
                        notification.type,
                        notification.priority,
                      )}
                      style={[
                        styles.notificationCard,
                        !notification.read && styles.unreadNotificationCard,
                      ]}
                    >
                      <View style={styles.notificationContent}>
                        {/* Notification Icon */}
                        <View
                          style={[
                            styles.notificationIcon,
                            notification.read
                              ? styles.readNotificationIcon
                              : styles.unreadNotificationIcon,
                          ]}
                        >
                          <MaterialIcons
                            name={getNotificationIcon(
                              notification.type,
                              notification.priority,
                            )}
                            size={24}
                            color={notification.read ? "#9ca3af" : "#ffffff"}
                          />
                        </View>

                        {/* Message Content */}
                        <View style={styles.messageContent}>
                          <View style={styles.messageHeader}>
                            <Text
                              style={[
                                styles.messageText,
                                notification.read
                                  ? styles.readMessageText
                                  : styles.unreadMessageText,
                              ]}
                            >
                              {notification.message}
                            </Text>
                            <View style={styles.messageTimestamp}>
                              <MaterialIcons
                                name="access-time"
                                size={12}
                                color="#9ca3af"
                              />
                              <Text style={styles.timestampText}>
                                {new Date(
                                  notification.timestamp ||
                                    notification.$createdAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.messageDescription}>
                            {notification.description ||
                              "Premium African marketplace update"}
                          </Text>

                          {!notification.read && (
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>NEW</Text>
                            </View>
                          )}

                          {/* Action Buttons */}
                          <View style={styles.notificationActions}>
                            {!notification.read && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleMarkAsRead(notification.$id)
                                }
                                style={styles.markReadButton}
                              >
                                <MaterialIcons
                                  name="done"
                                  size={16}
                                  color="#ffffff"
                                />
                                <Text style={styles.markReadButtonText}>
                                  Mark as Read
                                </Text>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity
                              onPress={() =>
                                handleDeleteNotification(notification.$id)
                              }
                              style={styles.deleteButton}
                            >
                              <MaterialIcons
                                name="delete"
                                size={16}
                                color="#fca5a5"
                              />
                              <Text style={styles.deleteButtonText}>
                                Delete
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Status Indicator */}
                        <View
                          style={[
                            styles.statusIndicator,
                            notification.read
                              ? styles.readStatusIndicator
                              : styles.unreadStatusIndicator,
                          ]}
                        />
                      </View>
                    </LinearGradient>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <LinearGradient
                      colors={["#92400e", "#059669"]}
                      style={styles.emptyIcon}
                    >
                      <MaterialIcons
                        name="notifications"
                        size={48}
                        color="#fbbf24"
                      />
                    </LinearGradient>
                    <Text style={styles.emptyTitle}>No Notifications</Text>
                    <Text style={styles.emptyDescription}>
                      {filter === "all"
                        ? "You're all caught up! Check back later for updates on your orders and exclusive African product deals."
                        : `No ${filter} notifications at the moment.`}
                    </Text>
                    {filter !== "all" && (
                      <TouchableOpacity
                        onPress={() => setFilter("all")}
                        style={styles.viewAllButton}
                      >
                        <Text style={styles.viewAllButtonText}>
                          View All Notifications
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#1f2937", "#000000"]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalSettingItem}>
                <View style={styles.modalSettingInfo}>
                  <Text style={styles.modalSettingTitle}>
                    Sound Notifications
                  </Text>
                  <Text style={styles.modalSettingDescription}>
                    Play sound when new notifications arrive
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleMute(!muteSound)}
                  style={[
                    styles.modalToggle,
                    muteSound ? styles.modalToggleOff : styles.modalToggleOn,
                  ]}
                >
                  <MaterialIcons
                    name={muteSound ? "volume-off" : "volume-up"}
                    size={20}
                    color={muteSound ? "#ef4444" : "#10b981"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  controlsBar: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    flexDirection: "row",
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#d97706",
    borderColor: "#fbbf24",
  },
  activeFilterButtonUnread: {
    backgroundColor: "#059669",
    borderColor: "#10b981",
  },
  activeFilterButtonImportant: {
    backgroundColor: "#dc2626",
    borderColor: "#ef4444",
  },
  filterIcon: {
    marginRight: 8,
  },
  filterButtonText: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  settingsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(146, 64, 14, 0.3)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.4)",
  },
  settingsButtonText: {
    color: "#fbbf24",
    fontWeight: "600",
    marginLeft: 8,
  },
  markAllButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#059669",
    borderRadius: 12,
  },
  markAllButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  settingsPanel: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(251, 191, 36, 0.2)",
  },
  settingsGrid: {
    gap: 16,
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  settingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 16,
  },
  soundToggle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  soundToggleMuted: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  soundToggleActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  settingDescription: {
    color: "#d1d5db",
    fontSize: 14,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    marginTop: 12,
  },
  clearButtonText: {
    color: "#fca5a5",
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 128,
  },
  loadingSpinner: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    position: "absolute",
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
    marginTop: 32,
  },
  loadingDescription: {
    color: "#9ca3af",
    marginTop: 8,
  },
  notificationsContainer: {
    paddingHorizontal: 16,
  },
  notificationsList: {
    gap: 16,
  },
  notificationCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  unreadNotificationCard: {
    borderColor: "rgba(251, 191, 36, 0.5)",
    shadowColor: "#fbbf24",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationContent: {
    flexDirection: "row",
    padding: 24,
    gap: 24,
    position: "relative",
  },
  notificationIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  readNotificationIcon: {
    backgroundColor: "rgba(31, 41, 55, 1)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  unreadNotificationIcon: {
    backgroundColor: "#d97706",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 16,
  },
  readMessageText: {
    color: "#d1d5db",
  },
  unreadMessageText: {
    color: "#ffffff",
  },
  messageTimestamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestampText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  messageDescription: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  newBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  newBadgeText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "bold",
  },
  notificationActions: {
    flexDirection: "row",
    gap: 16,
  },
  markReadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#059669",
    borderRadius: 12,
  },
  markReadButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  deleteButtonText: {
    color: "#fca5a5",
    fontSize: 14,
    marginLeft: 8,
  },
  statusIndicator: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  readStatusIndicator: {
    backgroundColor: "#4b5563",
  },
  unreadStatusIndicator: {
    backgroundColor: "#fbbf24",
    shadowColor: "#fbbf24",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 128,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  emptyTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  emptyDescription: {
    color: "#9ca3af",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 32,
    lineHeight: 22,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#d97706",
    borderRadius: 12,
  },
  viewAllButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  modalBody: {
    gap: 20,
  },
  modalSettingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSettingInfo: {
    flex: 1,
    marginRight: 16,
  },
  modalSettingTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalSettingDescription: {
    color: "#9ca3af",
    fontSize: 14,
  },
  modalToggle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalToggleOff: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  modalToggleOn: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
};
