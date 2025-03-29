import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import GlobalText from "../../../components/GlobalText";
import PromissoryNote from "../PromissoryNote";

export default function PromissoryNotePage() {
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
          minHeight={350}
        />

        {/* 버튼 영역 */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity
            onPress={handleRewrite}
            className="py-4 px-6 rounded-lg shadow-sm bg-gray-200 flex-1 mr-2"
          >
            <GlobalText className="text-gray-700 text-center">
              다시 쓰기
            </GlobalText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmitLoan}
            className="py-4 px-6 rounded-lg shadow-sm bg-[#4FC985] flex-[1.5]"
          >
            <GlobalText className="text-white text-center">서명하기</GlobalText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
