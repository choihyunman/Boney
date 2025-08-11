import { create } from "zustand";
import {
  QuestCreateResponse,
  ChildQuestList,
  ParentQuestList,
} from "@/apis/questApi";

interface QuestCreateState {
  parentChildId: number | null;
  questCategoryId: number | null;
  questCategoryName: string;
  questTitle: string;
  questReward: number;
  endDate: string;
  questMessage: string;
  setParentChildId: (id: number) => void;
  setQuestCategoryId: (id: number) => void;
  setQuestCategoryName: (name: string) => void;
  setQuestTitle: (title: string) => void;
  setQuestReward: (reward: number) => void;
  setEndDate: (date: string) => void;
  setQuestMessage: (message: string) => void;
  reset: () => void;
}

export const useQuestCreateStore = create<QuestCreateState>((set) => ({
  parentChildId: null,
  questCategoryId: null,
  questCategoryName: "",
  questTitle: "",
  questReward: 0,
  endDate: "",
  questMessage: "",
  setParentChildId: (id) => set({ parentChildId: id }),
  setQuestCategoryId: (id) => set({ questCategoryId: id }),
  setQuestCategoryName: (name) => set({ questCategoryName: name }),
  setQuestTitle: (title) => set({ questTitle: title }),
  setQuestReward: (reward) => set({ questReward: reward }),
  setEndDate: (date) => set({ endDate: date }),
  setQuestMessage: (message) => set({ questMessage: message }),
  reset: () =>
    set({
      parentChildId: null,
      questCategoryId: null,
      questCategoryName: "",
      questTitle: "",
      questReward: 0,
      endDate: "",
      questMessage: "",
    }),
}));

export const useQuestCreateResponseStore = create<QuestCreateResponse>(
  (set) => ({
    childName: "",
    questTitle: "",
    questCategory: "",
    questReward: 0,
    endDate: "",
    questMessage: "",
    setChildName: (name: string) => set({ childName: name }),
    setQuestTitle: (title: string) => set({ questTitle: title }),
    setQuestCategory: (category: string) => set({ questCategory: category }),
    setQuestReward: (reward: number) => set({ questReward: reward }),
    setEndDate: (date: string) => set({ endDate: date }),
    setQuestMessage: (message: string) => set({ questMessage: message }),

    setAll: (
      data: Partial<
        Omit<
          QuestCreateResponse,
          | "setChildName"
          | "setQuestTitle"
          | "setQuestCategory"
          | "setQuestReward"
          | "setEndDate"
          | "setQuestMessage"
          | "setAll"
        >
      >
    ) => set(data),
  })
);

export interface QuestCompleteState {
  categoryName: string;
  categoryTitle: string;
  amount: number;
  finishDate: string;
  setCategoryName: (name: string) => void;
  setCategoryTitle: (title: string) => void;
  setAmount: (amount: number) => void;
  setFinishDate: (date: string) => void;
  reset: () => void;
}

export interface QuestApprovalState {
  questTitle: string;
  childName: string;
  approvalDate: string;
  amount: number;
  setQuestTitle: (title: string) => void;
  setChildName: (name: string) => void;
  setApprovalDate: (date: string) => void;
  setAmount: (amount: number) => void;
  reset: () => void;
}

export const useQuestCompleteStore = create<QuestCompleteState>((set) => ({
  categoryName: "",
  categoryTitle: "",
  amount: 0,
  finishDate: "",
  setCategoryName: (name: string) => set({ categoryName: name }),
  setCategoryTitle: (title: string) => set({ categoryTitle: title }),
  setAmount: (amount: number) => set({ amount: amount }),
  setFinishDate: (date: string) => set({ finishDate: date }),
  reset: () =>
    set({ categoryName: "", categoryTitle: "", amount: 0, finishDate: "" }),
}));

export const useQuestApprovalStore = create<QuestApprovalState>((set) => ({
  questTitle: "",
  childName: "",
  approvalDate: "",
  amount: 0,
  setQuestTitle: (title: string) => set({ questTitle: title }),
  setChildName: (name: string) => set({ childName: name }),
  setApprovalDate: (date: string) => set({ approvalDate: date }),
  setAmount: (amount: number) => set({ amount: amount }),
  reset: () =>
    set({ questTitle: "", childName: "", approvalDate: "", amount: 0 }),
}));

export interface QuestListState {
  questList: ChildQuestList[]; // 그냥 배열!
  setQuestList: (questList: ChildQuestList[]) => void;
  reset: () => void;
}

export const useQuestListStore = create<QuestListState>((set) => ({
  questList: [], // 초기값은 배열
  setQuestList: (questList: ChildQuestList[]) => set({ questList }),
  reset: () => set({ questList: [] }),
}));

export interface QuestListParentState {
  questList: ParentQuestList[];
  setQuestList: (questList: ParentQuestList[]) => void;
  reset: () => void;
}

export const useQuestListParentStore = create<QuestListParentState>((set) => ({
  questList: [],
  setQuestList: (questList) =>
    set({ questList: Array.isArray(questList) ? questList : [] }),
  reset: () => set({ questList: [] }),
}));
