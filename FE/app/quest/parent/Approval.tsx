import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useQuestApprovalStore } from "@/stores/useQuestStore";
import { View, Image } from "react-native";
import { getQuestIcon } from "@/utils/getQuestIcon";

export default function ReqComplete() {
  const { questTitle, childName, approvalDate, amount } =
    useQuestApprovalStore();

  const handleConfirm = () => {
    router.replace("/quest/parent/List");
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
