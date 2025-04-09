import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useQuestApprovalStore } from "@/stores/useQuestStore";
import { View, Image } from "react-native";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { useEffect } from "react";

export default function ReqComplete() {
  const { questTitle, childName, approvalDate, amount } =
    useQuestApprovalStore();

  // 데이터가 없는 경우 퀘스트 목록 페이지로 리다이렉트
  useEffect(() => {
    if (!questTitle || !childName || !approvalDate || amount === 0) {
      router.replace("/quest/parent");
    }
  }, [questTitle, childName, approvalDate, amount]);

  const handleConfirm = () => {
    router.replace("/quest/parent");
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Complete
      onConfirm={handleConfirm}
      title="퀘스트 완료가 승인되었습니다"
      description={`${childName}님에게 보상을 지급해드릴게요.`}
      details={[
        {
          icon: getQuestIcon(questTitle),
          label: questTitle,
          value: amount.toLocaleString() + "원",
        },
        {
          label: "승인일",
          value: formatDate(approvalDate),
        },
        {
          label: "신용 점수 증가",
          value: "+2점",
          valueColor: "#4FC985",
          extraDescription: "퀘스트 완료로 신용 점수가 2점 증가합니다!",
        },
      ]}
    />
  );
}
