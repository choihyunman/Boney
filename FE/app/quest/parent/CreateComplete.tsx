import Complete from "@/components/Complete";
import { router, useFocusEffect } from "expo-router";
import { useQuestCreateResponseStore } from "@/stores/useQuestStore";
import GlobalText from "@/components/GlobalText";
import { BackHandler, View } from "react-native";
import { getQuestIcon } from "@/utils/getQuestIcon";
import { useCallback } from "react";
export default function CreateComplete() {
  const { childName, questTitle, questReward, endDate, questMessage } =
    useQuestCreateResponseStore();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // 뒤로가기 막기
        return true;
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  return (
    <Complete
      onConfirm={() => {
        router.replace({
          pathname: "/quest/parent",
          params: { fromComplete: "true" },
        });
      }}
      title="퀘스트가 등록되었습니다"
      description={`${childName}님에게 퀘스트를 전달했어요`}
      details={[
        {
          label: "퀘스트",
          value: (
            <View className="flex-1 flex-row items-center gap-2">
              <View className="h-8 w-8 rounded-full bg-[#e6f7ef] items-center justify-center">
                {getQuestIcon(questTitle)}
              </View>
              <GlobalText weight="bold" className="text-lg">
                {questTitle}
              </GlobalText>
            </View>
          ),
        },
        {
          label: "보상 금액",
          value: questReward.toLocaleString() + "원",
        },
        {
          label: "종료일",
          value: endDate,
        },
        {
          label: "전달 메시지",
          value: questMessage,
        },
      ]}
    />
  );
}
