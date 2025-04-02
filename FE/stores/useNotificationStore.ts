import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 알림 타입 정의
export interface Notification {
  id: string;
  type:
    | "deposit"
    | "quest-created"
    | "quest-completed"
    | "quest-failed"
    | "loan-due";
  title: string;
  message: string;
  amount?: number;
  date: string;
  read: boolean;
  link?: string;
  sender?: string;
}

// 로컬 스토리지 키
const NOTIFICATIONS_KEY = "notifications";
const UNREAD_COUNT_KEY = "unreadNotificationCount";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  getNotifications: () => Promise<void>;
  addNotification: (
    notification: Omit<Notification, "id" | "date" | "read">
  ) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  initializeNotifications: (
    sampleNotifications: Notification[]
  ) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  // 알림 목록 가져오기
  getNotifications: async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const storedCount = await AsyncStorage.getItem(UNREAD_COUNT_KEY);

      set({
        notifications: storedNotifications
          ? JSON.parse(storedNotifications)
          : [],
        unreadCount: storedCount ? Number.parseInt(storedCount) : 0,
      });
    } catch (error) {
      console.error("알림 목록 로드 중 오류 발생:", error);
    }
  },

  // 알림 추가하기
  addNotification: async (notification) => {
    try {
      const { notifications } = get();

      // 새 알림 생성
      const newNotification: Notification = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T").join(" ").substring(0, 16),
        read: false,
        ...notification,
      };

      // 알림 목록 업데이트
      const updatedNotifications = [newNotification, ...notifications];
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );

      // 읽지 않은 알림 개수 업데이트
      const unreadCount = updatedNotifications.filter((n) => !n.read).length;
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());

      set({
        notifications: updatedNotifications,
        unreadCount,
      });
    } catch (error) {
      console.error("알림 추가 중 오류 발생:", error);
    }
  },

  // 알림 읽음 처리
  markAsRead: async (id) => {
    try {
      const { notifications } = get();
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );

      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );

      // 읽지 않은 알림 개수 업데이트
      const unreadCount = updatedNotifications.filter((n) => !n.read).length;
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());

      set({
        notifications: updatedNotifications,
        unreadCount,
      });
    } catch (error) {
      console.error("알림 읽음 처리 중 오류 발생:", error);
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      const { notifications } = get();
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));

      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, "0");

      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      });
    } catch (error) {
      console.error("모든 알림 읽음 처리 중 오류 발생:", error);
    }
  },

  // 알림 삭제
  deleteNotification: async (id) => {
    try {
      const { notifications } = get();
      const updatedNotifications = notifications.filter(
        (notification) => notification.id !== id
      );

      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );

      // 읽지 않은 알림 개수 업데이트
      const unreadCount = updatedNotifications.filter((n) => !n.read).length;
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());

      set({
        notifications: updatedNotifications,
        unreadCount,
      });
    } catch (error) {
      console.error("알림 삭제 중 오류 발생:", error);
    }
  },

  // 알림 초기화 (테스트용)
  initializeNotifications: async (sampleNotifications) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(sampleNotifications)
      );

      // 읽지 않은 알림 개수 업데이트
      const unreadCount = sampleNotifications.filter((n) => !n.read).length;
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());

      set({
        notifications: sampleNotifications,
        unreadCount,
      });
    } catch (error) {
      console.error("알림 초기화 중 오류 발생:", error);
    }
  },
}));
