import { create } from "zustand";
import { fetchMonthlyReport, MonthlyReportResponse } from "../apis/reportApi";
import axios from "axios";

interface ReportState {
  monthlyReport: MonthlyReportResponse["data"] | null;
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  fetchReport: (year: number, month: number) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  monthlyReport: null,
  isLoading: false,
  error: null,
  selectedCategory: null,

  fetchReport: async (year: number, month: number) => {
    console.log("Starting fetchReport:", { year, month });
    set({ isLoading: true, error: null, selectedCategory: null });
    try {
      const response = await fetchMonthlyReport(year, month);
      console.log("Store received response:", response);
      set({ monthlyReport: response.data, isLoading: false });
    } catch (error) {
      console.error("Store Error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Store Axios Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
      set({
        error: "리포트 데이터를 불러오는데 실패했습니다.",
        isLoading: false,
        selectedCategory: null,
      });
    }
  },

  setSelectedCategory: (category: string | null) => {
    set((state) => {
      if (category && state.monthlyReport) {
        const categoryExists = state.monthlyReport.categoryExpense.some(
          (cat) => cat.category === category
        );
        if (!categoryExists) {
          console.warn("Selected category does not exist in current data");
          return { selectedCategory: null };
        }
      }
      return { selectedCategory: category };
    });
  },
}));
