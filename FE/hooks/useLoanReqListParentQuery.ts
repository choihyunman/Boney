import { useQuery } from "@tanstack/react-query";
import { getReqList, ReqItem } from "@/apis/loanParentApi";
import { useEffect } from "react";
import { useReqListParentStore } from "@/stores/useLoanParentStore";

type LoanList = ReqItem[];

export const useLoanReqListParentQuery = () => {
  const setReqList = useReqListParentStore((state) => state.setReqList);
  const hydrated = useReqListParentStore((state) => state.hydrated);

  const query = useQuery<LoanList, Error, LoanList, ["loan-req-list-parent"]>({
    queryKey: ["loan-req-list-parent"],
    queryFn: async () => {
      const res = await getReqList();
      return res;
    },
    staleTime: 0,
    enabled: hydrated,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: hydrated ? 1000 : false,
  });

  // 에러 처리 (v5 스타일)
  useEffect(() => {
    if (query.isError && query.error) {
      console.error("❌ 대출 목록 조회 실패:", query.error.message);
    }
  }, [query.isError, query.error]);

  // 상태 저장소에 값 설정
  useEffect(() => {
    if (query.data) {
      setReqList(Array.isArray(query.data) ? query.data : []);
    }
  }, [query.data, setReqList]);

  return query;
};
