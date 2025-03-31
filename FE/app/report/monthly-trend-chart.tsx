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
const chartWidth = width - 40; // 좌우 패딩 고려

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isReady, setIsReady] = useState(false);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // 데이터를 날짜순으로 정렬
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));

    // 차트 데이터 형식으로 변환 (react-native-gifted-charts 형식)
    const formattedData: any[] = [];

    sortedData.forEach((item, index) => {
      // month가 이미 "월"이 포함된 형태로 들어오므로 split 불필요
      const monthLabel = item.month;

      // 수입 데이터
      formattedData.push({
        value: item.income / 10000, // 만원 단위로 변환
        label: monthLabel,
        frontColor: "#49DB8A",
        spacing: 8,
        labelTextStyle: {
          color: isDark ? "#E5E7EB" : "#374151",
          fontSize: 10,
        },
      });

      // 지출 데이터
      formattedData.push({
        value: item.expense / 10000, // 만원 단위로 변환
        frontColor: isDark ? "#4B5563" : "#E2E8F0",
        spacing: index < sortedData.length - 1 ? 24 : 8, // 마지막 항목이 아니면 더 큰 간격
      });
    });

    setChartData(formattedData);
    setIsReady(true);
  }, [data, isDark]);

  if (!isReady) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          최근 수입/지출 추이
        </Text>
        <View className="h-64 items-center justify-center">
          <Text className="text-gray-500">로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        최근 수입/지출 추이
      </Text>

      <View className="h-64">
        <BarChart
          data={chartData}
          barWidth={20}
          spacing={20}
          roundedTop
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor={isDark ? "#4B5563" : "#E2E8F0"}
          yAxisColor={isDark ? "#4B5563" : "#E2E8F0"}
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
          height={200}
          isAnimated
          animationDuration={500}
          onPress={(item: any) => console.log(item)}
        />
      </View>

      {/* 범례 */}
      <View className="flex-row justify-center items-center mt-4 mb-2">
        <View className="flex-row items-center mr-4">
          <Circle size={8} fill="#49DB8A" color="#49DB8A" />
          <Text className="text-xs text-gray-700 dark:text-gray-300 ml-1">
            수입
          </Text>
        </View>
        <View className="flex-row items-center">
          <Circle
            size={8}
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
