import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Home, BookOpen, Users, Heart, Camera, X } from "lucide-react-native";
import QuestDetailCard from "../QuestDetailCard";

type Quest = {
  id: string;
  title: string;
  category: string;
  categoryIcon: React.ReactNode;
  reward: number;
  dueDate: string;
  isCompleted: boolean;
  completedDate?: string;
  photoUrl?: string;
};

export default function QuestDetailPage() {
  const params = useLocalSearchParams();
  const questId = params.id as string;
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "집안일":
        return <Home size={32} color="#4FC985" />;
      case "학습":
        return <BookOpen size={32} color="#4FC985" />;
      case "우리 가족":
        return <Users size={32} color="#4FC985" />;
      case "생활습관":
        return <Heart size={32} color="#4FC985" />;
      default:
        return <Home size={32} color="#4FC985" />;
    }
  };

  const quest: Quest = {
    id: questId,
    title: "설거지 하기",
    category: "집안일",
    categoryIcon: getCategoryIcon("집안일"),
    reward: 5000,
    dueDate: "2025-03-20",
    isCompleted: false,
  };

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

  const handleCompleteQuest = () => {
    console.log("퀘스트 완료:", questId);
    // router.back();
  };

  return (
    <QuestDetailCard
      title="설거지 하기"
      category="집안일"
      dueDate="2025-04-10"
      icon={<Home size={32} color="#4FC985" />}
      details={[
        { label: "마감일", value: formatDate("2025-04-10") },
        { label: "보상 금액", value: "5,000원", color: "text-[#4FC985]" },
      ]}
      extraNote={
        quest.isCompleted
          ? "보호자가 퀘스트 완료 신청을 검토 중이에요.{\n}승인되면 알림을 보내드릴게요."
          : undefined
      }
      buttons={
        !quest.isCompleted
          ? [{ text: "퀘스트 완료하기", onPress: handleCompleteQuest }]
          : undefined
      }
    ></QuestDetailCard>
  );
}
