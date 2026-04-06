/**
 * CommentsSheet - Bottom sheet for viewing and adding comments on a post.
 * Fetches comments from the API with pagination.
 */

import { Heart, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import {
  addComment,
  deleteComment as apiDeleteComment,
  getComments,
} from "../../../utils/socialApi";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const DEFAULT_AVATAR =
  "https://fra.cloud.appwrite.io/v1/storage/buckets/692a3b700039c02fb4bc/files/695439130011158bb8af/view?project=6926c7df002fa7831d94";

export default function CommentsSheet({ postId, visible, onClose }) {
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

  const [likedComments, setLikedComments] = useState({});

  const toggleLikeComment = (commentId) => {
    setLikedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentRow}>
      <Image
        source={{
          uri: item.userAvatar || DEFAULT_AVATAR,
        }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentBody}>
        <Text style={styles.commentTextWrap}>
          <Text style={styles.commentUsername}>{item.username} </Text>
          {item.text}
        </Text>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{timeAgo(item.$createdAt)}</Text>
          <TouchableOpacity>
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
          {user && item.userId === user.$id && (
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.commentLikeButton}
        onPress={() => toggleLikeComment(item.id)}
      >
        <Heart
          size={14}
          color={likedComments[item.id] ? "#FF3040" : "#8E8E8E"}
          fill={likedComments[item.id] ? "#FF3040" : "none"}
        />
      </TouchableOpacity>
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
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#F5F5F5" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerDivider} />

          {/* Comments list */}
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#8E8E8E"
              style={{ marginTop: 40 }}
            />
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptySubtitle}>Start the conversation.</Text>
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
            <View style={styles.inputRow}>
              <Image
                source={{
                  uri: user.avatar || user.avatarUrl || DEFAULT_AVATAR,
                }}
                style={styles.inputAvatar}
              />
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="#8E8E8E"
                value={text}
                onChangeText={setText}
                maxLength={1000}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!text.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#0095F6" />
                ) : (
                  <Text
                    style={[
                      styles.postButton,
                      { opacity: text.trim() ? 1 : 0.4 },
                    ]}
                  >
                    Post
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>Log in to comment</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 8,
    backgroundColor: "#262626",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4A4A4A",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    position: "relative",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    color: "#F5F5F5",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 10,
    padding: 4,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#3A3A3A",
  },
  commentList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
    marginRight: 8,
  },
  commentTextWrap: {
    fontSize: 14,
    lineHeight: 20,
    color: "#F5F5F5",
  },
  commentUsername: {
    fontWeight: "700",
    fontSize: 14,
    color: "#F5F5F5",
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },
  commentTime: {
    fontSize: 12,
    color: "#A8A8A8",
  },
  replyText: {
    fontSize: 12,
    color: "#A8A8A8",
    fontWeight: "600",
  },
  deleteText: {
    fontSize: 12,
    color: "#ED4956",
    fontWeight: "600",
  },
  commentLikeButton: {
    paddingTop: 8,
    paddingLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F5F5F5",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#A8A8A8",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#3A3A3A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3A3A3A",
    color: "#F5F5F5",
    backgroundColor: "#1C1C1E",
  },
  postButton: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0095F6",
  },
  signInPrompt: {
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#3A3A3A",
  },
  signInText: {
    fontSize: 14,
    color: "#A8A8A8",
  },
});
