import { View } from "react-native";
import GlobalText from "@/components/GlobalText";

interface QuestRowItemProps {
  // 왼쪽 텍스트
  title: string;
  subtitle?: string;
  titleSize?: string; // 예: 'text-base', 'text-lg' 등
  subtitleSize?: string;

  // 오른쪽 텍스트
  value: string;
  valueColor?: string; // 예: 'text-[#4FC985]' 같은 커스텀 색상
  subValue?: string;
}

export default function HistoryItem({
  title,
  subtitle,
  titleSize = "text-base",
  subtitleSize = "text-sm",
  value,
  valueColor = "text-gray-800",
  subValue,
}: QuestRowItemProps) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      {/* 왼쪽 영역 */}
      <View>
        <GlobalText
          weight="bold"
          className={`${titleSize} font-medium text-gray-800`}
        >
          {title}
        </GlobalText>
        {subtitle && (
          <GlobalText
            className={`${subtitleSize} font-medium text-gray-900 mt-1`}
          >
            {subtitle}
          </GlobalText>
        )}
      </View>

      {/* 오른쪽 영역 */}
      <View className="items-end">
        <GlobalText weight="bold" className={`text-lg ${valueColor}`}>
          {value}
        </GlobalText>
        {subValue && (
          <GlobalText className="text-xs text-gray-500 mt-1">
            {subValue}
          </GlobalText>
        )}
      </View>
    </View>
  );
}
