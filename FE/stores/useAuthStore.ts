import { create } from "zustand";
import { api } from "../lib/api";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

interface UserInfo {
  kakaoId: number;
  userEmail: string;
  userName?: string;
  userBirth?: string;
  userGender?: string;
  userPhone?: string;
  role?: string;
}

interface AuthStore {
  user: UserInfo | null;
  token: string | null;
  account: string | null;
  setUser: (user: UserInfo) => void;
  kakaoLogin: (code: string) => Promise<void>;
  signUp: (userInfo: Omit<UserInfo, "kakaoId" | "userEmail">) => Promise<void>;
  logout: () => void;
}

async function fetchAccessTokenFromKakao(code: string): Promise<string> {
  console.log("🚀 백엔드에 인가 코드 전송:", code);

  const res = await api.post(`/auth/login/kakao/token?code=${code}`);
  const { data } = res.data;
  const accessToken = data.access_token;

  if (typeof accessToken !== "string") {
    throw new Error("access_token이 문자열이 아닙니다!");
  }

  console.log("🔐 access_token 조회 완료:", accessToken);

  return accessToken;
}

async function fetchUserInfoFromKakao(token: string): Promise<UserInfo> {
  const res = await api.post(`/auth/login/kakao/user?access_token=${token}`);
  const { data } = res.data;

  const user: UserInfo = {
    kakaoId: data.id,
    userEmail: data.kakao_account.email,
  };

  console.log("✅ 사용자 정보 수신:", user);
  return user;
}

async function fetchJWTFromServer(kakaoId: number): Promise<string> {
  console.log("🚀 백엔드에 kakaoId 전송:", kakaoId, typeof kakaoId);

  const res = await api.post(`/auth/login/kakao/jwt`, {
    kakao_id: kakaoId,
  });
  const { token } = res.data;

  await SecureStore.setItemAsync("userToken", token);
  console.log("🔐 jwt 저장 완료:", token);

  return token;
}

async function createAccount(): Promise<string> {
  try {
    const res = await api.post("/account/create");
    const account = res.data.data.accountNo;
    return account;
  } catch (err) {
    console.error("❌ 계좌 생성 실패:", err);
    throw err;
  }
}

async function registerAccount(account: string): Promise<void> {
  try {
    await api.post("/account/register", { accountNo: account });
  } catch (err) {
    console.error("❌ 계좌 등록 실패:", err);
    throw err;
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  account: null,

  setUser: (user) => {
    console.log("🧠 사용자 상태 설정:", user);
    set({ user });
  },

  kakaoLogin: async (code) => {
    console.log("🚀 백엔드에 카카오 인가 코드 전송:", code);

    try {
      const token = await fetchAccessTokenFromKakao(code);
      const user = await fetchUserInfoFromKakao(token);

      set({ user });
    } catch (err) {
      console.error("❌ 카카오 로그인 실패:", err);
      router.replace("/auth");
      throw err;
    }
  },

  signUp: async (userInfo) => {
    const { user } = get();
    console.log("🧠 사용자:", user);

    if (!user) {
      throw new Error("카카오 로그인 되지 않은 상태입니다.");
    }

    const payload = {
      ...userInfo,
      kakaoId: user.kakaoId,
      userEmail: user.userEmail,
    };

    try {
      const res = await api.post("/auth/signup", payload);
      console.log("🎉 회원가입 성공: ", res.data);
      const token = await fetchJWTFromServer(user.kakaoId);
      console.log("🔐 토큰: ", token);
      const account = await createAccount();
      console.log("💳 계좌: ", account);
      await registerAccount(account);
      console.log("💳 계좌 등록 완료");

      set({ user, token, account });
    } catch (err) {
      console.error("❌ 회원가입 실패:", err);
      throw err;
    }
  },

  logout: async () => {
    console.log("👋 로그아웃 실행");
    await SecureStore.deleteItemAsync("userToken");
    set({ user: null, token: null });
  },
}));
