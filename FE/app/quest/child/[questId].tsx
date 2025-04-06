import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import QuestDetailCard from "../QuestDetailCard";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { completeQuest, getQuestDetail } from "@/apis/questApi";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { useQuestCompleteStore } from "@/stores/useQuestStore";
import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";
import PopupModal from "@/components/PopupModal";
import { SelectedImage } from "@/apis/questApi";

export default function QuestDetailPage() {
  const params = useLocalSearchParams();
  const questId = params.questId as string;
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null
  );

  const { data, isLoading } = useCustomQuery({
    queryKey: ["quest", questId],
    queryFn: () => getQuestDetail(Number(questId), false),
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 3,
  });

  const quest = data;
  console.log("quest", quest);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const now = new Date();
  const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

  const fileName = `quest_${questId}_${formattedDate}.jpg`;

  const handleImageSelect = async () => {
    // 카메라 권한 확인
    // 권한이 없으면 권한 요청 -> 거부 시 다시 요청 가능
    // 거부 + 다시 묻지 않기 클릭 시 설정으로 보내야 함
    // 권한이 있으면 카메라 실행
    const { status } = await ImagePicker.getCameraPermissionsAsync();

    if (status !== "granted") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== "granted") {
        setModalVisible(true);
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage({
        uri: imageUri,
        name: fileName,
        type: "image/jpeg",
      });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleCompleteQuest = async () => {
    console.log("퀘스트 완료:", questId);
    const res = await completeQuest(Number(questId), selectedImage);
    console.log("퀘스트 완료 결과:", res);
    useQuestCompleteStore.getState().setCategoryName(res.categoryName);
    useQuestCompleteStore.getState().setCategoryTitle(res.categoryTitle);
    useQuestCompleteStore.getState().setAmount(res.amount);
    useQuestCompleteStore.getState().setFinishDate(res.finishDate);
    router.replace("/quest/child/Complete");
  };

  return (
    <>
      {quest && (
        <QuestDetailCard
          title={quest.questTitle}
          category={quest.questCategory}
          dueDate={quest.endDate}
          icon={getQuestIcon(quest.questTitle)}
          details={[
            { label: "마감일", value: formatDate(quest.endDate) },
            {
              label: "보상 금액",
              value: quest.questReward.toLocaleString() + "원",
            },
            { label: "전달 메시지", value: quest.questMessage },
          ]}
          extraNote={
            quest.questStatus === "WAITING_REWARD"
              ? "보호자가 퀘스트 완료 신청을 검토 중이에요.\n승인되면 알림을 보내드릴게요."
              : undefined
          }
          buttons={
            !(quest.questStatus === "WAITING_REWARD")
              ? [{ text: "퀘스트 완료하기", onPress: handleCompleteQuest }]
              : undefined
          }
          editableImage={quest.questStatus === "IN_PROGRESS"}
          imageUri={
            selectedImage?.uri ? selectedImage.uri : quest.questImgUrl ?? null
          }
          onImageSelect={handleImageSelect}
          onRemoveImage={handleRemoveImage}
        />
      )}
      <PopupModal
        visible={modalVisible}
        title="카메라 권한이 필요합니다"
        content="설정 화면으로 이동하시겠습니까?"
        confirmText="설정으로 이동"
        cancelText="취소"
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false);
          Linking.openSettings();
        }}
      />
    </>
  );
}
