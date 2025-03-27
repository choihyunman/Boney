import { create } from "zustand";

interface PendingLoan {
  id: string;
  amount: number;
  repaymentDate: string;
  applicationDate: string;
}

interface LoanStore {
  pendingLoans: PendingLoan[];
  setPendingLoans: (loans: PendingLoan[]) => void;
}

export const useLoanStore = create<LoanStore>((set) => ({
  pendingLoans: [],
  setPendingLoans: (loans: PendingLoan[]) => set({ pendingLoans: loans }),
}));

