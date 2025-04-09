import { useEffect, useRef, useState } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { checkUserRegistered, fetchJWTFromServer } from "@/apis/authApi";
import { checkPinRegistered } from "@/apis/pinApi";
import * as SecureStore from "expo-secure-store";
import { useMutation } from "@tanstack/react-query";

export const useAuthRedirect = () => {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { hasHydrated, token, setToken, setUser, resetAuth, logout } =
    useAuthStore();
  const user = useAuthStore((state) => state.user);
  const hasRun = useRef(false);
  const [ready, setReady] = useState(false);

  // 상태 찍기 (디버깅용)
  useEffect(() => {
    console.log(
      "🔵 [useAuthRedirect] navigationState?.key:",
      navigationState?.key
    );
    console.log("🟣 [useAuthRedirect] hasHydrated:", hasHydrated);
    console.log("🟡 [useAuthRedirect] token:", token);
    console.log("🟢 [useAuthRedirect] ready:", ready);
  }, [navigationState?.key, hasHydrated, token, ready]);

  // navigationState와 hasHydrated 준비 체크
  useEffect(() => {
    if (!navigationState?.key) return;
    if (!hasHydrated) return;
    console.log("✅ [useAuthRedirect] Root + Zustand Hydration 완료!");
    setReady(true);
  }, [navigationState?.key, hasHydrated]);

  const { mutateAsync: refreshJwt } = useMutation({
    mutationFn: (kakaoId: number) => fetchJWTFromServer(kakaoId),
  });

  const { mutateAsync: checkUser } = useMutation({
    mutationFn: checkUserRegistered,
  });

  const { mutateAsync: checkPin } = useMutation({
    mutationFn: checkPinRegistered,
  });

  useEffect(() => {
    if (!ready) return;
    if (hasRun.current) return;

    hasRun.current = true;

    const redirect = async () => {
      try {
        console.log("⏳ [useAuthRedirect] 100ms 딜레이 후 리다이렉트 시작");
        await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms 기다림

        if (!token) {
          if (user?.kakaoId) {
            const newToken = await refreshJwt(user.kakaoId);
            setToken(newToken);
            await SecureStore.setItemAsync("userToken", newToken);
          } else {
            await resetAuth();
            console.log("🚀 [useAuthRedirect] 토큰 없음 ➔ /auth 이동");
            router.replace("/auth");
            return;
          }
        }

        const userData = await checkUser();
        const pinData = await checkPin();

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
          console.log(
            "🚀 [useAuthRedirect] PIN 설정 안 함 ➔ /auth/CreatePin 이동"
          );
          router.replace("/auth/CreatePin");
        } else {
          console.log("🚀 [useAuthRedirect] PIN 설정 완료 ➔ /home 이동");
          router.replace("/home");
        }
      } catch (err: any) {
        const status = err?.response?.status;
        console.error("❌ [useAuthRedirect] redirect 중 에러:", err);

        if (status === 404) {
          console.log("🆕 회원가입 필요 ➔ /auth/SignUp 이동");
          if (user?.kakaoId && user?.userEmail) {
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
          console.log("❌ 토큰 만료 ➔ /auth 이동");
          await logout();
          router.replace("/auth");
        } else {
          console.log("❌ 예상치 못한 에러 ➔ /auth 이동");
          await logout();
          router.replace("/auth");
        }
      }
    };

    redirect();
  }, [ready, token]);
};
