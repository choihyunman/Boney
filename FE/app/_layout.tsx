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
import { Bell, ArrowLeft, Search } from "lucide-react-native";
import { Image } from "react-native";

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

  const { session, isLoading } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "white" }} />;
  }

  // 헤더 설정
  const getHeaderConfig = (): HeaderConfig => {
    switch (pathname) {
      case "/":
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
            onPress: () => router.back(),
          },
          rightButton: {
            icon: <Bell size={24} color="#9CA3AF" />,
            onPress: () => console.log("알림 버튼 클릭"),
          },
        };
      case "/transaction":
        return {
          title: "거래내역",
          backgroundColor: "#FFFFFF",
          leftButton: {
            icon: <ArrowLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton: {
            icon: <Search size={24} color="#000000" />,
            onPress: () => console.log("검색 버튼 클릭"),
          },
        };
      case "/transaction/[id]":
        return {
          title: "거래 상세",
          backgroundColor: "#F9FAFB",
          leftButton: {
            icon: <ArrowLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Amount":
      case "/transfer/Confirm":
      case "/transfer/Account":
        return {
          title: "송금하기",
          backgroundColor: "white",
          leftButton: {
            icon: <ArrowLeft size={24} color="#000000" />,
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

  // auth 페이지에서는 헤더를 표시하지 않음
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="auto" />
      {!pathname.includes("auth") && <Header {...getHeaderConfig()} />}
      <Slot />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}
