import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useRouter } from "expo-router";

// 1️⃣ 인증 컨텍스트 타입 정의
interface SessionContextType {
  session: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 2️⃣ context 생성 시 타입 명시
const AuthContext = createContext<SessionContextType | null>(null);

// 3️⃣ Provider의 props 타입 정의
interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      if (Platform.OS !== "web") {
        const token = await SecureStore.getItemAsync("userToken");
        setSession(token);
      } else {
        console.warn("🌐 웹에서는 SecureStore를 사용하지 않습니다");
        setSession(null);
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (token: string) => {
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync("userToken", token);
    } else {
      console.warn("🌐 웹에서는 SecureStore 저장 생략");
    }
    setSession(token);
    console.log("🆕 [AUTH] session 상태 업데이트됨:", token);
  };

  useEffect(() => {
    console.log("📦 [AUTH] session 값 변경 감지:", session);
  }, [session]);

  const signOut = async () => {
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync("userToken");
    } else {
      console.warn("🌐 웹에서는 SecureStore 삭제 생략");
    }
    setSession(null);
  };

  useEffect(() => {
    if (session) {
      console.log("✅ [AUTH] 유효한 토큰 확인됨:", session);
      router.replace("/home");
    } else if (!isLoading) {
      console.log("❌ [AUTH] 유효한 토큰 없음");
    }
  }, [isLoading, session]);

  // 4️⃣ Provider로 값 전달
  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5️⃣ 커스텀 훅에서 타입 체크
export const useSession = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useSession must be used within a SessionProvider");
  return context;
};
