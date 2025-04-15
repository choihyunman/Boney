import React, { useEffect, useMemo } from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import GlobalText from "@/components/GlobalText";
import { LoanItem, RepaymentHistoryItem } from "@/apis/loanChildApi";

interface LoanTrendChartProps {
  loans: LoanItem[];
  repaymentHistory: RepaymentHistoryItem[];
}

const { width } = Dimensions.get("window");
const chartWidth = width * 0.67;

export default function LoanTrendChart({
  loans,
  repaymentHistory = [],
}: LoanTrendChartProps) {
  // Validate input data - only require loans to be present
  const hasValidData = useMemo(() => {
    return loans.length > 0;
  }, [loans]);

  // Group repayment history by loan_id using useMemo
  const repaymentByLoanId = useMemo(() => {
    if (!hasValidData) return [];

    const grouped = loans.map((loan) => {
      const repayments = repaymentHistory.filter(
        (repayment) => repayment.loan_id === loan.loan_id
      );
      return repayments;
    });

    return grouped;
  }, [loans, repaymentHistory, hasValidData]);

  // Create datasets for individual loans
  const datasets = useMemo(() => {
    if (!hasValidData) return [];

    // Check if there's any repayment history
    const hasRepaymentHistory = repaymentHistory.length > 0;

    // If there's no repayment history, create a dataset with due date as reference
    if (!hasRepaymentHistory) {
      // Create datasets for individual loans
      const individualDatasets = loans.map((loan, index) => {
        const colors = ["#5E1675", "#EE4266", "#FFD23F", "#3E77E9"];
        const color = colors[index % colors.length];

        // Create data points for the loan
        const dataPoints = [];

        // Add initial point with loan amount
        dataPoints.push({
          value: loan.loan_amount,
          label: "",
          dataPointText: "",
        });

        // Add current point with last_amount
        if (loan.due_date) {
          const dueDate = new Date(loan.due_date);
          dataPoints.push({
            value: loan.last_amount,
            label: `${dueDate.getMonth() + 1}.${dueDate.getDate()}`,
            dataPointText: "",
          });
        } else {
          // If no due date, just show current amount
          dataPoints.push({
            value: loan.last_amount,
            label: "",
            dataPointText: "",
          });
        }

        return {
          data: dataPoints,
          color: () => color,
          strokeWidth: 2,
        };
      });

      // Create dataset for total amount
      const totalInitialAmount = loans.reduce(
        (sum, loan) => sum + loan.loan_amount,
        0
      );
      const totalCurrentAmount = loans.reduce(
        (sum, loan) => sum + loan.last_amount,
        0
      );

      // Find the earliest due date for the total line
      const dueDates = loans
        .filter((loan) => loan.due_date)
        .map((loan) => new Date(loan.due_date))
        .sort((a, b) => a.getTime() - b.getTime());

      const earliestDueDate = dueDates.length > 0 ? dueDates[0] : null;

      const totalDataPoints = [
        {
          value: totalInitialAmount,
          label: "",
          dataPointText: "",
        },
      ];

      if (earliestDueDate) {
        totalDataPoints.push({
          value: totalCurrentAmount,
          label: `${
            earliestDueDate.getMonth() + 1
          }.${earliestDueDate.getDate()}`,
          dataPointText: "",
        });
      } else {
        totalDataPoints.push({
          value: totalCurrentAmount,
          label: "",
          dataPointText: "",
        });
      }

      const totalDataset = {
        data: totalDataPoints,
        color: () => "#4FC985",
        strokeWidth: 2,
      };

      return [totalDataset, ...individualDatasets];
    }

    // Get all unique dates from all repayments
    const allDates = [
      ...new Set(
        repaymentHistory
          .map((r) => r.repayment_date)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      ),
    ];

    // Calculate total initial amount
    const totalInitialAmount = loans.reduce(
      (sum, loan) => sum + loan.loan_amount,
      0
    );

    // Create datasets for individual loans
    const individualDatasets = repaymentByLoanId.map((repayments, index) => {
      const colors = ["#5E1675", "#EE4266", "#FFD23F", "#3E77E9"];
      const color = colors[index % colors.length];
      const loan = loans[index];

      // Create initial data point with loan amount
      const initialPoint = {
        value: loan.loan_amount,
        label: "", // Empty label for initial point
        dataPointText: "",
      };

      // Create data points for each date
      const datePoints = allDates.map((date) => {
        // Find the repayment for this loan and date
        const repayment = repayments.find((r) => r.repayment_date === date);

        if (!repayment) {
          // If no repayment found for this date, find the last known amount
          const previousRepayment = repayments
            .filter((r) => new Date(r.repayment_date) < new Date(date))
            .sort(
              (a, b) =>
                new Date(b.repayment_date).getTime() -
                new Date(a.repayment_date).getTime()
            )[0];

          const amount = previousRepayment
            ? previousRepayment.remaining_amount
            : loan.loan_amount;

          const dateObj = new Date(date);
          return {
            value: amount,
            label: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
            dataPointText: "",
            isEmpty: true,
          };
        }

        const dateObj = new Date(date);
        return {
          value: repayment.remaining_amount,
          label: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
          dataPointText: "",
        };
      });

      // Combine initial point with date points
      const dataPoints = [initialPoint, ...datePoints];

      return {
        data: dataPoints,
        color: () => color,
        strokeWidth: 2,
      };
    });

    // Create dataset for total amount
    const totalInitialPoint = {
      value: totalInitialAmount,
      label: "", // Empty label for initial point
      dataPointText: "",
    };

    // Create data points for total amount
    const totalDatePoints = allDates.map((date) => {
      // Calculate total remaining amount for this date
      const totalRemaining = loans.reduce((sum, loan) => {
        const repayments = repaymentHistory.filter(
          (r) => r.loan_id === loan.loan_id
        );
        const repayment = repayments.find((r) => r.repayment_date === date);

        if (!repayment) {
          // If no repayment found for this date, find the last known amount
          const previousRepayment = repayments
            .filter((r) => new Date(r.repayment_date) < new Date(date))
            .sort(
              (a, b) =>
                new Date(b.repayment_date).getTime() -
                new Date(a.repayment_date).getTime()
            )[0];

          return (
            sum +
            (previousRepayment
              ? previousRepayment.remaining_amount
              : loan.loan_amount)
          );
        }

        return sum + repayment.remaining_amount;
      }, 0);

      const dateObj = new Date(date);
      return {
        value: totalRemaining,
        label: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
        dataPointText: "",
      };
    });

    // Combine initial point with date points for total
    const totalDataPoints = [totalInitialPoint, ...totalDatePoints];

    // Add total dataset
    const totalDataset = {
      data: totalDataPoints,
      color: () => "#4FC985",
      strokeWidth: 2,
    };

    return [totalDataset, ...individualDatasets];
  }, [loans, repaymentByLoanId, hasValidData, repaymentHistory]);

  // Calculate max value for y-axis using useMemo
  const maxValue = useMemo(() => {
    if (!hasValidData) return 0;

    // Check if there's any repayment history
    const hasRepaymentHistory = repaymentHistory.length > 0;

    if (!hasRepaymentHistory) {
      // If no repayment history, use the current loan amounts
      const totalInitialAmount = loans.reduce(
        (sum, loan) => sum + loan.loan_amount,
        0
      );
      const totalCurrentAmount = loans.reduce(
        (sum, loan) => sum + loan.last_amount,
        0
      );
      const maxLoanAmount = Math.max(...loans.map((loan) => loan.loan_amount));
      const actualMax = Math.max(
        totalInitialAmount,
        totalCurrentAmount,
        maxLoanAmount
      );

      // Round up to the nearest 10000 (1만)
      return Math.ceil(actualMax / 10000) * 10000;
    }

    // Find the actual maximum value from total amounts
    const totalInitialAmount = loans.reduce(
      (sum, loan) => sum + loan.loan_amount,
      0
    );
    const maxRemainingAmount = Math.max(
      ...repaymentHistory.map((repayment) => {
        const loanRepayments = repaymentHistory.filter(
          (r) => r.loan_id === repayment.loan_id
        );
        const totalRemaining = loanRepayments.reduce(
          (sum, r) => sum + r.remaining_amount,
          0
        );
        return totalRemaining;
      })
    );

    const actualMax = Math.max(totalInitialAmount, maxRemainingAmount);

    // Round up to the nearest 10000 (1만)
    return Math.ceil(actualMax / 10000) * 10000;
  }, [loans, repaymentHistory, hasValidData]);

  // Create props for LineChart with multiple lines using useMemo
  const chartProps = useMemo(() => {
    if (!hasValidData || datasets.length === 0) {
      return null;
    }

    // Simple format function that just adds commas and "원"
    const formatAmount = (value: number) => {
      return value.toLocaleString() + "원";
    };

    // Calculate section values based on the actual max value
    const maxAmount = maxValue;
    const sectionCount = 5;

    // Create evenly spaced section values
    const sectionValues = Array.from({ length: sectionCount + 1 }, (_, i) =>
      Math.round((i * maxAmount) / sectionCount)
    );

    const props: any = {
      data: datasets[0]?.data || [],
      height: 180,
      width: chartWidth,
      spacing: 30,
      initialSpacing: 0,
      color1: "#4FC985",
      thickness: 0,
      startFillColor: "#4FC985".replace(")", ", 0.3)").replace("rgb", "rgba"),
      endFillColor: "#4FC985".replace(")", ", 0.1)").replace("rgb", "rgba"),
      startOpacity: 0.3,
      endOpacity: 0.1,
      backgroundColor: "white",
      xAxisColor: "#E2E8F0",
      yAxisColor: "#E2E8F0",
      yAxisTextStyle: { color: "#374151", fontSize: 10 },
      xAxisLabelTextStyle: { color: "#374151", fontSize: 10 },
      hideDataPoints: true,
      dataPointsColor1: "#4FC985",
      dataPointsRadius: 0,
      noOfSections: sectionCount,
      maxValue: maxAmount,
      minValue: 0,
      yAxisLabelTexts: sectionValues.map(formatAmount),
      isAnimated: true,
      animationDuration: 300,
      animationStartTime: 0,
      showVerticalLines: false,
      verticalLinesColor: "rgba(226, 232, 240, 0.5)",
      verticalLinesSpacing: 30,
      showXAxisIndices: false,
      xAxisIndicesColor: "#E2E8F0",
      xAxisIndicesHeight: 4,
      xAxisIndicesWidth: 1,
      showYAxisIndices: false,
      yAxisIndicesColor: "#E2E8F0",
      yAxisIndicesWidth: 1,
      yAxisIndicesHeight: 4,
      curved: true,
      curvature: 0.2,
      areaChart: true,
      hideRules: true,
      rulesColor: "transparent",
      showFractionalValues: false,
      roundToDigits: 0,
      horizSections: sectionValues.map((value) => ({ value })),
    };

    // Add additional datasets for individual loans
    if (datasets.length > 1) {
      datasets.slice(1).forEach((dataset, index) => {
        const colorIndex = index + 1;
        const baseColor = dataset.color();
        props[`data${colorIndex + 1}`] = dataset.data;
        props[`color${colorIndex + 1}`] = baseColor;
        props[`dataPointsColor${colorIndex + 1}`] = baseColor;
        props[`startFillColor${colorIndex + 1}`] = baseColor
          .replace(")", ", 0.3)")
          .replace("rgb", "rgba");
        props[`endFillColor${colorIndex + 1}`] = baseColor
          .replace(")", ", 0.1)")
          .replace("rgb", "rgba");
        props[`thickness${colorIndex + 1}`] = 0;
        props[`startOpacity${colorIndex + 1}`] = 0.3;
        props[`endOpacity${colorIndex + 1}`] = 0.1;
        props[`hideDataPoints${colorIndex + 1}`] = true;
        props[`dataPointsRadius${colorIndex + 1}`] = 0;
        props[`curved${colorIndex + 1}`] = true;
        props[`curvature${colorIndex + 1}`] = 0.2;
        props[`areaChart${colorIndex + 1}`] = true;
        props[`animationStartTime${colorIndex + 1}`] = 0;
      });
    }

    return props;
  }, [datasets, maxValue, hasValidData]);

  if (!hasValidData) {
    return (
      <View className="bg-white rounded-xl p-4 my-2 mx-6">
        <GlobalText weight="bold" className="text-lg text-gray-800 mb-4">
          대출 추이
        </GlobalText>
        <View className="h-64 items-center justify-center">
          <GlobalText className="text-gray-500">
            대출 데이터가 없습니다.
          </GlobalText>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 my-2 mx-6">
      <GlobalText weight="bold" className="text-lg text-gray-800 mb-4">
        대출 추이
      </GlobalText>
      <View className="h-64 items-center">
        {chartProps ? (
          <LineChart
            key={`chart-${repaymentHistory.length}-${datasets.length}`}
            {...chartProps}
          />
        ) : (
          <View className="h-64 items-center justify-center">
            <GlobalText className="text-gray-500">
              차트 데이터를 처리중입니다...
            </GlobalText>
          </View>
        )}
      </View>

      {/* 범례 */}
      <View className="flex-row flex-wrap justify-center items-center mt-4 gap-4">
        {datasets.map((dataset, index) => (
          <View key={index} className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: dataset.color() }}
            />
            <GlobalText className="text-xs text-gray-700">
              {index === 0 ? "전체" : `대출 ${index}`}
            </GlobalText>
          </View>
        ))}
      </View>
    </View>
  );
}
