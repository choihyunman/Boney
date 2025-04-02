import { create } from "zustand";
import { ChildMainResponse, ParentMainResponse } from "@/apis/homeApi";

interface HomeStore {
  childData: ChildMainResponse["data"] | null;
  parentData: ParentMainResponse["data"] | null;
  setChildData: (data: ChildMainResponse["data"]) => void;
  setParentData: (data: ParentMainResponse["data"]) => void;
  clearData: () => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
  childData: null,
  parentData: null,
  setChildData: (data) => {
    console.log("💾 Setting child data in store:", data);
    set({ childData: data });
  },
  setParentData: (data) => {
    console.log("💾 Setting parent data in store:", data);
    set({ parentData: data });
  },
  clearData: () => {
    console.log("🗑️ Clearing store data");
    set({ childData: null, parentData: null });
  },
}));
