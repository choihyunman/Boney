import axios from "axios";

interface VerifyPasswordResponse {
  success: boolean;
  message: string;
}

export const verifyPassword = async (
  password: string
): Promise<VerifyPasswordResponse> => {
  try {
    const response = await axios.post(
      "/api/v1/account/password/verify",
      {
        send_password: password,
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
        error.response?.data?.message || "비밀번호 검증 중 오류가 발생했습니다."
      );
    }
    throw error;
  }
};
