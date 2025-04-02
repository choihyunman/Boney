import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Clock, Plus } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { getQuestListParent, ParentQuestList } from "@/apis/questApi";
import { getquestIcon } from "@/utils/questUtils";

export default function QuestListPage() {
  const { data, isLoading } = useCustomQuery({
    queryKey: ["quests"],
    queryFn: getQuestListParent,
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000,
  });

  const questList = data?.quests || [];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const sortedQuests = React.useMemo(() => {
    if (!Array.isArray(questList)) return [];

    return [...questList].sort((a, b) => {
      if (
        a.questStatus === "WAITING_REWARD" &&
        b.questStatus !== "WAITING_REWARD"
      )
        return -1;
      if (
        a.questStatus !== "WAITING_REWARD" &&
        b.questStatus === "WAITING_REWARD"
      )
        return 1;

      if (
        a.questStatus === "WAITING_REWARD" &&
        b.questStatus === "WAITING_REWARD"
      ) {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }

      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
  }, [questList]);

  const activeQuestsCount = Array.isArray(questList) ? questList.length : 0;
  const pendingRewardCount = Array.isArray(questList)
    ? questList.filter((q) => q.questStatus === "WAITING_REWARD").length
    : 0;

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1 px-6 mt-6 pb-20">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <GlobalText weight="bold" className="text-xl text-gray-800">
              진행 중인 퀘스트
            </GlobalText>
            <View className="ml-3 bg-[#4FC985] px-3 py-1 rounded-lg">
              <GlobalText weight="bold" className="text-white">
                {activeQuestsCount}건
              </GlobalText>
            </View>
          </View>
          <TouchableOpacity className="bg-[#4FC985] px-3 py-1 rounded-lg flex-row items-center">
            <Plus size={16} color="white" className="mr-1" />
            <GlobalText className="text-white text-sm font-medium">
              만들기
            </GlobalText>
          </TouchableOpacity>
        </View>

        {/* 목록 */}
        <View className="bg-white rounded-xl shadow-sm p-5">
          <View className="flex-row justify-between items-center mb-4">
            <GlobalText weight="bold" className="text-lg text-gray-800">
              퀘스트 목록
            </GlobalText>
            {pendingRewardCount > 0 && (
              <View className="bg-[#FFE2EC] px-3 py-1 rounded-lg">
                <GlobalText className="text-[#D6456B] text-sm">
                  보상 대기 {pendingRewardCount}건
                </GlobalText>
              </View>
            )}
          </View>

          <View className="space-y-4">
            {isLoading ? (
              <GlobalText className="text-center text-gray-400">
                로딩 중...
              </GlobalText>
            ) : sortedQuests.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Clock size={48} color="#D1D5DB" className="mb-4" />
                <GlobalText className="text-gray-500">
                  진행 중인 퀘스트가 없습니다.
                </GlobalText>
              </View>
            ) : (
              sortedQuests.map((quest) => {
                const { Icon, backgroundColor, iconColor } = getquestIcon(
                  quest.questCategory
                );

                const IconComponent = Icon as React.FC<{
                  size?: number;
                  color?: string;
                }>;

                return (
                  <TouchableOpacity key={quest.questId}>
                    <View
                      className={`${
                        quest.questStatus === "WAITING_REWARD"
                          ? "bg-[#FFF8FA] border-2 border-[#FFE2EC] shadow-md"
                          : "bg-[#F9FAFB]"
                      } rounded-xl p-4 mb-4`}
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View>
                          {quest.questStatus === "WAITING_REWARD" ? (
                            <View className="bg-[#FFE2EC] px-3 py-1 rounded-full">
                              <GlobalText className="text-[#D6456B] text-xs">
                                보상 대기 중
                              </GlobalText>
                            </View>
                          ) : (
                            <GlobalText className="text-xs text-gray-500">
                              마감일: {formatDate(quest.endDate)}
                            </GlobalText>
                          )}
                        </View>
                        {quest.questStatus !== "WAITING_REWARD" && (
                          <View
                            className={`px-2 py-1 rounded-full ${
                              calculateDday(quest.endDate).includes("+")
                                ? "bg-red-100"
                                : calculateDday(quest.endDate) === "D-Day"
                                ? "bg-yellow-100"
                                : "bg-[#e6f7ef]"
                            }`}
                          >
                            <GlobalText
                              className={`text-xs font-medium ${
                                calculateDday(quest.endDate).includes("+")
                                  ? "text-red-600"
                                  : calculateDday(quest.endDate) === "D-Day"
                                  ? "text-yellow-600"
                                  : "text-[#4FC985]"
                              }`}
                            >
                              {calculateDday(quest.endDate)}
                            </GlobalText>
                          </View>
                        )}
                      </View>

                      <GlobalText className="text-xs text-gray-500">
                        {(quest as ParentQuestList).childName}의 퀘스트
                      </GlobalText>

                      {/* 본문 줄 */}
                      <View className="flex-row items-center mt-1">
                        <View className="w-10 items-center justify-center mr-3">
                          <View
                            style={{
                              backgroundColor: backgroundColor
                                .replace("bg-[", "")
                                .replace("]", ""),
                              borderRadius: 9999,
                              height: 32,
                              width: 32,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconComponent size={20} color={iconColor} />
                          </View>
                        </View>

                        <View className="flex-1">
                          <GlobalText
                            weight="bold"
                            className="text-base text-gray-800"
                          >
                            {quest.questTitle}
                          </GlobalText>
                          <GlobalText className="text-xs text-gray-500">
                            {quest.questCategory}
                          </GlobalText>
                        </View>

                        <View className="items-end ml-2">
                          <GlobalText
                            weight="bold"
                            className={`text-base ${
                              quest.questStatus === "WAITING_REWARD"
                                ? "text-[#D6456B]"
                                : "text-[#4FC985]"
                            }`}
                          >
                            {quest.questReward.toLocaleString()}원
                          </GlobalText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
