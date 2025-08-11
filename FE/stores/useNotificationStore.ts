import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationApi } from "@/apis/notificationApi";

// 알림 타입 정의
export interface Notification {
  id: string;
  type:
    | "TRANSFER_RECEIVED"
    | "QUEST_REGISTERED"
    | "QUEST_COMPLETION_REQUEST"
    | "QUEST_APPROVED"
    | "QUEST_APPROVAL_REJECTED"
    | "LOAN_APPLICATION"
    | "LOAN_REPAYMENT_COMPLETED"
    | "ABNORMAL_TRANSACTION";
  title: string;
  message: string;
  amount?: number;
  date: string;
  read: boolean;
  link?: string;
  sender?: string;
}

// 로컬 스토리지 키
const UNREAD_COUNT_KEY = "unreadNotificationCount";

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
    AsyncStorage.setItem(UNREAD_COUNT_KEY, count.toString());
  },

  // 알림 읽음 처리
  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(Number(id));
      const { unreadCount } = useNotificationStore.getState();
      if (unreadCount > 0) {
        set({ unreadCount: unreadCount - 1 });
        AsyncStorage.setItem(UNREAD_COUNT_KEY, (unreadCount - 1).toString());
      }
    } catch (error) {
      console.error("알림 읽음 처리 중 오류 발생:", error);
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set({ unreadCount: 0 });
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, "0");
    } catch (error) {
      console.error("모든 알림 읽음 처리 중 오류 발생:", error);
    }
  },

  // 읽지 않은 알림 개수 가져오기
  fetchUnreadCount: async () => {
    try {
      const response = await notificationApi.getNotifications();
      const unreadCount = response.data.filter((n) => !n.readStatus).length;
      set({ unreadCount });
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());
    } catch (error) {
      console.error("읽지 않은 알림 개수 조회 중 오류 발생:", error);
    }
  },
}));
