import { Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSession } from "../../ctx";
import { useEffect } from "react";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      // 로딩이 끝나고 로그인이 안되어 있으면 로그인 페이지로 이동
      router.replace("/(auth)/KakaoLogin");
    }
  }, [isLoading, session]);

  if (isLoading) {
    console.log("⏳ [AUTH] 세션 로딩 중... 아직 판단 보류");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중입니다...</Text>
      </View>
    );
  }

  return <Stack />;
}
