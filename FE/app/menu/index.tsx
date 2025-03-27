import React, { useEffect } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../../stores/useAuthStore";

export default function Menu() {
  const { user } = useAuthStore();

  useEffect(() => {
    console.log("Menu 컴포넌트 렌더링");
    console.log("현재 user 정보:", user);
    console.log("현재 user role:", user?.role);

    if (user?.role === "PARENT") {
      console.log("부모로 리다이렉트");
      router.push("/menu/parent");
    } else if (user?.role === "CHILD") {
      console.log("자녀로 리다이렉트");
      router.push("/menu/child");
    } else {
      console.log("인증 페이지로 리다이렉트");
      router.push("/home");
    }
  }, [user?.role]);

  return null;
}
