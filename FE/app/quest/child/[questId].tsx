import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Home,
  BookOpen,
  Users,
  Heart,
  Camera,
  X,
  View,
} from "lucide-react-native";
import QuestDetailCard from "../QuestDetailCard";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { completeQuest, getQuestDetail } from "@/apis/questApi";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { useQuestCompleteStore } from "@/stores/useQuestStore";

export default function QuestDetailPage() {
  const params = useLocalSearchParams();
  const questId = params.questId as string;
  console.log("questId", questId);
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const calculateDday = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };

  const handleImageSelect = async () => {
    // Expo ImagePicker 등으로 이미지 선택 구현 예정
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleCameraClick = () => {
    handleImageSelect();
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
              ? "보호자가 퀘스트 완료 신청을 검토 중이에요.{\n}승인되면 알림을 보내드릴게요."
              : undefined
          }
          buttons={
            !(quest.questStatus === "WAITING_REWARD")
              ? [{ text: "퀘스트 완료하기", onPress: handleCompleteQuest }]
              : undefined
          }
        />
      )}
    </>
  );
}
