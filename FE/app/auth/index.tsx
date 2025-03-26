import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
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

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID!;
const REDIRECT_URI =
  "https://j12b208.p.ssafy.io/api/v1/auth/login/kakao/callback";

export default function KakaoLogin() {
  const { kakaoLogin } = useAuthStore();
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef(null);

  const handleKakaoLogin = () => {
    setShowWebView(true);
  };

  const handleWebViewNavigationStateChange = ({ url }: { url: string }) => {
    if (url.startsWith(REDIRECT_URI) && url.includes("code=")) {
      const codeMatch = url.match(/code=([^&]+)/);
      const code = codeMatch?.[1];
      if (code) {
        console.log("✅ 인가 코드 감지:", code);
        setShowWebView(false); // WebView 닫기

        kakaoLogin(code)
          .then(() => {
            console.log("✅ 백엔드 로그인 완료");
            router.replace("/auth/SignUp"); // 로그인 성공 후 이동할 페이지
          })
          .catch((err) => {
            console.error("❌ 백엔드 로그인 실패:", err);
            Alert.alert("로그인 실패", "서버 통신 중 오류가 발생했습니다.");
          });
      }
    }
  };

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=account_email`;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <Image
            source={kakaoLoginBtn as ImageSourcePropType}
            style={styles.kakaoButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <Image
              source={fullLogo as ImageSourcePropType}
              style={styles.kakaoButtonImage}
              resizeMode="contain"
            />
          </View>
          <GlobalText weight="bold">돈과 친구되는 습관</GlobalText>
        </View>
      </View>

      <Modal visible={showWebView} animationType="slide">
        <WebView
          ref={webViewRef}
          source={{ uri: kakaoAuthUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  innerContainer: {
    width: 412,
    height: 917,
    backgroundColor: "white",
    position: "relative",
  },
  kakaoButton: {
    position: "absolute",
    top: 669,
    left: 32,
    width: 348,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoButtonImage: {
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    position: "absolute",
    width: 294,
    height: 127,
    top: 301,
    left: 61,
    alignItems: "center",
  },
  logoIconContainer: {
    width: 294,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "NEXON_Lv1_Gothic-Bold",
    fontSize: 20,
    color: "rgba(0, 0, 0, 0.61)",
    textAlign: "center",
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
