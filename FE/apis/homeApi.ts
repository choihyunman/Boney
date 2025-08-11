import { api } from "@/lib/api";

export interface Quest {
  quest_id: number;
  quest_child: string;
  quest_title: string;
  quest_category: string;
  quest_reward: number;
  quest_status: string;
  end_date: string;
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
    quest: Quest[];
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
}

export interface ChildInfo {
  child_id: number;
  child_name: string;
  credit_score: number;
  total_child_loan: number;
}

export interface ParentMainResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    bank_name: string;
    account_balance: number;
    child: ChildInfo[];
    quest: Quest[];
    parent_name: string;
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
