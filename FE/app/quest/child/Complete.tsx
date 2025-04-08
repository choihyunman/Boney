import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useQuestCompleteStore } from "@/stores/useQuestStore";
import { View, Image } from "react-native";
import { getQuestIcon } from "@/utils/getQuestIcon";

export default function ReqComplete() {
  const { categoryName, categoryTitle, amount, finishDate } =
    useQuestCompleteStore();

  const handleConfirm = () => {
    router.replace("/quest/child");
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
      title="퀘스트 완료가 신청되었습니다."
      details={[
        {
          icon: getQuestIcon(categoryTitle),
          label: categoryTitle,
          value: amount.toLocaleString() + "원",
        },
        {
          label: "완료일",
          value: formatDate(finishDate),
        },
      ]}
    />
  );
}
