import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, CreditCard } from "lucide-react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import GlobalText from "@/components/GlobalText";

export default function SignupCompletePage() {
  const router = useRouter();
  const account = useAuthStore((state) => state.account);
  const formattedAccountNumber =
    account?.match(/.{1,4}/g)?.join("-") || account;

  const handleConfirm = async () => {
    router.push("/home");
  };

  return (
    <View className="flex-1 bg-[#F5F6F8] px-6 pt-8 pb-8 items-center gap-6">
      {/* Spacer */}
      <View className="h-[102px] w-px" />

      {/* 완료 메시지 */}
      <View className="items-center pb-10">
        <View className="w-24 h-30 mb-6 items-center justify-start">
          <CheckCircle size={96} color="#4FC985" />
        </View>
        <GlobalText weight="bold" className="text-2xl text-gray-800">
          회원 가입이 완료되었습니다.
        </GlobalText>
      </View>

      {/* 계좌 정보 카드 */}
      <View className="w-full bg-white rounded-xl p-6 mb-8">
        <GlobalText className="text-base font-normal text-gray-700 mb-4">
          아래 계좌 번호로 앱을 이용할 수 있어요.
        </GlobalText>
        <View className="w-[300px] bg-[#F9FAFB] rounded-lg p-4 flex-row items-center">
          <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
            <CreditCard size={24} color="#4FC985" />
          </View>
          <View>
            <GlobalText className="text-sm text-gray-500">계좌번호</GlobalText>
            <GlobalText className="text-base font-medium text-black mt-1 tracking-wider">
              {formattedAccountNumber}
            </GlobalText>
          </View>
        </View>
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity
        onPress={handleConfirm}
        className="w-full bg-[#4FC985] rounded-lg py-4 items-center"
      >
        <GlobalText className="text-white text-base font-medium">
          홈으로
        </GlobalText>
      </TouchableOpacity>
    </View>
  );
}
