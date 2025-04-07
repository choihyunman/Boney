import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandSecureStorage } from "@/lib/secureStorage";
import * as SecureStore from "expo-secure-store";
import {
  checkUserRegistered,
  createAccount,
  fetchJWTFromServer,
  registerAccount,
  signUpUser,
} from "@/apis/authApi";
import { fetchUserInfoFromKakao } from "@/apis/authApi";
import { fetchAccessTokenFromKakao } from "@/apis/authApi";
import { checkPinRegistered } from "@/apis/pinApi";
import axios from "axios";

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
  setToken: (token: string) => void;
  setAccount: (account: string) => void;
  resetAuth: () => void;
  logout: () => Promise<void>;
  kakaoLogin: (
    code: string
  ) => Promise<{ next: string; kakaoId?: number; userEmail?: string }>;
  signup: (payload: UserInfo) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      account: null,
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAccount: (account) => set({ account }),
      resetAuth: () => set({ user: null, token: null, account: null }),
      logout: async () => {
        console.log("👋 로그아웃 실행");

        try {
          await SecureStore.deleteItemAsync("userToken");
        } catch (error) {
          console.error("❌ SecureStore 토큰 삭제 실패:", error);
        }

        set({ user: null, token: null, account: null });
      },
      kakaoLogin: async (code: string) => {
        let userData;
        try {
          // 1. access token 발급
          const accessToken = await fetchAccessTokenFromKakao(code);
          console.log("✅ access_token 수신:", accessToken);

          // 2. 카카오 유저 정보 조회
          userData = await fetchUserInfoFromKakao(accessToken);
          console.log("✅ 유저 정보 수신:", userData);

          set({
            user: {
              kakaoId: userData.id,
              userEmail: userData.kakao_account.email,
            },
          });

          // 3. JWT 발급
          const jwtToken = await fetchJWTFromServer(userData.id);
          set({ token: jwtToken });
          await SecureStore.setItemAsync("userToken", jwtToken);

          // 4. 회원가입 여부 확인
          const registeredUser = await checkUserRegistered();
          console.log("🔑 회원가입 여부 확인: ", registeredUser);
          const pinInfo = await checkPinRegistered();
          console.log("🔑 PIN 설정 여부 확인: ", pinInfo);

          set({
            user: {
              kakaoId: registeredUser.kakao_id,
              userId: registeredUser.user_id,
              userEmail: registeredUser.user_email,
              userName: registeredUser.user_name,
              userGender: registeredUser.user_gender,
              userBirth: registeredUser.user_birth,
              userPhone: registeredUser.user_phone,
              role: registeredUser.role,
            },
          });

          // PIN 설정 여부
          if (pinInfo.isPasswordNull) {
            return { next: "create-pin" };
          } else {
            return { next: "home" };
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const message = error.response?.data.message;
            console.log("❌ kakaoLogin 실패:", message);
            if (error.response?.status === 404) {
              console.log("🆕 등록되지 않은 사용자 → SignUp 이동");
              return {
                next: "signup",
                kakaoId: userData.id,
                userEmail: userData.kakao_account.email,
              };
            }
            if (error.response?.status === 401) {
              console.log("⚠️ 401 에러 무시: 재로그인 시도 흐름 유지");
              return { next: "auth" }; // 예: 로그인 화면으로 안내
            }
            throw new Error(message);
          }
          throw error;
        }
      },
      signup: async (payload) => {
        try {
          await signUpUser(payload);

          const jwtToken = await fetchJWTFromServer(payload.kakaoId);
          set({ token: jwtToken });
          await SecureStore.setItemAsync("userToken", jwtToken);

          const accountNo = await createAccount();
          await registerAccount(accountNo);
          set({ account: accountNo });

          // ✅ user 정보도 같이 채워줌
          set({
            user: {
              kakaoId: payload.kakaoId,
              userEmail: payload.userEmail,
              userName: payload.userName,
              userBirth: payload.userBirth,
              userGender: payload.userGender,
              userPhone: payload.userPhone,
              role: payload.role,
            },
          });
        } catch (error) {
          console.error("❌ 회원가입 실패:", error);
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: zustandSecureStorage,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        console.log("🔄 복원 완료: hasHydrated = true");
      },
    }
  )
);
