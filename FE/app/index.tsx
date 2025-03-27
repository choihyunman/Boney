// app/index.tsx
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Index() {
  const { token, hasHydrated } = useAuthStore();
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  useEffect(() => {
    // 렌더가 한번 된 이후에 navigation을 실행할 수 있도록 설정
    const timer = setTimeout(() => {
      setReadyToNavigate(true);
    }, 0); // 다음 tick에서 실행

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !readyToNavigate) return;

    if (token) {
      router.replace("/home");
    } else {
      router.replace("/auth");
    }
  }, [hasHydrated, readyToNavigate, token]);

  return null;
}
