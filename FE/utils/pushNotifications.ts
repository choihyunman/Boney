import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;
  const isExpoGo = Constants.executionEnvironment === "storeClient";

  console.log(
    "🔔 현재 환경:",
    isExpoGo ? "Expo Go (개발 환경)" : "EAS 빌드 (배포 환경)"
  );

  try {
    // 권한 확인
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("푸시 알림 권한을 얻지 못했습니다.");
      return;
    }

    // 환경에 따라 다른 토큰 획득 방식 사용
    if (isExpoGo) {
      // Expo Go 환경: Expo Push Token 사용
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "dc60c654-9c90-4e59-8d53-04220cd91abe", // app.json의 eas.projectId 값
        });
        token = tokenData.data;
        console.log("🔔 Expo Push Token 획득 성공:", token);
      } catch (error) {
        console.error("🔔 Expo Push Token 획득 실패:", error);
      }
    } else {
      // EAS 빌드 환경: FCM 토큰 사용
      try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        token = tokenData.data;
        console.log("🔔 FCM 토큰 획득 성공:", token);
      } catch (error) {
        console.error("🔔 FCM 토큰 획득 실패:", error);
      }
    }
  } catch (error) {
    console.error("🔔 푸시 알림 등록 중 오류 발생:", error);
  }

  return token;
}

// 알림 핸들러 설정
export function setupNotificationHandler() {
  try {
    // 앱이 포그라운드에 있을 때 알림 표시 방식 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 알림 채널 설정 (Android)
    if (Platform.OS === "android") {
      setupNotificationChannels();
    }
  } catch (error) {
    console.error("🔔 알림 핸들러 설정 실패:", error);
  }
}

// Android 알림 채널 설정
async function setupNotificationChannels() {
  try {
    // 기본 채널
    await Notifications.setNotificationChannelAsync("default", {
      name: "기본 알림",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "notification.wav", // 커스텀 사운드 (assets 폴더에 있어야 함)
    });

    // 중요 알림 채널
    await Notifications.setNotificationChannelAsync("important", {
      name: "중요 알림",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 500, 500],
      lightColor: "#FF0000",
      sound: "important.wav", // 커스텀 사운드
    });

    // 퀘스트 알림 채널
    await Notifications.setNotificationChannelAsync("quest", {
      name: "퀘스트 알림",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00FF00",
      sound: "quest.wav", // 커스텀 사운드
    });

    console.log("🔔 알림 채널 설정 완료");
  } catch (error) {
    console.error("🔔 알림 채널 설정 실패:", error);
  }
}

// 커스텀 알림 생성 함수
export async function createCustomNotification({
  title,
  body,
  data = {},
  channelId = "default",
  sound = true,
  badge = 1,
  color = "#FF0000",
  icon = "notification_icon",
  priority = "high",
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
  sound?: boolean | string;
  badge?: number;
  color?: string;
  icon?: string;
  priority?: "default" | "high" | "max";
}) {
  try {
    // 기본 알림 내용 설정
    const notificationContent: Notifications.NotificationContentInput = {
      title,
      body,
      data,
      sound,
      badge,
      color,
    };

    // Android 설정
    if (Platform.OS === "android") {
      // Android 알림 설정을 위한 객체 생성
      const androidConfig: any = {
        channelId,
        vibrate: [0, 250, 250, 250],
        sticky: false,
        autoCancel: true,
        showWhen: true,
        smallIcon: icon,
        color,
      };

      // 우선순위 설정
      if (priority === "high") {
        androidConfig.priority = "high";
      } else if (priority === "max") {
        androidConfig.priority = "max";
      } else {
        androidConfig.priority = "default";
      }

      // Android 설정을 알림 내용에 추가
      (notificationContent as any).android = androidConfig;
    }

    // iOS 설정
    if (Platform.OS === "ios") {
      // iOS 알림 설정을 위한 객체 생성
      const iosConfig: any = {
        sound: typeof sound === "string" ? sound : sound ? "default" : false,
        badge,
        threadId: channelId,
      };

      // 우선순위 설정
      if (priority === "high" || priority === "max") {
        iosConfig.priority = 10;
      } else {
        iosConfig.priority = 5;
      }

      // iOS 설정을 알림 내용에 추가
      (notificationContent as any).ios = iosConfig;
    }

    return notificationContent;
  } catch (error) {
    console.error("🔔 커스텀 알림 생성 실패:", error);
    return null;
  }
}
