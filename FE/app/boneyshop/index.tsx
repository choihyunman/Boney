import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Star } from "lucide-react-native";
import { getCategoryIcon } from "../../utils/categoryUtils";
import { menuItems, categories, getBgStyle } from "./_layout";
import { processPayment } from "../../apis/boneyshopApi";
import { useHomeStore } from "../../stores/useHomeStore";
import { useAuthStore } from "../../stores/useAuthStore";
import GlobalText from "@/components/GlobalText";

const MenuScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const childData = useHomeStore((state) => state.childData);
  const parentData = useHomeStore((state) => state.parentData);
  const user = useAuthStore((state) => state.user);

  // 사용자의 계좌번호 가져오기
  const getAccountNumber = () => {
    if (user?.role === "PARENT" && parentData?.account_number) {
      console.log("부모 계좌번호:", parentData.account_number);
      return parentData.account_number;
    }
    if (user?.role === "CHILD" && childData?.account_number) {
      console.log("자녀 계좌번호:", childData.account_number);
      return childData.account_number;
    }
    console.log("계좌번호를 찾을 수 없습니다.");
    return null;
  };

  // 선택된 카테고리에 따라 메뉴 필터링
  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  // 추천 메뉴 (각 카테고리에서 평점이 높은 아이템)
  const recommendedItems = [...menuItems]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  // 결제 처리 함수
  const handlePayment = async (item: { name: string; price: number }) => {
    const accountNumber = getAccountNumber();
    if (!accountNumber) {
      Alert.alert("오류", "계좌 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      await processPayment(item.name, item.price, accountNumber);
      Alert.alert("결제 성공", `${item.name} 결제가 완료되었습니다.`);
    } catch (error) {
      Alert.alert("결제 실패", "결제 처리 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 카테고리 */}
      <View className="py-4 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 space-x-2"
        >
          {categories.map((category) => {
            const categoryInfo = getCategoryIcon(category.name);
            const CategoryIcon = categoryInfo.Icon;
            const isSelected = category.id === selectedCategory;

            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className="flex-row items-center px-4 py-2 rounded-full mx-1"
                style={
                  isSelected
                    ? { backgroundColor: categoryInfo.iconColor }
                    : getBgStyle(categoryInfo.backgroundColor)
                }
              >
                <CategoryIcon
                  size={16}
                  color={isSelected ? "white" : categoryInfo.iconColor}
                />
                <GlobalText
                  className={`ml-2 font-medium ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {category.name}
                </GlobalText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 메뉴 아이템 */}
      <ScrollView className="flex-1 px-4 pt-4">
        <GlobalText weight="bold" className="text-xl text-gray-800 mb-4">
          {categories.find((c) => c.id === selectedCategory)?.name} 메뉴
        </GlobalText>

        <View className="space-y-4">
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-row"
              onPress={() => handlePayment(item)}
              disabled={isLoading}
            >
              <View className="w-24 h-24 bg-gray-200 justify-center items-center">
                <GlobalText className="text-center text-gray-500">
                  {item.name}
                </GlobalText>
              </View>

              <View className="flex-1 p-3 justify-between">
                <View>
                  <GlobalText weight="bold" className="text-lg text-gray-800">
                    {item.name}
                  </GlobalText>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    <GlobalText className="text-sm text-gray-500 ml-1">
                      {item.rating}
                    </GlobalText>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <GlobalText
                    weight="bold"
                    className="text-gray-800"
                    style={{ color: "#4FC985" }}
                  >
                    {item.price.toLocaleString()}원
                  </GlobalText>
                  {isLoading && (
                    <ActivityIndicator size="small" color="#4FC985" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 추천 메뉴 섹션 */}
        <GlobalText weight="bold" className="text-xl text-gray-800 mt-8 mb-4">
          추천 메뉴
        </GlobalText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="pb-6 space-x-4"
        >
          {recommendedItems.map((item) => {
            const category = categories.find((c) => c.id === item.category);
            const categoryInfo = category
              ? getCategoryIcon(category.name)
              : null;

            return (
              <TouchableOpacity
                key={`recommended-${item.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 w-40"
                onPress={() => handlePayment(item)}
                disabled={isLoading}
              >
                <View className="w-full h-32 bg-gray-200 relative justify-center items-center">
                  <GlobalText className="text-center text-gray-500">
                    {item.name}
                  </GlobalText>
                  {categoryInfo && (
                    <View
                      className="absolute top-2 right-2 px-2 py-1 rounded-full"
                      style={getBgStyle(categoryInfo.backgroundColor)}
                    >
                      <GlobalText
                        style={{ color: categoryInfo.iconColor, fontSize: 10 }}
                      >
                        {category?.name}
                      </GlobalText>
                    </View>
                  )}
                </View>

                <View className="p-3">
                  <GlobalText weight="bold" className="text-base text-gray-800">
                    {item.name}
                  </GlobalText>
                  <View className="flex-row items-center mt-1">
                    <Star size={12} color="#FBBF24" fill="#FBBF24" />
                    <GlobalText className="text-xs text-gray-500 ml-1">
                      {item.rating}
                    </GlobalText>
                  </View>
                  <GlobalText
                    weight="bold"
                    className="mt-2"
                    style={{ color: "#4FC985" }}
                  >
                    {item.price.toLocaleString()}원
                  </GlobalText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MenuScreen;
