import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const RatingModal = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const { themeStyles } = useTheme();

  // Responsive styles
  const modalWidth = width < 350 ? "90%" : "80%";
  const starSize = width < 350 ? 40 : 52;
  const buttonPaddingHorizontal = width < 350 ? 8 : 16;
  const buttonPaddingVertical = width < 350 ? 8 : 12;

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <LinearGradient
          colors={["#1e293b", "#334155"]}
          style={{
            width: modalWidth,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: "#fbbf24",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#fbbf24",
                marginBottom: 8,
              }}
            >
              Rate This Product
            </Text>
            <Text
              style={{ fontSize: 14, color: "#e5e7eb", textAlign: "center" }}
            >
              Share your experience with this premium product
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 24,
              gap: 8,
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={{
                  transform: [{ scale: star <= rating ? 1.1 : 1 }],
                  opacity: star <= rating ? 1 : 0.5,
                }}
              >
                <MaterialIcons
                  name={star <= rating ? "star" : "star-border"}
                  size={starSize}
                  color={star <= rating ? "#fbbf24" : "#6b7280"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={onClose} style={{ flex: 1 }}>
              <LinearGradient
                colors={["#dc2626", "#b91c1c"]}
                style={{
                  paddingHorizontal: buttonPaddingHorizontal,
                  paddingVertical: buttonPaddingVertical + 4,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Cancel
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSubmit(rating)}
              style={{ flex: 1 }}
              disabled={rating === 0}
            >
              <LinearGradient
                colors={
                  rating > 0 ? ["#f59e0b", "#d97706"] : ["#6b7280", "#4b5563"]
                }
                style={{
                  paddingHorizontal: buttonPaddingHorizontal,
                  paddingVertical: buttonPaddingVertical + 4,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: rating > 0 ? 1 : 0.5,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Submit Rating
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default RatingModal;
