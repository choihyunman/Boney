import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  WifiIcon,
  BatteryIcon,
  SignalIcon,
  CheckCircle,
  CreditCard,
  Home,
  FileText,
  BadgeCheck,
  Menu,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SignupCompletePage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const account = useAuthStore((state) => state.account);

  const formattedAccountNumber =
    account?.match(/.{1,4}/g)?.join("-") || account;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async () => {
    router.push("/home");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] items-center">
      {/* 상태바 */}
      <View className="flex-row items-center justify-between px-5 h-8 w-full">
        <Text className="text-sm font-medium">{currentTime}</Text>
        <View className="flex-row space-x-2">
          <SignalIcon size={16} color="#374151" />
          <WifiIcon size={16} color="#374151" />
          <BatteryIcon size={20} color="#374151" />
        </View>
      </View>

      {/* 콘텐츠 */}
      <View className="flex-1 w-full px-6 justify-center items-center">
        <View className="items-center mb-10">
          <CheckCircle size={96} color="#4FC985" className="mb-6" />
          <Text className="text-2xl font-bold text-gray-800">
            회원 가입을 완료하였습니다.
          </Text>
        </View>

        <View className="w-full bg-white rounded-xl p-6 mb-8 shadow-sm">
          <Text className="text-lg font-medium text-gray-800 mb-4">
            아래 계좌 번호로 앱을 이용할 수 있어요.
          </Text>
          <View className="bg-[#F9FAFB] rounded-lg p-5 flex-row items-center">
            <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
              <CreditCard size={24} color="#4FC985" />
            </View>
            <Text className="text-xl font-medium text-gray-800 tracking-wider">
              {formattedAccountNumber}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          className="w-full py-4 bg-[#4FC985] rounded-lg shadow-sm items-center"
        >
          <Text className="text-white font-medium">확인</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 탭바 */}
      <View className="flex-row justify-around py-3 border-t border-gray-200 w-full bg-white">
        <View className="items-center">
          <Home size={24} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 mt-1">홈</Text>
        </View>
        <View className="items-center">
          <FileText size={24} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 mt-1">거래내역</Text>
        </View>
        <View className="items-center">
          <BadgeCheck size={24} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 mt-1">미션</Text>
        </View>
        <View className="items-center">
          <Menu size={24} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 mt-1">메뉴</Text>
        </View>
      </View>
    </View>
  );
}
