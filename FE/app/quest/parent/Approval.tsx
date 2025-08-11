import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useQuestApprovalStore } from "@/stores/useQuestStore";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { useEffect } from "react";
import { BackHandler, View } from "react-native";
import GlobalText from "@/components/GlobalText";

export default function ReqComplete() {
  const { questTitle, childName, approvalDate, amount, reset } =
    useQuestApprovalStore();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  if (!questTitle || !childName || !approvalDate || !amount) {
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
      pathname: "/quest/parent",
      params: { fromApproval: "true" },
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
