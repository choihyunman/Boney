import { create } from "zustand";

interface LoanData {
  loan_amount: number;
  due_date: string;
  purpose?: string;
  signature?: string;
}

interface LoanStore {
  loanData: LoanData;
  setLoanData: (data: LoanData) => void;
}

export const useLoanStore = create<LoanStore>((set) => ({
  loanData: {
    loan_amount: 0,
    due_date: "",
  },
  setLoanData: (data) => set({ loanData: data }),
}));
