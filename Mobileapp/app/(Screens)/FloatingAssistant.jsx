/* eslint-disable no-unused-vars */
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "react-native-paper";
import axiosClient from "../../api";
import { useGlobalContext } from "../../Context/GlobalProvider";

const FloatingAssistant = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const { user } = useGlobalContext();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      // Save question in backend
      const res = await axiosClient.post(
        "/api/nilemart/questions/askedquestions",
        {
          userId: user.userId,
          question: userMessage.content,
        }
      );

      const aiAnswer =
        res.data.answer || "I'm still learning. Please rephrase your question.";

      const assistantMessage = {
        role: "assistant",
        content: aiAnswer,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Optional: Speak response
      Speech.speak(aiAnswer);
    } catch (error) {
      console.error("AI Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      {item.role === "assistant" && (
        <TouchableOpacity
          onPress={() => {
            Speech.speak(item.content, {
              rate: 1.0,
              pitch: 1.0,
              language: "en-US",
            });
          }}
        >
          <Text style={styles.listenText}>🔊 Listen</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {open && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.panel}
        >
          <Text style={styles.title}>👋 Welcome to Nile Mart!</Text>
          <Text style={styles.subtitle}>Ask me anything about the app.</Text>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
          />

          {loading && (
            <Text style={styles.typingText}>Nile Assistant is typing...</Text>
          )}

          {/* Text input */}
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Type your question..."
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendText}>Ask</Text>
          </TouchableOpacity>

          {/* Predefined help buttons */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Searchscreen")}
          >
            <Text style={styles.optionText}>🔍 Search Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.optionText}>🛒 View Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("OrdersScreen")}
          >
            <Text style={styles.optionText}>📦 Track Orders</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      <FAB
        icon={open ? "close" : "robot-happy"}
        label={open ? "" : "Ask Nile"}
        onPress={() => {
          setOpen(!open);
          setResponse("");
          setQuestion("");
        }}
        style={styles.fab}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    backgroundColor: "#8B4513",
  },
  panel: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: 300,
    height: 480,
    elevation: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  chatContainer: {
    flexGrow: 1,
    marginBottom: 10,
  },
  messageContainer: {
    borderRadius: 10,
    padding: 8,
    marginVertical: 4,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  assistantMessage: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  listenText: {
    marginTop: 6,
    color: "#007AFF",
    fontSize: 13,
  },
  typingText: {
    fontStyle: "italic",
    fontSize: 13,
    marginBottom: 6,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  sendButton: {
    backgroundColor: "#8B4513",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
  option: {
    marginTop: 6,
  },
  optionText: {
    color: "#007BFF",
    fontSize: 14,
  },
});

export default FloatingAssistant;
