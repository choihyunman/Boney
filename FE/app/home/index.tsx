import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import GlobalText from "@/components/GlobalText";

export default function Home() {
  const router = useRouter();

  const { token, user } = useAuthStore();
  console.log("🔑 현재 토큰:", token, "현재 user:", user);

  useEffect(() => {
    if (!token) {
      router.replace("/auth");
    }
  }, [token]);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    console.log("📦 앱 재실행 후 유저 상태:", user);
  }, []);

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center p-5"></View>
    </View>
  );
}
