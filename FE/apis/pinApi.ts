import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuthStore } from "@/stores/useAuthStore";

interface VerifyPasswordResponse {
  data: {
    isMatched: boolean;
  };
  message: string;
  status: number;
}

export const verifyPassword = async (
  password: string
): Promise<VerifyPasswordResponse> => {
  try {
    const token = useAuthStore.getState().token;
    const requestBody = {
      send_password: password,
    };
    console.log("🔐 비밀번호 검증 API 요청 바디:", requestBody);

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/account/password/verify`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("🔐 비밀번호 검증 API 응답:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ 비밀번호 검증 API 에러:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
      });
      throw new Error(
        error.response?.data?.message || "비밀번호 검증 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};
