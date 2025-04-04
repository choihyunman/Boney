import React from "react";
import { Slot, router, usePathname, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import Header from "@/components/Header";
import { Bell, ChevronLeft, Search } from "lucide-react-native";
import { Image } from "react-native";
import Nav from "@/components/Nav";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthStore } from "@/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/useNotificationStore";
import GlobalText from "@/components/GlobalText";
import Toast from "react-native-toast-message";

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

interface ToastProps {
  text1?: string;
  text2?: string;
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
  const { unreadCount } = useNotificationStore();

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
            onPress: () => router.push("./home"),
          },
          rightButton: {
            icon: (
              <View>
                <Bell size={24} color="#9CA3AF" />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF4B4B]" />
                )}
              </View>
            ),
            onPress: () => router.push("./notification"),
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
      case "/loan/parent/ReqList":
        return {
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.push("/menu"),
          },
        };
      case "/loan/child/ReqList":
        return {
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.push("/menu"),
          },
        };
      case "/child":
        return {
          title: "아이 조회하기",
          backgroundColor: "#F9FAFB",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/child/Register":
        return {
          title: "아이 등록하기",
          backgroundColor: "F9FAFB",
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
      case "/loan/ReqListChild":
        return {
          title: "요청 중인 대출 보기",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/child/LoanList":
        return {
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.push("/menu"),
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
      case "/menu":
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
            icon: (
              <View>
                <Bell size={24} color="#9CA3AF" />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF4B4B]" />
                )}
              </View>
            ),
            onPress: () => router.push("./notification"),
          },
        };
      case "/mypage":
        return {
          title: "나의 정보",
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
      case "/report":
        return {
          title: "월간 리포트",
          backgroundColor: "#F9FAFB",
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
      case "/notification":
        return {
          title: "알림",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton:
            unreadCount > 0
              ? {
                  icon: (
                    <GlobalText className="text-xs text-[#4FC985] font-medium">
                      모두 읽음
                    </GlobalText>
                  ),
                  onPress: () =>
                    useNotificationStore.getState().markAllAsRead(),
                }
              : undefined,
        };
      default:
        return {
          backgroundColor: "#F9FAFB",
        };
    }
  };

  // Check if the current path has navigation bar
  const hasNav =
    pathname === "/home" || pathname === "/transaction" || pathname === "/menu";

  // auth 페이지 중 SignUp 페이지에서만 헤더를 표시 + 메뉴에서 헤더 제거
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="auto" />
      {(!pathname.includes("auth") || pathname === "/auth/SignUp") && (
        <Header {...getHeaderConfig()} />
      )}
      <View style={{ flex: 1, paddingBottom: hasNav ? 60 : 0 }}>
        <Slot />
      </View>
      {hasNav && <Nav />}
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

  const toastConfig = {
    success: (props: ToastProps) => (
      <View
        style={{
          height: 72,
          width: "90%",
          backgroundColor: "white",
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          position: "absolute",
          top: 15,
          borderLeftWidth: 4,
          borderLeftColor: "#4FC985",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#1F2937",
              fontSize: 16,
              fontWeight: "700",
              marginBottom: props.text2 ? 4 : 0,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text style={{ color: "#6B7280", fontSize: 14 }}>
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    ),
    error: (props: ToastProps) => (
      <View
        style={{
          height: 72,
          width: "90%",
          backgroundColor: "white",
          borderRadius: 12,
          padding: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          position: "absolute",
          top: 15,
          borderLeftWidth: 4,
          borderLeftColor: "#EF4444",
        }}
      >
        <Text style={{ color: "#333", fontSize: 16, fontWeight: "600" }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
            {props.text2}
          </Text>
        )}
      </View>
    ),
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthRedirectWrapper />
        <RootLayoutNav />
        <Toast config={toastConfig} />
      </QueryClientProvider>
    </>
  );
}
