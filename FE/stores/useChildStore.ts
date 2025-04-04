import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

interface Child {
  parentChildId: number;
  childId: number;
  childName: string;
  childGender: string;
}

interface ChildStore {
  children: Child[];
  setChildren: (children: Child[]) => void;
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

export const useChildStore = create<ChildStore>()(
  persist(
    (set) => ({
      children: [],
      setChildren: (children) => set({ children }),
    }),
    {
      name: "child-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
