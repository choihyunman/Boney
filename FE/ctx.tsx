import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// 사용자 세션 타입
interface UserSession {
  token: string;
  signedUp: boolean;
  kakaoId: number;
  userName?: string;
  userEmail: string;
  userType?: string;
  hasPin: boolean;
}

// 인증 컨텍스트 타입 정의
interface SessionContextType {
  session: UserSession | null;
  isLoading: boolean;
  signIn: (user: UserSession) => Promise<void>;
  signOut: () => Promise<void>;
}

// context 생성
const AuthContext = createContext<SessionContextType | null>(null);

// provider props
interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (Platform.OS !== "web") {
        try {
          const token = await SecureStore.getItemAsync("userToken");
          const rawUser = await SecureStore.getItemAsync("userInfo");

          if (!token || !rawUser) {
            console.log("🪫 토큰 또는 사용자 정보 없음 → 로그인 필요");
            setSession(null);
            setIsLoading(false);
            return;
          }

          const user = JSON.parse(rawUser);
          setSession({ token, ...user });
          console.log("📦 SecureStore로부터 세션 복원 완료:", {
            token,
            ...user,
          });
        } catch (err) {
          console.warn("❌ 세션 복원 중 에러:", err);
          setSession(null);
        }
      } else {
        console.warn("🌐 웹 환경에서는 SecureStore를 사용하지 않음");
      }

      setIsLoading(false);
    };

    loadSession();
  }, []);

  const signIn = async (user: UserSession) => {
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync("userToken", user.token);
      await SecureStore.setItemAsync("userInfo", JSON.stringify(user));
    }
    setSession(user);
    console.log("🆕 [AUTH] session 상태 저장됨:", user);
  };

  const signOut = async () => {
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userInfo");
    }
    setSession(null);
    console.log("👋 [AUTH] 세션 제거 완료");
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export const useSession = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useSession must be used within a SessionProvider");
  return context;
};
