import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";
import { useSession } from "../../ctx";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    console.log("⏳ [AUTH] 세션 로딩 중... 아직 판단 보류");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중입니다...</Text>
      </View>
    );
  }

  if (!session) {
    console.log("🔐 [AUTH] 세션 없음 → /KakaoLogin 으로 이동");
    return <Redirect href="/KakaoLogin" />;
  }

  console.log("✅ [AUTH] 세션 있음 → (app) 내부 접근 허용");
  return <Stack />;
}
