import { useRouter, useLocalSearchParams } from "expo-router";
import PromissoryNote from "../PromissoryNote";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import GlobalText from "@/components/GlobalText";

export default function LoanDetailChild() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [currentTime, setCurrentTime] = useState("");

  // URL 파라미터에서 데이터 가져오기
  const loanAmount = (searchParams.amount as string) || "";
  const repaymentDate = (searchParams.date as string) || "";

  // 현재 날짜 포맷팅
  const today = new Date();
  const formattedToday = `${today.getFullYear()}년 ${String(
    today.getMonth() + 1
  ).padStart(2, "0")}월 ${String(today.getDate()).padStart(2, "0")}일`;

  // 상환 날짜 포맷팅
  const formatRepaymentDate = () => {
    if (!repaymentDate) return "";

    try {
      const date = new Date(repaymentDate);
      return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}월 ${String(date.getDate()).padStart(2, "0")}일`;
    } catch (e) {
      return "";
    }
  };

  // 상태 표시줄의 시간 업데이트
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

  // 다시 쓰기 버튼 핸들러
  const handleRewrite = () => {
    router.back();
  };

  // 대출 신청하기 버튼 핸들러
  const handleSubmitLoan = () => {
    router.push("/loan/child/ReqComplete");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 mt-6 space-y-6 pb-20">
        <PromissoryNote
          loanAmount={loanAmount}
          repaymentDate={formatRepaymentDate()}
          formattedToday={formattedToday}
          debtorName="김짤랑"
          creditorName="김부모"
          minHeight={200}
        />

        {/* 세부 내역 영역 */}
        <View className="w-full bg-white rounded-xl px-6 py-3 mb-8 shadow-sm">
          <View className="flex flex-col gap-3">
            <View className="flex-row justify-between items-center py-4">
              <View className="flex-row items-center">
                <GlobalText className="text-base text-gray-500">
                  총 대출액
                </GlobalText>
              </View>
              <GlobalText
                weight="bold"
                className="text-lg font-medium text-black tracking-wider"
              >
                {loanAmount}
              </GlobalText>
            </View>
            {/* Divider */}
            <View className="h-px bg-gray-200 mx-1 mt-2" />
            <View className="flex-row justify-between items-center py-4">
              <View className="flex-row items-center">
                <GlobalText className="text-base text-gray-500">
                  남은 대출액
                </GlobalText>
              </View>
              <GlobalText
                weight="bold"
                className="text-lg font-medium text-black tracking-wider"
              >
                {loanAmount}
              </GlobalText>
            </View>
            {/* Divider */}
            <View className="h-px bg-gray-200 mx-1 mt-2" />
            <View className="flex-row justify-between items-center py-4">
              <View className="flex-row items-center">
                <GlobalText className="text-base text-gray-500">
                  남은 일수
                </GlobalText>
              </View>
              <GlobalText
                weight="bold"
                className="text-lg font-medium text-black tracking-wider"
              >
                {loanAmount}
              </GlobalText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
