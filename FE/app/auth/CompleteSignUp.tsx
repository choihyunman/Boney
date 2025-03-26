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
    <View className="flex-1 bg-[#F9FAFB] px-6 pt-8 pb-8 items-center gap-6">
      {/* 상태바 */}
      <View className="flex-row items-center justify-between w-full h-8 px-1">
        <Text className="text-sm font-medium text-gray-800">{currentTime}</Text>
        <View className="flex-row space-x-2">
          <SignalIcon size={16} color="#374151" />
          <WifiIcon size={16} color="#374151" />
          <BatteryIcon size={20} color="#374151" />
        </View>
      </View>

      {/* Spacer */}
      <View className="h-[102px] w-px" />

      {/* 완료 메시지 */}
      <View className="items-center pb-10">
        <View className="w-24 h-30 mb-6 items-center justify-start">
          <CheckCircle size={96} color="#4FC985" />
        </View>
        <Text className="text-2xl font-bold text-gray-800">
          회원 가입이 완료되었습니다.
        </Text>
      </View>

      {/* 계좌 정보 카드 */}
      <View className="w-full bg-white rounded-xl p-6 mb-8 shadow-sm">
        <Text className="text-base font-normal text-gray-700 mb-4">
          아래 계좌 번호로 앱을 이용할 수 있어요.
        </Text>
        <View className="w-[300px] bg-[#F9FAFB] rounded-lg p-4 flex-row items-center">
          <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
            <CreditCard size={24} color="#4FC985" />
          </View>
          <View>
            <Text className="text-sm text-gray-500">계좌번호</Text>
            <Text className="text-base font-medium text-black mt-1 tracking-wider">
              {formattedAccountNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity
        onPress={handleConfirm}
        className="w-full bg-[#4FC985] rounded-lg shadow-sm py-4 items-center"
      >
        <Text className="text-white text-base font-medium">홈으로</Text>
      </TouchableOpacity>

      {/* 하단 탭바 */}
      <View className="absolute bottom-0 left-0 right-0 flex-row justify-around py-3 border-t border-gray-200 bg-white">
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
