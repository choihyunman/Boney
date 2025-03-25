import { Stack, useRouter } from "expo-router";
import { useSession } from "../../ctx";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function AuthLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
      console.log("🔑 [AUTH] 현재 세션 상태:", {
        isLoading,
        hasToken: !!session,
        token: session || "none",
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (isInitialized && session) {
      console.log("✅ [AUTH] 유효한 토큰 확인됨:", session);
      router.replace("/(home)");
    } else if (isInitialized) {
      console.log("❌ [AUTH] 유효한 토큰 없음");
    }
  }, [isInitialized, session]);

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
