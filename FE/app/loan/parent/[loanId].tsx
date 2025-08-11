import { useLocalSearchParams } from "expo-router";
import PromissoryNote from "../PromissoryNote";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import GlobalText from "@/components/GlobalText";
import { useLoanDetailParent } from "@/hooks/useLoanDetailParent";

export default function LoanDetailParent() {
  const { loanId, color } = useLocalSearchParams<{
    loanId: string;
    color: string;
  }>();
  const { data: loanDetail } = useLoanDetailParent(Number(loanId));
  const [currentTime, setCurrentTime] = useState("");

  const repaymentDate = loanDetail?.due_date;
  const loanAmount = loanDetail?.loan_amount;
  const lastAmount = loanDetail?.last_amount;
  const childName = loanDetail?.child_name;
  const parentName = loanDetail?.parent_name;
  const approvedAt = loanDetail?.approved_at;
  const childSignature = loanDetail?.child_signature;
  const parentSignature = loanDetail?.parent_signature;

  // 마감 날짜 포맷팅
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

  // 승인 날짜 포맷팅
  const formatApprovedAt = () => {
    if (!approvedAt) return "";

    try {
      const date = new Date(approvedAt);
      return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}월 ${String(date.getDate()).padStart(2, "0")}일`;
    } catch (e) {
      return "";
    }
  };

  // 남은 일수 계산 + 색상 적용
  const getDdayInfo = () => {
    if (!repaymentDate) return { text: "-", color: "text-black" };

    const today = new Date();
    const dueDate = new Date(repaymentDate);

    // 시/분/초 제거
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diff = dueDate.getTime() - today.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) return { text: "D-Day", color: "text-[#4FC985]" };
    if (dayDiff > 0) return { text: `D-${dayDiff}`, color: "text-[#4FC985]" };
    return { text: `D+${Math.abs(dayDiff)}`, color: "text-[#D6456B]" };
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

  return (
    <View className="flex-1 bg-[F5F6F8]">
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 mt-6 space-y-6 pb-20">
        <PromissoryNote
          loanAmount={loanAmount ?? 0}
          repaymentDate={formatRepaymentDate()}
          formattedToday={formatApprovedAt()}
          debtorName={childName ?? ""}
          creditorName={parentName ?? ""}
          debtorSign={childSignature ?? ""}
          creditorSign={parentSignature ?? ""}
          minHeight={200}
        />

        {/* 세부 내역 영역 */}
        <View className="w-full bg-white rounded-xl px-6 py-3 mt-4 mb-8">
          <View className="flex flex-col">
            <View className="flex-row justify-between items-center py-4">
              <View className="flex-row items-center">
                <GlobalText className="text-base text-gray-500">
                  채무자
                </GlobalText>
              </View>
              <GlobalText
                weight="bold"
                className="text-lg font-medium text-black tracking-wider"
              >
                {childName}
              </GlobalText>
            </View>
            {/* Divider */}
            <View className="h-px bg-gray-200 mt-1 mb-1" />
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
                {loanAmount?.toLocaleString()}원
              </GlobalText>
            </View>
            {/* Divider */}
            <View className="h-px bg-gray-200 mt-1 mb-1" />
            <View className="flex-row justify-between items-center py-4">
              <View className="flex-row items-center">
                <GlobalText className="text-base text-gray-500">
                  남은 대출액
                </GlobalText>
              </View>
              <GlobalText
                weight="bold"
                className="text-lg font-medium tracking-wider"
                style={{ color: color }}
              >
                {lastAmount?.toLocaleString()}원
              </GlobalText>
            </View>
            {/* Divider */}
            <View className="h-px bg-gray-200 mt-1 mb-1" />
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
                <GlobalText
                  weight="bold"
                  className={`text-lg font-medium ${getDdayInfo().color}`}
                >
                  {getDdayInfo().text}
                </GlobalText>
              </GlobalText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
