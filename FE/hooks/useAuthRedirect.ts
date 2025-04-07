import { useEffect, useRef } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { checkUserRegistered, fetchJWTFromServer } from "@/apis/authApi";
import { checkPinRegistered } from "@/apis/pinApi";
import * as SecureStore from "expo-secure-store";
import { useMutation } from "@tanstack/react-query";

export const useAuthRedirect = () => {
  const { hasHydrated, token, setToken, setUser, resetAuth, logout } =
    useAuthStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const hasRun = useRef(false);

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
    if (!hasHydrated || !navigationState?.key || hasRun.current) return;

    const redirect = async () => {
      hasRun.current = true;

      try {
        if (!token) {
          if (user?.kakaoId) {
            const newToken = await refreshJwt(user.kakaoId);
            setToken(newToken);
            await SecureStore.setItemAsync("userToken", newToken);
          } else {
            await resetAuth();
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
          router.replace("/auth/CreatePin");
        } else {
          router.replace("/home");
        }
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 404) {
          console.log("🆕 회원가입 필요 → SignUp으로 이동");
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
          console.log("❌ 토큰 만료 → 로그인 페이지로 이동");
          await logout();
          router.replace("/auth");
        } else {
          console.error("❌ 예상치 못한 에러:", err);
          await logout();
          router.replace("/auth");
        }
      }
    };

    redirect();
  }, [hasHydrated, navigationState, token, user]);
};
