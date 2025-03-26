import { View, TouchableOpacity } from "react-native";
import Nav from "@/components/Nav";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import GlobalText from "@/components/GlobalText";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = useAuthStore.getState().user;
    console.log("📦 앱 재실행 후 유저 상태:", user);
  }, []);

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center p-5">
        <TouchableOpacity
          className="bg-[#4FC985] p-4 rounded-lg mb-5"
          onPress={() => router.push("/transfer")}
        >
          <GlobalText className="text-white text-base">송금하기</GlobalText>
        </TouchableOpacity>
        <Nav />
      </View>
    </View>
  );
}
