import { create } from "zustand";

interface RegularTransfer {
  scheduledAmount: number;
  scheduledFrequency: "weekly" | "monthly";
  startDate: number;
}

interface ChildDetail {
  childId: number;
  childName: string;
  creditScore: number;
  loanAmount: number;
  bankName: string;
  accountNumber: string;
  regularTransfer?: RegularTransfer;
}

interface ChildDetailStore {
  childDetail: ChildDetail | null;
  setChildDetail: (childDetail: ChildDetail | null) => void;
}

export const useChildDetailStore = create<ChildDetailStore>()((set) => ({
  childDetail: null,
  setChildDetail: (childDetail) => set({ childDetail }),
}));
