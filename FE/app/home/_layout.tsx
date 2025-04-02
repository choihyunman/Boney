import { View, Text } from "react-native";
import { Slot } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
export default function HomeLayout() {
  const { hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    console.log("⏳ [AUTH] 세션 로딩 중... 아직 판단 보류");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중입니다...</Text>
      </View>
    );
  }

  return <Slot />;
}
