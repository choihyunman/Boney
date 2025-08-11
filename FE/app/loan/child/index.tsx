import { useEffect, useState, useCallback } from "react";
import { BackHandler, ScrollView } from "react-native";
import LoanSummary from "../LoanSummary";
import LoanListSection from "../LoanListSection";
import { useLoanListStore } from "@/stores/useLoanChildStore";
import { useLoanListChildQuery } from "@/hooks/useLoanListChild";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import LoanTrendChart from "../LoanTrendChart";
import { RepaymentHistoryItem } from "@/apis/loanChildApi";

export default function LoanListChild() {
  const { fromRepayment } = useLocalSearchParams();
  const { data: queryData, error, refetch } = useLoanListChildQuery();
  const loanList = useLoanListStore((state) => state.loanList);

  const [repaymentHistory, setRepaymentHistory] = useState<
    RepaymentHistoryItem[]
  >([]);
  const [key, setKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const sortedLoanList = [...loanList].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // 서버에서 받아온 대출 목록 및 상환 기록을 로컬 상태에 저장
  useEffect(() => {
    if (queryData) {
      setRepaymentHistory(queryData.loan_repayment_history || []);
      useLoanListStore.getState().setLoanList(queryData.active_loans || []);
      setKey((prev) => prev + 1);
    }
  }, [queryData]);

  // 서버 에러가 발생했을 때 로컬 상태 초기화 (특히 404 에러)
  useEffect(() => {
    if (
      error?.message.includes("아이에 해당하는 대출 내역이 존재하지 않습니다.")
    ) {
      console.warn("404 감지 - 대출 목록과 히스토리 초기화");
      useLoanListStore.getState().setLoanList([]);
      setRepaymentHistory([]);
    }
  }, [error]);

  useFocusEffect(
    useCallback(() => {
      if (!isMounted) return;
      console.log("대출 목록 페이지 포커스됨 - 데이터 리패칭");
      refetch();
    }, [refetch, isMounted])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (fromRepayment) {
          router.replace("/menu");
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [fromRepayment])
  );

  const totalAmount = sortedLoanList.reduce(
    (sum, loan) => sum + loan.last_amount,
    0
  );
  const hasValidChartData =
    sortedLoanList.length > 0 && repaymentHistory.length > 0;

  return (
    <ScrollView className="flex-1 bg-[#F5F6F8]">
      <LoanSummary
        title="보유 중인 대출"
        count={sortedLoanList.length}
        totalAmount={totalAmount}
      />
      {hasValidChartData && (
        <LoanTrendChart
          key={`trend-chart-${key}-${sortedLoanList.length}-${repaymentHistory.length}`}
          loans={sortedLoanList}
          repaymentHistory={repaymentHistory}
        />
      )}
      <LoanListSection
        title="대출 목록"
        loans={sortedLoanList}
        showCreditorTitle={false}
        error={!!error}
        emptyMessage="보유 중인 대출이 없습니다."
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
