import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useColorScheme } from "nativewind";
import { Circle, CalendarX } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
interface TrendData {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: TrendData[];
}

const { width } = Dimensions.get("window");
// 차트 너비를 화면에 딱 맞게 조정 (패딩 고려)
const chartWidth = width - 32; // 좌우 패딩 16px씩 고려

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isReady, setIsReady] = useState(false);

  const [chartData, setChartData] = useState<any[]>([]);
  // 기기 크기에 따라 spacing 값을 동적으로 조정
  const spacing = width < 360 ? 15 : 22;
  const barWidth = width < 360 ? 18 : 22;
  // x축 선 길이 조정 (차트 너비의 90%로 설정)
  const xAxisLength = chartWidth * 0.79;

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
        spacing: spacing,
        labelTextStyle: {
          color: isDark ? "#4FC985" : "#374151",
          fontSize: 13,
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
  }, [data, isDark, spacing]);

  if (!isReady) {
    return (
      <View className="bg-white rounded-xl p-4 my-2">
        <GlobalText className="font-bold text-xl text-gray-900 mb-4">
          최근 수입/지출 추이
        </GlobalText>
        <View className="h-64 items-center justify-center">
          <GlobalText className="text-gray-500">로딩 중...</GlobalText>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우 처리
  if (data.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
        <GlobalText className="font-bold text-xl text-gray-900 mb-4">
          최근 수입/지출 추이
        </GlobalText>
        <View className="h-64 items-center justify-center">
          <CalendarX size={48} color="#D1D5DB" />
          <GlobalText className="text-gray-500 mt-4">
            이번 달 거래 내역이 없습니다
          </GlobalText>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2">
      <GlobalText className="font-bold text-xl text-gray-900 dark:text-white mb-4">
        최근 수입/지출 추이
      </GlobalText>

      <View className="h-64 items-center">
        <BarChart
          data={chartData}
          barWidth={barWidth}
          spacing={spacing}
          roundedTop
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor={isDark ? "#4FC985" : "#E2E8F0"}
          yAxisColor={isDark ? "#4FC985" : "#E2E8F0"}
          yAxisTextStyle={{
            color: isDark ? "#E5E7EB" : "#374151",
            fontSize: 12,
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
          initialSpacing={spacing} // 왼쪽 여백을 다른 막대 사이 간격과 동일하게 설정
          xAxisLength={xAxisLength} // x축 선 길이 조정
        />
      </View>

      {/* 범례 */}
      <View className="flex-row justify-center items-center my-1">
        <View className="flex-row items-center mr-4">
          <Circle size={10} fill="#4FC985" color="#4FC985" />
          <GlobalText className="text-sm text-gray-700 dark:text-gray-300 ml-1">
            수입
          </GlobalText>
        </View>
        <View className="flex-row items-center">
          <Circle
            size={10}
            fill={isDark ? "#4B5563" : "#E2E8F0"}
            color={isDark ? "#4B5563" : "#E2E8F0"}
          />
          <GlobalText className="text-sm text-gray-700 dark:text-gray-300 ml-1">
            지출
          </GlobalText>
        </View>
      </View>
    </View>
  );
}
