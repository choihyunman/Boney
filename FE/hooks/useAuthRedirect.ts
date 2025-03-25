import { useSession } from "../ctx";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

export const useAuthRedirect = () => {
  const { session, isLoading, signIn, signOut } = useSession();
  const router = useRouter();
  const hasRun = useRef(false); // 세션 정보 조회가 한 번만 실행하도록 설정

  useEffect(() => {
    if (!isLoading) {
      console.log("🧾 현재 session 정보:", session);
    }

    if (isLoading || hasRun.current) return;

    if (!session?.token) {
      router.replace("/auth");
      return;
    }

    if (session?.signedUp && session?.hasPin) {
      router.replace("/home");
      return;
    }

    hasRun.current = true;

    const checkAuth = async () => {
      try {
        const res = await api.post("/auth/check");
        // 🔄 정상 응답인 경우 → 회원가입 된 사용자
        const userData = res.data.data;
        console.log("🔄 회원가입 된 사용자 → 비밀번호 설정 했는지 확인");

        const pinRes = await api.post("/account/password/check");
        const pinData = pinRes.data.data;

        await signIn({
          ...session,
          userName: userData.user_name,
          userEmail: userData.user_email,
          userType: userData.role,
          signedUp: userData.is_registered,
          hasPin: !pinData.isPasswordNull,
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

        console.warn("❌ /auth/check 실패. 상태 코드:", status);

        // ⚠️ 401, 403 → 토큰 문제 → 세션 초기화 + 로그인 페이지 이동
        if (status === 401 || status === 404) {
          await signOut();
          router.replace("/auth");
          return;
        }

        // ❌ 회원가입 안된 사용자
        const hasKakaoInfo = session?.kakaoId && session?.userEmail;

        if (hasKakaoInfo) {
          console.log("🆕 회원가입 안됨 → SignUp으로 이동");
          router.replace({
            pathname: "/auth/SignUp",
            params: {
              kakaoId: session.kakaoId,
              userEmail: session.userEmail,
            },
          });
        } else {
          console.log("❌ 세션 정보 없음 → 로그인으로 이동");
          await signOut();
          router.replace("/auth");
        }
      }
    };

    checkAuth();
  }, [isLoading, session]);
};
