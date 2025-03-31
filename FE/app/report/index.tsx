import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowUp,
  ArrowDown,
  Trophy,
} from "lucide-react-native";
import MonthlyExpenseDonut from "./monthly-expense-donut";
import MonthlyTrendChart from "./monthly-trend-chart";
import { useRouter } from "expo-router";
import { useReportStore } from "@/stores/useReportStore";
import { getCategoryIcon } from "@/utils/categoryUtils";

export default function MonthlyReport() {
  const router = useRouter();
  const {
    monthlyReport,
    isLoading,
    error,
    selectedCategory,
    fetchReport,
    setSelectedCategory,
  } = useReportStore();

  // 현재 년월 상태 수정
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // 이전 달로 설정
    now.setMonth(now.getMonth() - 1);
    const prevMonth = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
    console.log("Initial currentDate:", prevMonth);
    return prevMonth;
  });

  // 데이터 로드
  useEffect(() => {
    console.log("Fetching report for:", currentDate);
    fetchReport(currentDate.year, currentDate.month - 1);
  }, [currentDate]);

  // 월 변경 함수
  const changeMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev.year, prev.month - 1);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      const newMonth = {
        year: newDate.getFullYear(),
        month: newDate.getMonth() + 1,
      };
      console.log("Changing month to:", newMonth);
      return newMonth;
    });
  };

  // 현재 날짜가 3개월 트렌드의 첫 달인지 마지막 달인지 확인
  const isFirstMonth =
    monthlyReport?.threeMonthsTrend[0]?.month ===
    `${currentDate.year}-${String(currentDate.month).padStart(2, "0")}`;

  // 현재 날짜가 이전 달인지 확인
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const isLastMonth =
    currentDate.year === currentYear &&
    currentDate.month === (currentMonth === 1 ? 12 : currentMonth - 1);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!monthlyReport) {
    return null;
  }

  // 월 표시 형식 변환 (YYYY-MM -> YYYY년 MM월)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `${year}년 ${month}월`;
  };

  // 수입/지출 비율 계산
  const incomeRatio = Math.round(
    (monthlyReport.totalIncome /
      (monthlyReport.totalIncome + monthlyReport.totalExpense)) *
      100
  );
  const expenseRatio = 100 - incomeRatio;

  // 수입이 지출보다 많은지 여부
  const isIncomeHigher = monthlyReport.totalIncome > monthlyReport.totalExpense;

  // 선택된 카테고리 데이터 찾기
  const selectedCategoryData = selectedCategory
    ? monthlyReport.categoryExpense.find(
        (cat) => cat.category === selectedCategory
      )
    : null;

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB]">
      <View className="p-4">
        {/* 1. 현재 월 선택 */}
        <View className="flex-row items-center justify-center mb-6">
          <TouchableOpacity
            onPress={() => changeMonth("prev")}
            className="p-2 rounded-full mr-4"
            disabled={isFirstMonth}
          >
            <ChevronLeft
              size={24}
              color={isFirstMonth ? "#D1D5DB" : "#4B5563"}
            />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Calendar size={20} color="#49DB8A" />
            <Text className="text-lg font-semibold">
              {formatMonth(`${currentDate.year}-${currentDate.month - 1}`)}
            </Text>
          </View>

          {!isLastMonth && (
            <TouchableOpacity
              onPress={() => changeMonth("next")}
              className="p-2 rounded-full ml-4"
            >
              <ChevronRight size={24} color="#4B5563" />
            </TouchableOpacity>
          )}
          {isLastMonth && (
            <View className="w-10 h-10" /* 버튼 자리 유지를 위한 빈 공간 */ />
          )}
        </View>

        {/* 2. 수입/지출 비교 막대 */}
        <View className="bg-white rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold mb-4">수입/지출 비교</Text>
          <View className="h-16 bg-gray-100 rounded-xl overflow-hidden flex-row">
            <View
              className={`flex-1 items-center justify-center ${
                isIncomeHigher ? "bg-[#49DB8A]" : "bg-gray-300"
              }`}
              style={{ width: `${incomeRatio}%` }}
            >
              <View className="items-center">
                <View className="flex-row items-center">
                  <ArrowUp
                    size={12}
                    color={isIncomeHigher ? "#FFFFFF" : "#374151"}
                  />
                  <Text
                    className={`text-xs font-medium ${
                      isIncomeHigher ? "text-white" : "text-gray-700"
                    }`}
                  >
                    수입 {incomeRatio}%
                  </Text>
                </View>
                <Text
                  className={`text-sm font-bold mt-1 ${
                    isIncomeHigher ? "text-white" : "text-gray-700"
                  }`}
                >
                  {monthlyReport.totalIncome.toLocaleString()}원
                </Text>
              </View>
            </View>
            <View
              className={`flex-1 items-center justify-center ${
                !isIncomeHigher ? "bg-[#49DB8A]" : "bg-gray-200"
              }`}
              style={{ width: `${expenseRatio}%` }}
            >
              <View className="items-center">
                <View className="flex-row items-center">
                  <ArrowDown
                    size={12}
                    color={!isIncomeHigher ? "#FFFFFF" : "#374151"}
                  />
                  <Text
                    className={`text-xs font-medium ${
                      !isIncomeHigher ? "text-white" : "text-gray-700"
                    }`}
                  >
                    지출 {expenseRatio}%
                  </Text>
                </View>
                <Text
                  className={`text-sm font-bold mt-1 ${
                    !isIncomeHigher ? "text-white" : "text-gray-700"
                  }`}
                >
                  {monthlyReport.totalExpense.toLocaleString()}원
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. 지출 내역 도넛 그래프 */}
        <View className="mb-4">
          <MonthlyExpenseDonut
            categories={monthlyReport.categoryExpense.map((category) => ({
              category: category.category,
              amount: category.amount,
              icon: getCategoryIcon(category.category).Icon,
              color: getCategoryIcon(category.category).iconColor,
            }))}
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </View>

        {/* 4. 선택된 카테고리 지출 내역 */}
        {selectedCategory && selectedCategoryData && (
          <View className="bg-white rounded-xl p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <View
                  className={`w-8 h-8 rounded-full ${
                    getCategoryIcon(selectedCategory).backgroundColor
                  } items-center justify-center`}
                >
                  {(() => {
                    const Icon = getCategoryIcon(selectedCategory).Icon;
                    return (
                      <Icon
                        size={20}
                        color={getCategoryIcon(selectedCategory).iconColor}
                      />
                    );
                  })()}
                </View>
                <Text className="text-lg font-semibold">
                  {selectedCategory} 지출 내역
                </Text>
              </View>
              <Text className="text-base font-semibold text-[#49DB8A] pr-4">
                {selectedCategoryData.amount.toLocaleString()}원
              </Text>
            </View>
            <View className="space-y-4 gap-2">
              {selectedCategoryData.transactions.map((transaction) => (
                <View
                  key={transaction.transactionId}
                  className="bg-gray-50 p-4 rounded-lg flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-base font-medium">
                      {transaction.transactionContent}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold">
                    {transaction.amount.toLocaleString()}원
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. 이번 달 퀘스트 완료 건수 카드 */}
        <View className="bg-white rounded-xl p-6 mb-6">
          <Text className="text-lg font-semibold mb-4">이번 달 퀘스트</Text>
          <View className="flex-row items-center gap-6">
            <View className="w-16 h-16 rounded-full bg-[#49DB8A]/20 items-center justify-center">
              <Trophy size={32} color="#49DB8A" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-500">완료 건수</Text>
                <Text className="text-lg font-semibold">
                  {monthlyReport.completedQuests.count}건
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-gray-500">총 수입액</Text>
                <Text className="text-lg font-semibold text-[#49DB8A]">
                  {monthlyReport.completedQuests.totalIncome.toLocaleString()}원
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. 3개월 수입/지출 추이 그래프 - API 데이터 사용 */}
        <View className="h-96">
          <MonthlyTrendChart
            data={monthlyReport.threeMonthsTrend.map((item) => ({
              month: item.month.split("-")[1] + "월",
              income: item.income,
              expense: item.expense,
            }))}
          />
        </View>
      </View>
    </ScrollView>
  );
}
