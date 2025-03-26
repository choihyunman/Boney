import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import kakaoLoginBtn from "../../assets/icons/kakao_login_large_wide.png";
import fullLogo from "../../assets/icons/full-logo.png";
import GlobalText from "../../components/GlobalText";
import { useAuthStore } from "../../stores/useAuthStore";
import { router } from "expo-router";
import { useSession } from "../../ctx";

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID!;
const REDIRECT_URI =
  "https://j12b208.p.ssafy.io/api/v1/auth/login/kakao/callback";

export default function KakaoLogin() {
  const { kakaoLogin } = useAuthStore();
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef(null);
  const { signIn } = useSession();

  const handleKakaoLogin = () => {
    setShowWebView(true);
  };

  const handleWebViewNavigationStateChange = async ({
    url,
  }: {
    url: string;
  }) => {
    if (url.startsWith(REDIRECT_URI) && url.includes("code=")) {
      const codeMatch = url.match(/code=([^&]+)/);
      const code = codeMatch?.[1];
      if (code) {
        console.log("✅ 인가 코드 감지:", code);
        setShowWebView(false); // WebView 닫기

        try {
          const user = await kakaoLogin(code);
          if (user) {
            await signIn({
              kakaoId: user.kakaoId,
              userEmail: user.userEmail,
            });
            console.log("✅ 세션 저장 완료");
            router.replace("/auth/SignUp"); // 가입 페이지로 이동
          } else {
            throw new Error("user 또는 token이 존재하지 않음");
          }
        } catch (err) {
          console.error("❌ 카카오 로그인 실패:", err);
          Alert.alert("로그인 실패", "서버 통신 중 오류가 발생했습니다.");
        }
      }
    }
  };

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=account_email`;

  return (
    <View className="flex-1 bg-white items-center">
      <View className="w-[412px] h-[917px] bg-white relative">
        <TouchableOpacity
          className="absolute top-[669px] left-8 w-[348px] h-12 items-center justify-center"
          onPress={handleKakaoLogin}
        >
          <Image
            source={kakaoLoginBtn as ImageSourcePropType}
            className="w-full h-full"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View className="absolute w-[294px] h-[127px] top-[301px] left-[61px] items-center">
          <View className="w-[294px] h-[116px] items-center justify-center">
            <Image
              source={fullLogo as ImageSourcePropType}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <GlobalText className="text-xl text-black/60 text-center mt-2.5">
            돈과 친구되는 습관
          </GlobalText>
        </View>
      </View>

      <Modal visible={showWebView} animationType="slide">
        <WebView
          ref={webViewRef}
          source={{ uri: kakaoAuthUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" />
            </View>
          )}
        />
      </Modal>
    </View>
  );
}
