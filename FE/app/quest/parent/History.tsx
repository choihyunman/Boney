import { View, ScrollView } from "react-native";
import GlobalText from "@/components/GlobalText";
import HistoryItem from "@/components/HistoryItem";
import { useQuery } from "@tanstack/react-query";
import { getQuestHistory } from "@/apis/questApi";

export default function ParentQuestHistoryPage() {
  const { data: questHistory } = useQuery({
    queryKey: ["questHistory"],
    queryFn: getQuestHistory,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 1,
  });

  const pastQuests = Array.isArray(questHistory) ? questHistory : [];
  console.log(pastQuests);

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return "미완료";

    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 퀘스트 정렬: 최근 완료된 퀘스트가 상단에 위치하도록 정렬
  const sortedQuests = [...pastQuests].sort((a, b) => {
    return new Date(b.finishDate).getTime() - new Date(a.finishDate).getTime();
  });

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      <ScrollView className="flex-1">
        <View className="bg-white mt-1">
          {sortedQuests.map((quest) => (
            <HistoryItem
              key={quest.questId}
              title={quest.questTitle}
              subtitle={quest.childName}
              titleSize="text-base"
              subtitleSize="text-sm"
              value={`${quest.questReward.toLocaleString()}원`}
              valueColor={
                quest.questStatus === "SUCCESS"
                  ? "text-[#4FC985]"
                  : "text-gray-400"
              }
              subValue={
                quest.questStatus === "SUCCESS"
                  ? formatDate(quest.finishDate)
                  : "미완료"
              }
            />
          ))}

          {pastQuests.length === 0 && (
            <View className="items-center justify-center py-12">
              <GlobalText className="text-gray-500">
                지난 퀘스트가 없습니다.
              </GlobalText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
