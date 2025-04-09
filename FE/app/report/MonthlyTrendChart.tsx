import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useColorScheme } from "nativewind";
import { Circle } from "lucide-react-native";

interface TrendData {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: TrendData[];
}

const { width } = Dimensions.get("window");
const chartWidth = width - 50; // 좌우 패딩을 더 늘림

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isReady, setIsReady] = useState(false);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // 데이터가 있는 항목만 필터링
    const validData = data.filter(
      (item) => item.income > 0 || item.expense > 0
    );

    // 데이터를 날짜순으로 정렬
    const sortedData = [...validData].sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // 마지막 3개월 데이터만 선택
    const lastThreeMonths = sortedData.slice(-3);

    // 차트 데이터 형식으로 변환 (react-native-gifted-charts 형식)
    const formattedData: any[] = [];

    lastThreeMonths.forEach((item, index) => {
      const monthLabel = item.month;

      // 수입 데이터
      formattedData.push({
        value: item.income / 10000, // 만원 단위로 변환
        label: monthLabel,
        frontColor: "#4FC985",
        spacing: 12,
        labelTextStyle: {
          color: isDark ? "#4FC985" : "#374151",
          fontSize: 11,
        },
      });

      // 지출 데이터
      formattedData.push({
        value: item.expense / 10000, // 만원 단위로 변환
        frontColor: isDark ? "#4FC985" : "#E2E8F0",
      });
    });

    setChartData(formattedData);
    setIsReady(true);
  }, [data, isDark]);

  if (!isReady) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          최근 수입/지출 추이
        </Text>
        <View className="h-64 items-center justify-center">
          <Text className="text-gray-500">로딩 중...</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우 처리
  if (data.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          최근 수입/지출 추이
        </Text>
        <View className="h-64 items-center justify-center">
          <Circle size={48} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4">
            이번 달 내역이 없습니다
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        최근 수입/지출 추이
      </Text>

      <View className="h-64 items-center">
        <BarChart
          data={chartData}
          barWidth={25}
          spacing={38}
          roundedTop
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor={isDark ? "#4FC985" : "#E2E8F0"}
          yAxisColor={isDark ? "#4FC985" : "#E2E8F0"}
          yAxisTextStyle={{
            color: isDark ? "#E5E7EB" : "#374151",
            fontSize: 10,
          }}
          noOfSections={5}
          yAxisLabelSuffix="만"
          maxValue={
            Math.ceil(
              (Math.max(
                ...data.map((d) => Math.max(d.income, d.expense) / 10000)
              ) *
                1.1) /
                5
            ) * 5
          }
          width={chartWidth}
          height={180}
          isAnimated
          animationDuration={500}
          initialSpacing={30} // 왼쪽 여백을 다른 막대 사이 간격과 동일하게 설정
        />
      </View>

      {/* 범례 */}
      <View className="flex-row justify-center items-center my-1">
        <View className="flex-row items-center mr-4">
          <Circle size={10} fill="#4FC985" color="#4FC985" />
          <Text className="text-xs text-gray-700 dark:text-gray-300 ml-1">
            수입
          </Text>
        </View>
        <View className="flex-row items-center">
          <Circle
            size={10}
            fill={isDark ? "#4B5563" : "#E2E8F0"}
            color={isDark ? "#4B5563" : "#E2E8F0"}
          />
          <Text className="text-xs text-gray-700 dark:text-gray-300 ml-1">
            지출
          </Text>
        </View>
      </View>
    </View>
  );
}
