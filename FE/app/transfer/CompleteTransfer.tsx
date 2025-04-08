import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useTransferStore } from "@/stores/useTransferStore";

interface TransferData {
  recipient?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  amount?: string;
}

export default function CompleteTransfer() {
  const router = useRouter();
  const { transferData, clearTransferData } = useTransferStore();
  const [completedTransfer, setCompletedTransfer] = useState<TransferData>({});

  useEffect(() => {
    // 컴포넌트 마운트 시 transfer store의 데이터 사용
    if (transferData.recipient && transferData.amount) {
      setCompletedTransfer({
        recipient: transferData.recipient,
        amount: transferData.amount,
      });
    } else {
      // 데이터가 없으면 홈으로 이동
      router.push("/home");
    }
  }, [transferData]);

  // 컴포넌트 언마운트 시 transfer store 초기화
  useEffect(() => {
    return () => {
      clearTransferData();
    };
  }, []);

  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const handleViewDetails = () => {
    router.push("/transaction");
  };

  const handleHome = () => {
    router.push("/home");
  };

  // 데이터가 없으면 아무것도 표시하지 않음
  if (!completedTransfer.recipient || !completedTransfer.amount) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6F8]">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 py-8 items-center gap-6">
          {/* 완료 메시지 */}
          <View className="items-center flex-shrink-0">
            <View className="w-24 h-24 mb-6 items-center justify-center">
              <CheckCircle size={96} color="#4FC985" />
            </View>
            <GlobalText weight="bold" className="text-2xl text-gray-800 mb-2">
              송금 완료
            </GlobalText>
            <GlobalText className="text-base text-gray-600 text-center">
              {completedTransfer.recipient?.accountHolder}님에게{" "}
              {formatAmount(completedTransfer.amount || "0")}원을 보냈어요.
            </GlobalText>
          </View>

          {/* 송금 정보 */}
          <View className="w-full bg-white rounded-xl p-6 flex-shrink-0">
            <View className="flex-row justify-between py-4 border-b border-gray-100">
              <GlobalText className="text-gray-600">받는 사람</GlobalText>
              <GlobalText className="font-medium">
                {completedTransfer.recipient?.accountHolder}
              </GlobalText>
            </View>
            <View className="flex-row justify-between py-4 border-b border-gray-100">
              <GlobalText className="text-gray-600">송금 금액</GlobalText>
              <GlobalText className="font-medium">
                {formatAmount(completedTransfer.amount || "0")}원
              </GlobalText>
            </View>
            <View className="flex-row justify-between py-4">
              <GlobalText className="text-gray-600">송금 시간</GlobalText>
              <GlobalText className="font-medium">
                {getCurrentDateTime()}
              </GlobalText>
            </View>
          </View>

          {/* 버튼 영역 */}
          <View className="w-full gap-3 mt-auto">
            <TouchableOpacity
              onPress={handleViewDetails}
              className="w-full bg-white rounded-xl py-4 items-center"
            >
              <GlobalText className="text-gray-700 text-base font-medium">
                거래내역 보기
              </GlobalText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleHome}
              className="w-full bg-[#4FC985] rounded-xl py-4 items-center"
            >
              <GlobalText className="text-white text-base font-medium">
                홈으로 가기
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
