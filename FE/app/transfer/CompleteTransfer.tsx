import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import GlobalText from "@/components/GlobalText";

interface TransferData {
  recipient?: {
    ownerName: string;
  };
  amount?: string;
}

export default function CompleteTransfer() {
  const router = useRouter();
  const [completedTransfer, setCompletedTransfer] = useState<TransferData>({});

  useEffect(() => {
    // 컴포넌트 마운트 시 저장된 송금 데이터 불러오기
    const loadCompletedTransfer = async () => {
      try {
        const storedData = await SecureStore.getItemAsync("completedTransfer");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setCompletedTransfer(parsedData);
          // 데이터 표시 후 저장된 데이터 삭제
          await SecureStore.deleteItemAsync("completedTransfer");
        }
      } catch (error) {
        console.error("Error loading completed transfer:", error);
      }
    };

    loadCompletedTransfer();
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
    // 거래내역 보기 기능 추가 예정
    console.log("거래내역 보기");
  };

  const handleHome = () => {
    router.push("/home");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] px-6 pt-8 pb-8 items-center gap-6">
      {/* Spacer */}
      <View className="h-[102px] w-px" />

      {/* 완료 메시지 */}
      <View className="items-center pb-10">
        <View className="w-24 h-30 mb-6 items-center justify-start">
          <CheckCircle size={96} color="#4FC985" />
        </View>
        <GlobalText weight="bold" className="text-2xl text-gray-800 mb-2">
          송금 완료
        </GlobalText>
        <GlobalText className="text-base text-gray-600">
          {completedTransfer.recipient?.ownerName}님에게{" "}
          {formatAmount(completedTransfer.amount || "0")}원을 보냈어요.
        </GlobalText>
      </View>

      {/* 송금 정보 */}
      <View className="w-full bg-white rounded-xl p-6 mb-8">
        <View className="flex-row justify-between py-4 border-b border-gray-100">
          <GlobalText className="text-gray-600">받는 사람</GlobalText>
          <GlobalText className="font-medium">
            {completedTransfer.recipient?.ownerName}
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
      <View className="w-full gap-3">
        <TouchableOpacity
          onPress={handleViewDetails}
          className="w-full border border-gray-200 rounded-xl py-4 items-center"
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
  );
}
