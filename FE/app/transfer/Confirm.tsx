"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Send, Banknote } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

// Friend 인터페이스를 Account 인터페이스로 변경
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
  recentSend?: boolean;
}

export default function SendMoneyConfirm() {
  const [recipient, setRecipient] = useState<Account | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 이전 단계 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedRecipient = await SecureStore.getItemAsync(
          "sendMoneyRecipient"
        );
        const savedAmount = await SecureStore.getItemAsync("sendMoneyAmount");

        if (!savedRecipient || !savedAmount) {
          router.push("/transfer/Account");
          return;
        }

        setRecipient(JSON.parse(savedRecipient));
        setAmount(savedAmount);
      } catch (error) {
        console.error("Error loading data:", error);
        router.push("/transfer/Account");
      }
    };

    loadData();
  }, []);

  // 송금 처리
  const handleSendMoney = () => {
    router.push({
      pathname: "../../components/AppPassword",
      params: {
        title: "송금 비밀번호 입력",
        description: `${recipient?.ownerName}님에게 ${formatAmount(
          amount
        )}원을 송금합니다.`,
        onSuccess: `(password) => {
          const handlePasswordConfirm = ${handlePasswordConfirm.toString()};
          handlePasswordConfirm(password);
        }`,
      },
    });
  };

  // 비밀번호 확인 후 송금 완료 처리
  const handlePasswordConfirm = async (password: string) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear stored data
      await SecureStore.deleteItemAsync("sendMoneyRecipient");
      await SecureStore.deleteItemAsync("sendMoneyAmount");

      setIsLoading(false);

      Alert.alert(
        "송금 완료",
        `${recipient?.ownerName}님의 계좌로 ${Number.parseInt(
          amount
        ).toLocaleString()}원을 송금했습니다.`,
        [
          {
            text: "확인",
            onPress: () => router.push("/"),
          },
        ]
      );
    } catch (error) {
      console.error("Error sending money:", error);
      setIsLoading(false);
      Alert.alert("오류", "송금 중 오류가 발생했습니다.");
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

  return (
    <View className="flex-1 bg-gray-50">
      <View className="w-full max-w-md mx-auto">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center p-5 bg-white">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="p-1"
              onPress={() => router.push("/transfer/Amount")}
            >
              <ChevronLeft className="text-gray-700" size={24} />
            </TouchableOpacity>
            <Text className="text-xl font-bold">송금하기</Text>
          </View>
        </View>

        {/* 진행 단계 표시 */}
        <View className="px-5 py-3 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="flex-col items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#49DB8A] items-center justify-center">
                <Text className="text-white font-bold">✓</Text>
              </View>
              <Text className="text-xs mt-1 font-medium text-[#49DB8A]">
                받는 사람
              </Text>
            </View>
            <View className="flex-1 h-1 bg-[#49DB8A]">
              <View
                className="h-full bg-[#49DB8A]"
                style={{ width: "100%" }}
              ></View>
            </View>
            <View className="flex-col items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#49DB8A] items-center justify-center">
                <Text className="text-white font-bold">✓</Text>
              </View>
              <Text className="text-xs mt-1 font-medium text-[#49DB8A]">
                금액
              </Text>
            </View>
            <View className="flex-1 h-1 bg-[#49DB8A]">
              <View
                className="h-full bg-[#49DB8A]"
                style={{ width: "100%" }}
              ></View>
            </View>
            <View className="flex-col items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#49DB8A] items-center justify-center">
                <Text className="text-white font-bold">3</Text>
              </View>
              <Text className="text-xs mt-1 font-medium text-[#49DB8A]">
                확인
              </Text>
            </View>
          </View>
        </View>

        {/* 송금 정보 확인 */}
        <View className="mx-5 mt-6 bg-white rounded-xl p-6 border border-gray-100">
          <Text className="font-bold text-lg mb-4">송금 정보 확인</Text>

          {/* 받는 사람 정보 */}
          {recipient && (
            <View className="flex-row items-center gap-3 p-3 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-[#49DB8A]/20 items-center justify-center">
                <Banknote className="text-[#49DB8A]" size={18} />
              </View>
              <View>
                <Text className="text-sm text-gray-500">받는 계좌</Text>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="font-medium">{recipient.ownerName}</Text>
                    <Text className="text-xs text-gray-500">
                      {recipient.bankName}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {recipient.accountNumber}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 송금 금액 */}
          <View className="p-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500">송금 금액</Text>
            <Text className="font-bold text-xl">{formatAmount(amount)}원</Text>
          </View>

          {/* 송금 시간 */}
          <View className="p-3">
            <Text className="text-sm text-gray-500">송금 시간</Text>
            <Text className="font-medium">
              {currentDate} {currentTime}
            </Text>
          </View>
        </View>

        {/* 송금 수수료 안내 */}
        <View className="mx-5 mt-4 bg-gray-100 rounded-xl p-4">
          <Text className="text-sm text-gray-600">
            친구에게 송금 시 수수료는 없습니다.
          </Text>
        </View>

        {/* 하단 버튼 */}
        <View className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
          <TouchableOpacity
            className="w-full py-3 bg-[#49DB8A] rounded-lg flex-row items-center justify-center gap-2"
            onPress={handleSendMoney}
          >
            <Send size={18} color="white" />
            <Text className="text-white font-medium">송금하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
