import axios from "axios";
import { Gift, RefreshCw, Target, Users } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = "http://localhost:5000/api/gamification";
// ⚠️ Change to your server’s URL (e.g., https://nilemart-backend.com/api/gamification)

export default function GamificationHub({ userId = "123" }) {
  const [streak, setStreak] = useState(0);
  const [spinResult, setSpinResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Daily Check-In
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/checkin`, { userId });
      setStreak(streak + 1);
      Alert.alert("Success", `You earned ${res.data.reward} Nile Miles!`);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Spin the Wheel
  const handleSpin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/spin`, { userId });
      setSpinResult(res.data.prize);
      Alert.alert("Spin Result", `🎉 You won: ${res.data.prize}`);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to spin");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Referral
  const handleReferral = async () => {
    setLoading(true);
    try {
      // Example: hardcoding refereeId (replace with real user sign-up flow)
      const refereeId = "456";
      const res = await axios.post(`${API_BASE}/referral`, {
        referrerId: userId,
        refereeId,
      });
      Alert.alert("Referral Sent", res.data.message);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to send referral"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4" style={{ backgroundColor: "#0f172a" }}>
      <Text className="text-2xl font-bold mb-4">🎮 Gamification Hub</Text>

      {loading && <ActivityIndicator size="large" color="orange" />}

      {/* Daily Check-In */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <View className="flex-row items-center mb-2">
          <Gift size={20} color="orange" />
          <Text className="ml-2 text-lg font-semibold">Daily Check-In</Text>
        </View>
        <Text className="text-gray-500 mb-2">
          Current streak: {streak} days 🔥
        </Text>
        <TouchableOpacity
          className="bg-orange-500 py-2 px-4 rounded-2xl"
          onPress={handleCheckIn}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">
            Check In Today
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spin the Wheel */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <View className="flex-row items-center mb-2">
          <RefreshCw size={20} color="purple" />
          <Text className="ml-2 text-lg font-semibold">Spin the Wheel</Text>
        </View>
        <Text className="text-gray-500 mb-2">
          Try your luck once per day 🎡
        </Text>
        <TouchableOpacity
          className="bg-purple-600 py-2 px-4 rounded-2xl"
          onPress={handleSpin}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">Spin Now</Text>
        </TouchableOpacity>
        {spinResult && (
          <Text className="mt-2 text-green-600 font-bold text-center">
            You won: {spinResult}
          </Text>
        )}
      </View>

      {/* Referrals */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <View className="flex-row items-center mb-2">
          <Users size={20} color="blue" />
          <Text className="ml-2 text-lg font-semibold">Invite Friends</Text>
        </View>
        <Text className="text-gray-500 mb-2">
          Earn rewards for every friend who joins Nile Mart 🎁
        </Text>
        <TouchableOpacity
          className="bg-blue-600 py-2 px-4 rounded-2xl"
          onPress={handleReferral}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">Invite Now</Text>
        </TouchableOpacity>
      </View>

      {/* Challenges (static mock for now) */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <View className="flex-row items-center mb-2">
          <Target size={20} color="green" />
          <Text className="ml-2 text-lg font-semibold">Active Challenges</Text>
        </View>
        <View className="mb-3">
          <Text className="text-gray-700 font-medium">
            🛒 Buy 3 Beauty items → Get 20% off
          </Text>
          <View className="h-2 bg-gray-200 rounded-full mt-1">
            <View className="h-2 bg-green-500 rounded-full w-2/3" />
          </View>
          <Text className="text-xs text-gray-500 mt-1">2/3 completed</Text>
        </View>
      </View>
    </ScrollView>
  );
}
