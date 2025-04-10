import { useState, useEffect } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Banknote } from "lucide-react-native";
import TransferProgress from "./TransferProgress";
import { useTransferStore } from "@/stores/useTransferStore";
import BottomButton from "@/components/Button";
import GlobalText from "@/components/GlobalText";
import { getBalance } from "@/apis/transferApi";

export default function SendMoneyAmount() {
  const { transferData, setAmount, saveTransferData, loadTransferData } =
    useTransferStore();
  const [localAmount, setLocalAmount] = useState(transferData.amount);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 저장된 데이터 로드 및 수신자 정보 확인
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadTransferData();
        if (!transferData.recipient) {
          router.push("/transfer/Account");
          return;
        }

        // 금액 초기화
        setAmount("");
        setLocalAmount("");

        // 잔액 조회
        const balanceData = await getBalance();
        setBalance(balanceData.balance);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  // transferData.amount가 변경될 때 localAmount 업데이트
  useEffect(() => {
    setLocalAmount(transferData.amount);
  }, [transferData.amount]);

  // 금액 입력 처리
  const handleAmountChange = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, "");
    setLocalAmount(numericValue);
    setAmount(numericValue);
  };

  // 금액 버튼 클릭 처리
  const handleAmountButtonClick = (value: number) => {
    const currentAmount = Number.parseInt(localAmount || "0");
    const newAmount = (currentAmount + value).toString();
    setLocalAmount(newAmount);
    setAmount(newAmount);
  };

  // 다음 단계로 이동
  const handleNext = async () => {
    if (
      localAmount &&
      Number.parseInt(localAmount) > 0 &&
      Number.parseInt(localAmount) <= balance
    ) {
      try {
        await saveTransferData();
        router.push("./Confirm");
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
  };

  // 금액이 잔액을 초과하는지 확인
  const isAmountValid =
    localAmount &&
    Number.parseInt(localAmount) > 0 &&
    Number.parseInt(localAmount) <= balance;

  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  // 수신자 정보가 없는 경우 렌더링하지 않음
  if (!transferData.recipient || isLoading) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Progress Steps */}
        <TransferProgress currentStep={2} />

        {/* 받는 사람 정보 */}
        <View className="m-5 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-full bg-[#49DB8A]/20 items-center justify-center">
              <Banknote color="#49DB8A" size={24} />
            </View>
            <View>
              <View className="flex-row items-center gap-2">
                <GlobalText className="text-lg font-medium">
                  {transferData.recipient.accountHolder}
                </GlobalText>
                <GlobalText className="text-sm text-gray-500">
                  {transferData.recipient.bankName}
                </GlobalText>
              </View>
              <GlobalText className="text-sm text-gray-500">
                {transferData.recipient.accountNumber}
              </GlobalText>
            </View>
          </View>
        </View>

        {/* 금액 입력 */}
        <View className="mx-5 bg-white rounded-xl p-6 border border-gray-100">
          <View className="items-center">
            <GlobalText className="text-sm text-gray-500 mb-5">
              송금 금액
            </GlobalText>
            <View className="flex-row items-center">
              <GlobalText weight="bold" className="text-3xl mr-2">
                {formatAmount(localAmount)}
              </GlobalText>
              <GlobalText className="text-xl">원</GlobalText>
            </View>

            {/* 잔액 표시 */}
            <GlobalText
              className={`text-sm mt-2 ${
                isAmountValid ? "text-gray-500" : "text-red-500"
              }`}
            >
              {isAmountValid
                ? `잔액: ${balance.toLocaleString()}원`
                : localAmount && Number.parseInt(localAmount) > balance
                ? "잔액이 부족합니다"
                : `잔액: ${balance.toLocaleString()}원`}
            </GlobalText>
          </View>

          {/* 빠른 금액 선택 버튼 */}
          <View className="flex-row justify-between mt-6">
            {[1000, 5000, 10000].map((value) => (
              <Pressable
                key={value}
                className="flex-1 py-2 bg-gray-100 rounded-lg mx-1"
                onPress={() => handleAmountButtonClick(value)}
              >
                <GlobalText className="text-sm font-medium text-center">
                  +{value.toLocaleString()}원
                </GlobalText>
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
                  onPress={() =>
                    handleAmountChange(localAmount + num.toString())
                  }
                >
                  <GlobalText className="text-xl font-medium">{num}</GlobalText>
                </Pressable>
              ))}
              <Pressable
                className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                onPress={() => handleAmountChange("")}
              >
                <GlobalText className="text-xl font-medium">취소</GlobalText>
              </Pressable>
              <Pressable
                className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                onPress={() => handleAmountChange(localAmount + "0")}
              >
                <GlobalText className="text-xl font-medium">0</GlobalText>
              </Pressable>
              <Pressable
                className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                onPress={() => handleAmountChange(localAmount.slice(0, -1))}
              >
                <GlobalText className="text-xl font-medium">←</GlobalText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <BottomButton
        onPress={handleNext}
        disabled={!isAmountValid}
        text="다음"
        variant={isAmountValid ? "primary" : "secondary"}
      />
    </View>
  );
}
