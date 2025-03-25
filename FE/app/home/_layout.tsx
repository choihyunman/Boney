import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { useSession } from "../../ctx";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export default function AppLayout() {
  const { isLoading } = useSession();
  useAuthRedirect();

  if (isLoading) {
    console.log("⏳ [AUTH] 세션 로딩 중... 아직 판단 보류");
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
