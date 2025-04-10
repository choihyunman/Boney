import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Trophy,
  Circle,
  CalendarX,
} from "lucide-react-native";
import MonthlyExpenseDonut from "./MonthlyExpenseDonut";
import MonthlyTrendChart from "./MonthlyTrendChart";
import { useRouter } from "expo-router";
import { useReportStore } from "@/stores/useReportStore";
import { getCategoryIcon } from "@/utils/categoryUtils";
import GlobalText from "@/components/GlobalText";

// 월 선택기 컴포넌트
const MonthSelector = ({
  currentDate,
  changeMonth,
  isLastMonth,
}: {
  currentDate: { year: number; month: number };
  changeMonth: (direction: "prev" | "next") => void;
  isLastMonth: boolean;
}) => {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `${year}년 ${month}월`;
  };

  return (
    <View className="bg-white rounded-xl mx-4 mt-2">
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity onPress={() => changeMonth("prev")}>
          <ChevronLeft size={20} color="#000000" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <GlobalText weight="bold" className="text-xl text-gray-800">
            {formatMonth(`${currentDate.year}-${currentDate.month}`)}
          </GlobalText>
        </View>

        <TouchableOpacity
          onPress={() => changeMonth("next")}
          disabled={isLastMonth}
          style={{ opacity: isLastMonth ? 0.5 : 1 }}
        >
          <ChevronRight size={20} color={isLastMonth ? "#9CA3AF" : "#000000"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    const currentMonth = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
    console.log("Initial currentDate:", currentMonth);
    return currentMonth;
  });

  // 데이터 로드
  useEffect(() => {
    console.log("Fetching report for:", currentDate);
    fetchReport(currentDate.year, currentDate.month);
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

  // 현재 날짜가 현재 달인지 확인
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const isLastMonth =
    currentDate.year === currentYear && currentDate.month === currentMonth;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText>로딩 중...</GlobalText>
      </View>
    );
  }

  if (error === "NO_DATA") {
    return (
      <View className="flex-1 bg-[#F5F6F8]">
        <MonthSelector
          currentDate={currentDate}
          changeMonth={changeMonth}
          isLastMonth={isLastMonth}
        />
        <View className="flex-1 items-center justify-center p-4">
          <CalendarX size={64} color="#D1D5DB" />
          <GlobalText className="text-gray-500 mt-4 text-lg">
            이번 달 내역이 없습니다
          </GlobalText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText className="text-red-500">{error}</GlobalText>
      </View>
    );
  }

  if (!monthlyReport) {
    return null;
  }

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
    <ScrollView className="flex-1 bg-[#F5F6F8] px-2">
      <MonthSelector
        currentDate={currentDate}
        changeMonth={changeMonth}
        isLastMonth={isLastMonth}
      />
      <View className="p-4">
        {/* 1. 지출 내역 도넛 그래프 */}
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

        {/* 2. 선택된 카테고리 지출 내역 */}
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
                <GlobalText weight="bold" className="text-lg">
                  {selectedCategory} 지출 내역
                </GlobalText>
              </View>
              <GlobalText
                weight="bold"
                className="text-base text-[#4FC985] pr-4"
              >
                {selectedCategoryData.amount.toLocaleString()}원
              </GlobalText>
            </View>
            <View className="space-y-4 gap-2">
              {selectedCategoryData.transactions.map((transaction) => (
                <View
                  key={transaction.transactionId}
                  className="bg-gray-50 p-4 rounded-lg flex-row justify-between items-center"
                >
                  <View>
                    <GlobalText className="text-base">
                      {transaction.transactionContent}
                    </GlobalText>
                    <GlobalText className="text-sm text-gray-500 mt-1">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </GlobalText>
                  </View>
                  <GlobalText weight="bold" className="text-base">
                    {transaction.amount.toLocaleString()}원
                  </GlobalText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. 수입/지출 비교 막대 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <GlobalText className="text-xl font-semibold mb-4">
            수입/지출 비교
          </GlobalText>
          {monthlyReport.totalIncome === 0 &&
          monthlyReport.totalExpense === 0 ? (
            <View className="h-16 items-center justify-center">
              <Circle size={32} color="#D1D5DB" />
              <GlobalText className="text-gray-500 mt-2">
                거래 내역이 없습니다
              </GlobalText>
            </View>
          ) : (
            <View className="h-16 bg-gray-100 rounded-xl overflow-hidden flex-row">
              <View
                className={`flex-1 items-center justify-center ${
                  isIncomeHigher ? "bg-[#4FC985]" : "bg-gray-300"
                }`}
                style={{ width: `${incomeRatio}%` }}
              >
                <View className="items-center">
                  <View className="flex-row items-center">
                    <ArrowUp
                      size={12}
                      color={isIncomeHigher ? "#FFFFFF" : "#374151"}
                    />
                    <GlobalText
                      className={`text-xs ${
                        isIncomeHigher ? "text-white" : "text-gray-700"
                      }`}
                    >
                      수입 {incomeRatio}%
                    </GlobalText>
                  </View>
                  <GlobalText
                    weight="bold"
                    className={`text-sm mt-1 ${
                      isIncomeHigher ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {monthlyReport.totalIncome.toLocaleString()}원
                  </GlobalText>
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
                    <GlobalText
                      className={`text-xs ${
                        !isIncomeHigher ? "text-white" : "text-gray-700"
                      }`}
                    >
                      지출 {expenseRatio}%
                    </GlobalText>
                  </View>
                  <GlobalText
                    weight="bold"
                    className={`text-sm mt-1 ${
                      !isIncomeHigher ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {monthlyReport.totalExpense.toLocaleString()}원
                  </GlobalText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 4. 3개월 수입/지출 추이 그래프 - API 데이터 사용 */}
        <View className="h-96 mb-4">
          <MonthlyTrendChart
            data={monthlyReport.threeMonthsTrend.map((item) => ({
              month: item.month.split("-")[1] + "월",
              income: item.income,
              expense: item.expense,
            }))}
          />
        </View>
        {/* 5. 이번 달 퀘스트 완료 건수 카드 */}
        <View className="bg-white rounded-xl p-6">
          <GlobalText className="text-xl font-semibold mb-4">
            이번 달 퀘스트
          </GlobalText>
          <View className="flex-row items-center gap-6">
            <View className="w-16 h-16 rounded-full bg-[#4FC985]/20 items-center justify-center">
              <Trophy size={32} color="#4FC985" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-2">
                <GlobalText className="text-base text-gray-500">
                  완료 건수
                </GlobalText>
                <GlobalText className="text-lg font-semibold">
                  {monthlyReport.completedQuests.count}건
                </GlobalText>
              </View>
              <View className="flex-row justify-between items-center">
                <GlobalText className="text-base text-gray-500">
                  총 수입액
                </GlobalText>
                <GlobalText weight="bold" className="text-lg text-[#4FC985]">
                  {monthlyReport.completedQuests.totalIncome.toLocaleString()}원
                </GlobalText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
