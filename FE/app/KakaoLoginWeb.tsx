import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useAuthRequest } from "expo-auth-session";

const clientId = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID as string;
const redirectUri = "http://localhost:8081";

console.log("🔧 [DEBUG] clientId:", clientId);
console.log("🔧 [DEBUG] redirectUri:", redirectUri);

const discovery = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
};

export default function KakaoLoginWeb() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      responseType: "code",
    },
    discovery
  );

  useEffect(() => {
    console.log("📡 [DEBUG] response 상태 변경 감지:", response);

    if (response?.type === "success" && response.params?.code) {
      const code = response.params.code;
      console.log("✅ [DEBUG] 인가 코드 수신:", code);
      Alert.alert("로그인 성공", `인가 코드: ${code}`);
    } else if (response?.type === "error") {
      console.error("❌ [DEBUG] 에러 발생:", response);
      Alert.alert("에러 발생", JSON.stringify(response));
    } else if (response?.type === "dismiss") {
      console.warn("⚠️ [DEBUG] 창이 닫혔습니다.");
    } else if (response?.type === "cancel") {
      console.warn("⚠️ [DEBUG] 로그인 취소됨");
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 카카오 로그인 (웹 전용)</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (request) {
            console.log("🚀 [DEBUG] promptAsync 실행");
            promptAsync()
              .then((res) => console.log("📥 [DEBUG] promptAsync 결과:", res))
              .catch((err) =>
                console.error("❌ [DEBUG] promptAsync 에러:", err)
              );
          } else {
            console.warn("⚠️ [DEBUG] 인증 요청 준비되지 않음");
            Alert.alert("요청이 아직 준비되지 않았습니다.");
          }
        }}
      >
        <Text style={styles.buttonText}>카카오 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FEE500",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
  },
});
