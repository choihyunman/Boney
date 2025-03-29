import { api } from "@/lib/api";
import axios from "axios";

interface DeleteAccountResponse {
  status: number;
  message: string;
}

export const deleteAccount = async (
  token: string
): Promise<DeleteAccountResponse> => {
  try {
    console.log("deleteAccount 함수 시작");
    const response = await api.delete("/auth/delete");
    console.log("API 응답 전체:", response);
    console.log("API 응답 데이터:", response.data);

    // API 응답이 성공이면 바로 반환 (200 또는 201)
    if (response.data.status === 200 || response.data.status === 201) {
      console.log("성공 응답 반환");
      return {
        status: response.data.status,
        message: response.data.message || "회원탈퇴를 완료했습니다.",
      };
    }

    console.log("실패 응답 처리");
    // 그 외의 경우는 에러로 처리
    throw new Error(
      response.data.message || "회원탈퇴 중 오류가 발생했습니다."
    );
  } catch (error) {
    console.log("에러 발생:", error);
    if (axios.isAxiosError(error)) {
      console.log("Axios 에러 상세:", error.response?.data);
      // axios 에러인 경우 (네트워크 오류 등)
      throw new Error(
        error.response?.data?.message || "회원탈퇴 중 오류가 발생했습니다."
      );
    }
    // 기타 에러
    throw error;
  }
};
