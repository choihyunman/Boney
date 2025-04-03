import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import GlobalText from "@/components/GlobalText";

// 아이 데이터 타입 정의
type Child = {
  id: string;
  name: string;
  profileImage: string;
};

export default function SelectChildPage() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([
    {
      id: "1",
      name: "김짤랑",
      profileImage: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "2",
      name: "김딸랑",
      profileImage: "/placeholder.svg?height=60&width=60",
    },
  ]);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1 px-6 mt-8">
        <View className="bg-white rounded-xl shadow-sm p-5">
          <GlobalText weight="bold" className="text-lg text-gray-800 mb-2">
            아이 선택
          </GlobalText>
          <GlobalText className="text-sm text-gray-600 mb-6">
            누구에게 퀘스트를 줄까요?
          </GlobalText>

          {/* 아이 목록 */}
          <View className="space-y-4">
            {children.map((child) => (
              <View key={child.id} className="mb-2">
                <TouchableOpacity
                  className={`flex-row items-center p-4 bg-[#F9FAFB] rounded-xl border ${
                    selectedChild === child.id
                      ? "border-[#4FC985]"
                      : "border-gray-100"
                  }`}
                  onPress={() => {
                    setSelectedChild(child.id);
                    router.push("/quest/parent/SelectQuest");
                  }}
                >
                  <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
                    {/* <Image
                    source={{ uri: child.profileImage || "/placeholder.svg" }}
                    alt={`${child.name}의 프로필`}
                    className="w-10 h-10 rounded-full"
                    contentFit="cover"
                  /> */}
                  </View>
                  <View className="flex-1">
                    <GlobalText className="text-base text-gray-800">
                      {child.name}
                    </GlobalText>
                  </View>
                  <ChevronRight size={20} color="#4FC985" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
