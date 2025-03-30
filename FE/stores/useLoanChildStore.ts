import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMutation } from "@tanstack/react-query";
import {
  createLoan,
  CreateLoanRequest,
  CreateLoanResponse,
  ReqItem,
} from "@/apis/loanApi";
import { zustandSecureStorage } from "@/lib/secureStorage";

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
  setField: <K extends keyof LoanRequest>(
    key: K,
    value: LoanRequest[K]
  ) => void;
  reset: () => void;
};

type LoanReqListStore = {
  reqList: ReqItem[];
  setReqList: (data: ReqItem[]) => void;
  hydrated: boolean;
};

export const useLoanStore = create<LoanStore>()(
  persist(
    (set) => ({
      latestLoan: undefined,
      setLatestLoan: (data) => set({ latestLoan: data }),
    }),
    {
      name: "loan-storage",
      storage: zustandSecureStorage,
    }
  )
);

export const useLoanRequestStore = create<LoanRequestStore>()(
  persist(
    (set) => ({
      request: {},
      setField: (key, value) =>
        set((state) => ({
          request: { ...state.request, [key]: value },
        })),
      reset: () => set({ request: {} }),
    }),
    {
      name: "loan-request",
      storage: zustandSecureStorage,
    }
  )
);

export const useLoanReqListStore = create<LoanReqListStore>()(
  persist(
    (set) => ({
      reqList: [],
      setReqList: (data) => set({ reqList: Array.isArray(data) ? data : [] }),
      hydrated: false,
    }),
    {
      name: "loan-req-list",
      storage: zustandSecureStorage,
      onRehydrateStorage: () => {
        return (_, error) => {
          if (!error) {
            useLoanReqListStore.setState((state) => ({
              ...state,
              hydrated: true,
            }));
          }
        };
      },
    }
  )
);

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
