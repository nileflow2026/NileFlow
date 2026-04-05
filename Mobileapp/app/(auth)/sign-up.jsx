/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../app/components/FormField";
import VerificationInput from "../../app/components/VerificationInput";
import { signUp, useGlobalContext } from "../../Context/GlobalProvider";
import i18n from "../../i18n";
import CusttomButton from "../components/CusttomButton";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const router = useRouter();
  const [isSubmitting, setIsubmitting] = useState(false);
  const [step, setStep] = useState("signup"); // 'signup' or 'verify'
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { setUser, setIsLogged, setIsGuest } = useGlobalContext();
  const logoWidth = width > 400 ? 180 : 140;
  const logoHeight = width > 400 ? 55 : 45;

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  // Timer for verification code resend
  useEffect(() => {
    if (step === "verify" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, step]);

  const showToast = (message, type = "success") => {
    Alert.alert(
      type === "success" ? "Success" : type === "error" ? "Error" : "Info",
      message
    );
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      showToast("Please enter your full name", "error");
      return false;
    }
    if (!form.email.trim()) {
      showToast("Please enter your email address", "error");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }
    if (!form.phone.trim()) {
      showToast("Please enter your phone number", "error");
      return false;
    }
    if (!form.password.trim()) {
      showToast("Please enter a password", "error");
      return false;
    }
    if (form.password.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return false;
    }
    if (!termsAccepted) {
      showToast(
        "Please accept the Terms of Service and Privacy Policy",
        "error"
      );
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsubmitting(true);

    try {
      const result = await signUp(
        form.email,
        form.password,
        form.username,
        form.phone,
        { setUser, setIsLogged, setIsGuest }
      );
      if (result) {
        showToast("Verification code sent to your email!", "success");
        setStep("verify");
        setTimeLeft(60);
        setCanResend(false);
      }
    } catch (error) {
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setIsubmitting(false);
    }
  };

  const handleVerification = async () => {
    const fullCode = verificationCode.join("");

    if (fullCode.length !== 6) {
      showToast("Please enter the complete 6-digit code", "error");
      return;
    }

    setIsubmitting(true);

    try {
      // Here you would implement actual verification logic
      // For now, we'll simulate success
      showToast("Account verified successfully!", "success");
      router.replace("/(tabs)/BottomTabs");
    } catch (error) {
      showToast(
        error.message || "Verification failed. Please try again.",
        "error"
      );
    } finally {
      setIsubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Implement resend logic here
      showToast("New verification code sent!", "success");
      setTimeLeft(60);
      setCanResend(false);
    } catch (error) {
      showToast("Failed to resend code. Please try again.", "error");
    }
  };

  const handleBackToSignup = () => {
    setStep("signup");
    setVerificationCode(["", "", "", "", "", ""]);
    setTimeLeft(60);
    setCanResend(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#1a1a2e", flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {step === "signup" ? (
              <View className="flex-1 justify-center px-6 py-10">
                {/* Logo */}
                <View className="items-center mb-8">
                  <Image
                    source={images.Nilelogo}
                    resizeMode="contain"
                    style={{ width: logoWidth, height: logoHeight }}
                  />
                </View>
                {/* Title */}
                <Text
                  className="text-3xl font-bold mb-2 text-center"
                  style={{ color: "#fbbf24" }}
                >
                  Join Nile Flow Africa
                </Text>
                <Text
                  className="text-lg mb-8 text-center"
                  style={{ color: "white" }}
                >
                  Premium African Marketplace
                </Text>
                {/* Form Fields */}
                <View className="space-y-4">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color="#fbbf24"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#fbbf24", fontWeight: "600" }}>
                        Full Name
                      </Text>
                    </View>
                    <FormField
                      value={form.username}
                      handleChangeText={(e) =>
                        setForm({ ...form, username: e })
                      }
                      placeholder="Enter your full name"
                      otherStyles="mb-0"
                    />
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color="#fbbf24"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#fbbf24", fontWeight: "600" }}>
                        Phone Number
                      </Text>
                    </View>
                    <FormField
                      value={form.phone}
                      handleChangeText={(e) => setForm({ ...form, phone: e })}
                      placeholder="+254 700 000 000"
                      otherStyles="mb-0"
                    />
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color="#fbbf24"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#fbbf24", fontWeight: "600" }}>
                        Email Address
                      </Text>
                    </View>
                    <FormField
                      value={form.email}
                      handleChangeText={(e) => setForm({ ...form, email: e })}
                      placeholder="Enter your email address"
                      otherStyles="mb-0"
                    />
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color="#fbbf24"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#fbbf24", fontWeight: "600" }}>
                        Password
                      </Text>
                    </View>
                    <View style={{ position: "relative" }}>
                      <FormField
                        value={form.password}
                        handleChangeText={(e) =>
                          setForm({ ...form, password: e })
                        }
                        placeholder="Create a strong password"
                        otherStyles="mb-0"
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 20,
                          top: "50%",
                          transform: [{ translateY: -10 }],
                          zIndex: 10,
                        }}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={20}
                          color="#fbbf24"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 12,
                        marginTop: 4,
                        opacity: 0.7,
                      }}
                    >
                      Use at least 8 characters with letters, numbers, and
                      symbols
                    </Text>
                  </View>
                </View>
                {/* Terms & Conditions */}
                <View
                  className="flex-row items-start mt-6"
                  style={{ marginBottom: 24 }}
                >
                  <TouchableOpacity
                    onPress={() => setTermsAccepted(!termsAccepted)}
                    className="w-4 h-4 mr-3 mt-1 rounded border-2 items-center justify-center"
                    style={{
                      borderColor: "#fbbf24",
                      backgroundColor: termsAccepted
                        ? "rgba(251, 191, 36, 0.2)"
                        : "rgba(251, 191, 36, 0.1)",
                    }}
                  >
                    {termsAccepted && (
                      <Ionicons name="checkmark" size={12} color="#fbbf24" />
                    )}
                  </TouchableOpacity>
                  <View className="flex-1">
                    <Text
                      style={{
                        color: "rgba(251, 191, 36, 0.7)",
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      I agree to Nile Flow's{" "}
                      <Text
                        style={{
                          color: "#fbbf24",
                          textDecorationLine: "underline",
                        }}
                      >
                        Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text
                        style={{
                          color: "#fbbf24",
                          textDecorationLine: "underline",
                        }}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </View>
                {/* Button */}
                <View className="mt-8">
                  <CusttomButton
                    title={
                      isSubmitting
                        ? "Creating Account..."
                        : "Create Premium Account"
                    }
                    handlePress={submit}
                    containerStyles="mb-6"
                    isLoading={isSubmitting}
                  />
                </View>
                {/* Link to Sign In */}
                <View className="flex-row justify-center gap-1">
                  <Text
                    className="text-sm font-pregular"
                    style={{ color: "white" }}
                  >
                    {i18n.t("Have an account already?")}
                  </Text>
                  <Link
                    href={"/sign-in"}
                    className="text-sm font-psemibold"
                    style={{ color: "#fbbf24" }}
                  >
                    {i18n.t("Sign-In")}
                  </Link>
                </View>
                {/* Premium Benefits */}
                <View
                  className="mt-8 p-6 rounded-3xl"
                  style={{
                    backgroundColor: "rgba(251, 191, 36, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <Text
                    className="text-lg font-bold text-center mb-4"
                    style={{ color: "#fbbf24" }}
                  >
                    Premium Benefits
                  </Text>
                  <View className="space-y-3">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="diamond-outline"
                        size={16}
                        color="#10b981"
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ color: "white", flex: 1 }}>
                        Exclusive African products
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="headset-outline"
                        size={16}
                        color="#10b981"
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ color: "white", flex: 1 }}>
                        24/7 Premium support
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={16}
                        color="#10b981"
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ color: "white", flex: 1 }}>
                        Secure transactions
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="globe-outline"
                        size={16}
                        color="#10b981"
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ color: "white", flex: 1 }}>
                        Cultural authenticity guarantee
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Trust Badges */}
                <View className="mt-8 grid grid-cols-2 gap-4">
                  <View
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(251, 191, 36, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(251, 191, 36, 0.3)",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold text-center mb-2"
                      style={{ color: "#fbbf24" }}
                    >
                      100%
                    </Text>
                    <Text
                      className="text-center"
                      style={{ color: "rgba(251, 191, 36, 0.8)", fontSize: 12 }}
                    >
                      Secure Registration
                    </Text>
                  </View>

                  <View
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold text-center mb-2"
                      style={{ color: "#10b981" }}
                    >
                      24/7
                    </Text>
                    <Text
                      className="text-center"
                      style={{ color: "rgba(16, 185, 129, 0.8)", fontSize: 12 }}
                    >
                      Account Support
                    </Text>
                  </View>
                </View>
                <View className="mt-4 grid grid-cols-2 gap-4">
                  <View
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold text-center mb-2"
                      style={{ color: "#3b82f6" }}
                    >
                      Free
                    </Text>
                    <Text
                      className="text-center"
                      style={{ color: "rgba(59, 130, 246, 0.8)", fontSize: 12 }}
                    >
                      Premium Membership
                    </Text>
                  </View>

                  <View
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold text-center mb-2"
                      style={{ color: "#ef4444" }}
                    >
                      Instant
                    </Text>
                    <Text
                      className="text-center"
                      style={{ color: "rgba(239, 68, 68, 0.8)", fontSize: 12 }}
                    >
                      Account Access
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Verification Step */
              <View className="flex-1 justify-center px-6 py-10">
                {/* Back Button */}
                <TouchableOpacity
                  onPress={handleBackToSignup}
                  className="flex-row items-center mb-8"
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color="#fbbf24"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#fbbf24", fontWeight: "600" }}>
                    Back to Signup
                  </Text>
                </TouchableOpacity>

                {/* Verification Header */}
                <View className="items-center mb-8">
                  <LinearGradient
                    colors={["#fbbf24", "#f59e0b"]}
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  >
                    <Ionicons name="mail" size={32} color="white" />
                  </LinearGradient>
                  <Text
                    className="text-2xl font-bold text-center mb-2"
                    style={{ color: "#fbbf24" }}
                  >
                    Verify Your Email
                  </Text>
                  <Text
                    className="text-center"
                    style={{ color: "white", opacity: 0.8 }}
                  >
                    Enter the 6-digit code sent to {form.email}
                  </Text>
                </View>

                {/* Verification Code Input */}
                <View className="mb-8">
                  <VerificationInput
                    code={verificationCode}
                    setCode={setVerificationCode}
                    length={6}
                  />
                </View>

                {/* Verify Button */}
                <CusttomButton
                  title={isSubmitting ? "Verifying..." : "Verify Account"}
                  handlePress={handleVerification}
                  containerStyles="mb-6"
                  isLoading={isSubmitting}
                />

                {/* Resend Code */}
                <View className="text-center">
                  <Text
                    className="text-sm text-center mb-2"
                    style={{ color: "white", opacity: 0.7 }}
                  >
                    Didn't receive the code?
                  </Text>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResendCode}>
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: "#fbbf24" }}
                      >
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text
                      className="text-sm"
                      style={{ color: "white", opacity: 0.5 }}
                    >
                      Resend in {timeLeft}s
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
