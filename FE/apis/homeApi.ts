import { api } from "@/lib/api";

export interface Quest {
  questId: number;
  childName: string;
  questTitle: string;
  questCategory: string;
  questReward: number;
  questStatus: string;
  endDate: string;
}

export interface ChildMainResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    bank_name: string;
    account_balance: number;
    all_loan: number;
    credit_score: number;
    all_score: number;
    quests: Quest[];
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
}

export interface ChildInfo {
  child_id: string;
  child_name: string;
  score: string;
  child_loan: string;
}

export interface ParentQuest extends Quest {
  quest_child: string;
}

export interface ParentMainResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    bank_name: string;
    account_balance: string;
    child: ChildInfo[];
    quest: ParentQuest[];
  };
}

export const homeApi = {
  getChildMain: async () => {
    console.log("🚀 Fetching child main data...");
    try {
      const response = await api.get<ChildMainResponse>("/main/child");
      console.log("✅ Child API Response:", response.data);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = error.response?.data || {
        status: "404",
        message: "해당 자녀가 없습니다.",
      };
      console.log("❌ Child API Error:", errorResponse.message);
      return {
        status: errorResponse.status,
        message: errorResponse.message,
        data: null,
      };
    }
  },

  getParentMain: async () => {
    console.log("🚀 Fetching parent main data...");
    try {
      const response = await api.get<ParentMainResponse>("/main/parent");
      console.log("✅ Parent API Response:", response.data);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = error.response?.data || {
        status: "404",
        message: "해당 부모가 없습니다.",
      };
      console.log("❌ Parent API Error:", errorResponse.message);
      return {
        status: errorResponse.status,
        message: errorResponse.message,
        data: null,
      };
    }
  },
};
