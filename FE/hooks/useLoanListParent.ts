import { getLoanList, LoanItem } from "@/apis/loanParentApi";
import { useCustomQuery } from "./useCustomQuery";
import { useLoanListParentStore } from "@/stores/useLoanParentStore";
import { useIsFocused } from "@react-navigation/native";

type LoanList = LoanItem[];

export const useLoanListParentQuery = () => {
  const setLoanList = useLoanListParentStore((state) => state.setLoanList);
  const isFocused = useIsFocused();

  return useCustomQuery<LoanList, Error>({
    queryKey: ["loan-list-parent"],
    queryFn: async () => {
      const res = await getLoanList();
      return res;
    },
    enabled: isFocused,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    onSuccessAction: (data) => {
      setLoanList(data);
    },
    onErrorAction: (error) => {
      console.error("❌ 대출 목록 조회 실패:", error.message);
    },
  });
};
