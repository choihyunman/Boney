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
      const res = await getLoanDetail(loanId);
      return res;
    },
    enabled: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 3000,
  });

  // 에러 처리
  useEffect(() => {
    if (query.isError && query.error) {
      console.error("대출 상세 조회 실패:", query.error.message);
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
