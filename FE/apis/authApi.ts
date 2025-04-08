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

// 인가 코드로 카카오 access token 가져오기
export async function fetchAccessTokenFromKakao(code: string) {
  const res = await api.post(`/auth/login/kakao/token?code=${code}`);
  return res.data.data.access_token;
}

// 카카오 access token으로 유저 정보 가져오기
export async function fetchUserInfoFromKakao(token: string) {
  const res = await api.post(`/auth/login/kakao/user?access_token=${token}`);
  return res.data.data;
}

// 카카오 ID로 JWT 발급받기
export async function fetchJWTFromServer(kakaoId: number) {
  const res = await api.post(`/auth/login/kakao/jwt`, { kakao_id: kakaoId });
  console.log("발급된 JWT 토큰:", res.data.token);
  return res.data.token;
}

// 회원가입
export async function signUpUser(payload: any) {
  const res = await api.post("/auth/signup", payload);
  return res.data;
}

// 계좌 생성
export async function createAccount() {
  const res = await api.post("/account/create");
  return res.data.data.accountNo;
}

// 계좌 등록
export async function registerAccount(account: string) {
  return api.post("/account/register", { accountNo: account });
}

// 회원가입 여부 체크
export async function checkUserRegistered() {
  const res = await api.post("/auth/check");
  return res.data.data;
}
