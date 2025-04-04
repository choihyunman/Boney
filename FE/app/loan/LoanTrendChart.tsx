import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import GlobalText from "@/components/GlobalText";

interface LoanTrendChartProps {
  loans: {
    loan_id: number;
    loan_amount: number;
    last_amount: number;
    due_date: string;
    child_name?: string;
  }[];
}

const { width } = Dimensions.get("window");
const chartWidth = width - 50;

export default function LoanTrendChart({ loans }: LoanTrendChartProps) {
  // 대출 데이터를 월별로 그룹화
  const groupedData = loans.reduce((acc, loan) => {
    const month = loan.due_date.substring(0, 7); // YYYY-MM 형식
    if (!acc[month]) {
      acc[month] = {
        total: 0,
        loans: {},
      };
    }
    acc[month].total += loan.last_amount;
    acc[month].loans[loan.loan_id] = loan.last_amount;
    return acc;
  }, {} as Record<string, { total: number; loans: Record<number, number> }>);

  // 차트 데이터 준비
  const months = Object.keys(groupedData).sort();
  const chartData = months.map((month) => ({
    value: groupedData[month].total / 10000, // 만원 단위로 변환
    label: month.substring(5) + "월", // MM월 형식
    dataPointText: Math.round(groupedData[month].total / 10000).toString(),
  }));

  // 개별 대출 데이터 준비
  const individualLoanData = loans.map((loan, index) => {
    const color = ["#6366F1", "#F59E0B", "#4FC985"][index % 3];
    return {
      value:
        groupedData[months[months.length - 1]]?.loans[loan.loan_id] / 10000 ||
        0,
      label: months[months.length - 1].substring(5) + "월",
      color,
      name: loan.child_name || `대출 ${index + 1}`,
    };
  });

  return (
    <View className="bg-white rounded-xl p-4 my-2">
      <GlobalText className="text-lg font-bold text-gray-800 mb-4">
        대출 추이
      </GlobalText>
      <View className="h-64 items-center">
        <LineChart
          data={chartData}
          data2={individualLoanData}
          height={180}
          width={chartWidth}
          spacing={38}
          initialSpacing={30}
          color="#4FC985"
          thickness={2}
          startFillColor="rgba(79, 201, 133, 0.3)"
          endFillColor="rgba(79, 201, 133, 0.01)"
          startOpacity={0.9}
          endOpacity={0.2}
          backgroundColor="white"
          xAxisColor="#E2E8F0"
          yAxisColor="#E2E8F0"
          yAxisTextStyle={{ color: "#374151", fontSize: 10 }}
          xAxisLabelTextStyle={{ color: "#374151", fontSize: 10 }}
          hideDataPoints={false}
          dataPointsColor="#4FC985"
          dataPointsRadius={4}
          yAxisLabelSuffix="만"
          noOfSections={5}
          maxValue={Math.ceil(Math.max(...chartData.map((d) => d.value)) * 1.1)}
          isAnimated
          animationDuration={500}
        />
      </View>

      {/* 범례 */}
      <View className="flex-row flex-wrap justify-center items-center mt-4 gap-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#4FC985] mr-2" />
          <GlobalText className="text-xs text-gray-700">총 대출액</GlobalText>
        </View>
        {individualLoanData.map((loan, index) => (
          <View key={index} className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: loan.color }}
            />
            <GlobalText className="text-xs text-gray-700">
              {loan.name}
            </GlobalText>
          </View>
        ))}
      </View>
    </View>
  );
}
