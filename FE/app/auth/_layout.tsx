import { Stack } from "expo-router";
import { useSession } from "../../ctx";
import { View, Text } from "react-native";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export type AuthStackParamList = {
  "/auth": undefined;
  "/auth/CreatePin": undefined;
  "/auth/ConfirmPin": { password: string };
  "/auth/CompleteSignUp": undefined;
  "/auth/SignUp": undefined;
};

export default function AuthLayout() {
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중입니다...</Text>
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
