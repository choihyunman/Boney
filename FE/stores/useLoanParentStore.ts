import { create } from "zustand";
import {
  LoanItem,
  ReqItem,
  LoanDetail,
  ApproveLoanResponse,
} from "@/apis/loanParentApi";

// 요청 목록
type LoanParentStore = {
  reqList: ReqItem[];
  setReqList: (data: ReqItem[]) => void;
};

type LoanList = {
  loanList: LoanItem[];
  setLoanList: (data: LoanItem[]) => void;
};

type LoanDetailStore = {
  loanDetail: LoanDetail | null;
  setLoanDetail: (data: LoanDetail) => void;
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

export const useReqListParentStore = create<LoanParentStore>((set) => ({
  reqList: [],
  setReqList: (data) => set({ reqList: data }),
}));

export const useLoanListParentStore = create<LoanList>((set) => ({
  loanList: [],
  setLoanList: (data) => set({ loanList: data }),
}));

export const useLoanDetailParentStore = create<LoanDetailStore>((set) => ({
  loanDetail: null,
  setLoanDetail: (data) => set({ loanDetail: data }),
}));

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
