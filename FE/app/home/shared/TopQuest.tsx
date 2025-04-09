import { View, TouchableOpacity } from "react-native";
import { ArrowRight, Trophy } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useHomeStore } from "@/stores/useHomeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Quest } from "@/apis/homeApi";
import { useEffect } from "react";

export default function MissionSection() {
  const user = useAuthStore((state) => state.user);
  const { childData, parentData } = useHomeStore();

  // Get quests based on user role
  const quest = user?.role === "CHILD" ? childData?.quest : parentData?.quest;

  // Log quest data
  useEffect(() => {
    console.log("🔍 TopQuest - User role:", user?.role);
    console.log("🔍 TopQuest - Quest data:", quest);
    console.log(
      "🔍 TopQuest - Quest statuses:",
      quest?.map((q) => q.quest_status)
    );
  }, [user?.role, quest]);

  // Find in-progress or waiting reward quest
  const inProgressQuest = quest?.find(
    (quest: Quest) =>
      quest.quest_status === "IN_PROGRESS" || quest.quest_status === "WAITING_REWARD"
  );

  // Log in-progress quest
  useEffect(() => {
    console.log("🔍 TopQuest - In-progress quest:", inProgressQuest);
  }, [inProgressQuest]);

  // Calculate D-day
  const calculateDday = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(endDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <View className="mt-4 bg-white rounded-xl p-4">
      <View className="flex-row justify-between items-center mb-4">
        {/* 퀘스트 상태에 따라 타이틀 변경 */}
        <GlobalText className="font-bold text-lg">
          {inProgressQuest?.quest_status === "WAITING_REWARD"
            ? "보상 대기중인 퀘스트"
            : "진행 중인 퀘스트"}
        </GlobalText>
        <TouchableOpacity className="flex-row items-center">
          <GlobalText className="text-sm text-gray-400 font-medium">
            더보기
          </GlobalText>
          <ArrowRight size={18} color="#9CA3AF" className="ml-1" />
        </TouchableOpacity>
      </View>

      <View
        className={`p-4 rounded-lg ${
          inProgressQuest?.quest_status === "WAITING_REWARD"
            ? "bg-[#FFF8FA] border-2 border-[#FFE2EC]"
            : "bg-[#F9FAFB]"
        }`}
      >
        {inProgressQuest ? (
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-[#4FC985] items-center justify-center">
              <Trophy size={24} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between">
                <GlobalText className="font-medium text-base">
                  {inProgressQuest.quest_title}
                </GlobalText>
                <GlobalText className="text-sm bg-[#4FC985]/10 text-[#4FC985] font-bold px-3 py-1 rounded-full">
                  D-{calculateDday(inProgressQuest.end_date)}
                </GlobalText>
              </View>
              <GlobalText className="text-[#4FC985] font-bold mt-1 text-base">
                {inProgressQuest.quest_reward.toLocaleString()}원
              </GlobalText>
            </View>
          </View>
        ) : (
          <View className="items-center py-4">
            <Trophy size={24} color="#CBD5E1" />
            <GlobalText className="mt-2 text-gray-500 text-base">
              {user?.role === "PARENT"
                ? "보상 대기중인 퀘스트가 없습니다"
                : "진행중인 퀘스트가 없습니다"}
            </GlobalText>
          </View>
        )}
      </View>
    </View>
  );
}
