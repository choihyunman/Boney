import { LoanDetail } from "@/apis/loanParentApi";
import { getLoanDetail } from "@/apis/loanParentApi";
import { useLoanDetailParentStore } from "@/stores/useLoanParentStore";
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useLoanDetailParent = (loanId: number) => {
  const setLoanDetail = useLoanDetailParentStore(
    (state) => state.setLoanDetail
  );
  const isFocused = useIsFocused();

  const query = useQuery<
    LoanDetail,
    Error,
    LoanDetail,
    ["loan-detail-parent", number]
  >({
    queryKey: ["loan-detail-parent", loanId],
    queryFn: async () => {
      console.log("🔍 대출 상세 조회 시작, loanId:", loanId);
      const res = await getLoanDetail(loanId);
      return res;
    },
    enabled: isFocused,
    staleTime: 1000 * 60 * 3,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 1,
  });

  // 에러 처리 (v5 스타일)
  useEffect(() => {
    if (query.isError && query.error) {
      console.error("❌ 대출 상세 조회 실패:", query.error.message);
    }
  }, [query.isError, query.error]);

  // 상태 저장소에 값 설정
  useEffect(() => {
    if (query.data) {
      setLoanDetail(query.data);
    }
  }, [query.data, setLoanDetail]);

  return query;
};
