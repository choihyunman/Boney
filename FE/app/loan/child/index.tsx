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

  // queryData 변경 시 상태 업데이트
  useEffect(() => {
    if (queryData) {
      if (queryData.loan_repayment_history) {
        setRepaymentHistory(queryData.loan_repayment_history);
      }

      if (queryData.active_loans) {
        useLoanListStore.getState().setLoanList(queryData.active_loans);
      } else {
        useLoanListStore.getState().setLoanList([]); // 혹시 없으면 빈 리스트로 초기화
      }

      setKey((prev) => prev + 1);
    } else {
      // 🔥 queryData 자체가 없는 경우: (ex. 404가 와서 에러났을 때)
      console.log("queryData 없음 - 대출 목록 초기화");
      useLoanListStore.getState().setLoanList([]);
    }
  }, [queryData]);

  // Use useFocusEffect to refetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isMounted) return;
      console.log("대출 목록 페이지 포커스됨 - 데이터 리패칭");
      refetch();
    }, [refetch, isMounted])
  );

  // 3초마다 자동 새로고침
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!isMounted) return;
  //     // console.log("대출 목록 자동 새로고침");
  //     refetch();
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [refetch, isMounted]);

  // 에러 핸들링 useEffect
  useEffect(() => {
    if (error) {
      console.error("대출 목록 조회 실패:", error.message);
    }
  }, [error]);

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
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [fromRepayment])
  );

  const totalAmount = sortedLoanList.reduce(
    (sum, loan) => sum + loan.last_amount,
    0
  );

  // 차트 데이터 유효성 확인
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
