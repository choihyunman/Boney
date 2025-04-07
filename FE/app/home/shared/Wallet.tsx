import { View, TouchableOpacity } from "react-native";
import { Send, Wallet, ChevronRight } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import LoanAmount from "../child/LoanAmount";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHomeStore } from "@/stores/useHomeStore";
import { router } from "expo-router";

export default function BalanceSection() {
  const user = useAuthStore((state) => state.user);
  const { childData, parentData } = useHomeStore();

  const data = user?.role === "CHILD" ? childData : parentData;
  if (!data) return null;

  return (
    <View className="bg-white rounded-xl p-4 mb-4">
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-2 bg-[#4FC985]/10 px-4 py-2 my-1 rounded-full">
          <Wallet size={24} color="#4FC985" />
          <View className="flex-row items-center">
            <GlobalText className="font-bold leading-[1.3] text-gray-800 text-lg">
              {user?.userName}
            </GlobalText>
            <GlobalText className="text-gray-800">님의 지갑</GlobalText>
          </View>
        </View>
      </View>
      <View className="flex flex-col mt-4">
        <View className="flex-row justify-between items-center">
          <View>
            <View>
              <GlobalText className="text-base text-gray-500">
                현재 잔액
              </GlobalText>
              <GlobalText className="text-2xl font-bold">
                {Number(data.account_balance).toLocaleString()}원
              </GlobalText>
            </View>
            <View className="flex-row items-center gap-1 mt-2">
              <GlobalText className="text-sm text-gray-500">
                출금계좌
              </GlobalText>
              <GlobalText className="text-base text-gray-500">|</GlobalText>
              <GlobalText className="text-base text-gray-600">
                {data.bank_name}
              </GlobalText>
            </View>
            <GlobalText className="text-sm text-gray-400">
              {data.account_number}
            </GlobalText>
          </View>

          <View className="self-center">
            <TouchableOpacity
              className="bg-[#4FC985] px-4 py-2 rounded-full flex-row items-center gap-1"
              onPress={() => router.push("/transfer")}
            >
              <Send size={16} color="white" />
              <GlobalText className="text-white text-base">송금</GlobalText>
            </TouchableOpacity>
          </View>
        </View>

        {user?.role === "CHILD" && (
          <View>
            <View className="h-px bg-gray-100 my-5" />
            <LoanAmount />
          </View>
        )}
      </View>
    </View>
  );
}
