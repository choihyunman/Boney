import axios from "axios";

interface DeleteAccountResponse {
  status: number;
  message: string;
}

export const deleteAccount = async (
  token: string
): Promise<DeleteAccountResponse> => {
  try {
    const response = await axios.delete("auth/delete", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // API 응답의 status 코드에 따른 처리
    switch (response.data.status) {
      case 201:
        return {
          status: 201,
          message: "회원탈퇴를 완료했습니다.",
        };
      case 404:
        throw new Error("사용자를 찾을 수 없습니다.");
      default:
        throw new Error(
          response.data.message || "회원탈퇴 중 오류가 발생했습니다."
        );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // axios 에러인 경우 (네트워크 오류 등)
      throw new Error(
        error.response?.data?.message || "회원탈퇴 중 오류가 발생했습니다."
      );
    }
    // 기타 에러
    throw error;
  }
};
