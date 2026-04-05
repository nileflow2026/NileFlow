/**
 * CommentsSheet - Bottom sheet for viewing and adding comments on a post.
 * Fetches comments from the API with pagination.
 */

import { MessageCircle, Send, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGlobalContext } from "../../../Context/GlobalProvider";
import { useTheme } from "../../../Context/ThemeProvider";
import {
  addComment,
  deleteComment as apiDeleteComment,
  getComments,
} from "../../../utils/socialApi";

export default function CommentsSheet({ postId, visible, onClose }) {
  const { themeStyles } = useTheme();
  const { user } = useGlobalContext();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await getComments(postId, { limit: 20 });
      setComments(res.comments || []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId, loadComments]);

  const handleSend = async () => {
    if (!text.trim() || sending || !user) return;
    setSending(true);

    try {
      const res = await addComment(postId, {
        text: text.trim(),
        username: user.name || user.username || "Anonymous",
        userAvatar: user.avatar || user.avatarUrl || null,
      });
      if (res.comment) {
        setComments((prev) => [res.comment, ...prev]);
      }
      setText("");
    } catch {
      // Silently fail
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await apiDeleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // Silently fail
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentRow}>
      <Image
        source={{
          uri:
            item.userAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=random`,
        }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentBody}>
        <Text style={[styles.commentUsername, { color: themeStyles.text }]}>
          {item.username}
        </Text>
        <Text style={[styles.commentText, { color: themeStyles.text }]}>
          {item.text}
        </Text>
        <View style={styles.commentMeta}>
          <Text
            style={[styles.commentTime, { color: themeStyles.secondaryText }]}
          >
            {timeAgo(item.$createdAt)}
          </Text>
          {user && item.userId === user.$id && (
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: themeStyles.cardBackground },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <MessageCircle size={20} color={themeStyles.text} />
            <Text style={[styles.headerTitle, { color: themeStyles.text }]}>
              Comments
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={themeStyles.text} />
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={themeStyles.primary}
              style={{ marginTop: 40 }}
            />
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[styles.emptyText, { color: themeStyles.secondaryText }]}
              >
                No comments yet. Be the first!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input */}
          {user ? (
            <View
              style={[styles.inputRow, { borderTopColor: themeStyles.border }]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: themeStyles.text,
                    backgroundColor: themeStyles.background,
                  },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={themeStyles.secondaryText}
                value={text}
                onChangeText={setText}
                maxLength={1000}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!text.trim() || sending}
                style={[
                  styles.sendButton,
                  { opacity: text.trim() && !sending ? 1 : 0.4 },
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FF4458" />
                ) : (
                  <Send size={20} color="#FF4458" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.signInPrompt}>
              <Text
                style={[
                  styles.signInText,
                  { color: themeStyles.secondaryText },
                ]}
              >
                Sign in to comment
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  commentList: {
    paddingBottom: 8,
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentBody: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  commentTime: {
    fontSize: 12,
  },
  deleteText: {
    fontSize: 12,
    color: "#FF4458",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },
  sendButton: {
    padding: 8,
  },
  signInPrompt: {
    paddingVertical: 16,
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
  },
});
