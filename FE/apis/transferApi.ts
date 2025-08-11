import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuthStore } from "@/stores/useAuthStore";

interface FavoriteAccount {
  favoriteId: number;
  bankId: number;
  bankName: string;
  accountHolder: string;
  favoriteAccount: string;
  createdAt: string;
}

interface GetFavoriteAccountsResponse {
  status: number;
  message: string;
  data: FavoriteAccount[];
}

interface AddFavoriteAccountResponse {
  success: boolean;
  message: string;
}

interface TransferRequest {
  sendPassword: string;
  amount: number;
  recipientBank: string;
  recipientAccountHolder: string;
  recipientAccountNumber: string;
}

interface TransferResponseData {
  bankName: string;
  accountNumber: string;
  amount: number;
  createdAt: string;
}

interface TransferResponse {
  status: string;
  message: string;
  data: TransferResponseData;
}

interface BalanceResponse {
  balance: number;
  accountNumber: string;
  bankName: string;
}

export const getFavoriteAccounts =
  async (): Promise<GetFavoriteAccountsResponse> => {
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${API_BASE_URL}/api/v1/favorite`, {
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
            "계좌 목록 조회 중 오류가 발생했습니다."
        );
      }
      throw error;
    }
  };

export const addFavoriteAccount = async (
  bankName: string,
  accountNumber: string,
  accountHolder: string
): Promise<AddFavoriteAccountResponse> => {
  try {
    const token = useAuthStore.getState().token;
    const requestBody = {
      bankName,
      favoriteAccount: accountNumber,
      accountHolder,
    };

    console.log("계좌 등록 요청 바디:", requestBody);
    console.log("계좌 등록 요청 헤더:", {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/favorite`,
      requestBody,
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
      console.error("계좌 등록 API 에러:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
      });
      throw new Error(
        error.response?.data?.message || "계좌 등록 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};

export const transferMoney = async (
  data: TransferRequest
): Promise<TransferResponse> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_BASE_URL}/api/v1/transfer`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("송금 API 에러:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
      });
      throw new Error(
        error.response?.data?.message || "송금 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};

export const getBalance = async (): Promise<BalanceResponse> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/transfer/balance`,
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
      console.error("잔액 조회 API 에러:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
      });
      throw new Error(
        error.response?.data?.message || "잔액 조회 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};
