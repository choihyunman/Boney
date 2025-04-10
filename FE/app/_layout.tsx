import React, { useEffect, useRef } from "react";
import { Slot, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useFonts } from "expo-font";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import Header from "@/components/Header";
import { Bell, ChevronLeft, History, Search } from "lucide-react-native";
import { Image } from "react-native";
import Nav from "@/components/Nav";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthStore } from "@/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/useNotificationStore";
import GlobalText from "@/components/GlobalText";
import Toast from "react-native-toast-message";
import { notificationApi } from "@/apis/notificationApi";
import { NotificationData } from "@/apis/notificationApi";
import { deleteQuest } from "@/apis/questApi";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import * as Notifications from "expo-notifications";
import { createCustomNotification } from "@/utils/pushNotifications";

interface HeaderButton {
  icon?: React.ReactNode;
  text?: string;
  onPress: () => void;
}

interface HeaderConfig {
  title?: string;
  backgroundColor: string;
  leftButton?: HeaderButton;
  rightButton?: HeaderButton;
  headerShown?: boolean;
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
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const previousNotificationsRef = useRef<NotificationData[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 푸시 알림 설정
  usePushNotifications();

  // 알림 모니터링 함수
  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications();

      // 읽지 않은 알림 개수 업데이트
      const unreadCount = response.data.filter((n) => !n.readStatus).length;
      setUnreadCount(unreadCount);

      // 새로운 알림이 있는지 확인
      const newNotifications = response.data.filter(
        (newNoti) =>
          !previousNotificationsRef.current.some(
            (prevNoti) => prevNoti.notificationId === newNoti.notificationId
          )
      );

      // 새로운 알림이 있으면 Toast 표시 및 푸시 알림 발송
      // if (newNotifications.length > 0) {
      //   newNotifications.forEach((notification) => {
      //     if (!notification.readStatus) {
      //       // Toast 표시
      //       Toast.show({
      //         type: "success",
      //         text1: notification.notificationTitle,
      //         text2: notification.notificationContent,
      //         position: "top",
      //       });

      //       // 푸시 알림 발송
      //       sendPushNotification(notification);
      //     }
      //   });
      // }

      // 현재 알림 목록 저장
      previousNotificationsRef.current = response.data;
    } catch (error) {
      console.error("❌ 알림 목록 조회 실패:", error);
    }
  };

  // 푸시 알림 발송 함수
  const sendPushNotification = async (notification: NotificationData) => {
    try {
      // 알림 데이터 준비
      const notificationData = {
        notificationId: notification.notificationId,
        notificationTypeCode: notification.notificationTypeCode,
        referenceId: notification.referenceId,
        amount: notification.notificationAmount,
      };

      // 알림 내용 생성
      const notificationContent = await createCustomNotification({
        title: notification.notificationTitle,
        body: notification.notificationContent,
        data: notificationData,
        channelId: getChannelIdByType(notification.notificationTypeCode),
      });

      if (notificationContent) {
        // 푸시 알림 발송
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null, // 즉시 발송
        });
        console.log("🔔 푸시 알림 발송 성공:", notification.notificationId);
      }
    } catch (error) {
      console.error("🔔 푸시 알림 발송 실패:", error);
    }
  };

  // 알림 타입에 따른 채널 ID 반환
  const getChannelIdByType = (type: string): string => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return "default";
      case "QUEST_REGISTERED":
      case "QUEST_COMPLETION_REQUEST":
      case "QUEST_APPROVED":
      case "QUEST_APPROVAL_REJECTED":
        return "quest";
      case "LOAN_APPLICATION":
      case "LOAN_REPAYMENT_COMPLETED":
      case "ABNORMAL_TRANSACTION":
        return "important";
      default:
        return "default";
    }
  };

  // 주기적으로 알림 확인 (1분마다)
  useEffect(() => {
    // 초기 알림 확인
    fetchNotifications();

    // 주기적으로 알림 확인
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 60000); // 1분마다 확인

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 알림 모니터링 시작
  useEffect(() => {
    if (hasHydrated) {
      fetchNotifications();
    }
  }, [hasHydrated]);

  if (!fontsLoaded || !hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: "white" }} />;
  }

  // 헤더 설정
  const getHeaderConfig = (): HeaderConfig => {
    // 퀘스트 상세 페이지에서 삭제 버튼 표시
    if (pathname.match(/^\/quest\/parent\/\d+$/)) {
      const questId = pathname.split("/").pop();
      return {
        title: "퀘스트 상세 보기",
        backgroundColor: "#F5F6F8",
        leftButton: {
          icon: <ChevronLeft size={24} color="#000000" />,
          onPress: () => router.back(),
        },
        rightButton: {
          text: "삭제",
          onPress: () => {
            console.log("Deleting quest:", questId);
            deleteQuest(Number(questId)).catch((error: any) => {
              console.error(
                "Delete quest error:",
                error.response?.data || error.message
              );
            });
            router.replace("/quest/parent");
          },
        },
      };
    }
    if (pathname.match(/^\/quest\/child\/\d+$/)) {
      return {
        title: "퀘스트 상세 보기",
        backgroundColor: "#F5F6F8",
        leftButton: {
          icon: <ChevronLeft size={24} color="#000000" />,
          onPress: () => router.back(),
        },
      };
    }
    if (
      pathname.match(/^\/loan\/child\/\d+$/) ||
      pathname.match(/^\/loan\/parent\/\d+$/)
    ) {
      return {
        title: "대출 상세 보기",
        backgroundColor: "#F5F6F8",
        leftButton: {
          icon: <ChevronLeft size={24} color="#000000" />,
          onPress: () => router.replace("/loan/child"),
        },
      };
    }

    switch (pathname) {
      case "/home":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: (
              <Image
                source={require("@/assets/icons/logo.png")}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            ),
            onPress: () => router.push("/home"),
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
          backgroundColor: "#F5F6F8",
        };
      case "/transaction":
        return {
          title: "거래 내역",
          backgroundColor: "#FFFFFF",
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
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Account":
        return {
          title: "계좌 입력",
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Amount":
        return {
          title: "금액 입력",
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/Confirm":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/transfer/ConfirmPin":
        return {
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton: undefined,
        };
      case "/child":
        return {
          title: "아이 조회하기",
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/child/Register":
        return {
          title: "아이 등록하기",
          backgroundColor: "F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/parent/ReqList":
      case "/loan/parent/PromissoryNote":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/parent/Signature":
        return {
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/child/ReqList":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.replace("/menu"),
          },
        };
      case "/loan/child/Request":
      case "/loan/child/ReqNote":
        return {
          title: "대출 요청하기",
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/child":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.replace("/menu"),
          },
          rightButton: {
            icon: <History size={24} color="#000000" />,
            onPress: () => router.push("/loan/child/History"),
          },
        };
      case "/loan/parent":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton: {
            icon: <History size={24} color="#000000" />,
            onPress: () => router.push("/loan/parent/History"),
          },
        };
      case "/loan/child/Repayment":
        return {
          title: "대출 상환하기",
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/loan/parent/History":
      case "/loan/child/History":
        return {
          title: "지난 대출",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/menu":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: (
              <Image
                source={require("@/assets/icons/logo.png")}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            ),
            onPress: () => {
              router.push("/home");
            },
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
          backgroundColor: "#F5F6F8",
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
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/child/RegularAllowance":
        return {
          title: "정기 용돈 설정",
          backgroundColor: "#F5F6F8",
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
          rightButton: {
            icon: (
              <GlobalText className="text-xs text-[#4FC985] font-medium">
                모두 읽음
              </GlobalText>
            ),
            onPress: async () => {
              try {
                console.log("📖 모든 알림 읽음 처리 시작");
                await notificationApi.markAllAsRead();
                console.log("✅ 모든 알림 읽음 처리 완료");
                // 알림 목록 새로고침
                router.replace("/notification");
              } catch (error) {
                console.error("❌ 모든 알림 읽음 처리 실패:", error);
                Toast.show({
                  type: "error",
                  text1: "알림 읽음 처리 실패",
                  text2: "다시 시도해주세요",
                });
              }
            },
          },
        };
      case "/quest/parent":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton: {
            icon: <History size={24} color="#000000" />,
            onPress: () => router.push("/quest/parent/History"),
          },
        };
      case "/quest/child":
        return {
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
          rightButton: {
            icon: <History size={24} color="#000000" />,
            onPress: () => router.push("/quest/child/History"),
          },
        };

      case "/quest/child/History":
      case "/quest/parent/History":
        return {
          title: "지난 퀘스트",
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/quest/parent/SelectChild":
      case "/quest/parent/SelectQuest":
      case "/quest/parent/Detail":
        return {
          title: "퀘스트 만들기",
          backgroundColor: "#F5F6F8",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/quest/parent/QuestPinInput":
        return {
          backgroundColor: "white",
          leftButton: {
            icon: <ChevronLeft size={24} color="#000000" />,
            onPress: () => router.back(),
          },
        };
      case "/boneyshop":
        return {
          title: "버니 상점",
          backgroundColor: "white",
          leftButton: {
            icon: (
              <Image
                source={require("@/assets/icons/logo.png")}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            ),
            onPress: () => router.push("/home"),
          },
        };
      default:
        return {
          backgroundColor: "#F5F6F8",
        };
    }
  };

  // Check if the current path has navigation bar
  const hasNav =
    pathname === "/home" ||
    pathname === "/transaction" ||
    pathname === "/menu" ||
    pathname === "/quest/child" ||
    pathname === "/quest/parent";

  // auth 페이지 중 SignUp 페이지에서만 헤더를 표시 + 메뉴에서 헤더 제거
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6F8" }}>
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
          <GlobalText
            style={{
              color: "#1F2937",
              fontSize: 16,
              fontWeight: "700",
              marginBottom: props.text2 ? 4 : 0,
            }}
          >
            {props.text1}
          </GlobalText>
          {props.text2 && (
            <GlobalText style={{ color: "#6B7280", fontSize: 14 }}>
              {props.text2}
            </GlobalText>
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
        <GlobalText style={{ color: "#333", fontSize: 16, fontWeight: "600" }}>
          {props.text1}
        </GlobalText>
        {props.text2 && (
          <GlobalText style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
            {props.text2}
          </GlobalText>
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
