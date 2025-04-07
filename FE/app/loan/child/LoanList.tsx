import { useEffect, useState, useCallback } from "react";
import { ScrollView } from "react-native";
import LoanSummary from "../LoanSummary";
import LoanListSection from "../LoanListSection";
import { useLoanListStore } from "@/stores/useLoanChildStore";
import { useLoanListChildQuery } from "@/hooks/useLoanListChild";
import { router, useFocusEffect } from "expo-router";
import LoanTrendChart from "../LoanTrendChart";
import { RepaymentHistoryItem } from "@/apis/loanChildApi";

export default function LoanListChild() {
  const { data: queryData, error, refetch } = useLoanListChildQuery();
  const loanList = useLoanListStore((state) => state.loanList);
  const [repaymentHistory, setRepaymentHistory] = useState<
    RepaymentHistoryItem[]
  >([]);
  const [key, setKey] = useState(0);

  // queryData 변경 시 상태 업데이트
  useEffect(() => {
    if (queryData?.loan_repayment_history) {
      setRepaymentHistory(queryData.loan_repayment_history);
      setKey((prev) => prev + 1);
    }
  }, [queryData]);

  // Use useFocusEffect to refetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
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
      console.error("대출 목록 조회 실패:", error.message);
      setRepaymentHistory([]);
    }
  }, [error]);

  const totalAmount = loanList.reduce((sum, loan) => sum + loan.last_amount, 0);

  // 차트 데이터 유효성 확인
  const hasValidChartData = loanList.length > 0 && repaymentHistory.length > 0;

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB]">
      <LoanSummary
        title="보유 중인 대출"
        count={loanList.length}
        totalAmount={totalAmount}
      />
      {hasValidChartData && (
        <LoanTrendChart
          key={`trend-chart-${key}-${loanList.length}-${repaymentHistory.length}`}
          loans={loanList}
          repaymentHistory={repaymentHistory}
        />
      )}
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
