import axios from "axios";
import { API_BASE_URL } from "../config";

// API 응답 타입 정의
export interface TransactionResponse {
  status: string;
  message: string;
  data: Transaction[];
}

export interface Transaction {
  transactionId: number;
  transactionDate: string;
  transactionContent: string;
  transactionAmount: number;
  transactionType: "WITHDRAWAL" | "DEPOSIT";
  transactionCategoryName: string;
  hashtags: string[];
  transactionAfterBalance: number;
}

// API 요청 파라미터 타입 정의
export interface TransactionQueryParams {
  year: string;
  month: string;
  type?: "all" | "withdrawal" | "deposit";
}

// 거래 내역 조회 API
export const getTransactionHistory = async (
  params: TransactionQueryParams,
  token: string
): Promise<TransactionResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/transaction`, {
      params: {
        year: params.year,
        month: params.month,
        type: params.type || "all",
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "거래 내역 조회 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};

export interface TransactionDetailResponse {
  status: string;
  message?: string;
  data: {
    transactionId: number;
    transactionDate: string;
    transactionContent: string;
    transactionAmount: number;
    transactionType: "WITHDRAWAL" | "DEPOSIT";
    transactionCategoryName: string;
    hashtags: string[];
    transactionAfterBalance: number;
  };
}

// 거래 상세 내역 조회 API
export const getTransactionDetail = async (
  transactionId: number,
  token: string
): Promise<TransactionDetailResponse> => {
  if (!token) {
    throw new Error("인증 토큰이 없습니다.");
  }

  try {
    console.log("📡 API 호출:", {
      url: `${API_BASE_URL}/api/v1/transaction/${transactionId}`,
      hasToken: true,
    });

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/transaction/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("🚫 API 에러:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        transactionId,
      });

      switch (error.response?.status) {
        case 401:
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
        case 403:
          throw new Error("해당 거래 내역에 대한 접근 권한이 없습니다.");
        case 404:
          throw new Error("해당 거래 내역을 찾을 수 없습니다.");
        default:
          throw new Error(
            error.response?.data?.message ||
              `거래 상세 내역 조회 중 오류가 발생했습니다. (${
                error.response?.status || "알 수 없음"
              })`
          );
      }
    }
    throw error;
  }
};
