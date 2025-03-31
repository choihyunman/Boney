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
import { api } from "@/lib/api";
import * as SecureStore from "expo-secure-store";

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID!;
const REDIRECT_URI =
  "https://j12b208.p.ssafy.io/api/v1/auth/login/kakao/callback";

export default function KakaoLogin() {
  const { kakaoLogin, token, user, setUser } = useAuthStore();
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef(null);

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
            setUser({
              kakaoId: user.kakaoId,
              userEmail: user.userEmail,
            });

            try {
              console.log("🔐 JWT 요청 시도 중...");
              const res = await api.post("/auth/login/kakao/jwt", {
                kakao_id: user.kakaoId,
              });
              console.log("🧾 JWT 응답: ", res.data);

              const token = res.data.token;
              useAuthStore.setState({ token });
              await SecureStore.setItemAsync("userToken", token);

              // ✅ 토큰이 바로 업데이트되었는지 확신할 수 없기 때문에 직접 다음 단계 진행
              try {
                const userRes = await api.post("/auth/check");
                const userData = userRes.data.data;

                const pinRes = await api.post("/account/password/check");
                const pinData = pinRes.data.data;

                useAuthStore.setState({
                  user: {
                    kakaoId: userData.kakao_id,
                    userId: userData.user_id,
                    userEmail: userData.user_email,
                    userName: userData.user_name,
                    userGender: userData.user_gender,
                    userBirth: userData.user_birth,
                    userPhone: userData.user_phone,
                    role: userData.role,
                  },
                });

                if (pinData.isPasswordNull) {
                  console.log("🔐 PIN 미설정 → CreatePin 이동");
                  router.replace("/auth/CreatePin");
                } else {
                  console.log("✅ 모든 조건 통과 → 홈으로");
                  router.replace("/home");
                }
              } catch (err: any) {
                const status = err?.response?.status;
                if (status === 404) {
                  router.replace({
                    pathname: "/auth/SignUp",
                    params: {
                      kakaoId: user.kakaoId,
                      userEmail: user.userEmail,
                    },
                  });
                } else {
                  console.error("❌ 유저 확인 실패:", err);
                  Alert.alert(
                    "로그인 실패",
                    "서버 통신 중 오류가 발생했습니다."
                  );
                }
              }
              return;
            } catch (err: any) {
              const status = err?.response?.status;

              if (status === 404) {
                console.log("🆕 등록되지 않은 사용자 → SignUp 이동");
                router.replace({
                  pathname: "/auth/SignUp",
                  params: {
                    kakaoId: user.kakaoId,
                    userEmail: user.userEmail,
                  },
                });
              } else {
                console.error("❌ jwt 발급 실패:", err);
                Alert.alert("jwt 실패", "서버 통신 중 오류가 발생했습니다.");
              }
            }
          }
        } catch (err) {
          console.error("❌ 카카오 로그인 실패:", err);
          Alert.alert("로그인 실패", "사용자 정보를 가져오는 데 실패했습니다.");
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
