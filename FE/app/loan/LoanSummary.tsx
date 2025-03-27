import { View } from "react-native";
import GlobalText from "@/components/GlobalText";

type Props = {
  title: string;
  count: number;
  totalAmount?: number; // optional
};

export default function LoanSummary({ title, count, totalAmount }: Props) {
  return (
    <View className="mt-8 px-6 mb-3">
      <View className="flex-row items-center gap-x-1 mb-1">
        <GlobalText weight="bold" className="text-2xl text-gray-800">
          {title}
        </GlobalText>
        <View className="bg-[#4FC985] px-2 py-0.5 rounded-full">
          <GlobalText weight="bold" className="text-white text-md">
            {count}건
          </GlobalText>
        </View>
      </View>

      {totalAmount !== undefined && (
        <GlobalText className="text-gray-500">
          총 {totalAmount.toLocaleString()}원
        </GlobalText>
      )}
    </View>
  );
}
