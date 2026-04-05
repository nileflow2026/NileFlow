import { useRouter, useSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../app/components/FormField";
import { account } from "../../Appwrite";
import CusttomButton from "../components/CusttomButton";

const ResetPassword = () => {
  const router = useRouter();
  const { userId, secret } = useSearchParams(); // Get reset token from URL
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handlePasswordReset = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    setSubmitting(true);
    try {
      await account.updateRecovery(userId, secret, newPassword, newPassword);
      Alert.alert("Success", "Password reset successfully");
      router.replace("/sign-in"); // Redirect to login
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
            Enter New Password
          </Text>
          <FormField
            title={"New Password"}
            value={newPassword}
            handleChangeText={setNewPassword}
            otherStyles={"mt-7"}
          />
          <CusttomButton
            title="Reset Password"
            handlePress={handlePasswordReset}
            containerStyles={"mt-7"}
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
