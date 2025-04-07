import { View, TouchableOpacity } from "react-native";
import { ArrowRight, Trophy } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useHomeStore } from "@/stores/useHomeStore";
import { useAuthStore } from "@/stores/useAuthStore";

export default function MissionSection() {
  const user = useAuthStore((state) => state.user);
  const { childData, parentData } = useHomeStore();

  const quests = user?.role === "CHILD" ? childData?.quests : parentData?.quest;
  const inProgressQuest = quests?.find(
    (quest) => quest.quest_status === "IN_PROGRESS"
  );

  return (
    <View className="mt-4 bg-white rounded-xl p-4">
      <View className="flex-row justify-between items-center mb-4">
        {/* 퀘스트 상태에 따라 타이틀 변경 */}
        <GlobalText className="font-bold text-lg">진행 중인 퀘스트</GlobalText>
        <TouchableOpacity className="flex-row items-center">
          <GlobalText className="text-sm text-gray-400 font-medium">
            더보기
          </GlobalText>
          <ArrowRight size={18} color="#9CA3AF" className="ml-1" />
        </TouchableOpacity>
      </View>

      <View className="bg-[#F9FAFB] p-4 rounded-lg">
        {inProgressQuest ? (
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-[#4FC985] items-center justify-center">
              <Trophy size={24} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between">
                <GlobalText className="font-medium text-base">
                  {inProgressQuest.quest_category}
                </GlobalText>
                <GlobalText className="text-sm bg-[#4FC985]/10 text-[#4FC985] font-bold px-3 py-1 rounded-full">
                  D-
                  {new Date(inProgressQuest.end_date).getDate() -
                    new Date().getDate()}
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
              진행중인 퀘스트가 없습니다
            </GlobalText>
          </View>
        )}
      </View>
    </View>
  );
}
