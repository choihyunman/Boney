import { create } from "zustand";

interface QuestDetail {
  questId: number;
  questTitle: string;
  questCategory: string;
  childName?: string;
  endDate: string;
  questReward: number;
  questStatus: "WAITING_REWARD" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
}
