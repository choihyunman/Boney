import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

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
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error("Error saving to secure store:", error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error("Error removing from secure store:", error);
    }
  },
};

export const useChildDetailStore = create<ChildDetailStore>()(
  persist(
    (set) => ({
      childDetail: null,
      setChildDetail: (childDetail) => set({ childDetail }),
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "child-detail-storage",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
