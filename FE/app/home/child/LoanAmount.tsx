import { View, TouchableOpacity } from "react-native";
import GlobalText from "@/components/GlobalText";
import { HandCoins } from "lucide-react-native";
import { useHomeStore } from "@/stores/useHomeStore";
import { router } from "expo-router";

export default function LoanAmount() {
  const { childData } = useHomeStore();

  if (!childData) return null;

  return (
    <View className="flex-row justify-between items-center mb-2">
      <View>
        <GlobalText className="text-base text-gray-500">대출 총액</GlobalText>
        <GlobalText className="text-2xl font-bold">
          {Number(childData.all_loan).toLocaleString()}원
        </GlobalText>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/loan/child")}
        className="bg-gray-600 px-4 py-2 rounded-full flex-row items-center gap-1 mt-1"
      >
        <HandCoins size={16} color="white" />
        <GlobalText className="text-white text-base">상환</GlobalText>
      </TouchableOpacity>
    </View>
  );
}
