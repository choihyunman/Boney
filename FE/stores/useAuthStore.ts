import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { api } from "../lib/api";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

interface UserInfo {
  kakaoId: number;
  userId?: number;
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
  hasHydrated: boolean;
  setHydrated: () => void;
  setUser: (user: UserInfo) => void;
  kakaoLogin: (code: string) => Promise<UserInfo>;
  signUp: (userInfo: Omit<UserInfo, "kakaoId" | "userEmail">) => Promise<void>;
  logout: () => void;
}

// Zustand에서 사용할 보안 스토리지
const zustandSecureStorage: PersistStorage<AuthStore> = {
  getItem: async (key) => {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// 카카오 accsess-token 발급
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

// 카카오 유저 정보 조회
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

// 서버에서 jwt 발급
async function fetchJWTFromServer(kakaoId: number): Promise<string> {
  console.log("🚀 백엔드에 kakaoId 전송:", kakaoId, typeof kakaoId);

  const res = await api.post(`/auth/login/kakao/jwt`, {
    kakao_id: kakaoId,
  });
  const { token } = res.data;

  await SecureStore.setItemAsync("userToken", token);
  useAuthStore.setState({ token });

  console.log("🔐 jwt 저장 완료:", token);

  return token;
}

// 계좌 생성
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

// 계좌 등록
async function registerAccount(account: string): Promise<void> {
  try {
    await api.post("/account/register", { accountNo: account });
  } catch (err) {
    console.error("❌ 계좌 등록 실패:", err);
    throw err;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      account: null,
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),
      setUser: (user) => {
        set({ user });
      },

      kakaoLogin: async (code): Promise<UserInfo> => {
        console.log("🚀 백엔드에 카카오 인가 코드 전송:", code);

        try {
          const token = await fetchAccessTokenFromKakao(code);
          const user = await fetchUserInfoFromKakao(token);

          set({ user });
          return user;
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

          // 사용자 정보, 토큰, 계좌 저장
          set({ user, token, account });
          await SecureStore.setItemAsync("userToken", token);

          router.replace("/home");
        } catch (err) {
          console.error("❌ 회원가입 실패:", err);
          throw err;
        }
      },

      logout: async () => {
        console.log("👋 로그아웃 실행");
        await SecureStore.deleteItemAsync("userToken");
        set({ user: null, token: null, account: null });
      },
    }),
    {
      name: "auth-storage", // 저장될 키 이름
      storage: zustandSecureStorage,
      onRehydrateStorage: () => {
        return () => {
          useAuthStore.getState().setHydrated(); // 복원 완료 후 hasHydrated 상태 업데이트
          console.log("🔄 복원 완료: hasHydrated = true");
        };
      },
    }
  )
);
