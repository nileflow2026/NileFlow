import { Account } from "appwrite";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../app/components/FormField";
import CusttomButton from "../components/CusttomButton";
// Ensure you have Appwrite configured

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    setSubmitting(true);
    try {
      await Account.createRecovery(
        email,
        "http://localhost:8081/reset-password"
      );
      Alert.alert("Success", "Check your email for reset instructions");
      router.replace("/sign-in"); // Navigate back to login
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: "#0f172a" }}>
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Reset Your Password
          </Text>
          <FormField
            title={"Email Address"}
            value={email}
            handleChangeText={setEmail}
            otherStyles={"mt-7"}
          />
          <CusttomButton
            title="Send Reset Link"
            handlePress={handleResetPassword}
            containerStyles={"mt-7"}
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
