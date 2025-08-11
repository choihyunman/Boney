import { Stack } from "expo-router";
import { View } from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import GlobalText from "@/components/GlobalText";

export type AuthStackParamList = {
  "/auth": undefined;
  "/auth/CreatePin": undefined;
  "/auth/ConfirmPin": { password: string };
  "/auth/CompleteSignUp": undefined;
  "/auth/SignUp": undefined;
};

export default function AuthLayout() {
  const { hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <GlobalText>로딩 중입니다...</GlobalText>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
