import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import GlobalText from "@/components/GlobalText";
import { getQuestIcon } from "@/utils/getQuestIcon";
import CustomQuestModal from "./CustomQuestModal";
import { useQuestCreateStore } from "@/stores/quests/useQuestCreateStore";
import { categories } from "@/utils/questCategoryUtils";
import { quests } from "@/utils/quests";

export default function SelectQuestPage() {
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const { setQuestTitle, setQuestCategoryId, setQuestCategoryName } =
    useQuestCreateStore();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // 선택된 카테고리에 해당하는 퀘스트 필터링
  const filteredQuests = quests.filter(
    (quest) => quest.categoryId === selectedCategory
  );

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="flex flex-col px-6 mt-6">
        <View className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <GlobalText weight="bold" className="text-lg text-gray-800 mb-6">
            퀘스트 선택
          </GlobalText>
          <GlobalText className="text-sm text-gray-600 mb-6">
            원하는 퀘스트를 선택하세요
          </GlobalText>

          {/* 카테고리 스크롤 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <View className="flex-row space-x-4 pb-2">
              {categories.map((category) => (
                <View key={category.id} className="mr-2">
                  <TouchableOpacity
                    className={`flex items-center justify-center p-3 ${
                      selectedCategory === category.id
                        ? "bg-[#4FC985]"
                        : "bg-[#F9FAFB]"
                    } rounded-lg h-12 px-4 shadow-sm`}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <GlobalText
                      className={`text-sm font-medium ${
                        selectedCategory === category.id
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {category.name}
                    </GlobalText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 퀘스트 그리드 */}
          <View className="flex-row flex-wrap justify-between">
            {filteredQuests.map((quest) => (
              <TouchableOpacity
                key={quest.id}
                className={`w-[48%] flex flex-col items-center justify-center p-4 bg-[#F9FAFB] rounded-xl mb-4 ${
                  selectedQuest === quest.id
                    ? "border-2 border-[#4FC985]"
                    : "border border-gray-100"
                }`}
                onPress={() => {
                  if (quest.title === "직접 입력") {
                    setIsCustomModalOpen(true);
                  } else {
                    setQuestTitle(quest.title);
                    setQuestCategoryId(quest.categoryId);
                    setQuestCategoryName(
                      categories.find((c) => c.id === quest.categoryId)?.name ||
                        ""
                    );
                    setSelectedQuest(quest.id);
                    router.push("/quest/parent/Detail");
                  }
                }}
              >
                <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mb-2">
                  {getQuestIcon(quest.title)}
                </View>
                <GlobalText className="text-sm font-medium text-center">
                  {quest.title}
                </GlobalText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 다음 버튼 */}
        <TouchableOpacity
          className="mt-6 mb-20"
          onPress={() => router.push("/quest/parent/Detail")}
        >
          <View className="w-full py-4 bg-[#4FC985] rounded-lg shadow-sm">
            <GlobalText className="text-white font-medium text-center">
              다음
            </GlobalText>
          </View>
        </TouchableOpacity>
      </View>

      <CustomQuestModal
        visible={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={(customTitle) => {
          setQuestTitle(customTitle);
          setQuestCategoryId(selectedCategory);
          setQuestCategoryName(
            categories.find((c) => c.id === selectedCategory)?.name || ""
          );
          setIsCustomModalOpen(false);
          router.push("/quest/parent/Detail");
        }}
      />
    </View>
  );
}
