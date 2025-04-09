import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useColorScheme } from "nativewind";
import { CalendarX, Circle } from "lucide-react-native";
import { LucideIcon } from "lucide-react-native";

interface CategoryExpense {
  category: string;
  amount: number;
  icon: LucideIcon;
  color: string;
}

interface MonthlyExpenseDonutProps {
  categories: CategoryExpense[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}

const { width } = Dimensions.get("window");
const chartSize = width - 100; // 차트 크기를 더 크게 조정 (200에서 100으로 변경)

interface ChartLabel {
  category: string;
  percentage: number;
  color: string;
  angle: number;
  isTop?: boolean;
}

function ChartLabelComponent({
  label,
  radius,
}: {
  label: ChartLabel;
  radius: number;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // 라벨 위치 계산
  const x = Math.cos((label.angle * Math.PI) / 180) * radius;
  const y = Math.sin((label.angle * Math.PI) / 180) * radius;

  // 라벨이 위치할 사분면에 따라 정렬 방식 결정
  const isRight = x > 0;
  const isBottom = y > 0;

  return (
    <View
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: [
          { translateX: x },
          { translateY: y },
          { translateX: isRight ? 5 : -5 },
          { translateX: isRight ? 0 : -80 },
        ],
        width: 80,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: isRight ? "flex-start" : "flex-end",
        }}
      >
        {!isRight && (
          <Text
            style={{
              color: isDark ? "#E5E7EB" : "#374151",
              fontSize: 10,
              textAlign: isRight ? "left" : "right",
            }}
          >
            {`${label.category} ${label.percentage}%`}
          </Text>
        )}
        <View
          style={{
            width: 12,
            height: 1,
            backgroundColor: label.color,
            marginHorizontal: 2,
          }}
        />
        {isRight && (
          <Text
            style={{
              color: isDark ? "#E5E7EB" : "#374151",
              fontSize: 10,
              textAlign: isRight ? "left" : "right",
            }}
          >
            {`${label.category} ${label.percentage}%`}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function MonthlyExpenseDonut({
  categories,
  onCategorySelect,
  selectedCategory,
}: MonthlyExpenseDonutProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isReady, setIsReady] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLabels, setChartLabels] = useState<ChartLabel[]>([]);

  useEffect(() => {
    const totalExpense = categories.reduce((sum, cat) => sum + cat.amount, 0);

    let currentAngle = -90; // 시작 각도 (12시 방향)
    const labels: ChartLabel[] = [];

    const formattedData = categories.map((category) => {
      const percentage = Math.round((category.amount / totalExpense) * 100);
      const angle = (category.amount / totalExpense) * 360;

      // 라벨의 각도는 해당 섹션의 중앙
      const labelAngle = currentAngle + angle / 2;

      // 상단에 있는 라벨인지 확인 (각도 기준)
      // 상단: -90도 ~ -45도 또는 45도 ~ 90도
      const isTop =
        (labelAngle >= -90 && labelAngle <= -45) ||
        (labelAngle >= 45 && labelAngle <= 90);

      labels.push({
        category: category.category,
        percentage,
        color: category.color,
        angle: labelAngle,
        isTop,
      });

      currentAngle += angle;

      return {
        value: category.amount,
        text: "",
        color: category.color,
        focused: selectedCategory === category.category,
      };
    });

    setChartData(formattedData);
    setChartLabels(labels);
    setIsReady(true);
  }, [categories, selectedCategory, isDark]);

  if (!isReady) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          지출 카테고리 분포
        </Text>
        <View className="h-64 items-center justify-center">
          <Text className="text-gray-500">로딩 중...</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우 처리
  if (categories.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          지출 카테고리 분포
        </Text>
        <View className="h-64 items-center justify-center">
          <CalendarX size={48} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4">이번 달 내역이 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        지출 카테고리 분포
      </Text>

      <View className="items-center">
        <View
          style={{
            width: chartSize,
            height: chartSize,
            position: "relative",
            alignSelf: "center",
            marginVertical: 30,
          }}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PieChart
              data={chartData}
              donut
              radius={chartSize / 2}
              innerRadius={chartSize / 2.5}
              focusOnPress
              showValuesAsLabels={false}
              onPress={(_item: any, index: number) => {
                if (
                  index !== undefined &&
                  index >= 0 &&
                  index < categories.length
                ) {
                  onCategorySelect(categories[index].category);
                }
              }}
              centerLabelComponent={() => {
                const totalExpense = categories.reduce(
                  (sum, cat) => sum + cat.amount,
                  0
                );
                return (
                  <View className="items-center">
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      총 지출
                    </Text>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      {totalExpense.toLocaleString()}원
                    </Text>
                  </View>
                );
              }}
            />
          </View>
          {chartLabels.map((label, index) => (
            <ChartLabelComponent
              key={label.category}
              label={label}
              radius={chartSize / 2 + (label.isTop ? 8 : 4)}
            />
          ))}
        </View>

        {/* 카테고리 범례 */}
        <View className="flex-row flex-wrap justify-center mt-4">
          {categories.map((category) => (
            <Pressable
              key={category.category}
              onPress={() => onCategorySelect(category.category)}
              className={`flex-row items-center m-2 px-4 py-2 rounded-full ${
                selectedCategory === category.category
                  ? "bg-gray-100 dark:bg-gray-700"
                  : ""
              }`}
            >
              <Circle size={10} fill={category.color} color={category.color} />
              <Text
                className={`text-sm ml-2 ${
                  selectedCategory === category.category
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {category.category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
