import { useEffect, useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import LoanSummary from "../LoanSummary";
import LoanListSection from "../LoanListSection";
import { useLoanListParentQuery } from "@/hooks/useLoanListParent";
import { useLoanListParentStore } from "@/stores/useLoanParentStore";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function LoanListParent() {
  const { data: queryData, error, refetch } = useLoanListParentQuery();
  const loanList = useLoanListParentStore((state) => state.loanList);
  const [isMounted, setIsMounted] = useState(false);

  // 대출 목록을 마감 날짜가 빠른 순으로 정렬
  const sortedLoanList = [...loanList].sort((a, b) => {
    if (!a.due_date) return 1; // 날짜가 없는 항목은 뒤로
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // 에러 핸들링 useEffect
  useEffect(() => {
    if (error) {
      console.error("❌ 대출 목록 조회 실패:", error.message);
    }
  }, [error]);

  // Use useFocusEffect to refetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isMounted) return;
      console.log("대출 목록 페이지 포커스됨 - 데이터 리패칭");
      refetch();
    }, [refetch, isMounted])
  );

  const totalAmount = sortedLoanList.reduce(
    (sum, loan) => sum + loan.last_amount,
    0
  );

  return (
    <ScrollView className="flex-1 bg-[#F5F6F8]">
      <LoanSummary
        title="진행 중인 대출"
        count={sortedLoanList.length}
        totalAmount={totalAmount}
      />
      <LoanListSection
        title="대출 목록"
        loans={sortedLoanList}
        showCreditorTitle={true}
        error={!!error}
        onPress={(loanId, color) =>
          router.push({
            pathname: `/loan/parent/${loanId}`,
            params: { color },
          } as any)
        }
      />
    </ScrollView>
  );
}
