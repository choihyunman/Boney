import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSession } from "../../ctx";
import { Slot } from "expo-router";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function HomeLayout() {
  const { session, isLoading } = useSession();

  useAuthRedirect();

  if (isLoading) {
    console.log("⏳ [AUTH] 세션 로딩 중... 아직 판단 보류");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중입니다...</Text>
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="auto" />
      <Slot />
    </SafeAreaView>
  );
}
