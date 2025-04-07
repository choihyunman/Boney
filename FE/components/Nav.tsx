import React, { useEffect } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import { router, usePathname } from "expo-router";
import GlobalText from "./GlobalText";
import { clsx } from "clsx";
import { Home, FileText, Trophy, Menu, Award } from "lucide-react-native";
import { useAuthStore } from "@/stores/useAuthStore";

const { width } = Dimensions.get("window");

const Nav = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    console.log("📍 Nav - Current Path:", pathname);
  }, [pathname]);

  // 현재 경로에 따라 activeTab 설정
  const getActiveTab = () => {
    if (pathname === "/" || pathname === "/home") return 0;
    if (pathname.startsWith("/transaction")) return 1;
    if (pathname.startsWith("/quest")) return 2;
    if (pathname.startsWith("/menu")) return 3;
    return 0;
  };

  const activeColor = "#4FC985";
  const inactiveColor = "#9CA3AF";

  const handleQuestPress = () => {
    if (user?.role === "CHILD") {
      router.push("/quest/child");
    } else if (user?.role === "PARENT") {
      router.push("/quest/parent");
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 w-full bg-white rounded-t-2xl flex-row justify-around py-3 shadow-lg"
      style={{ width }}
    >
      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/home")}
      >
        <Home
          size={24}
          color={getActiveTab() === 0 ? activeColor : inactiveColor}
        />
        <GlobalText
          className={clsx(
            "text-xs mt-1",
            getActiveTab() === 0 ? "text-[#4FC985]" : "text-[#9CA3AF]"
          )}
        >
          홈
        </GlobalText>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/transaction")}
      >
        <FileText
          size={24}
          color={getActiveTab() === 1 ? activeColor : inactiveColor}
        />
        <GlobalText
          className={clsx(
            "text-xs mt-1",
            getActiveTab() === 1 ? "text-[#4FC985]" : "text-[#9CA3AF]"
          )}
        >
          거래내역
        </GlobalText>
      </TouchableOpacity>

      <TouchableOpacity className="items-center" onPress={handleQuestPress}>
        <Award
          size={24}
          color={getActiveTab() === 2 ? activeColor : inactiveColor}
        />
        <GlobalText
          className={clsx(
            "text-xs mt-1",
            getActiveTab() === 2 ? "text-[#4FC985]" : "text-[#9CA3AF]"
          )}
        >
          퀘스트
        </GlobalText>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/menu")}
      >
        <Menu
          size={24}
          color={getActiveTab() === 3 ? activeColor : inactiveColor}
        />
        <GlobalText
          className={clsx(
            "text-xs mt-1",
            getActiveTab() === 3 ? "text-[#4FC985]" : "text-[#9CA3AF]"
          )}
        >
          메뉴
        </GlobalText>
      </TouchableOpacity>
    </View>
  );
};

export default Nav;
