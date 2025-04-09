import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import QuestDetailCard from "../QuestDetailCard";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import {
  approvalQuest,
  getQuestDetail,
  redoQuest,
  QuestDetailResponse,
} from "@/apis/questApi";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { PinInput } from "@/components/PinInput";
import { Modal, View } from "react-native";
import PopupModal from "@/components/PopupModal";
import { useQuestApprovalStore } from "@/stores/useQuestStore";
import GlobalText from "@/components/GlobalText";

export default function QuestDetailPage() {
  const params = useLocalSearchParams();
  const questId = Number(params.questId as string);
  console.log("퀘스트 상세 페이지 진입", questId);
  const router = useRouter();
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isRedoModalVisible, setIsRedoModalVisible] = useState(false);

  // 퀘스트 상세 정보 조회
  const {
    data: quest,
    isLoading,
    error,
  } = useCustomQuery<QuestDetailResponse, Error>({
    queryKey: ["parent-quest", questId],
    queryFn: async () => {
      return await getQuestDetail(questId, true); // isParent=true로 설정
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    onErrorAction: (error) => {
      console.error("퀘스트 상세 조회 실패:", error);
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const handleApproveQuest = async (password: string) => {
    try {
      if (!questId) {
        console.error("유효하지 않은 questId");
        return;
      }
      console.log("퀘스트 완료:", questId);
      const res = await approvalQuest(Number(questId), password);
      setIsPinModalVisible(false);

      useQuestApprovalStore.getState().setQuestTitle(res.questTitle);
      useQuestApprovalStore.getState().setChildName(res.childName);
      useQuestApprovalStore.getState().setAmount(res.amount);
      useQuestApprovalStore.getState().setApprovalDate(res.approvalDate);
      router.replace("/quest/parent/Approval");
    } catch (error) {
      console.error("퀘스트 승인 중 오류 발생:", error);

      setIsPinModalVisible(false);
    }
  };

  const handleRedoQuest = async () => {
    try {
      console.log("퀘스트 다시 하기:", questId);
      await redoQuest(Number(questId));
      setIsRedoModalVisible(false);

      // 약간의 지연 후 네비게이션 수행
      setTimeout(() => {
        router.replace("/quest/parent");
      }, 100);
    } catch (error) {
      console.error("퀘스트 다시 하기 실패:", error);
      setIsRedoModalVisible(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <GlobalText className="text-gray-500">로딩 중...</GlobalText>
        </View>
      ) : !quest ? (
        <View className="flex-1 items-center justify-center">
          <GlobalText className="text-gray-500">
            퀘스트를 찾을 수 없습니다.
          </GlobalText>
        </View>
      ) : (
        <>
          <QuestDetailCard
            title={quest.questTitle}
            category={quest.questCategory}
            dueDate={quest.endDate}
            icon={getQuestIcon(quest.questTitle)}
            details={[
              { label: "아이 이름", value: quest.childName || "" },
              { label: "마감일", value: formatDate(quest.endDate) },
              {
                label: "보상 금액",
                value: quest.questReward.toLocaleString() + "원",
              },
              { label: "전달 메시지", value: quest.questMessage || "" },
            ]}
            imageUri={quest.questImgUrl}
            extraNote={
              !(quest.questStatus === "WAITING_REWARD")
                ? "아이가 아직 퀘스트를 수행 중이에요.\n완료되면 알림을 보내드릴게요."
                : undefined
            }
            buttons={
              quest.questStatus === "WAITING_REWARD"
                ? [
                    {
                      text: "다시 하기",
                      onPress: () => setIsRedoModalVisible(true),
                    },
                    {
                      text: "퀘스트 완료 승인하기",
                      onPress: () => setIsPinModalVisible(true),
                    },
                  ]
                : undefined
            }
          />
          <Modal
            visible={isPinModalVisible}
            transparent={true}
            animationType="slide"
          >
            <PinInput
              title="비밀번호 입력"
              subtitle="퀘스트 승인을 위해 비밀번호를 입력해주세요"
              onPasswordComplete={handleApproveQuest}
              onBackPress={() => setIsPinModalVisible(false)}
            />
          </Modal>
          <PopupModal
            visible={isRedoModalVisible}
            onClose={() => setIsRedoModalVisible(false)}
            onConfirm={handleRedoQuest}
            title="퀘스트 다시 하기"
            content="정말로 다시 하기를 보내시겠습니까?"
            confirmText="다시 하기"
            cancelText="취소"
            confirmColor="#4FC985"
          />
        </>
      )}
    </View>
  );
}
