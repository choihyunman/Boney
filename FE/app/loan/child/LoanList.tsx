import { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import LoanSummary from "../LoanSummary";
import LoanListSection from "../LoanListSection";
import { useLoanListStore } from "@/stores/useLoanChildStore";
import { useLoanListChildQuery } from "@/hooks/useLoanListChild";
import { router } from "expo-router";

export default function LoanListChild() {
  const { data: queryData, error, refetch } = useLoanListChildQuery();
  const loanList = useLoanListStore((state) => state.loanList);

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
