import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LoanItem,
  ReqItem,
  LoanDetail,
  ApproveLoanResponse,
} from "@/apis/loanParentApi";
import { zustandSecureStorage } from "@/lib/secureStorage";

// 요청 목록
type LoanParentStore = {
  reqList: ReqItem[];
  setReqList: (data: ReqItem[]) => void;
  hydrated: boolean;
};

type LoanList = {
  loanList: LoanItem[];
  setLoanList: (data: LoanItem[]) => void;
  hydrated: boolean;
};

type LoanDetailStore = {
  loanDetail: LoanDetail | null;
  setLoanDetail: (data: LoanDetail) => void;
  hydrated: boolean;
};

type LoanApproveStore = {
  approve: Partial<ApproveLoanResponse>;
  isLoaded: boolean;
  setApprove: <K extends keyof ApproveLoanResponse>(
    key: K,
    value: ApproveLoanResponse[K]
  ) => void;
  reset: () => void;
};

// 차용증 데이터 스토어
type PromissoryNoteStore = {
  promissoryNoteData: {
    loanAmount: number;
    repaymentDate: string;
    debtorName: string;
    debtorSign: string;
    loanId: number;
  } | null;
  setPromissoryNoteData: (data: {
    loanAmount: number;
    repaymentDate: string;
    debtorName: string;
    debtorSign: string;
    loanId: number;
  }) => void;
  clearPromissoryNoteData: () => void;
};

export const useReqListParentStore = create<LoanParentStore>()(
  persist(
    (set) => ({
      reqList: [],
      setReqList: (data) => set({ reqList: data }),
      hydrated: false,
    }),
    {
      name: "loan-req-list-parent",
      storage: zustandSecureStorage,
      onRehydrateStorage: () => {
        return (_, error) => {
          if (!error) {
            useReqListParentStore.setState((state) => ({
              ...state,
              hydrated: true,
            }));
          }
        };
      },
    }
  )
);

export const useLoanListParentStore = create<LoanList>()(
  persist(
    (set) => ({
      loanList: [],
      setLoanList: (data) => set({ loanList: data }),
      hydrated: false,
    }),
    {
      name: "loan-list-parent",
      storage: zustandSecureStorage,
      onRehydrateStorage: () => {
        return (_, error) => {
          if (!error) {
            useLoanListParentStore.setState((state) => ({
              ...state,
              hydrated: true,
            }));
          }
        };
      },
    }
  )
);

export const useLoanDetailParentStore = create<LoanDetailStore>()(
  persist(
    (set) => ({
      loanDetail: null,
      setLoanDetail: (data) => set({ loanDetail: data }),
      hydrated: false,
    }),
    {
      name: "loan-detail-parent",
      storage: zustandSecureStorage,
      onRehydrateStorage: () => {
        return (_, error) => {
          if (!error) {
            useLoanDetailParentStore.setState((state) => ({
              ...state,
              hydrated: true,
            }));
          }
        };
      },
    }
  )
);

export const useApproveStore = create<LoanApproveStore>((set) => ({
  approve: {},
  isLoaded: false,
  setApprove: (key, value) =>
    set((state) => ({
      approve: { ...state.approve, [key]: value },
      isLoaded: true,
    })),
  reset: () => set({ approve: {} }),
}));

// 차용증 데이터 스토어 생성
export const usePromissoryNoteStore = create<PromissoryNoteStore>((set) => ({
  promissoryNoteData: null,
  setPromissoryNoteData: (data) => set({ promissoryNoteData: data }),
  clearPromissoryNoteData: () => set({ promissoryNoteData: null }),
}));
