import React, { useEffect } from "react";
import { View, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  ChevronLeft,
  Wallet,
  Trophy,
  AlertCircle,
  CreditCard,
  Check,
  X,
  Trash2,
} from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import {
  useNotificationStore,
  Notification,
} from "@/stores/useNotificationStore";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    initializeNotifications,
  } = useNotificationStore();

  // 컴포넌트 마운트 시 알림 데이터 로드
  useEffect(() => {
    // 알림이 없으면 샘플 데이터 초기화 (실제 앱에서는 필요 없음)
    if (notifications.length === 0) {
      initializeNotifications([
        {
          id: "1",
          type: "deposit",
          title: "용돈이 입금되었어요",
          message: "팔랑님이 용돈을 보냈어요.",
          amount: 10000,
          date: "2023-07-15 14:30",
          read: false,
          sender: "팔랑",
        },
        {
          id: "2",
          type: "quest-created",
          title: "새로운 퀘스트가 등록되었어요",
          message: "팔랑님이 새로운 퀘스트를 등록했어요.",
          amount: 5000,
          date: "2023-07-14 10:15",
          read: false,
          link: "/quests",
        },
        {
          id: "3",
          type: "quest-completed",
          title: "퀘스트 성공!",
          message: "심부름 퀘스트를 성공적으로 완료했어요.",
          amount: 3000,
          date: "2023-07-12 18:45",
          read: true,
          link: "/quests",
        },
        {
          id: "4",
          type: "quest-failed",
          title: "퀘스트 실패",
          message: "방 청소 퀘스트 기간이 만료되었어요.",
          amount: 2000,
          date: "2023-07-10 09:20",
          read: true,
          link: "/quests",
        },
        {
          id: "5",
          type: "loan-due",
          title: "대출 상환 기간이 임박했어요",
          message: "3일 후 대출금 상환일이 다가오고 있어요.",
          amount: 5000,
          date: "2023-07-08 16:10",
          read: false,
          link: "/loan",
        },
        {
          id: "6",
          type: "deposit",
          title: "용돈이 입금되었어요",
          message: "팔랑님이 용돈을 보냈어요.",
          amount: 5000,
          date: "2023-07-05 11:30",
          read: true,
          sender: "팔랑",
        },
      ]);
    } else {
      getNotifications();
    }
  }, []);

  // 알람 아이콘 렌더링
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <View className="w-8 h-8 rounded-full bg-[#49DB8A]/20 items-center justify-center">
            <Wallet color="#49DB8A" size={16} />
          </View>
        );
      case "quest-created":
        return (
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
            <Trophy color="#3B82F6" size={16} />
          </View>
        );
      case "quest-completed":
        return (
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
            <Check color="#22C55E" size={16} />
          </View>
        );
      case "quest-failed":
        return (
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
            <X color="#EF4444" size={16} />
          </View>
        );
      case "loan-due":
        return (
          <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center">
            <CreditCard color="#F59E0B" size={16} />
          </View>
        );
      default:
        return (
          <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
            <AlertCircle color="#6B7280" size={16} />
          </View>
        );
    }
  };

  // 알람 클릭 처리
  const handleNotificationClick = (notification: Notification) => {
    // 읽음 처리
    markAsRead(notification.id);

    // 링크가 있으면 해당 페이지로 이동
    if (notification.link) {
      router.push(notification.link as any);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* 알림 목록 */}
      <ScrollView className="flex-1 px-3 py-2">
        {unreadCount > 0 && (
          <View className="mb-2">
            <GlobalText className="text-xs text-gray-500">
              읽지 않은 알림 {unreadCount}개
            </GlobalText>
          </View>
        )}

        {notifications.length > 0 ? (
          <View className="space-y-2">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className={`p-4 rounded-lg flex-row items-start gap-3 ${
                  notification.read ? "bg-white" : "bg-[#49DB8A]/10"
                }`}
                onPress={() => handleNotificationClick(notification)}
              >
                {renderNotificationIcon(notification.type)}

                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <GlobalText
                        className="text-sm font-medium text-black"
                        numberOfLines={1}
                      >
                        {notification.title}
                      </GlobalText>
                      <GlobalText
                        className="text-xs text-gray-500 mt-2"
                        numberOfLines={2}
                      >
                        {notification.message}
                      </GlobalText>

                      {notification.amount && (
                        <GlobalText
                          className={`text-xs font-semibold mt-2 ${
                            notification.type === "quest-failed"
                              ? "text-red-500"
                              : "text-[#49DB8A]"
                          }`}
                        >
                          {notification.type === "deposit" ||
                          notification.type === "quest-completed"
                            ? `+${notification.amount.toLocaleString()}원`
                            : notification.type === "quest-failed"
                            ? `-${notification.amount.toLocaleString()}원`
                            : `${notification.amount.toLocaleString()}원`}
                        </GlobalText>
                      )}
                    </View>

                    <View className="items-end ml-1">
                      <GlobalText className="text-[10px] text-gray-400">
                        {notification.date.split(" ")[0].slice(5)}
                      </GlobalText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-16">
            <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mb-3">
              <AlertCircle color="#9CA3AF" size={28} />
            </View>
            <GlobalText className="text-sm text-gray-500">
              알림이 없습니다
            </GlobalText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
