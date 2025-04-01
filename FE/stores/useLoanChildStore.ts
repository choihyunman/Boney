import { create } from "zustand";
import { useMutation } from "@tanstack/react-query";
import {
  createLoan,
  CreateLoanRequest,
  CreateLoanResponse,
  LoanItem,
  RepaymentRequest,
  RepaymentResponse,
  ReqItem,
} from "@/apis/loanChildApi";

type LoanStore = {
  latestLoan?: CreateLoanResponse["data"];
  setLatestLoan: (data: CreateLoanResponse["data"]) => void;
};

type LoanRequest = {
  amount: number;
  dueDate: string;
  requestDate: string; // 신청 날짜
  signImage?: string;
  pin?: string;
};

type LoanRequestStore = {
  request: Partial<LoanRequest>;
  setRequest: <K extends keyof LoanRequest>(
    key: K,
    value: LoanRequest[K]
  ) => void;
  reset: () => void;
};

type LoanReqListStore = {
  reqList: ReqItem[];
  setReqList: (data: ReqItem[]) => void;
};

type LoanListStore = {
  loanList: LoanItem[];
  setLoanList: (data: LoanItem[]) => void;
};

type LoanRepaymentStore = {
  repayment: Partial<RepaymentRequest>;
  setRepayment: <K extends keyof RepaymentRequest>(
    key: K,
    value: RepaymentRequest[K]
  ) => void;
};

type LoanState = {
  totalAmount: number;
  remainingAmount: number;
  remainingDays: string;
  remainingDaysColor: string;
  setLoanInfo: (data: {
    totalAmount: number;
    remainingAmount: number;
    remainingDays: string;
    remainingDaysColor: string;
  }) => void;
  reset: () => void;
};

type RepaymentState = {
  repaymentAmount: number;
  setRepaymentAmount: (amount: number) => void;
  reset: () => void;
};

type RepaymentResult = {
  repaymentResult?: RepaymentResponse;
  setRepaymentResult: (result: RepaymentResponse) => void;
  reset: () => void;
};

export const useLoanStore = create<LoanStore>((set) => ({
  latestLoan: undefined,
  setLatestLoan: (data) => set({ latestLoan: data }),
}));

export const useLoanRequestStore = create<LoanRequestStore>((set) => ({
  request: {},
  setRequest: (key, value) =>
    set((state) => ({
      request: { ...state.request, [key]: value },
    })),
  reset: () => set({ request: {} }),
}));

export const useLoanReqListStore = create<LoanReqListStore>((set) => ({
  reqList: [],
  setReqList: (data) => set({ reqList: Array.isArray(data) ? data : [] }),
}));

export const useLoanListStore = create<LoanListStore>((set) => ({
  loanList: [],
  setLoanList: (data) => set({ loanList: Array.isArray(data) ? data : [] }),
}));

export const useLoanRepaymentStore = create<LoanRepaymentStore>((set) => ({
  repayment: {},
  setRepayment: (key, value) =>
    set((state) => ({
      repayment: { ...state.repayment, [key]: value },
    })),
}));

export const useLoanStateStore = create<LoanState>((set) => ({
  totalAmount: 0,
  remainingAmount: 0,
  remainingDays: "",
  remainingDaysColor: "",
  setLoanInfo: (data) => set(data),
  reset: () =>
    set({
      totalAmount: 0,
      remainingAmount: 0,
      remainingDays: "",
      remainingDaysColor: "",
    }),
}));

export const useRepaymentStateStore = create<RepaymentState>((set) => ({
  repaymentAmount: 0,
  setRepaymentAmount: (amount) => set({ repaymentAmount: amount }),
  reset: () => set({ repaymentAmount: 0 }),
}));

export const useRepaymentResultStore = create<RepaymentResult>((set) => ({
  repaymentResult: undefined,
  setRepaymentResult: (result) => set({ repaymentResult: result }),
  reset: () => set({ repaymentResult: undefined }),
}));

// react-query 훅
export const useCreateLoanMutation = () => {
  const setLatestLoan = useLoanStore((state) => state.setLatestLoan);

  return useMutation<CreateLoanResponse, Error, CreateLoanRequest>({
    mutationFn: createLoan,
    onSuccess: (data) => {
      setLatestLoan(data.data);
    },
    onError: (error) => {
      console.error("대출 요청 실패:", error);
    },
  });
};
