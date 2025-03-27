import { Slot, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { SessionProvider, useSession } from "../ctx";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import Header from "@/components/Header";
import { Bell, ChevronLeft, Search } from "lucide-react-native";
import { Image } from "react-native";
import Nav from "@/components/Nav";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
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
  const { isLoading } = useSession();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
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
      default:
        return {
          title: "Boney",
          backgroundColor: "#F9FAFB",
        };
    }
  };

  // auth 페이지 중 SignUp 페이지에서만 헤더를 표시
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="auto" />
      {(!pathname.includes("auth") || pathname === "/auth/SignUp") && (
        <Header {...getHeaderConfig()} />
      )}
      <Slot />
      {(pathname === "/home" || pathname === "/transaction") && <Nav />}
    </SafeAreaView>
  );
}

function AuthRedirectWrapper() {
  useAuthRedirect();
  return null;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <AuthRedirectWrapper />
      <RootLayoutNav />
    </SessionProvider>
  );
}
