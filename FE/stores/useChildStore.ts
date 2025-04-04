import { child } from "@/apis/childApi";
import { create } from "zustand";

type ChildrenStore = {
  children: child[];
  setChildren: (data: child[]) => void;
  reset: () => void;
};

export const useChildrenStore = create<ChildrenStore>((set) => ({
  children: [],
  setChildren: (data) => set({ children: Array.isArray(data) ? data : [] }),
  reset: () => set({ children: [] }),
}));
