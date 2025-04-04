import { create } from "zustand";
import { QuestCreateResponse } from "@/apis/questApi";

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
