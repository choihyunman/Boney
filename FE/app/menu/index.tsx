import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import {
  Wallet,
  Clock,
  FileText,
  PiggyBank,
  ChartColumn,
  ScrollText,
  Landmark,
  CalendarFold,
  FileClock,
  Banknote,
  ChevronRight,
  UserPlus,
  Users,
  FilePlus2,
  Award,
  LogOut,
  ContactRound,
  Utensils,
} from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { getLoanValidation } from "@/apis/loanChildApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";
import { getTransactionHistory } from "@/apis/transactionApi";
import WebView from "react-native-webview";
import LottieView from "lottie-react-native";

// 프로필 이미지
const profileImages = {
  child_male: require("@/assets/images/child_male.png"),
  child_female: require("@/assets/images/child_female.png"),
  parent_male: require("@/assets/images/parent_male.png"),
  parent_female: require("@/assets/images/parent_female.png"),
};

// 메뉴 아이템 타입 정의
interface SubMenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  route?: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  subMenus: SubMenuItem[];
}

export default function MenuScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isParent = user?.role === "PARENT";
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  if (isLoggingOut) {
    return (
      <View className="flex-1 justify-center items-center bg-white pt-20">
        <LottieView
          source={require("@/assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID!;
  const REDIRECT_URI = "https://j12b208.p.ssafy.io/api/v1/auth/logout/redirect";
  const LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_REST_API_KEY}&logout_redirect_uri=${REDIRECT_URI}`;

  // 프로필 이미지 경로 설정
  const getProfileImage = () => {
    if (!user?.role || !user?.userGender) return null;

    const role = user.role.toLowerCase();
    const gender = user.userGender.toLowerCase();
    const imageKey = `${role}_${gender}` as keyof typeof profileImages;

    return profileImages[imageKey] || null;
  };

  // 아이 메뉴 데이터
  const childMenuItems: MenuItem[] = [
    {
      id: "wallet",
      title: "내 지갑",
      icon: <Wallet size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "wallet-balance",
          title: "송금",
          icon: <PiggyBank size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/transfer",
        },
        {
          id: "wallet-transactions",
          title: "거래내역",
          icon: <FileText size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/transaction",
        },
      ],
    },
    {
      id: "quests",
      title: "퀘스트",
      icon: <Award size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "quests-active",
          title: "진행 중인 퀘스트",
          icon: <FileClock size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/quest/child",
        },
        // {
        //   id: "quests-completed",
        //   title: "완료된 퀘스트",
        //   icon: <FileCheck2 size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
        //   route: "/quest/",
        // },
      ],
    },
    {
      id: "loan",
      title: "대출",
      icon: <Landmark size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "loan-request",
          title: "대출 요청",
          icon: <Banknote size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/loan/child/Request",
        },
        {
          id: "loan-list",
          title: "대출 목록",
          icon: <ScrollText size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/loan/child",
        },
        {
          id: "loan-req-list",
          title: "요청 중인 대출",
          icon: <Clock size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/loan/child/ReqList",
        },
      ],
    },
    {
      id: "report",
      title: "월간 리포트",
      icon: <CalendarFold size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "monthly-report",
          title: "이달의 리포트",
          icon: (
            <ChartColumn size={18} color={isDark ? "#E5E7EB" : "#374151"} />
          ),
          route: "/report",
        },
      ],
    },
  ];

  // 보호자 메뉴 데이터
  const parentMenuItems: MenuItem[] = [
    {
      id: "wallet",
      title: "내 지갑",
      icon: <Wallet size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "wallet-balance",
          title: "송금",
          icon: <PiggyBank size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/transfer",
        },
        {
          id: "wallet-transactions",
          title: "거래내역",
          icon: <FileText size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/transaction",
        },
      ],
    },
    {
      id: "children",
      title: "내 아이",
      icon: <Users size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "children-register",
          title: "등록하기",
          icon: <UserPlus size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/child/Register",
        },
        {
          id: "children-manage",
          title: "관리하기",
          icon: (
            <ContactRound size={18} color={isDark ? "#E5E7EB" : "#374151"} />
          ),
          route: "/child",
        },
        // {
        //   id: "children-allowance",
        //   title: "정기 용돈",
        //   icon: <Coins size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
        //   route: "/child/allowance",
        // },
      ],
    },
    {
      id: "quests",
      title: "퀘스트",
      icon: <Award size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "quests-create",
          title: "퀘스트 만들기",
          icon: <FilePlus2 size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/quest/parent/SelectChild",
        },
        {
          id: "quests-active",
          title: "진행 중인 퀘스트",
          icon: <FileClock size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/quest/parent",
        },
      ],
    },
    {
      id: "loan",
      title: "대출",
      icon: <Landmark size={20} color={isDark ? "#E5E7EB" : "#374151"} />,
      subMenus: [
        {
          id: "loan-req-list",
          title: "요청 중인 대출",
          icon: <Clock size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/loan/parent/ReqList",
        },
        {
          id: "loan-list",
          title: "대출 목록",
          icon: <ScrollText size={18} color={isDark ? "#E5E7EB" : "#374151"} />,
          route: "/loan/parent",
        },
      ],
    },
  ];

  // 메뉴 항목 클릭 처리
  const handleMenuItemClick = async (route?: string, id?: string) => {
    if (!route) return;

    // 대출 요청 메뉴인 경우 예외 처리
    if (id === "loan-request") {
      try {
        const res = await getLoanValidation();
        console.log("loan validation:", res);

        if (res?.is_loan_allowed) {
          router.push("/loan/child/Request");
        } else {
          router.push({
            pathname: "/loan/child/Restrict",
            params: {
              credit_score: res?.credit_score,
            },
          });
        }
      } catch (err) {
        console.error("대출 가능 여부 확인 실패:", err);
        Alert.alert("알림", "대출 요청 확인 중 오류가 발생했어요.");
      }
      return;
    }

    // 월간 리포트 메뉴인 경우 거래내역 조회 후 이동
    if (id === "monthly-report") {
      try {
        const token = useAuthStore.getState().token;
        if (!token) {
          Alert.alert("알림", "인증 정보가 없습니다. 다시 로그인해주세요.");
          return;
        }

        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");

        // 거래내역 조회 API 호출
        await getTransactionHistory({ year, month, type: "all" }, token);

        // 거래내역 조회 성공 후 리포트 페이지로 이동
        router.push(route as any);
      } catch (err) {
        console.error("거래내역 조회 실패:", err);
        Alert.alert("알림", "거래내역 조회 중 오류가 발생했어요.");
      }
      return;
    }

    // 다른 메뉴 아이템들은 일반 라우팅
    router.push(route as any);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    // WebView 열기
    console.log("🔄 로그아웃 웹뷰 열기");
    setShowWebView(true);
  };

  const handleWebViewNavigation = async (navState: any) => {
    console.log("🔄 웹뷰 네비게이션 처리");
    const { url } = navState;
    if (url.startsWith(REDIRECT_URI)) {
      console.log("✅ 카카오 로그아웃 완료");
      setShowWebView(false);
      setIsLoggingOut(true);
      console.log("✨ 초기화 시작");
      await logout();
      console.log("🎈 로그인 화면으로 이동");
      router.replace("/auth");
    }
  };
  // 사용자 역할에 따라 메뉴 아이템 선택
  const menuItems = isParent ? parentMenuItems : childMenuItems;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6F8] dark:bg-gray-900">
      <ScrollView className="flex-1 pb-20">
        <View className="px-6">
          {/* 프로필 카드 */}
          <TouchableOpacity
            onPress={() => router.push("/mypage")}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900 items-center justify-center overflow-hidden">
                {getProfileImage() ? (
                  <Image
                    source={getProfileImage()}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <GlobalText
                    weight="bold"
                    className="text-lg text-blue-500 dark:text-blue-300"
                  >
                    {user?.userName?.[0] || "?"}
                  </GlobalText>
                )}
              </View>
              <View className="ml-3">
                <GlobalText
                  weight="bold"
                  className="text-lg text-gray-900 dark:text-white"
                >
                  {user?.userName || "사용자"}
                </GlobalText>
                <GlobalText className="text-base text-gray-500 dark:text-gray-400">
                  {user?.userEmail || "이메일 없음"}
                </GlobalText>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? "#E5E7EB" : "#374151"} />
          </TouchableOpacity>

          {/* 메뉴 목록 */}
          <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden p-2 mb-4">
            {menuItems.map((menuItem, index) => (
              <View key={menuItem.id}>
                {/* 메인 메뉴 항목 */}
                <View className="flex-row items-center p-4 dark:bg-gray-700 gap-2">
                  <View className="w-6">{menuItem.icon}</View>
                  <GlobalText
                    weight="bold"
                    className="text-base text-gray-900 dark:text-white"
                  >
                    {menuItem.title}
                  </GlobalText>
                </View>

                {/* 서브 메뉴 항목 */}
                <View className="bg-white dark:bg-gray-800">
                  {menuItem.subMenus.map((subMenuItem) => (
                    <TouchableOpacity
                      key={subMenuItem.id}
                      onPress={() =>
                        handleMenuItemClick(subMenuItem.route, subMenuItem.id)
                      }
                      className="flex-row items-center justify-between p-4 dark:border-gray-700"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center ml-4">
                        <View className="w-6">{subMenuItem.icon}</View>
                        <GlobalText className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                          {subMenuItem.title}
                        </GlobalText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/boneyshop")}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="items-center justify-center ml-2">
                <Utensils size={18} color={isDark ? "#E5E7EB" : "#374151"} />
              </View>
              <GlobalText
                weight="bold"
                className="text-base text-[#374151] dark:text-white ml-3"
              >
                버니 상점
              </GlobalText>
            </View>
          </TouchableOpacity>

          {/* 로그아웃 카드 */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="items-center justify-center ml-2">
                <LogOut size={18} color={isDark ? "#E5E7EB" : "#374151"} />
              </View>
              <GlobalText
                weight="bold"
                className="text-base text-[#374151] dark:text-white ml-3"
              >
                로그아웃
              </GlobalText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* WebView for Logout */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <WebView
          source={{ uri: LOGOUT_URL }}
          onNavigationStateChange={handleWebViewNavigation}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("❌ WebView 에러 발생:", nativeEvent);
          }}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 justify-center items-center bg-white">
              <LottieView
                source={require("@/assets/animations/loading.json")}
                autoPlay
                loop
                style={{ width: 150, height: 150 }}
              />
            </View>
          )}
        />
      </Modal>
    </SafeAreaView>
  );
}
