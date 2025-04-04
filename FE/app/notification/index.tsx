import React, { useEffect } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  Wallet,
  Trophy,
  AlertCircle,
  CreditCard,
  Check,
  X,
  AlertTriangle,
} from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationApi } from "@/apis/notificationApi";
import { useNotificationStore } from "@/stores/useNotificationStore";

export default function NotificationsPage() {
  const { notifications, isLoading, error, refetch } = useNotifications();
  const { setUnreadCount } = useNotificationStore();

  // 알림 목록이 변경될 때마다 읽지 않은 알림 개수 업데이트
  useEffect(() => {
    if (!isLoading && !error) {
      const unreadCount = notifications.filter((n) => !n.readStatus).length;
      setUnreadCount(unreadCount);
    }
  }, [notifications, isLoading, error]);

  // 알람 아이콘 렌더링
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return (
          <View className="w-8 h-8 rounded-full bg-[#49DB8A]/20 items-center justify-center">
            <Wallet color="#49DB8A" size={16} />
          </View>
        );
      case "QUEST_REGISTERED":
      case "QUEST_COMPLETION_REQUEST":
        return (
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
            <Trophy color="#3B82F6" size={16} />
          </View>
        );
      case "QUEST_APPROVED":
        return (
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
            <Check color="#22C55E" size={16} />
          </View>
        );
      case "QUEST_APPROVAL_REJECTED":
        return (
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
            <X color="#EF4444" size={16} />
          </View>
        );
      case "LOAN_APPLICATION":
      case "LOAN_REPAYMENT_COMPLETED":
        return (
          <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center">
            <CreditCard color="#F59E0B" size={16} />
          </View>
        );
      case "ABNORMAL_TRANSACTION":
        return (
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
            <AlertTriangle color="#EF4444" size={16} />
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
  const handleNotificationClick = async (notification: any) => {
    try {
      // 읽지 않은 알림인 경우에만 읽음 처리
      if (!notification.readStatus) {
        console.log("📖 알림 읽음 처리 시작:", notification.notificationId);
        await notificationApi.markAsRead(notification.notificationId);
        console.log("✅ 알림 읽음 처리 완료:", notification.notificationId);
        // 알림 목록 새로고침
        refetch();
      }

      // 알림 타입에 따른 페이지 이동
      switch (notification.notificationTypeCode) {
        case "TRANSFER_RECEIVED":
          // 송금 내역 페이지로 이동
          router.push("/transaction" as any);
          break;

        case "QUEST_REGISTERED":
          // 퀘스트 목록 페이지로 이동 (아이)
          router.push("/quest/child/list" as any);
          break;

        case "QUEST_COMPLETION_REQUEST":
          // 퀘스트 완료 요청 상세 페이지로 이동 (보호자)
          router.push("/quest/parent/list" as any);
          break;

        case "QUEST_APPROVED":
          // 승인된 퀘스트 상세 페이지로 이동
          router.push("/quest/child/list" as any);
          break;

        case "QUEST_APPROVAL_REJECTED":
          // 거절된 퀘스트 상세 페이지로 이동
          router.push("/quest/child/list" as any);
          break;

        case "LOAN_APPLICATION":
          // 대출 신청 상세 페이지로 이동 (보호자)
          router.push("/loan/parent/ReqList" as any);
          break;

        case "LOAN_REPAYMENT_COMPLETED":
          // 대출 상환 완료 상세 페이지로 이동
          router.push("/loan/child/LoanList" as any);
          break;

        case "ABNORMAL_TRANSACTION":
          // 이상 거래 내역 페이지로 이동
          router.push("/transaction" as any);
          break;

        default:
          console.warn(
            "알 수 없는 알림 타입:",
            notification.notificationTypeCode
          );
      }
    } catch (error) {
      console.error("❌ 알림 읽음 처리 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <GlobalText className="text-gray-500">로딩 중...</GlobalText>
      </View>
    );
  }

  if (error || notifications.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mb-3">
          <AlertCircle color="#9CA3AF" size={28} />
        </View>
        <GlobalText className="text-sm text-gray-500">
          알림이 없습니다
        </GlobalText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-3 py-2">
        <View className="space-y-2">
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.notificationId}
              className={`p-4 rounded-lg flex-row items-start gap-3 ${
                notification.readStatus ? "bg-white" : "bg-[#49DB8A]/10"
              }`}
              onPress={() => handleNotificationClick(notification)}
            >
              {renderNotificationIcon(notification.notificationTypeCode)}

              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <GlobalText
                      className="text-sm font-medium text-black"
                      numberOfLines={1}
                    >
                      {notification.notificationTitle}
                    </GlobalText>
                    <GlobalText
                      className="text-xs text-gray-500 mt-2"
                      numberOfLines={2}
                    >
                      {notification.notificationContent}
                    </GlobalText>

                    {notification.notificationAmount !== null && (
                      <GlobalText
                        className={`text-xs font-semibold mt-2 ${
                          notification.notificationTypeCode ===
                          "QUEST_APPROVAL_REJECTED"
                            ? "text-red-500"
                            : "text-[#49DB8A]"
                        }`}
                      >
                        {notification.notificationTypeCode ===
                          "TRANSFER_RECEIVED" ||
                        notification.notificationTypeCode === "QUEST_APPROVED"
                          ? `+${notification.notificationAmount.toLocaleString()}원`
                          : notification.notificationTypeCode ===
                            "QUEST_APPROVAL_REJECTED"
                          ? `-${notification.notificationAmount.toLocaleString()}원`
                          : `${notification.notificationAmount.toLocaleString()}원`}
                      </GlobalText>
                    )}
                  </View>

                  <View className="items-end ml-1">
                    <GlobalText className="text-[10px] text-gray-400">
                      {new Date(notification.createdAt)
                        .toLocaleDateString()
                        .slice(5)}
                    </GlobalText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
