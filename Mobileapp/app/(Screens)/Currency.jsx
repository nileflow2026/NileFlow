import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Config, databases, Query } from "../../Appwrite";
import { useGlobalContext } from "../../Context/GlobalProvider";
import { useTheme } from "../../Context/ThemeProvider";

const { width } = Dimensions.get("window");

const currencyFlags = {
  USD: "🇺🇸",
  SSP: "🇸🇸",
};

const Currency = ({ onCurrencyChange = () => {} }) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("SSP");
  const { user } = useGlobalContext();
  const router = useRouter();
  const { theme, themeStyles } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await databases.listDocuments(
          Config.databaseId,
          Config.currenciesCollection,
          [Query.equal("currency_code", ["USD", "SSP"])]
        );
        setCurrencies(response.documents);

        const savedCurrency = await AsyncStorage.getItem("userCurrency");
        setSelectedCurrency(savedCurrency || "SSP");
      } catch (error) {
        console.error("❌ Error fetching currencies:", error);
      }
    };
    fetchCurrencies();
  }, []);

  const handleCurrencySelect = async (currency) => {
    try {
      await AsyncStorage.setItem("userCurrency", currency);
      setSelectedCurrency(currency);
      onCurrencyChange(currency);

      if (user?.$id) {
        await databases.updateDocument(
          Config.databaseId,
          Config.userCollectionId,
          user.$id,
          { currency }
        );
        console.log("✅ Currency updated in Appwrite successfully.");
      } else {
        console.warn("⚠️ No user ID found, skipping Appwrite update.");
      }
    } catch (error) {
      console.error("❌ Error updating currency:", error);
    }
  };

  // Responsive styles
  const titleFontSize = width < 350 ? 18 : 20;
  const currencyFontSize = width < 350 ? 16 : 18;
  const itemPadding = width < 350 ? 12 : 16;
  const itemMarginBottom = width < 350 ? 10 : 14;
  const infoFontSize = width < 350 ? 12 : 14;

  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtitleColor = isDark ? "text-gray-300" : "text-gray-600";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const cardBase = isDark ? themeStyles.accent2 : themeStyles.accent2;
  const selectedCard = "bg-gray-800 ";

  return (
    <SafeAreaView
      className={`flex-1 ${bgColor} px-5`}
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Header */}
      <View className="flex-row items-center mt-3 mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="keyboard-arrow-left"
            size={45}
            color={"#8C3E14"}
          />
        </TouchableOpacity>
        <Text
          className={`ml-4 font-semibold ${textColor}`}
          style={{ fontSize: titleFontSize }}
        >
          Choose Your Currency
        </Text>
      </View>

      {/* Currency List */}
      <Text
        className={`mb-4 font-medium ${textColor}`}
        style={{ fontSize: titleFontSize }}
      >
        Select Your Currency:
      </Text>

      <FlatList
        data={currencies}
        keyExtractor={(item) => item.currency_code}
        renderItem={({ item }) => {
          const isSelected = selectedCurrency === item.currency_code;
          return (
            <TouchableOpacity
              onPress={() => handleCurrencySelect(item.currency_code)}
              className={`flex-row items-center justify-between rounded-xl border w-full ${
                isSelected ? selectedCard : cardBase
              }`}
              style={{
                padding: itemPadding,
                marginBottom: itemMarginBottom,
                backgroundColor: themeStyles.accent2,
              }}
            >
              <Text className="text-2xl">
                {currencyFlags[item.currency_code] ?? "🏳️"}
              </Text>
              <Text
                className={`${textColor} font-medium`}
                style={{ fontSize: currencyFontSize }}
              >
                {item.currency_code}
              </Text>
              {isSelected && (
                <Text
                  className="text-green-400"
                  style={{ fontSize: currencyFontSize }}
                >
                  ✔
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Info Box */}
      <View
        className="mt-6 rounded-xl"
        style={{ backgroundColor: themeStyles.accent2, padding: itemPadding }}
      >
        <Text
          className={subtitleColor + " text-center"}
          style={{ fontSize: infoFontSize, color: "#fff" }}
        >
          Selecting a currency will automatically update product prices to match
          the exchange rate.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Currency;
