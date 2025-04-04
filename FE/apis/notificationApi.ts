import { api } from "@/lib/api";

export interface NotificationResponse {
  status: number;
  message: string;
  data: NotificationData[];
}

export interface NotificationData {
  notificationId: number;
  userId: number;
  notificationTypeCode: string;
  notificationTitle: string;
  notificationContent: string;
  notificationAmount: number | null;
  readStatus: boolean;
  createdAt: string;
  referenceId: number;
}

export const notificationApi = {
  getNotifications: async (): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>("/notifications");
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/read-all");
  },
};
