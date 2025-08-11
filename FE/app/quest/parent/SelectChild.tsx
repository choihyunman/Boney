import { useState } from "react";
import { View, TouchableOpacity, ScrollView, Image } from "react-native";
import { ChevronRight, User } from "lucide-react-native";
import { router } from "expo-router";
import GlobalText from "@/components/GlobalText";
import { getChildren } from "@/apis/childApi";
import { getChildProfileImage } from "@/utils/getChildProfileImage";
import { useQuestCreateStore } from "@/stores/useQuestStore";
import { useCustomQuery } from "@/hooks/useCustomQuery";

export default function SelectChildPage() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const { setParentChildId } = useQuestCreateStore();

  const { data, isLoading, isError } = useCustomQuery({
    queryKey: ["questChildren"],
    queryFn: () => getChildren(),
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 3,
  });

  const children = data?.data.children;

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F5F6F8] items-center justify-center">
        <GlobalText>로딩 중...</GlobalText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      <ScrollView className="flex-1 px-6 mt-8">
        <View className="bg-white rounded-xl p-5">
          <GlobalText weight="bold" className="text-lg text-gray-800 mb-2">
            아이 선택
          </GlobalText>
          <GlobalText className="text-sm text-gray-600 mb-6">
            누구에게 퀘스트를 줄까요?
          </GlobalText>

          {/* 아이 목록 */}
          <View className="space-y-4">
            {isError || !children || children.length === 0 ? (
              <View className="items-center justify-center py-12">
                <User size={48} color="#D1D5DB" className="mb-4" />
                <GlobalText className="text-gray-500">
                  등록된 아이가 없습니다
                </GlobalText>
              </View>
            ) : (
              children.map((child: any) => (
                <View key={child.childId} className="mb-2">
                  <TouchableOpacity
                    className={`flex-row items-center p-4 bg-[#F9FAFB] rounded-xl border ${
                      selectedChild === child.childName
                        ? "border-[#4FC985]"
                        : "border-gray-100"
                    }`}
                    onPress={() => {
                      setSelectedChild(child.childName);
                      setParentChildId(child.parentChildId);
                      router.push("/quest/parent/SelectQuest");
                    }}
                  >
                    <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
                      <Image
                        source={getChildProfileImage(child.childGender)}
                        alt={`${child.childName}의 프로필`}
                        className="w-10 h-10 rounded-full"
                      />
                    </View>
                    <View className="flex-1">
                      <GlobalText className="text-base text-gray-800">
                        {child.childName}
                      </GlobalText>
                    </View>
                    <ChevronRight size={20} color="#4FC985" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
