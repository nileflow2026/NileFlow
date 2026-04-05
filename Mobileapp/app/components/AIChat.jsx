import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import aiChatService from "../../utils/aiChatService";

const AIChat = ({ showChat = false, onClose }) => {
  const { user } = useGlobalContext();
  const { themeStyles, theme } = useTheme();
  const isDark = theme === "dark";

  const [open, setOpen] = useState(showChat);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 Welcome to Nile AI Assistant! I'm here to help you with:\n\n📦 Orders & Tracking\n💳 Payments & Billing\n🔍 Product Search\n🎁 Promotions & Deals\n❓ General Questions\n\nWhat can I help you with today?`,
      timestamp: new Date().toISOString(),
      isSystemMessage: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const suggestedReplies = aiChatService.getSuggestedReplies();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (messageText = input) => {
    if (!messageText || !messageText.trim() || loading) return;

    const userId = (user && (user._id || user.userId)) || "guest";

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically append user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Ensure service initialized for this user
      if (!aiChatService.userProfiles[userId]) {
        try {
          await aiChatService.initialize(userId);
        } catch (initErr) {
          console.log("AI service init error:", initErr);
        }
      }

      const response = await aiChatService.sendMessage(messageText, userId);

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Optional: Speak response for accessibility
      if (Platform.OS !== "web") {
        try {
          await Speech.speak(response, {
            language: "en-US",
            pitch: 1.0,
            rate: 0.9,
          });
        } catch (error) {
          console.log("Speech error:", error);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        role: "assistant",
        content: `Sorry, I encountered an issue: ${error.message || error}. Please try again.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    const bgColor = isUser
      ? isDark
        ? "#1e40af"
        : "#3b82f6"
      : isDark
        ? "#374151"
        : "#e5e7eb";
    const textColor = isUser ? "#fff" : isDark ? "#f3f4f6" : "#1f2937";

    return (
      <View
        style={[
          styles.messageWrapper,
          { justifyContent: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: bgColor,
              borderBottomRightRadius: isUser ? 0 : 16,
              borderBottomLeftRadius: isUser ? 16 : 0,
            },
          ]}
        >
          <Text style={[styles.messageText, { color: textColor }]}>
            {item.content}
          </Text>

          {item.role === "assistant" && !item.isSystemMessage && (
            <View style={styles.messageActions}>
              <TouchableOpacity
                onPress={() => Speech.speak(item.content)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>🔊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // Copy to clipboard (would need react-native-clipboard)
                  console.log("Copied:", item.content);
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>📋</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Chat Window Container - Only visible when open */}
      {open && (
        <View
          style={[
            styles.chatWindow,
            { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
            ]}
          >
            <View>
              <Text style={[styles.headerTitle, { color: themeStyles.text }]}>
                🤖 Nile AI Assistant
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { color: themeStyles.textSecondary },
                ]}
              >
                Always here to help
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setOpen(false);
                if (onClose) onClose();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages Area */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.messagesContent}
            scrollIndicatorInsets={{ right: 1 }}
          />

          {/* Suggested Replies */}
          {messages.length <= 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsContainer}
            >
              {suggestedReplies.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionButton,
                    { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
                  ]}
                  onPress={() => handleSendMessage(suggestion.message)}
                >
                  <Text
                    style={[styles.suggestionText, { color: themeStyles.text }]}
                    numberOfLines={2}
                  >
                    {suggestion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={isDark ? "#3b82f6" : "#1e40af"}
              />
              <Text
                style={[
                  styles.loadingText,
                  { color: themeStyles.textSecondary },
                ]}
              >
                Assistant is typing...
              </Text>
            </View>
          )}

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
              styles.inputContainer,
              { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: themeStyles.text,
                  borderColor: isDark ? "#374151" : "#e5e7eb",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                },
              ]}
              placeholder="Ask me anything..."
              placeholderTextColor={themeStyles.textSecondary}
              value={input}
              onChangeText={setInput}
              editable={!loading}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: loading || !input.trim() ? 0.5 : 1 },
              ]}
              onPress={() => handleSendMessage()}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Floating Action Button - Always Visible */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
        style={[
          styles.fab,
          { backgroundColor: isDark ? "#1e40af" : "#3b82f6" },
        ]}
      >
        <Text style={styles.fabIcon}>{open ? "✕" : "🤖"}</Text>
        {!open && <Text style={styles.fabLabel}>Chat</Text>}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  chatWindow: {
    position: "absolute",
    bottom: 170,
    right: 16,
    width: 340,
    height: 600,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1001,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1002,
    flexDirection: "column",
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  fabLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    marginTop: 2,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "400",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messagesContent: {
    padding: 12,
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: "row",
    marginVertical: 8,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  messageActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 60,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 80,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputContainer: {
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default AIChat;
