import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import QuestDetailCard from "../QuestDetailCard";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { getQuestDetail, redoQuest } from "@/apis/questApi";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { Modal, View, TouchableOpacity } from "react-native";
import PopupModal from "@/components/PopupModal";
import GlobalText from "@/components/GlobalText";

interface QuestDetailResponse {
  questId: number;
  questTitle: string;
  questStatus: string;
  childName: string;
  amount: number;
}

export default function QuestDetailPage() {
  const params = useLocalSearchParams();
  const questId = params.questId as string;
  console.log("퀘스트 상세 페이지 진입", questId);
  const router = useRouter();
  const [isRedoModalVisible, setIsRedoModalVisible] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [questDetail, setQuestDetail] = useState<QuestDetailResponse | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleApproveQuest = (response: any) => {
    setQuestDetail((prev: QuestDetailResponse | null) =>
      prev
        ? {
            ...prev,
            questStatus: "SUCCESS",
          }
        : null
    );
    setShowSuccessModal(true);
    setSuccessMessage(
      `${response.childName}님이 ${response.questTitle} 퀘스트를 완료했습니다. ${response.amount}원이 지급되었습니다.`
    );
  };

  const handleQuestError = async (error: any, password: string) => {
    console.error("퀘스트 승인 실패:", error);
    if (error.response) {
      const errorData = error.response.data;
      if (error.response.status === 400) {
        setShowErrorModal(true);
        setErrorMessage("잔액이 부족합니다.");
      } else {
        setShowErrorModal(true);
        setErrorMessage(
          errorData.error?.message || "퀘스트 승인 중 오류가 발생했습니다."
        );
      }
    } else {
      setShowErrorModal(true);
      setErrorMessage("서버와의 통신 중 오류가 발생했습니다.");
    }
  };

  // 모달 확인 버튼 처리
  const handleModalConfirm = () => {
    setShowErrorModal(false);
  };

  const handleRedoQuest = async () => {
    console.log("퀘스트 다시 하기:", questId);
    await redoQuest(Number(questId));
    setIsRedoModalVisible(false);
    router.back();
  };

  const navigateToPinInput = () => {
    router.push({
      pathname: "/quest/parent/QuestPinInput",
      params: { questId: questId },
    });
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
                      text: "승인하기",
                      onPress: navigateToPinInput,
                    },
                  ]
                : undefined
            }
          />

          {/* 오류 모달 */}
          <Modal
            visible={showErrorModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowErrorModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white rounded-xl p-6 w-[80%] max-w-md">
                <GlobalText className="text-lg font-bold text-center mb-4">
                  결제 실패
                </GlobalText>
                <GlobalText className="text-base text-center mb-6">
                  {errorMessage}
                </GlobalText>
                <TouchableOpacity
                  className="bg-[#4FC985] py-3 rounded-lg"
                  onPress={handleModalConfirm}
                >
                  <GlobalText className="text-white text-center font-bold">
                    확인
                  </GlobalText>
                </TouchableOpacity>
              </View>
            </View>
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
