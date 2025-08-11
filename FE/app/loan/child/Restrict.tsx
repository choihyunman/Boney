import GlobalText from "@/components/GlobalText";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, Gauge } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

import { View } from "react-native";

export default function Restrict() {
  const { credit_score } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-[#F5F6F8] px-6 pt-8 pb-8 items-center gap-6">
      {/* Spacer */}
      <View className="h-[102px] w-px" />

      {/* 완료 메시지 */}
      <View className="items-center pb-10">
        <View className="w-24 h-30 mb-6 items-center justify-start">
          <AlertCircle size={96} color="#EF4444" />
        </View>
        <GlobalText weight="bold" className="text-2xl text-gray-800">
          대출이 제한되었습니다.
        </GlobalText>
      </View>

      {/* 신용 점수 카드 */}
      <View className="w-full bg-white rounded-xl p-6 mb-8">
        <GlobalText className="text-base font-normal text-gray-700 mb-4">
          신용 점수가 30점 미만이면 대출을 할 수 없어요.
        </GlobalText>
        <View className="w-[300px] bg-[#F9FAFB] rounded-lg p-4 flex-row items-center">
          <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
            <Gauge size={24} color="#4FC985" />
          </View>
          <View>
            <GlobalText className="text-sm text-gray-500">
              현재 내 신용 점수
            </GlobalText>
            <GlobalText
              weight="bold"
              className="text-base text-black mt-1 tracking-wider"
            >
              {credit_score}점
            </GlobalText>
          </View>
        </View>
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity
        onPress={() => router.push("/home")}
        className="w-full bg-[#4FC985] rounded-lg py-4 items-center"
      >
        <GlobalText className="text-white text-base font-medium">
          홈으로
        </GlobalText>
      </TouchableOpacity>
    </View>
  );
}
