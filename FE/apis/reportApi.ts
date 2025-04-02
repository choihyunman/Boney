import axios from "axios";
import { API_BASE_URL } from "@/config";
import { useAuthStore } from "@/stores/useAuthStore";

export interface MonthlyReportResponse {
  status: string;
  message: string;
  data: {
    reportMonth: string;
    totalIncome: number;
    totalExpense: number;
    incomeRatio: number;
    expenseRatio: number;
    categoryExpense: {
      category: string;
      amount: number;
      percentage: number;
      transactions: {
        transactionId: number;
        amount: number;
        createdAt: string;
        transactionType: string;
        transactionContent: string;
      }[];
    }[];
    completedQuests: {
      count: number;
      totalIncome: number;
    };
    threeMonthsTrend: {
      month: string;
      income: number;
      expense: number;
    }[];
  };
}

export const fetchMonthlyReport = async (
  year: number,
  month: number
): Promise<MonthlyReportResponse> => {
  const token = useAuthStore.getState().token;
  console.log("Fetching report with:", { year, month, token });

  try {
    const response = await axios.get<MonthlyReportResponse>(
      `${API_BASE_URL}/api/v1/reports/monthly?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};
