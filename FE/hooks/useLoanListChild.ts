import { getLoanList, LoanItem, LoanListResponse } from "@/apis/loanChildApi";
import { useCustomQuery } from "./useCustomQuery";
import { useLoanListStore } from "@/stores/useLoanChildStore";
import { useIsFocused } from "@react-navigation/native";

export const useLoanListChildQuery = () => {
  const setLoanList = useLoanListStore((state) => state.setLoanList);
  const isFocused = useIsFocused();

  return useCustomQuery<LoanListResponse, Error>({
    queryKey: ["loan-list-child"],
    queryFn: async () => {
      try {
        const res = await getLoanList();
        // console.log("대출 목록 조회 결과:", res.data);

        if (!res?.data) {
          return {
            active_loans: [],
            loan_repayment_history: [],
          };
        }

        const response: LoanListResponse = {
          active_loans: Array.isArray(res.data.active_loans)
            ? res.data.active_loans
            : [],
          loan_repayment_history: Array.isArray(res.data.loan_repayment_history)
            ? res.data.loan_repayment_history
            : [],
        };

        return response;
      } catch (error) {
        console.error("Failed to fetch loan list:", error);
        throw error;
      }
    },
    enabled: isFocused,
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    onSuccessAction: (data: LoanListResponse) => {
      setLoanList(data.active_loans);
    },
    onErrorAction: (error: Error) => {
      console.error("Query failed:", error.message);
      setLoanList([]);
    },
  });
};
