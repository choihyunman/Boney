import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMutation } from "@tanstack/react-query";
import { ReqItem } from "@/apis/loanParentApi";
import { zustandSecureStorage } from "@/lib/secureStorage";

type LoanParentStore = {
  reqList: ReqItem[];
  setReqList: (data: ReqItem[]) => void;
  hydrated: boolean;
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
