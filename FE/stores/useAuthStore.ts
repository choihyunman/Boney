import { create } from "zustand";
import { api } from "../lib/api";
import { router } from "expo-router";

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  birth?: string;
  gender?: string;
  phone?: string;
}

interface AuthStore {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  kakaoLogin: (code: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  setUser: (user) => {
    console.log("🧠 사용자 상태 설정:", user);

    set({ user });
  },

  kakaoLogin: async (code) => {
    console.log("🚀 백엔드에 카카오 인가 코드 전송:", code);

    try {
      const res = await api.post("/auth/kakao", { code });
      console.log("📥 백엔드 응답 수신:", res.data);

      const user = res.data as UserInfo;

      set({ user }); // 로그인 성공 → 상태에 저장
      console.log("✅ 사용자 로그인 성공. 상태 저장됨");

      // 회원가입 페이지로 이동
      router.replace({
        pathname: "/(auth)/SignUp",
        params: {
          id: user.id,
          email: user.email,
        },
      });

      console.log("➡️ 회원가입 페이지로 이동");
    } catch (err) {
      console.error("카카오 로그인 실패:", err);
      throw err;
    }
  },

  logout: () => {
    console.log("👋 로그아웃 실행");
    set({ user: null });
  },
}));
