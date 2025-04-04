import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import LoanSummary from "../LoanSummary";
import LoanListSection from "../LoanListSection";
import { useLoanListStore } from "@/stores/useLoanChildStore";
import { useLoanListChildQuery } from "@/hooks/useLoanListChild";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import LoanTrendChart from "../LoanTrendChart";

export default function LoanListChild() {
  const { data: queryData, error, refetch } = useLoanListChildQuery();
  const loanList = useLoanListStore((state) => state.loanList);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log("대출 목록 새로고침");
      refetch();
    }, [refetch])
  );

  // 3초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("대출 목록 자동 새로고침");
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  // 에러 핸들링 useEffect
  useEffect(() => {
    if (error) {
      console.error("❌ 대출 목록 조회 실패:", error.message);
    }
  }, [error]);

  const totalAmount = loanList.reduce((sum, loan) => sum + loan.last_amount, 0);

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB]">
      <LoanSummary
        title="보유 중인 대출"
        count={loanList.length}
        totalAmount={totalAmount}
      />
      <LoanTrendChart loans={loanList} />
      <LoanListSection
        title="대출 목록"
        loans={loanList}
        showCreditorTitle={false}
        onPress={(loanId, color) =>
          router.push({
            pathname: `/loan/child/${loanId}`,
            params: { color },
          } as any)
        }
      />
    </ScrollView>
  );
}
