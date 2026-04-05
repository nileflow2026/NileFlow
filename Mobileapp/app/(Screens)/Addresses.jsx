/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchUserName } from "../../Appwrite";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";
import AddressService from "../../utils/AddressService";
import { reverseGeocode } from "../../utils/geocoding";

const { width } = Dimensions.get("window");

const Addresses = () => {
  const { user } = useGlobalContext();
  const [addresses, setAddresses] = useState([]);
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isAddNewModalVisible, setIsAddNewModalVisible] = useState(false);
  const { themeStyles } = useTheme();
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    const fetchuserName = async () => {
      try {
        const user = await fetchUserName();
        setUserName(user.username);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchuserName();
  }, []);

  const fetchAddresses = async () => {
    if (!user) return;
    const fetchedAddresses = await AddressService.getAddresses(user.userId);
    setAddresses(fetchedAddresses);
  };

  const handleAddAddress = async () => {
    if (!newAddress.phone || !newAddress.address) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const newAddressData = { ...newAddress, fullName: userName };
    const addedAddress = await AddressService.addAddress(
      user.userId,
      newAddressData
    );
    if (addedAddress) {
      setAddresses([...addresses, addedAddress]);
      setNewAddress({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
    }
  };

  const handleDeleteAddress = async (id) => {
    const confirmed = await AddressService.deleteAddress(id);
    if (confirmed) {
      setAddresses(addresses.filter((item) => item.$id !== id));
    }
  };

  const handleLocationSelect = async (coordinate) => {
    setIsMapModalVisible(false); // Close the map modal after selection
    const address = await reverseGeocode(
      coordinate.latitude,
      coordinate.longitude
    );
    if (address) {
      // You can choose to directly save here or show a confirmation to the user
      saveMapAddressToAppwrite({ ...coordinate, formattedAddress: address });
    } else {
      Alert.alert("Error", "Could not retrieve address for this location.");
    }
  };

  const saveMapAddressToAppwrite = async (locationData) => {
    if (!user?.$id) {
      Alert.alert(
        "Authentication Required",
        "Please log in to save addresses."
      );
      return;
    }
    try {
      const newAddressData = {
        userId: user.$id,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.formattedAddress,
        // You might want to add a label or other details later
      };
      const addedAddress = await AddressService.addAddress(
        user.$id,
        newAddressData
      );
      if (addedAddress) {
        setAddresses([...addresses, addedAddress]);
        Alert.alert("Success", "Address saved successfully!");
      } else {
        Alert.alert("Error", "Failed to save address.");
      }
    } catch (error) {
      console.error("Error saving map address:", error);
      Alert.alert("Error", "Failed to save address. Please try again.");
    }
  };

  // Responsive styles
  const titleFontSize = width < 350 ? 18 : 20;
  const addressTextFontSize = width < 350 ? 14 : 16;
  const itemPadding = width < 350 ? 12 : 16;
  const itemMarginBottom = width < 350 ? 8 : 12;
  const modalPadding = width < 350 ? 16 : 20;
  const inputPadding = width < 350 ? 10 : 12;
  const buttonPadding = width < 350 ? 8 : 12;
  const buttonFontSize = width < 350 ? 14 : 16;

  return (
    <SafeAreaView
      className="bg-black h-full px-4"
      style={{ backgroundColor: "#0f172a" }}
    >
      <View className="flex-row items-center justify-between mb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="keyboard-arrow-left"
            size={45}
            color={"#8C3E14"}
          />
        </TouchableOpacity>
        <Text
          className="text-white font-semibold"
          style={{ fontSize: titleFontSize }}
        >
          Your Addresses
        </Text>
        <View className="w-12" />
      </View>
      <View style={{ flex: 1 }}></View>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-6 bg-[#8C3E14] p-4 rounded-full shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View
          className="flex-1 justify-center bg-opacity-80"
          style={{ padding: modalPadding, backgroundColor: themeStyles.accent }}
        >
          <View className="bg-white rounded-lg p-5">
            <Text
              className="text-black font-bold mb-3"
              style={{ fontSize: titleFontSize }}
            >
              Add New Address
            </Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="white"
              className="rounded mb-2 text-white-100"
              value={user.username}
              editable={false}
              style={{
                padding: inputPadding,
                backgroundColor: themeStyles.accent2,
              }}
            />
            <TextInput
              placeholder="Phone"
              placeholderTextColor="white"
              className="rounded mb-2 text-white-100"
              value={newAddress.phone}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, phone: text })
              }
              style={{
                padding: inputPadding,
                backgroundColor: themeStyles.accent2,
              }}
            />
            <TextInput
              placeholder="Address"
              placeholderTextColor="white"
              className="rounded mb-2 text-white-100"
              value={newAddress.address}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, address: text })
              }
              style={{
                padding: inputPadding,
                backgroundColor: themeStyles.accent2,
              }}
            />
            <TextInput
              placeholder="City"
              placeholderTextColor="white"
              className="rounded mb-2 text-white-100"
              value={newAddress.city}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, city: text })
              }
              style={{
                padding: inputPadding,
                backgroundColor: themeStyles.accent2,
              }}
            />
            <TextInput
              placeholder="State"
              placeholderTextColor="white"
              className="rounded mb-2 text-white-100"
              value={newAddress.state}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, state: text })
              }
              style={{
                padding: inputPadding,
                backgroundColor: themeStyles.accent2,
              }}
            />
            <TextInput
              placeholder="Country"
              placeholderTextColor="white"
              className="rounded mb-4"
              value={newAddress.country}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, country: text })
              }
              style={{
                padding: inputPadding,
                backgroundColor: themeStyles.accent2,
              }}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-400 rounded-lg"
                style={{
                  paddingHorizontal: buttonPadding,
                  paddingVertical: buttonPadding / 2,
                }}
              >
                <Text
                  className="text-white"
                  style={{ fontSize: buttonFontSize }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleAddAddress();
                  setModalVisible(false);
                }}
                className="bg-green-500 rounded-lg"
                style={{
                  paddingHorizontal: buttonPadding,
                  paddingVertical: buttonPadding / 2,
                }}
              >
                <Text
                  className="text-white"
                  style={{ fontSize: buttonFontSize }}
                >
                  Add Address
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Addresses;
