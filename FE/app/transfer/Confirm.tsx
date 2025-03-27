"use client";

import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, Pressable } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Send, Banknote } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import TransferProgress from "./TransferProgress";
import { useTransferStore } from "@/stores/useTransferStore";
import BottomButton from "@/components/Button";
import GlobalText from "@/components/GlobalText";
import { PinInput } from "@/components/PinInput";
import { verifyPassword } from "@/apis/pinApi";

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
  const [showPinInput, setShowPinInput] = useState(false);

  // 컴포넌트 마운트 시 데이터 확인
  useEffect(() => {
    if (!transferData.recipient || !transferData.amount) {
      router.push("/transfer/Account");
    }
  }, []);

  // 송금 처리
  const handleSendMoney = () => {
    setShowPinInput(true);
  };

  // 비밀번호 확인 후 송금 완료 처리
  const handlePasswordConfirm = async (password: string) => {
    setIsLoading(true);

    try {
      // 비밀번호 검증 API 호출
      const response = await verifyPassword(password);

      if (response.success) {
        // Clear stored data
        await SecureStore.deleteItemAsync("sendMoneyRecipient");
        await SecureStore.deleteItemAsync("sendMoneyAmount");
        clearTransferData();

        // 임시로 홈 화면으로 이동 (나중에 송금 완료 페이지로 변경)
        router.push("/home");
      } else {
        Alert.alert(
          "오류",
          response.message || "비밀번호가 일치하지 않습니다."
        );
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      Alert.alert("오류", "비밀번호 검증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  // 현재 날짜 및 시간
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!transferData.recipient || !transferData.amount) {
    return null;
  }

  if (showPinInput) {
    return (
      <PinInput
        title="송금 비밀번호 입력"
        subtitle={`${transferData.recipient?.ownerName}님에게 ${formatAmount(
          transferData.amount
        )}원을 송금합니다.`}
        onPasswordComplete={handlePasswordConfirm}
      />
    );
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
              {transferData.recipient.ownerName}
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
                {transferData.recipient.ownerName}
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
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
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
