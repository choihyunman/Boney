import { getLoanList, LoanItem } from "@/apis/loanChildApi";
import { useCustomQuery } from "./useCustomQuery";
import { useLoanListStore } from "@/stores/useLoanChildStore";
import { useIsFocused } from "@react-navigation/native";

type LoanList = LoanItem[];

export const useLoanListChildQuery = () => {
  const setLoanList = useLoanListStore((state) => state.setLoanList);
  const isFocused = useIsFocused();

  return useCustomQuery<LoanList, Error>({
    queryKey: ["loan-list-child"],
    queryFn: async () => {
      const res = await getLoanList();
      return res;
    },
    enabled: isFocused,
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60,
    onSuccessAction: (data) => {
      setLoanList(data);
    },
    onErrorAction: (error) => {
      console.error("❌ 아이 대출 목록 조회 실패:", error.message);
    },
  });
};
