import { useState, useEffect, useRef } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  Home,
  Users,
  BookOpen,
  Heart,
  Edit3,
  Settings,
} from "lucide-react-native";
import GlobalText from "@/components/GlobalText";

// 카테고리 타입 정의
type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

// 퀘스트 타입 정의
type Quest = {
  id: string;
  categoryId: string;
  title: string;
  icon: React.ReactNode;
};

export default function SelectQuestPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("housework");
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);

  // 카테고리 목록
  const categories: Category[] = [
    {
      id: "housework",
      name: "집안일",
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: "family",
      name: "우리 가족",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "study",
      name: "학습",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      id: "lifestyle",
      name: "생활습관",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      id: "other",
      name: "기타",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // 퀘스트 목록
  const quests: Quest[] = [
    {
      id: "dishes",
      categoryId: "housework",
      title: "설거지 하기",
      icon: <Home className="h-6 w-6" />,
    },
    {
      id: "errand",
      categoryId: "housework",
      title: "심부름 다녀오기",
      icon: <Home className="h-6 w-6" />,
    },
    {
      id: "laundry",
      categoryId: "housework",
      title: "빨래 개기",
      icon: <Home className="h-6 w-6" />,
    },
    {
      id: "custom",
      categoryId: "housework",
      title: "직접 입력",
      icon: <Edit3 className="h-6 w-6" />,
    },
    {
      id: "family1",
      categoryId: "family",
      title: "가족 식사",
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: "family2",
      categoryId: "family",
      title: "가족 여행",
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: "family3",
      categoryId: "family",
      title: "가족 게임",
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: "family4",
      categoryId: "family",
      title: "직접 입력",
      icon: <Edit3 className="h-6 w-6" />,
    },
    {
      id: "study1",
      categoryId: "study",
      title: "숙제 완료하기",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      id: "study2",
      categoryId: "study",
      title: "독서하기",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      id: "study3",
      categoryId: "study",
      title: "시험 준비하기",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      id: "study4",
      categoryId: "study",
      title: "직접 입력",
      icon: <Edit3 className="h-6 w-6" />,
    },
    {
      id: "health1",
      categoryId: "lifestyle",
      title: "운동하기",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      id: "health2",
      categoryId: "lifestyle",
      title: "일찍 자기",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      id: "health3",
      categoryId: "lifestyle",
      title: "건강한 식사",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      id: "health4",
      categoryId: "lifestyle",
      title: "직접 입력",
      icon: <Edit3 className="h-6 w-6" />,
    },
    {
      id: "other1",
      categoryId: "other",
      title: "기타 활동",
      icon: <Settings className="h-6 w-6" />,
    },
    {
      id: "other2",
      categoryId: "other",
      title: "직접 입력",
      icon: <Edit3 className="h-6 w-6" />,
    },
  ];

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
                  setSelectedQuest(quest.id);
                  router.push("/quest/parent/Detail");
                }}
              >
                <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mb-2">
                  {quest.icon}
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
    </View>
  );
}
