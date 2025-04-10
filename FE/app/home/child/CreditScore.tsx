import { View } from "react-native";
import GlobalText from "@/components/GlobalText";
import { PieChart } from "react-native-gifted-charts";
import { useHomeStore } from "@/stores/useHomeStore";

interface CreditScoreDonutProps {
  score: number;
  label: string;
  isAverage?: boolean;
}

function CreditScoreDonut({
  score,
  label,
  isAverage = false,
}: CreditScoreDonutProps) {
  // Determine color based on score
  let color = "#CBD5E1"; // Default gray for average score

  if (!isAverage) {
    if (score <= 30) {
      color = "#EF4444"; // Red for low scores
    } else if (score <= 79) {
      color = "#FFD700"; // Yellow for medium scores
    } else {
      color = "#4FC985"; // Green for high scores
    }
  }

  const data = [
    { value: score, color: color },
    { value: 100 - score, color: "#F9FAFB" },
  ];

  return (
    <View className="relative w-28 h-28">
      <PieChart
        data={data}
        donut
        showText
        textColor={color}
        textSize={20}
        radius={45}
        innerRadius={35}
        focusOnPress
        centerLabelComponent={() => (
          <View className="items-center">
            <GlobalText weight="bold" className="text-2xl" style={{ color }}>
              {score}
            </GlobalText>
            <GlobalText className="text-sm text-gray-600">{label}</GlobalText>
          </View>
        )}
      />
    </View>
  );
}

export default function CreditScoreSection() {
  const { childData } = useHomeStore();

  if (!childData) return null;

  return (
    <View className="bg-white rounded-xl p-4">
      <GlobalText weight="bold" className="text-lg mb-4">
        신용 점수
      </GlobalText>
      <View className="flex-row justify-around">
        <View className="items-center">
          <CreditScoreDonut score={childData.credit_score} label="나의 점수" />
        </View>

        <View className="items-center">
          <CreditScoreDonut
            score={childData.all_score}
            label="평균 점수"
            isAverage={true}
          />
        </View>
      </View>
    </View>
  );
}
