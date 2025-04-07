import { useState, useEffect } from "react";
import { notificationApi, NotificationData } from "@/apis/notificationApi";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getNotifications();
      // console.log("✅ 알림 목록 조회 성공:", {
      //   totalCount: response.data.length,
      //   unreadCount: response.data.filter((n) => !n.readStatus).length,
      //   notifications: response.data.map((n) => ({
      //     id: n.notificationId,
      //     type: n.notificationTypeCode,
      //     title: n.notificationTitle,
      //     read: n.readStatus,
      //   })),
      // });

      setNotifications(response.data);
      setError(null);
    } catch (err) {
      // console.error("❌ 알림 목록 조회 실패:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("알림을 불러오는데 실패했습니다.")
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications,
  };
};
