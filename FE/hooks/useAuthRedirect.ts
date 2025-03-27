import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import * as SecureStore from "expo-secure-store";

export const useAuthRedirect = () => {
  const { setUser, hasHydrated, user, token, account, logout } = useAuthStore();
  const router = useRouter();
  const hasRun = useRef(false); // 세션 정보 조회가 한 번만 실행하도록 설정

  useEffect(() => {
    if (!hasHydrated || hasRun.current) return;

    const handleRedirect = async () => {
      hasRun.current = true;
      console.log("🧾 현재 user 정보:", user, token, account);

      try {
        if (!token) {
          // 🔑 token이 없는 경우 → kakaoId로 jwt 발급 시도
          console.log("🔑 token이 없는 경우 → kakaoId로 jwt 발급 시도");
          if (user?.kakaoId) {
            const res = await api.post("/auth/login/kakao/jwt", {
              kakao_id: user.kakaoId,
            });

            const newToken = res.data.token;
            useAuthStore.setState({
              token: newToken,
            });
            await SecureStore.setItemAsync("userToken", newToken);
            console.log("🔓 토큰 재발급 완료 → 인증 재시도");
          } else {
            console.log("❌ kakaoId가 없는 경우 → 로그인으로 이동");
            await logout();
            router.replace("/auth");
            return;
          }
        }

        // 🔑 token이 있는 경우 → 회원가입 여부 확인
        console.log("🔑 token이 있는 경우 → 회원가입 여부 확인");
        const userRes = await api.post("/auth/check");
        const userData = userRes.data.data;

        console.log("🔄 회원가입 된 사용자 → 비밀번호 설정 확인");
        const pinRes = await api.post("/account/password/check");
        const pinData = pinRes.data.data;

        // zustand store에 저장
        setUser({
          kakaoId: userData.kakao_id,
          userId: userData.user_id,
          userEmail: userData.user_email,
          userName: userData.user_name,
          userGender: userData.user_gender,
          userBirth: userData.user_birth,
          userPhone: userData.user_phone,
          role: userData.role,
        });

        if (pinData.isPasswordNull) {
          console.log("🔐 PIN 미설정 → CreatePin 이동");
          router.replace("/auth/CreatePin");
        } else {
          console.log("✅ 모든 조건 통과 → 홈으로");
          router.replace("/home");
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          if (user?.kakaoId && user?.userEmail) {
            await logout();
            console.log("🆕 등록되지 않은 사용자 → ,logout 후 SignUp 이동");
            router.replace({
              pathname: "/auth/SignUp",
              params: {
                kakaoId: user.kakaoId,
                userEmail: user.userEmail,
              },
            });
          } else {
            await logout();
            router.replace("/auth");
          }
        } else if (status === 401) {
          console.log("❌ 토큰 만료 → 로그아웃 후 로그인 페이지로");
          await logout();
          router.replace("/auth");
        }
      }
    };

    handleRedirect();
  }, [hasHydrated, token, user]);
};
