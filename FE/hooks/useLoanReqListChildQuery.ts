import { useQuery } from "@tanstack/react-query";
import { getReqList, ReqItem } from "@/apis/loanChildApi";
import { useLoanReqListStore } from "@/stores/useLoanChildStore";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

type LoanList = ReqItem[];

export const useLoanReqListQuery = () => {
  const setReqList = useLoanReqListStore((state) => state.setReqList);
  const isFocused = useIsFocused();

  const query = useQuery<LoanList, Error, LoanList, ["loan-req-list-child"]>({
    queryKey: ["loan-req-list-child"],
    queryFn: async () => {
      const res = await getReqList();
      return res;
    },
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 10,
    enabled: isFocused,
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
