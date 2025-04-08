import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
  registerForPushNotificationsAsync,
  setupNotificationHandler,
} from "@/utils/pushNotifications";
import { getDeviceInfo } from "@/utils/deviceInfo";
import { fcmApi } from "@/apis/fcmApi";
import { useAuthStore } from "@/stores/useAuthStore";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isExpoGo, setIsExpoGo] = useState<boolean>(false);

  useEffect(() => {
    // Expo Go 여부 확인
    const checkExpoGo = async () => {
      const isExpoGoApp = Constants.appOwnership === "expo";
      setIsExpoGo(isExpoGoApp);
      console.log("🔔 Expo Go 여부:", isExpoGoApp);
    };

    checkExpoGo();

    // 알림 핸들러 설정
    try {
      setupNotificationHandler();
    } catch (error) {
      console.error("🔔 알림 핸들러 설정 실패:", error);
    }

    // 푸시 알림 등록
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        console.log("🔔 푸시 토큰 발급 성공:", token);

        // 토큰을 SecureStore에 저장
        SecureStore.setItemAsync("fcmToken", token).catch((error) => {
          console.error("FCM 토큰 저장 실패:", error);
        });

        // 사용자가 로그인한 상태라면 토큰을 백엔드에 등록
        if (user?.userId) {
          const deviceInfo = getDeviceInfo();
          console.log("🔔 기기 정보:", deviceInfo);
          console.log("🔔 사용자 ID:", user.userId);

          fcmApi
            .registerToken({
              userId: user.userId,
              fcmToken: token,
              deviceInfo,
            })
            .then((response) => {
              console.log("🔔 푸시 토큰 등록 성공:", response);
            })
            .catch((error) => {
              console.error("푸시 토큰 등록 실패:", error);
            });
        } else {
          console.log(
            "🔔 사용자가 로그인하지 않았습니다. 푸시 토큰 등록을 건너뜁니다."
          );
        }
      } else {
        console.log("🔔 푸시 토큰을 가져오지 못했습니다.");
      }
    });

    // 알림 수신 리스너
    try {
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
          console.log("🔔 알림 수신:", notification);
        });
    } catch (error) {
      console.error("🔔 알림 수신 리스너 설정 실패:", error);
    }

    // 알림 응답 리스너 (알림 탭했을 때)
    try {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          console.log("🔔 알림 응답:", data);

          // 알림 데이터에 따라 적절한 화면으로 이동
          if (data.referenceId) {
            // 알림 타입에 따라 다른 화면으로 이동
            switch (data.notificationTypeCode) {
              case "QUEST":
                // 부모/자녀 역할에 따라 다른 경로로 이동
                if (user?.role === "PARENT") {
                  router.push(`/quest/parent/${data.referenceId}`);
                } else {
                  router.push(`/quest/child/${data.referenceId}`);
                }
                break;
              case "TRANSACTION":
                router.push(`/transaction/${data.referenceId}`);
                break;
              case "LOAN":
                // 부모/자녀 역할에 따라 다른 경로로 이동
                if (user?.role === "PARENT") {
                  router.push(`/loan/parent/${data.referenceId}`);
                } else {
                  router.push(`/loan/child/${data.referenceId}`);
                }
                break;
              default:
                // 기본적으로 알림 목록으로 이동
                router.push("/notification");
            }
          }
        });
    } catch (error) {
      console.error("🔔 알림 응답 리스너 설정 실패:", error);
    }

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      if (notificationListener.current) {
        try {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        } catch (error) {
          console.error("🔔 알림 수신 리스너 제거 실패:", error);
        }
      }
      if (responseListener.current) {
        try {
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
        } catch (error) {
          console.error("🔔 알림 응답 리스너 제거 실패:", error);
        }
      }
    };
  }, [user]);

  // 로그아웃 시 푸시 토큰 등록 해제
  const unregisterToken = async () => {
    if (expoPushToken) {
      try {
        console.log("🔔 푸시 토큰 등록 해제 시도:", expoPushToken);
        await fcmApi.unregisterToken(expoPushToken);
        await SecureStore.deleteItemAsync("fcmToken");
        console.log("🔔 푸시 토큰 등록 해제 성공");
      } catch (error) {
        console.error("푸시 토큰 등록 해제 실패:", error);
      }
    }
  };

  return {
    expoPushToken,
    notification,
    unregisterToken,
    isExpoGo,
  };
}
