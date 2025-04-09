import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useQuestCompleteStore } from "@/stores/useQuestStore";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { useEffect } from "react";
import { BackHandler, View } from "react-native";
import GlobalText from "@/components/GlobalText";

export default function ReqComplete() {
  const { categoryTitle, amount, finishDate, reset } = useQuestCompleteStore();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  if (!categoryTitle || !amount || !finishDate) {
    console.log("🛑 데이터 준비 안됨, 렌더링 보류");
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText className="text-gray-400">로딩 중...</GlobalText>
      </View>
    );
  }

  const handleConfirm = () => {
    reset();
    router.replace({
      pathname: "/quest/child",
      params: { fromComplete: "true" },
    });
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
