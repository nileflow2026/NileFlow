/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { getCurrentUser, signIn } from "@/Context/GlobalProvider";
import { images } from "@/constants";
import { useGlobalContext } from "@/Context/GlobalProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../app/components/FormField";
import { useTheme } from "../../Context/ThemeProvider";
import CusttomButton from "../components/CusttomButton";

const { width } = Dimensions.get("window");
const SignIn = () => {
  const router = useRouter();
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const logoWidth = width > 400 ? 180 : 140;
  const logoHeight = width > 400 ? 55 : 45;
  const { theme, themeStyles } = useTheme();
  const isDarkMode = theme === "dark";

  const themedText = isDarkMode ? "text-white" : "text-black";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      // Add Google sign-in implementation here
      Alert.alert("Info", "Google sign-in will be implemented");
    } catch (err) {
      setError("Failed to sign in with Google");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError("");
      // Add Facebook sign-in implementation here
      Alert.alert("Info", "Facebook sign-in will be implemented");
    } catch (err) {
      setError("Failed to sign in with Facebook");
    }
  };

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      setError("Please fill in all the fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      // Handle remember me functionality
      if (rememberMe) {
        // Store user preference locally
        // You can implement AsyncStorage here if needed
      }

      Alert.alert("Success", "User signed in successfully");
      router.replace("/(tabs)/BottomTabs");
    } catch (error) {
      setError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#111827", flex: 1 }}>
      <LinearGradient
        colors={["#111827", "#000000", "#111827"]}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View className="px-4 pt-8 pb-6">
            <View className="items-center mb-8">
              <View className="bg-amber-600/20 p-3 rounded-2xl border border-amber-700/30 mb-4">
                <Ionicons name="shield-checkmark" size={24} color="#FCD34D" />
              </View>
              <Text className="text-amber-200 font-medium text-sm tracking-wide mb-4">
                Secure Access
              </Text>
              <Image
                source={images.Nilelogo}
                resizeMode="contain"
                style={{
                  width: logoWidth,
                  height: logoHeight,
                  marginBottom: 16,
                }}
              />
              <Text className="text-white text-3xl font-bold text-center mb-2">
                Welcome Back
              </Text>
              <Text className="text-amber-200 text-xl font-bold text-center mb-4">
                Premium African Marketplace
              </Text>
              <Text className="text-gray-300 text-center text-base px-4 max-w-sm mx-auto">
                Access your exclusive collection of authentic African products
              </Text>
            </View>
          </View>

          {/* Main Form Section */}
          <View className="px-4">
            <View className="bg-gray-900/80 border border-amber-800/30 rounded-3xl overflow-hidden mb-8">
              {/* Form Header */}
              <View className="p-6 border-b border-amber-800/30">
                <View className="flex-row items-center mb-2">
                  <View className="w-12 h-12 rounded-2xl bg-amber-600 items-center justify-center mr-3">
                    <Ionicons name="crown" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-amber-200">
                      Premium Sign In
                    </Text>
                    <Text className="text-amber-100/70">
                      Access your Nile Flow account
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Body */}
              <View className="p-6">
                {/* Email Field */}
                <View className="mb-6">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="mail" size={16} color="#FCD34D" />
                    <Text className="text-amber-100 font-medium ml-2">
                      Email Address
                    </Text>
                  </View>
                  <FormField
                    value={form.email}
                    handleChangeText={(e) => setForm({ ...form, email: e })}
                    placeholder={"Enter your email address"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    otherStyles={"border-amber-800/50 bg-gray-900/50"}
                  />
                </View>

                {/* Password Field */}
                <View className="mb-6">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="lock-closed" size={16} color="#FCD34D" />
                    <Text className="text-amber-100 font-medium ml-2">
                      Password
                    </Text>
                  </View>
                  <View className="relative">
                    <FormField
                      value={form.password}
                      handleChangeText={(e) =>
                        setForm({ ...form, password: e })
                      }
                      placeholder={"Enter your password"}
                      secureTextEntry={!showPassword}
                      otherStyles={"border-amber-800/50 bg-gray-900/50 pr-12"}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-2"
                      style={{ transform: [{ translateY: -12 }] }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#FCD34D"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View className="mb-6">
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center mb-4"
                  >
                    <View
                      className={`w-5 h-5 rounded border items-center justify-center mr-2 ${
                        rememberMe
                          ? "bg-amber-600 border-amber-500"
                          : "border-amber-800/50"
                      }`}
                    >
                      {rememberMe && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#FCD34D",
                        opacity: 0.8,
                        fontSize: 14,
                        minWidth: 100,
                        flexShrink: 0,
                      }}
                    >
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(Screens)/ForgotPassword")}
                    style={{
                      alignSelf: "flex-end",
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{ color: "#FCD34D", fontSize: 14, minWidth: 120 }}
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error ? (
                  <View className="bg-red-900/30 border border-red-700/30 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="shield-checkmark"
                        size={20}
                        color="#FCA5A5"
                      />
                      <Text className="text-red-200 ml-2 flex-1">{error}</Text>
                    </View>
                  </View>
                ) : null}

                {/* Submit Button */}
                <CusttomButton
                  title={isSubmitting ? "Signing In..." : "Sign In"}
                  handlePress={submit}
                  containerStyles={"mb-6 bg-amber-600"}
                  isLoading={isSubmitting}
                />

                {/* Divider */}
                <View className="mb-6">
                  <View className="flex-row items-center">
                    <View className="flex-1 border-t border-amber-800/30" />
                    <View className="px-6">
                      <Text
                        style={{
                          color: "#FCD34D",
                          opacity: 0.5,
                          fontSize: 14,
                          textAlign: "center",
                          backgroundColor: "rgba(17, 24, 39, 0.8)",
                          minWidth: 120,
                          paddingHorizontal: 8,
                        }}
                      >
                        Or continue with
                      </Text>
                    </View>
                    <View className="flex-1 border-t border-amber-800/30" />
                  </View>
                </View>

                {/* Social Login Buttons */}
                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    onPress={handleGoogleSignIn}
                    className="flex-1 flex-row items-center justify-center bg-gray-900/50 border border-amber-800/30 rounded-xl py-4 px-4"
                  >
                    <Ionicons name="logo-google" size={20} color="#60A5FA" />
                    <Text
                      style={{
                        color: "#FCD34D",
                        fontSize: 14,
                        fontWeight: "500",
                        minWidth: 60,
                        textAlign: "center",
                      }}
                    >
                      Google
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleFacebookSignIn}
                    className="flex-1 flex-row items-center justify-center bg-gray-900/50 border border-amber-800/30 rounded-xl py-4 px-4"
                  >
                    <Ionicons name="logo-facebook" size={20} color="#A78BFA" />
                    <Text
                      style={{
                        color: "#FCD34D",
                        fontSize: 14,
                        fontWeight: "500",
                        minWidth: 70,
                        textAlign: "center",
                      }}
                    >
                      Facebook
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Link */}
              <View className="p-6 border-t border-amber-800/30">
                <View className="flex-row items-center justify-center flex-wrap">
                  <Text className="text-amber-100/70 mr-2 text-center">
                    Don't have an account?
                  </Text>
                  <Link href={"/sign-up"} className="text-amber-400 font-bold">
                    Create Account
                  </Link>
                </View>
              </View>
            </View>

            {/* Benefits Section */}
            <View className="bg-gray-900/80 border border-amber-800/30 rounded-3xl p-6 mb-8">
              <Text className="text-2xl font-bold text-amber-200 mb-2">
                Premium Benefits
              </Text>
              <Text className="text-amber-100/70 mb-6">
                Unlock exclusive features with your Nile Flow account
              </Text>

              <View className="space-y-4">
                <View className="flex-row items-start bg-amber-900/20 border border-amber-800/30 rounded-2xl p-4 mb-4">
                  <View className="w-12 h-12 rounded-xl bg-amber-600 items-center justify-center mr-4">
                    <Ionicons name="trophy" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-amber-100 mb-1">
                      Exclusive Access
                    </Text>
                    <Text className="text-amber-100/70 text-sm leading-5">
                      Premium African products only available to members
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start bg-emerald-900/20 border border-emerald-800/30 rounded-2xl p-4 mb-4">
                  <View className="w-12 h-12 rounded-xl bg-emerald-600 items-center justify-center mr-4">
                    <Ionicons name="flash" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-emerald-100 mb-1">
                      Fast Checkout
                    </Text>
                    <Text className="text-emerald-100/70 text-sm leading-5">
                      Save your details for quicker purchases
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start bg-blue-900/20 border border-blue-800/30 rounded-2xl p-4">
                  <View className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center mr-4">
                    <Ionicons name="star" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-blue-100 mb-1">
                      Personalized Recommendations
                    </Text>
                    <Text className="text-blue-100/70 text-sm leading-5">
                      Get tailored product suggestions
                    </Text>
                  </View>
                </View>
              </View>

              {/* Trust Badges */}
              <View className="flex-row justify-around mt-6 pt-6 border-t border-amber-800/30">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-amber-300">
                    100%
                  </Text>
                  <Text className="text-amber-100/80 text-xs">
                    Secure Login
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-emerald-300">
                    24/7
                  </Text>
                  <Text className="text-emerald-100/80 text-xs">Support</Text>
                </View>
              </View>
            </View>

            {/* Trust Section */}
            <View className="items-center mb-8 px-4">
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark" size={16} color="#FCD34D" />
                <Text className="text-amber-100/60 text-sm ml-2 text-center flex-1">
                  Your security is our priority. All data is encrypted.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignIn;
