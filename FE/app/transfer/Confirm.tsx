import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import TransferProgress from "./TransferProgress";
import { useTransferStore } from "@/stores/useTransferStore";
import BottomButton from "@/components/Button";
import GlobalText from "@/components/GlobalText";
import { verifyPassword } from "@/apis/pinApi";
import { transferMoney } from "@/apis/transferApi";

// Friend 인터페이스를 Account 인터페이스로 변경
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
  recentSend?: boolean;
}

export default function SendMoneyConfirm() {
  const { transferData, clearTransferData } = useTransferStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!transferData.recipient || !transferData.amount) {
      router.push("/transfer/Account");
    }
  }, []);

  const handleSendMoney = () => {
    router.push("/transfer/ConfirmPin");
  };

  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  if (!transferData.recipient || !transferData.amount) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Progress Steps */}
        <TransferProgress currentStep={3} />

        {/* 확인 메시지 */}
        <View className="items-center py-16 px-6 mx-5 mt-8">
          <GlobalText className="text-2xl font-medium text-center">
            <GlobalText className="text-[#4FC985]">
              {transferData.recipient.accountHolder}
            </GlobalText>
            님에게{"\n"}
            <GlobalText className="text-[#4FC985]">
              {formatAmount(transferData.amount)}원
            </GlobalText>
            을 보낼까요?
          </GlobalText>
        </View>

        {/* 송금 정보 확인 */}
        <View className="mx-5 mt-5 bg-white rounded-xl p-6 border border-gray-100">
          {/* 받는 사람 정보 */}
          <View>
            {/* 받는 사람 */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <GlobalText className="text-sm text-gray-500">
                받는 사람
              </GlobalText>
              <GlobalText className="text-sm font-medium">
                {transferData.recipient.accountHolder}
              </GlobalText>
            </View>

            {/* 입금 계좌 */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <GlobalText className="text-sm text-gray-500">
                입금 계좌
              </GlobalText>
              <GlobalText className="text-sm font-medium">
                {transferData.recipient.bankName}
              </GlobalText>
            </View>

            {/* 계좌 번호 */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <GlobalText className="text-sm text-gray-500">
                계좌 번호
              </GlobalText>
              <GlobalText className="text-sm font-medium">
                {transferData.recipient.accountNumber}
              </GlobalText>
            </View>

            {/* 송금 금액 */}
            <View className="flex-row justify-between items-center py-4">
              <GlobalText className="text-sm text-gray-500">
                송금 금액
              </GlobalText>
              <GlobalText className="text-sm font-medium">
                {formatAmount(transferData.amount)}원
              </GlobalText>
            </View>
          </View>
        </View>

        {/* 송금 수수료 안내 */}
        <View className="mx-5 mt-4 bg-gray-100 rounded-xl p-4">
          <GlobalText className="text-sm text-gray-600">
            계좌 이체 시 수수료는 없습니다.
          </GlobalText>
        </View>
      </View>

      {/* 하단 버튼 */}
      <BottomButton onPress={handleSendMoney} text="송금하기" />
    </View>
  );
}
