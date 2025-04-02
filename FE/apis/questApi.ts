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

export const getQuestListParent = async (): Promise<QuestListResponse> => {
  const res = await api.get("/parents/quests");
  return res.data.data;
};

export const getQuestListChild = async (): Promise<ChildQuestListResponse> => {
  const res = await api.get("/children/quests");
  return res.data.data;
};
