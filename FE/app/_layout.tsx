import React from "react";
import { Slot, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import Header from "@/components/Header";
import { ArrowLeft, Bell, ChevronLeft, Search } from "lucide-react-native";
import { Image } from "react-native";
import Nav from "@/components/Nav";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthStore } from "@/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
interface HeaderButton {
  icon: React.ReactNode;
  onPress: () => void;
}

interface HeaderConfig {
  title?: string;
  backgroundColor: string;
  leftButton?: HeaderButton;
  rightButton?: HeaderButton;
}

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [fontsLoaded] = useFonts({
    "NEXONLv1Gothic-Bold": require("../assets/fonts/NEXONLv1GothicBold.ttf"),
    "NEXONLv1Gothic-Light": require("../assets/fonts/NEXONLv1GothicLight.ttf"),
    "NEXONLv1Gothic-Regular": require("../assets/fonts/NEXONLv1GothicRegular.ttf"),
  });

  const pathname = usePathname();
  const { hasHydrated } = useAuthStore();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: "white" }} />;
  }

  // 헤더 설정
  const getHeaderConfig = (): HeaderConfig => {
    switch (pathname) {
      case "/home":
        return {
          backgroundColor: "#F9FAFB",
          leftButton: {
            icon: (
              <Image
                source={require("@/assets/icons/logo.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ),
            onPress: () => {},
          },
          rightButton: {
            icon: <Bell size={24} color="#9CA3AF" />,
            onPress: () => console.log("알림 버튼 클릭"),
          },
        };
      case "/auth/SignUp":
        return {
          title: "회원가입",
          backgroundColor: "#F9FAFB",
        };
      case "/transaction":
        return {
          title: "거래 내역",
          backgroundColor: "#FFFFFF",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton: {
            icon: <Search size={24} color="#000000" />,
            onPress: () => console.log("검색 버튼 클릭"),
          },
        };
      case pathname.startsWith("/transaction/") ? pathname : "":
        return {
          title: "상세 내역",
          backgroundColor: "#FFFFFF",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer":
        return {
          title: "계좌 선택",
          backgroundColor: "F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Account":
        return {
          title: "계좌 입력",
          backgroundColor: "F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Amount":
        return {
          title: "금액 입력",
          backgroundColor: "F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Confirm":
        return {
          backgroundColor: "F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/ReqListParent":
        return {
          title: "대기 중인 대출 보기",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/child/Register":
        return {
          title: "아이 등록하기",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/LoanListParent":
        return {
          title: "진행 중인 대출 보기",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/child":
        return {
          title: "아이 조회하기",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/ReqListChild":
        return {
          title: "요청 중인 대출 보기",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/mypage":
        return {
          title: "마이페이지",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/child/Request":
      case "/loan/child/PromissoryNote":
        return {
          title: "대출 신청하기",
          backgroundColor: "#F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/mypage/password":
        return {
          title: "앱 비밀번호 변경",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/child/RegularAllowance":
        return {
          title: "정기 용돈 설정",
          backgroundColor: "#F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      default:
        return {
          backgroundColor: "#F9FAFB",
        };
    }
  };

  // auth 페이지 중 SignUp 페이지에서만 헤더를 표시 + 메뉴에서 헤더 제거
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="auto" />
      {(!pathname.includes("auth") || pathname === "/auth/SignUp") &&
        !pathname.includes("/menu/") &&
        pathname !== "/menu" && <Header {...getHeaderConfig()} />}
      <Slot />
      {(pathname === "/home" ||
        pathname === "/transaction" ||
        pathname === "/menu/child" ||
        pathname === "/menu/parent") && <Nav />}
    </SafeAreaView>
  );
}

function AuthRedirectWrapper() {
  useAuthRedirect();
  return null;
}

export default function RootLayout() {
  // TanStack Query 클라이언트 생성
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const clearPersistedLoan = async () => {
      await SecureStore.deleteItemAsync("loan-req-list");
      console.log("🧹 초기화 완료: loan-req-list 삭제됨");
    };

    clearPersistedLoan();
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthRedirectWrapper />
        <RootLayoutNav />
      </QueryClientProvider>
    </>
  );
}
