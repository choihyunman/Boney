import axios from "axios";

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

export const getFavoriteAccounts =
  async (): Promise<GetFavoriteAccountsResponse> => {
    try {
      const response = await axios.get("/api/v1/favorite", {
        headers: {
          Authorization: `Bearer ${process.env.JWT_TOKEN}`,
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
  accountNumber: string
): Promise<AddFavoriteAccountResponse> => {
  try {
    const response = await axios.post(
      "/api/v1/favorite",
      {
        bankName,
        favoriteAccount: accountNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JWT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "계좌 등록 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};
