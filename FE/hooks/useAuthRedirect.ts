import { useSession } from "../ctx";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

export const useAuthRedirect = () => {
  const { session, isLoading, signIn, signOut } = useSession();
  const { setUser } = useAuthStore();
  const router = useRouter();
  const hasRun = useRef(false); // 세션 정보 조회가 한 번만 실행하도록 설정

  useEffect(() => {
    if (!isLoading) {
      console.log("🧾 현재 session 정보:", session);
    }

    if (isLoading || hasRun.current) return;

    const handleRedirect = async () => {
      console.log("🧾 현재 session 정보:", session);

      if (!session?.token) {
        // 🔑 token이 없는 경우 → kakaoId로 jwt 발급 시도
        console.log("🔑 token이 없는 경우 → kakaoId로 jwt 발급 시도");
        if (session?.kakaoId) {
          try {
            const res = await api.post("/auth/login/kakao/jwt", {
              kakao_id: session.kakaoId,
            });

            const newToken = res.data.token;
            console.log("🔓 토큰 재발급 완료 → 인증 재시도");

            await signIn({
              ...session,
              token: newToken,
            });

            return; // signIn 후 재렌더링 → useEffect 다시 실행됨
          } catch (err: any) {
            const status = err?.response?.status;
            if (status === 404) {
              console.log("🆕 등록되지 않은 사용자 → SignUp 이동");
              router.replace({
                pathname: "/auth/SignUp",
                params: {
                  kakaoId: session.kakaoId,
                  userEmail: session.userEmail,
                },
              });
              return;
            }
            console.warn("❌ 토큰 재발급 실패 → 로그인으로 이동");
            await signOut();
            router.replace("/auth");
            return;
          }
        } else {
          // token도 kakaoId도 없음 → 로그인 페이지로
          console.log("❌ 세션 정보 없음 → 로그인 페이지 이동");
          await signOut();
          router.replace("/auth");
          return;
        }
      }

      hasRun.current = true;

      try {
        const res = await api.post("/auth/check");
        const userData = res.data.data;
        console.log("🔄 회원가입 된 사용자 → 비밀번호 설정 확인");

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

        // zustand store에도 저장
        setUser({
          kakaoId: userData.kakao_id,
          userId: userData.user_id,
          userEmail: userData.user_email,
          userName: userData.user_name,
          userGender: userData.user_gender, // 필요 시
          userBirth: userData.user_birth, // 필요 시
          userPhone: userData.user_phone, // 필요 시
          role: userData.role,
        });

        useAuthStore.setState({
          token: session.token,
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

        if (status === 401 || status === 404) {
          await signOut();
          router.replace("/auth");
        } else {
          const hasKakaoInfo = session?.kakaoId && session?.userEmail;
          if (hasKakaoInfo) {
            router.replace({
              pathname: "/auth/SignUp",
              params: {
                kakaoId: session.kakaoId,
                userEmail: session.userEmail,
              },
            });
          } else {
            await signOut();
            router.replace("/auth");
          }
        }
      }
    };

    handleRedirect();
  }, [isLoading, session]);
};
