import { api } from "@/lib/api";

export interface BaseQuest {
  questId: number;
  questTitle: string;
  questCategory: string;
  questReward: number;
  questStatus: "IN_PROGRESS" | "WAITING_REWARD" | "SUCCESS" | "FAILED";
  endDate: string;
}

export interface ParentQuestList extends BaseQuest {
  childName: string;
}

export interface ChildQuestList extends BaseQuest {}

export interface QuestListResponse {
  quests: ParentQuestList[];
}

export interface ChildQuestListResponse {
  quests: ChildQuestList[];
}

export interface ParentQuestDetailResponse {
  childName: string;
  questImgUrl: string;
}

export interface ChildQuestDetailResponse {
  questImgUrl: string;
}

export interface NewQuest {
  parentChildId: number;
  questCategoryId: number;
  questTitle: string;
  questReward: number;
  endDate: string;
  questMessage: string;
}

export interface QuestCreateResponse {
  childName: string;
  questTitle: string;
  questCategory: string;
  questReward: number;
  endDate: string;
  questMessage: string;
  setChildName: (name: string) => void;
  setQuestTitle: (title: string) => void;
  setQuestCategory: (category: string) => void;
  setQuestReward: (reward: number) => void;
  setEndDate: (date: string) => void;
  setQuestMessage: (message: string) => void;
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
  ) => void;
}

export interface QuestDetailResponse {
  questId: number;
  questTitle: string;
  questCategory: string;
  questReward: number;
  endDate: string;
}

export const getQuestListParent = async (): Promise<QuestListResponse> => {
  const res = await api.get("/parents/quests");
  return res.data.data;
};

export const getQuestListChild = async (): Promise<ChildQuestListResponse> => {
  const res = await api.get("/children/quests");
  return res.data.data;
};

export const createQuest = async (
  quest: NewQuest
): Promise<QuestCreateResponse> => {
  const res = await api.post("/parents/quests", quest);
  return res.data.data;
};

export const getQuestDetailChild = async (
  questId: number
): Promise<ChildQuestDetailResponse> => {
  const res = await api.get(`parents/quests/${questId}`);
  return res.data.data;
};
