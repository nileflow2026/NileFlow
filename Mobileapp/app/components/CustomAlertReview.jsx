import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const CustomAlertReview = ({ isVisible, onClose, onSignUp }) => {
  const router = useRouter();

  const handleSignUp = () => {
    onSignUp();
    router.push("/(auth)/sign-up");
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
      >
        <LinearGradient
          colors={["#1e293b", "#334155"]}
          style={{
            borderRadius: 24,
            padding: 24,
            alignItems: "center",
            width: "85%",
            borderWidth: 1,
            borderColor: "#fbbf24",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 8,
                textAlign: "center",
                color: "#fbbf24",
              }}
            >
              Sign Up Required
            </Text>
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                color: "#e5e7eb",
                lineHeight: 22,
              }}
            >
              To proceed with your review, please create an account and join our
              premium community.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              width: "100%",
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ flex: 1 }}>
              <LinearGradient
                colors={["#dc2626", "#b91c1c"]}
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Cancel
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignUp} style={{ flex: 1 }}>
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Sign Up
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default CustomAlertReview;
