/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../Context/GlobalProvider";
import AddressService from "../../utils/AddressService";
import { reverseGeocode } from "../../utils/geocoding";

const { width } = Dimensions.get("window");

const Addresses = () => {
  const { user } = useGlobalContext();
  const [addresses, setAddresses] = useState([]);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user?.userId) return;
    const fetched = await AddressService.getAddresses(user.userId);
    setAddresses(fetched || []);
  };

  const handleAddAddress = async () => {
    if (!newAddress.phone || !newAddress.address) {
      Alert.alert(
        "Missing Fields",
        "Please fill in the phone and address fields.",
      );
      return;
    }
    const newAddressData = {
      ...newAddress,
      fullName: user?.username || user?.name || "",
    };
    const added = await AddressService.addAddress(user.userId, newAddressData);
    if (added) {
      setAddresses((prev) => [...prev, added]);
      setNewAddress({
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
      setModalVisible(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    Alert.alert("Delete Address", "Remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const ok = await AddressService.deleteAddress(id);
          if (ok) setAddresses((prev) => prev.filter((a) => a.$id !== id));
        },
      },
    ]);
  };

  const saveMapAddressToAppwrite = async (locationData) => {
    if (!user?.$id) {
      Alert.alert(
        "Authentication Required",
        "Please log in to save addresses.",
      );
      return;
    }
    try {
      const newAddressData = {
        userId: user.$id,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.formattedAddress,
      };
      const added = await AddressService.addAddress(user.$id, newAddressData);
      if (added) {
        setAddresses((prev) => [...prev, added]);
        Alert.alert("Success", "Address saved successfully!");
      } else {
        Alert.alert("Error", "Failed to save address.");
      }
    } catch (error) {
      console.error("Error saving map address:", error);
      Alert.alert("Error", "Failed to save address. Please try again.");
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    marginBottom: 10,
    fontSize: 14,
  };

  return (
    <LinearGradient
      colors={["#111827", "#000000", "#111827"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F59E0B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Your Addresses</Text>
            <Text style={styles.headerSubtitle}>
              Manage your delivery addresses
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {addresses.length === 0 ? (
            <LinearGradient
              colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
              style={styles.emptyCard}
            >
              <MaterialIcons
                name="location-off"
                size={48}
                color="rgba(245,158,11,0.4)"
              />
              <Text style={styles.emptyText}>No addresses saved yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to add your first address
              </Text>
            </LinearGradient>
          ) : (
            addresses.map((item) => (
              <LinearGradient
                key={item.$id}
                colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
                style={styles.addressCard}
              >
                <View style={styles.addressCardRow}>
                  <View style={styles.addressIconBox}>
                    <MaterialIcons
                      name="location-on"
                      size={22}
                      color="#F59E0B"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {item.fullName ? (
                      <Text style={styles.addressName}>{item.fullName}</Text>
                    ) : null}
                    <Text style={styles.addressText}>{item.address}</Text>
                    {item.city || item.state ? (
                      <Text style={styles.addressMeta}>
                        {[item.city, item.state, item.zipCode, item.country]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    ) : null}
                    {item.phone ? (
                      <Text style={styles.addressPhone}>{item.phone}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(item.$id)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            ))
          )}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Address Modal */}
        <Modal transparent animationType="slide" visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={["rgba(15, 23, 42, 0.98)", "rgba(30, 41, 59, 0.98)"]}
              style={styles.modalCard}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Address</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#6B7280"
                value={user?.username || user?.name || ""}
                editable={false}
                style={[inputStyle, { color: "#9CA3AF" }]}
              />
              <TextInput
                placeholder="Phone *"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={newAddress.phone}
                onChangeText={(t) => setNewAddress({ ...newAddress, phone: t })}
                style={inputStyle}
              />
              <TextInput
                placeholder="Address *"
                placeholderTextColor="#6B7280"
                value={newAddress.address}
                onChangeText={(t) =>
                  setNewAddress({ ...newAddress, address: t })
                }
                style={inputStyle}
              />
              <TextInput
                placeholder="City"
                placeholderTextColor="#6B7280"
                value={newAddress.city}
                onChangeText={(t) => setNewAddress({ ...newAddress, city: t })}
                style={inputStyle}
              />
              <TextInput
                placeholder="State / Region"
                placeholderTextColor="#6B7280"
                value={newAddress.state}
                onChangeText={(t) => setNewAddress({ ...newAddress, state: t })}
                style={inputStyle}
              />
              <TextInput
                placeholder="ZIP / Postal Code"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={newAddress.zipCode}
                onChangeText={(t) =>
                  setNewAddress({ ...newAddress, zipCode: t })
                }
                style={inputStyle}
              />
              <TextInput
                placeholder="Country"
                placeholderTextColor="#6B7280"
                value={newAddress.country}
                onChangeText={(t) =>
                  setNewAddress({ ...newAddress, country: t })
                }
                style={inputStyle}
              />

              <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={{ color: "#9CA3AF", fontWeight: "600" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddAddress}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={["#F59E0B", "#D97706"]}
                    style={styles.saveButton}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                    >
                      Save Address
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: width < 350 ? 18 : 20,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
    padding: 40,
    alignItems: "center",
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    color: "#F3F4F6",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
  addressCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.25)",
    padding: 16,
    marginBottom: 12,
  },
  addressCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  addressName: {
    color: "#FCD34D",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  addressText: {
    color: "#F3F4F6",
    fontSize: 14,
    lineHeight: 20,
  },
  addressMeta: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 3,
  },
  addressPhone: {
    color: "#6EE7B7",
    fontSize: 13,
    marginTop: 3,
  },
  deleteButton: {
    padding: 4,
  },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    borderRadius: 32,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#FCD34D",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});

export default Addresses;
