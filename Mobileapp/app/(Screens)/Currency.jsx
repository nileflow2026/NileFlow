import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Config, databases, Query } from "../../Appwrite";
import { useGlobalContext } from "../../Context/GlobalProvider";

const { width } = Dimensions.get("window");

const currencyFlags = {
  USD: "🇺🇸",
  SSP: "🇸🇸",
  KES: "🇰🇪",
  UGX: "🇺🇬",
  ETB: "🇪🇹",
};

const currencyNames = {
  USD: "US Dollar",
  SSP: "South Sudanese Pound",
  KES: "Kenyan Shilling",
  UGX: "Ugandan Shilling",
  ETB: "Ethiopian Birr",
};

const Currency = ({ onCurrencyChange = () => {} }) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("SSP");
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await databases.listDocuments(
          Config.databaseId,
          Config.currenciesCollection,
          [Query.equal("currency_code", ["USD", "SSP"])],
        );
        setCurrencies(response.documents);

        const savedCurrency = await AsyncStorage.getItem("userCurrency");
        setSelectedCurrency(savedCurrency || "SSP");
      } catch (error) {
        console.error("❌ Error fetching currencies:", error);
      } finally {
        setLoading(false);
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
          { currency },
        );
      }
    } catch (error) {
      console.error("❌ Error updating currency:", error);
    }
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
            <Text style={styles.headerTitle}>Currency</Text>
            <Text style={styles.headerSubtitle}>
              Choose your preferred currency
            </Text>
          </View>
        </LinearGradient>

        {/* Auto-detect notice */}
        <LinearGradient
          colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.6)"]}
          style={styles.noticeCard}
        >
          <MaterialIcons name="my-location" size={18} color="#10b981" />
          <Text style={styles.noticeText}>
            Currency is auto-detected from your location. You can override it
            below.
          </Text>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#F59E0B" size="large" />
          </View>
        ) : (
          <FlatList
            data={currencies}
            keyExtractor={(item) => item.currency_code}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => {
              const isSelected = selectedCurrency === item.currency_code;
              return (
                <TouchableOpacity
                  onPress={() => handleCurrencySelect(item.currency_code)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? ["rgba(245, 158, 11, 0.2)", "rgba(217, 119, 6, 0.15)"]
                        : ["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]
                    }
                    style={[
                      styles.currencyCard,
                      isSelected && styles.currencyCardSelected,
                    ]}
                  >
                    <Text style={styles.flag}>
                      {currencyFlags[item.currency_code] ?? "🏳️"}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.currencyCode,
                          isSelected && { color: "#FCD34D" },
                        ]}
                      >
                        {item.currency_code}
                      </Text>
                      <Text style={styles.currencyName}>
                        {currencyNames[item.currency_code] ??
                          item.currency_name ??
                          ""}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <MaterialIcons name="check" size={18} color="#F59E0B" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              <LinearGradient
                colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.6)"]}
                style={styles.infoCard}
              >
                <MaterialIcons name="info-outline" size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>
                  Selecting a currency will update product prices to match the
                  exchange rate.
                </Text>
              </LinearGradient>
            }
          />
        )}
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
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  noticeText: {
    flex: 1,
    color: "#D1FAE5",
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
    padding: 16,
    gap: 14,
  },
  currencyCardSelected: {
    borderColor: "rgba(245, 158, 11, 0.5)",
  },
  flag: {
    fontSize: 28,
  },
  currencyCode: {
    color: "#F3F4F6",
    fontWeight: "700",
    fontSize: width < 350 ? 15 : 16,
  },
  currencyName: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 2,
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  infoText: {
    flex: 1,
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 18,
  },
});

export default Currency;
