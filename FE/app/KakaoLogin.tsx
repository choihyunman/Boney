import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Alert,
} from "react-native";
import kakaoLoginBtn from "../assets/icons/kakao_login_large_wide.png";
import fullLogo from "../assets/icons/full-logo.png";
import GlobalText from "../components/GlobalText";
import { useAuthStore } from "../stores/useAuthStore";
import * as AuthSession from "expo-auth-session";

const redirectUri1 = AuthSession.makeRedirectUri();
const redirectUri2 = AuthSession.makeRedirectUri({ useProxy: true });
const redirectUri3 = AuthSession.makeRedirectUri({
  native: "myapp://redirect",
  useProxy: true,
});

console.log("🧪 [리디렉트 URI 체크 - 기본]:", redirectUri1);
console.log("🧪 [리디렉트 URI 체크 - 프록시]:", redirectUri2);
console.log("🧪 [리디렉트 URI 체크 - 프록시 + 네이티브]:", redirectUri3);

const clientId = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID as string;
// const redirectUri = AuthSession.makeRedirectUri({
//   native: "myapp://redirect",
//   useProxy: true,
// });
const redirectUri = "https://auth.expo.io/@msunny/FE";

export default function KakaoLogin() {
  const { kakaoLogin } = useAuthStore();

  const discovery = {
    authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      responseType: "code",
      scopes: ["account_email"],
    },
    discovery
  );

  const handleKakaoLogin = async () => {
    try {
      console.log(
        AuthSession.makeRedirectUri({
          scheme: "myapp",
          native: "myapp://redirect",
          useProxy: true,
        })
      );
      console.log("redirectUri", redirectUri);
      console.log("clientId", clientId);
      console.log("discovery", discovery);

      const result = await promptAsync();

      if (result.type === "success" && result.params.code) {
        const code = result.params.code;
        console.log("✅ 카카오 인가 코드:", code);

        await kakaoLogin(code);
      } else if (result.type === "dismiss") {
        console.log("🚫 사용자 로그인 취소");
      } else {
        Alert.alert("로그인 실패", "인가 코드 획득에 실패했습니다.");
      }
    } catch (error) {
      console.error("🔥 카카오 로그인 에러:", error);
      Alert.alert("로그인 에러", "카카오 로그인 중 문제가 발생했습니다.");
    }
  };

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
});
