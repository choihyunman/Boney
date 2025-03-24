import { Stack, useRouter } from "expo-router";
import { useSession } from "../../ctx";
import { useEffect } from "react";
import { View, Text } from "react-native";

export default function AuthLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로그인 되어 있으면 홈으로 보내기
    if (!isLoading && session) {
      console.log("✅ [AUTH] 세션 있음 → (app) 내부 접근 허용");
      router.replace("/"); // 또는 "/(app)"으로도 가능
    }
  }, [isLoading, session]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중입니다...</Text>
      </View>
    );
  }

  return <Stack />;
}
