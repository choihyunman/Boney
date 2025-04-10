import React, { useCallback } from "react";
import { View, ScrollView, TouchableOpacity, BackHandler } from "react-native";
import { Clock } from "lucide-react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import GlobalText from "../../../components/GlobalText";
import { getQuestListChild } from "@/apis/questApi";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { getQuestIcon } from "@/utils/getQuestIcon";
export default function ChildQuestListPage() {
  const params = useLocalSearchParams();
  const fromComplete = params.fromComplete;

  const { data, isLoading, isError } = useCustomQuery({
    queryKey: ["quests"],
    queryFn: getQuestListChild,
    staleTime: 1000 * 60 * 3,
    refetchInterval: 2000,
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (fromComplete) {
          router.replace("/home");
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [fromComplete])
  );
  const questList = data?.quests || [];

  // D-day 계산 함수
  const calculateDday = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `D+${Math.abs(diffDays)}`;
    } else if (diffDays === 0) {
      return "D-Day";
    } else {
      return `D-${diffDays}`;
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일까지`;
  };

  // 퀘스트 정렬: 완료된 퀘스트(보상 대기 중)가 상단에 위치하도록 정렬
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

  // 진행 중인 퀘스트 수 계산
  const activeQuestsCount = Array.isArray(questList) ? questList.length : 0;
  const pendingRewardCount = Array.isArray(questList)
    ? questList.filter((q) => q.questStatus === "WAITING_REWARD").length
    : 0;

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 pb-20">
        {/* 퀘스트 요약 */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <GlobalText weight="bold" className="text-2xl text-gray-800">
              진행 중인 퀘스트
            </GlobalText>
            <View className="ml-3 bg-[#4FC985] px-3 py-1 rounded-lg">
              <GlobalText weight="bold" className="text-white">
                {activeQuestsCount}건
              </GlobalText>
            </View>
          </View>
        </View>

        {/* 퀘스트 목록 */}
        <View className="bg-white rounded-xl p-5">
          <View className="flex-row justify-between items-center mb-4">
            <GlobalText weight="bold" className="text-lg text-gray-800 mb-4">
              퀘스트 목록
            </GlobalText>
            {pendingRewardCount > 0 && (
              <View className="bg-[#FFE2EC] px-3 py-1 rounded-lg">
                <GlobalText weight="bold" className="text-[#D6456B] text-sm">
                  보상 대기 {pendingRewardCount}건
                </GlobalText>
              </View>
            )}
          </View>

          <View className="space-y-4">
            {isLoading ? (
              <View className="items-center justify-center py-12">
                <GlobalText className="text-gray-500">로딩 중...</GlobalText>
              </View>
            ) : isError ? (
              <View className="items-center justify-center py-12">
                <GlobalText className="text-gray-500">
                  퀘스트를 불러오는 중 오류가 발생했습니다.
                </GlobalText>
              </View>
            ) : questList.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Clock size={48} color="#D1D5DB" className="mb-4" />
                <GlobalText className="text-gray-500">
                  진행 중인 퀘스트가 없습니다.
                </GlobalText>
              </View>
            ) : (
              sortedQuests.map((quest) => (
                <TouchableOpacity
                  key={quest.questId}
                  onPress={() => {
                    router.push({
                      pathname: "/quest/child/[questId]" as any,
                      params: { questId: quest.questId.toString() },
                    });
                  }}
                >
                  <View
                    className={`${
                      quest.questStatus === "WAITING_REWARD"
                        ? "bg-[#FFF8FA] border-2 border-[#FFE2EC]"
                        : "bg-[#F9FAFB]"
                    } rounded-xl p-4 mb-4`}
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        {quest.questStatus === "WAITING_REWARD" ? (
                          <View className="bg-[#FFE2EC] px-3 py-1 rounded-full">
                            <GlobalText
                              weight="bold"
                              className="text-[#D6456B] text-xs"
                            >
                              보상 대기 중
                            </GlobalText>
                          </View>
                        ) : (
                          <GlobalText className="text-xs text-gray-800">
                            {formatDate(quest.endDate)}
                          </GlobalText>
                        )}
                      </View>
                      {quest.questStatus !== "WAITING_REWARD" && (
                        <View
                          className={`px-2 py-1 rounded-full ${
                            calculateDday(quest.endDate).includes("+")
                              ? "bg-red-100"
                              : "bg-[#e6f7ef]"
                          }`}
                        >
                          <GlobalText
                            weight="bold"
                            className={`text-xs ${
                              calculateDday(quest.endDate).includes("+")
                                ? "text-red-600"
                                : "text-[#4FC985]"
                            }`}
                          >
                            {calculateDday(quest.endDate)}
                          </GlobalText>
                        </View>
                      )}
                    </View>

                    <View className="items-center">
                      <View className="h-16 w-16 rounded-full bg-[#e6f7ef] items-center justify-center mb-3">
                        {(() => {
                          const IconElement = getQuestIcon(quest.questTitle);
                          return (
                            <View
                              className={`h-12 w-12 rounded-full items-center justify-center`}
                            >
                              {IconElement}
                            </View>
                          );
                        })()}
                      </View>
                      <View className="items-center mb-3">
                        <GlobalText
                          weight="bold"
                          className="text-base text-gray-800"
                        >
                          {quest.questTitle}
                        </GlobalText>
                        <GlobalText className="text-xs text-gray-800">
                          {quest.questCategory}
                        </GlobalText>
                      </View>
                      <View className="w-full items-center">
                        <GlobalText
                          weight="bold"
                          className={`text-lg  ${
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
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
