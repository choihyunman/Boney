import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import GlobalText from "@/components/GlobalText";
import { useLoanDetailParentStore } from "@/stores/useLoanParentStore";
import { useLoanDetailParent } from "@/hooks/useLoanDetailParent";
import BottomButton from "@/components/Button";
import { useLoanStateStore } from "@/stores/useLoanChildStore";
import PromissoryNote from "../PromissoryNote";
import Signature from "../parent/Signature";

export default function LoanDetailChild() {
  const { loanId, color } = useLocalSearchParams<{
    loanId: string;
    color: string;
  }>();
  const {
    data: loanDetail,
    isLoading,
    refetch,
    error,
  } = useLoanDetailParent(Number(loanId));
  const [currentTime, setCurrentTime] = useState("");
  const { setLoanInfo } = useLoanStateStore((state) => state);

  // 모든 hooks를 최상위에 배치
  useEffect(() => {
    if (!isLoading) {
      refetch();
    }
  }, [ isLoading, refetch]);

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

  // 로딩 상태일 때
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F5F6F8]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4FC985" />
          <GlobalText className="mt-2">데이터 로딩 중...</GlobalText>
        </View>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View className="flex-1 bg-[#F5F6F8]">
        <View className="flex-1 justify-center items-center">
          <GlobalText>데이터 로딩 중 오류가 발생했습니다.</GlobalText>
          <GlobalText className="mt-2">{error.message}</GlobalText>
        </View>
      </View>
    );
  }

  // 데이터 없음
  if (!loanDetail) {
    return (
      <View className="flex-1 bg-[#F5F6F8]">
        <View className="flex-1 justify-center items-center">
          <GlobalText>대출 정보를 불러올 수 없습니다.</GlobalText>
        </View>
      </View>
    );
  }

  const repaymentDate = loanDetail.due_date;
  const loanAmount = loanDetail.loan_amount;
  const lastAmount = loanDetail.last_amount;
  const childName = loanDetail.child_name;
  const parentName = loanDetail.parent_name;
  const approvedAt = loanDetail.approved_at;
  const childSignature = loanDetail.child_signature;
  const parentSignature = loanDetail.parent_signature;

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

  return (
    <View className="flex-1 bg-[#F5F6F8]">
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
                남은 날짜
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
        <BottomButton
          onPress={() => {
            setLoanInfo({
              totalAmount: loanAmount ?? 0,
              remainingAmount: lastAmount ?? 0,
              remainingDays: getDdayInfo().text,
              remainingDaysColor: getDdayInfo().color,
            });
            router.push({
              pathname: "/loan/child/Repayment",
              params: { loanId },
            } as any);
          }}
          text="상환하기"
        />
      </ScrollView>
    </View>
  );
}
