import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import QuestDetailCard from "../QuestDetailCard";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { approvalQuest, getQuestDetail, redoQuest } from "@/apis/questApi";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { PinInput } from "@/components/PinInput";
import { Modal } from "react-native";
import PopupModal from "@/components/PopupModal";

export default function QuestDetailPage() {
  const params = useLocalSearchParams();
  const questId = params.questId as string;
  console.log("퀘스트 상세 페이지 진입", questId);
  const router = useRouter();
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isRedoModalVisible, setIsRedoModalVisible] = useState(false);

  const { data, isLoading } = useCustomQuery({
    queryKey: ["quest", questId],
    queryFn: () => getQuestDetail(Number(questId), true),
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 3,
  });

  const quest = data;
  console.log(quest);

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
      await approvalQuest(Number(questId), password);
      setIsPinModalVisible(false);
      router.replace("/quest/parent/Approval");
    } catch (error) {
      console.error("퀘스트 승인 중 오류 발생:", error);
      // 여기에 에러 처리 로직 추가 가능
    }
  };

  const handleRedoQuest = async () => {
    console.log("퀘스트 다시 하기:", questId);
    await redoQuest(Number(questId));
    setIsRedoModalVisible(false);
    router.back();
  };

  return (
    <>
      {quest && (
        <>
          <QuestDetailCard
            title={quest.questTitle}
            category={quest.questCategory}
            dueDate={quest.endDate}
            icon={getQuestIcon(quest.questTitle)}
            details={[
              { label: "아이 이름", value: quest.childName },
              { label: "마감일", value: formatDate(quest.endDate) },
              {
                label: "보상 금액",
                value: quest.questReward.toLocaleString() + "원",
              },
              { label: "전달 메시지", value: quest.questMessage },
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
            content="정말로 다시 하기를 보내시겠습니까까?"
            confirmText="다시 하기"
            cancelText="취소"
            confirmColor="#4FC985"
          />
        </>
      )}
    </>
  );
}
