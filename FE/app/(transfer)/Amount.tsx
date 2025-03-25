import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, User, ArrowRight, Banknote } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

// 친구 정보 타입 정의
interface Friend {
  id: string;
  name: string;
  phoneNumber: string;
  recentSend?: boolean;
}

// 계좌 정보 타입 정의
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
  recentSend?: boolean;
}

export default function SendMoneyAmount() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<Friend | Account | null>(null);
  const [isAccount, setIsAccount] = useState(false);

  // 잔액 (예시 데이터)
  const balance = 25000;

  // 컴포넌트 마운트 시 이전 단계 데이터 로드 (있는 경우에만)
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedRecipient = await SecureStore.getItemAsync(
          "sendMoneyRecipient"
        );
        if (savedRecipient) {
          const recipientData = JSON.parse(savedRecipient);
          setRecipient(recipientData);
          setIsAccount("bankName" in recipientData);
        }

        const savedAmount = await SecureStore.getItemAsync("sendMoneyAmount");
        if (savedAmount) {
          setAmount(savedAmount);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };

    loadSavedData();
  }, []);

  // 금액 입력 처리
  const handleAmountChange = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, "");
    setAmount(numericValue);
  };

  // 금액 버튼 클릭 처리
  const handleAmountButtonClick = (value: number) => {
    const currentAmount = Number.parseInt(amount || "0");
    setAmount((currentAmount + value).toString());
  };

  // 다음 단계로 이동
  const handleNext = async () => {
    if (
      amount &&
      Number.parseInt(amount) > 0 &&
      Number.parseInt(amount) <= balance
    ) {
      try {
        await SecureStore.setItemAsync("sendMoneyAmount", amount);

        // 수신자 정보가 없는 경우 기본 데이터 저장
        if (!recipient) {
          const defaultRecipient: Friend = {
            id: "default",
            name: "테스트 사용자",
            phoneNumber: "010-0000-0000",
          };
          await SecureStore.setItemAsync(
            "sendMoneyRecipient",
            JSON.stringify(defaultRecipient)
          );
        }

        router.push("./Confirm");
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
  };

  // 금액이 잔액을 초과하는지 확인
  const isAmountValid =
    amount && Number.parseInt(amount) > 0 && Number.parseInt(amount) <= balance;

  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  // 수신자 정보 렌더링
  const renderRecipientInfo = () => {
    if (!recipient) {
      // 수신자 정보가 없는 경우 기본 UI 표시
      return (
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#49DB8A]/20 items-center justify-center">
            <User color="#49DB8A" size={18} />
          </View>
          <View>
            <Text className="font-medium">테스트 사용자</Text>
            <Text className="text-xs text-gray-500">010-0000-0000</Text>
          </View>
        </View>
      );
    }

    if (isAccount) {
      const accountInfo = recipient as Account;
      return (
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#49DB8A]/20 items-center justify-center">
            <Banknote color="#49DB8A" size={18} />
          </View>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="font-medium">{accountInfo.ownerName}</Text>
              <Text className="text-xs text-gray-500">
                {accountInfo.bankName}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              {accountInfo.accountNumber}
            </Text>
          </View>
        </View>
      );
    } else {
      const friendInfo = recipient as Friend;
      return (
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#49DB8A]/20 items-center justify-center">
            <User color="#49DB8A" size={18} />
          </View>
          <View>
            <Text className="font-medium">{friendInfo.name}</Text>
            <Text className="text-xs text-gray-500">
              {friendInfo.phoneNumber}
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 헤더 */}
        <View className="bg-white p-5">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()}>
              <ChevronLeft color="#374151" size={24} />
            </Pressable>
            <Text className="text-xl font-bold">송금하기</Text>
          </View>
        </View>

        {/* 진행 단계 표시 */}
        <View className="px-5 py-3 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#49DB8A] items-center justify-center">
                <Text className="text-white font-bold">✓</Text>
              </View>
              <Text className="text-xs mt-1 font-medium text-[#49DB8A]">
                받는 사람
              </Text>
            </View>
            <View className="flex-1 h-1 bg-[#49DB8A]" />
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#49DB8A] items-center justify-center">
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="text-xs mt-1 font-medium text-[#49DB8A]">
                금액
              </Text>
            </View>
            <View className="flex-1 h-1 bg-gray-200" />
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-gray-600 font-bold">3</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">확인</Text>
            </View>
          </View>
        </View>

        {/* 받는 사람 정보 */}
        <View className="mx-5 mt-4 bg-white rounded-xl p-4 border border-gray-100">
          {renderRecipientInfo()}
        </View>

        {/* 금액 입력 */}
        <View className="mx-5 mt-6 bg-white rounded-xl p-6 border border-gray-100">
          <View className="items-center">
            <Text className="text-sm text-gray-500 mb-2">송금 금액</Text>
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold mr-2">
                {formatAmount(amount)}
              </Text>
              <Text className="text-xl">원</Text>
            </View>

            {/* 잔액 표시 */}
            <Text
              className={`text-sm mt-2 ${
                isAmountValid ? "text-gray-500" : "text-red-500"
              }`}
            >
              {isAmountValid
                ? `잔액: ${balance.toLocaleString()}원`
                : amount && Number.parseInt(amount) > balance
                ? "잔액이 부족합니다"
                : `잔액: ${balance.toLocaleString()}원`}
            </Text>
          </View>

          {/* 빠른 금액 선택 버튼 */}
          <View className="flex-row justify-between mt-6">
            {[1000, 5000, 10000].map((value) => (
              <Pressable
                key={value}
                className="flex-1 py-2 bg-gray-100 rounded-lg mx-1"
                onPress={() => handleAmountButtonClick(value)}
              >
                <Text className="text-sm font-medium text-center">
                  +{value.toLocaleString()}원
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 숫자 키패드 */}
          <View className="mt-6">
            <View className="flex-row flex-wrap justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Pressable
                  key={num}
                  className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center mb-4"
                  onPress={() => handleAmountChange(amount + num.toString())}
                >
                  <Text className="text-xl font-medium">{num}</Text>
                </Pressable>
              ))}
              <Pressable
                className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                onPress={() => handleAmountChange("")}
              >
                <Text className="text-xl font-medium">C</Text>
              </Pressable>
              <Pressable
                className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                onPress={() => handleAmountChange(amount + "0")}
              >
                <Text className="text-xl font-medium">0</Text>
              </Pressable>
              <Pressable
                className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                onPress={() => handleAmountChange(amount.slice(0, -1))}
              >
                <Text className="text-xl font-medium">←</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="p-5 bg-white border-t border-gray-100">
        <Pressable
          className={`py-3 rounded-lg flex-row items-center justify-center ${
            isAmountValid ? "bg-[#49DB8A]" : "bg-gray-200"
          }`}
          onPress={handleNext}
          disabled={!isAmountValid}
        >
          <Text
            className={`font-medium mr-2 ${
              isAmountValid ? "text-white" : "text-gray-400"
            }`}
          >
            다음
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
