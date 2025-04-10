import GlobalText from "@/components/GlobalText";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import {
  useRepaymentResultStore,
  useRepaymentStateStore,
  useLoanListStore,
} from "@/stores/useLoanChildStore";
import BottomButton from "@/components/Button";
import { getBalance } from "@/apis/transferApi";
import { useEffect } from "react";
import { useState } from "react";
import { PinInput } from "@/components/PinInput";
import { usePinStateStore } from "@/stores/usePinStore";
import { repayLoan, getLoanList } from "@/apis/loanChildApi";
import { getLoanDetail } from "@/apis/loanParentApi";

export default function Repayment() {
  const { loanId } = useLocalSearchParams();
  console.log("loanId: ", loanId);
  const [loanDetail, setLoanDetail] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [remainingDays, setRemainingDays] = useState<string>("");
  const [remainingDaysColor, setRemainingDaysColor] = useState<string>("");

  const { repaymentAmount, setRepaymentAmount, reset } =
    useRepaymentStateStore();
  const [localAmount, setLocalAmount] = useState(repaymentAmount);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPinInput, setShowPinInput] = useState(false);
  const { pin, setPin, reset: resetPin } = usePinStateStore();
  const { setRepaymentResult } = useRepaymentResultStore();

  // 남은 일수 계산 + 색상 적용
  const getDdayInfo = (dueDate: string) => {
    if (!dueDate) return { text: "-", color: "text-black" };

    const today = new Date();
    const due = new Date(dueDate);

    // 시/분/초 제거
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diff = due.getTime() - today.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) return { text: "D-Day", color: "text-[#4FC985]" };
    if (dayDiff > 0) return { text: `D-${dayDiff}`, color: "text-[#4FC985]" };
    return { text: `D+${Math.abs(dayDiff)}`, color: "text-[#D6456B]" };
  };

  // 컴포넌트 마운트 시 저장된 데이터 로드 및 수신자 정보 확인
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 대출 상세 정보 조회
        const loanDetailData = await getLoanDetail(Number(loanId));
        console.log("대출 상세 정보: ", loanDetailData);
        setLoanDetail(loanDetailData);
        setTotalAmount(loanDetailData.loan_amount);
        setRemainingAmount(loanDetailData.last_amount);
        console.log("초기 설정 - 총 대출액: ", loanDetailData.loan_amount);
        console.log("초기 설정 - 남은 대출액: ", loanDetailData.last_amount);
        const ddayInfo = getDdayInfo(loanDetailData.due_date);
        setRemainingDays(ddayInfo.text);
        setRemainingDaysColor(ddayInfo.color);

        // 잔액 조회
        const balanceData = await getBalance();
        console.log("잔액 정보: ", balanceData);
        setBalance(balanceData.balance);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
      reset();
      resetPin();
    };
    initializeData();

    // cleanup 함수: 화면을 나갈 때 초기화
    return () => {
      reset();
      resetPin();
    };
  }, [loanId]);

  // 금액 입력 처리
  const handleAmountChange = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, "");
    setRepaymentAmount(Number(numericValue));
    setLocalAmount(Number(numericValue));
  };

  // 금액 버튼 클릭 처리
  const handleAmountButtonClick = (value: number | string) => {
    const currentAmount = Number.parseInt(String(localAmount || "0"));
    let newAmount: number;

    if (value === "전액") {
      console.log("전액 선택 시 - 남은 대출액: ", remainingAmount);
      console.log("전액 선택 시 - 총 대출액: ", totalAmount);
      newAmount = remainingAmount;
    } else {
      newAmount = currentAmount + (value as number);
    }

    console.log("설정될 금액: ", newAmount);
    setRepaymentAmount(newAmount);
    setLocalAmount(newAmount);
  };

  const handlePasswordInput = async (password: string) => {
    if (
      localAmount &&
      Number.parseInt(String(localAmount)) > 0 &&
      Number.parseInt(String(localAmount)) <= balance
    ) {
      console.log("password: ", password);
      console.log("대출 상환 시작");
      try {
        const res = await repayLoan({
          loan_id: Number(loanId),
          repayment_amount: localAmount,
          password: password,
        });
        console.log(
          "대출 상환 정보: loanId: ",
          loanId,
          "repayment_amount: ",
          localAmount,
          "password: ",
          password
        );
        setRepaymentResult(res);
        
        router.replace("./RepaymentComplete");
      } catch (error) {
        console.error("대출 상환 실패:", error);
      }
    }
  };

  if (showPinInput) {
    return (
      <PinInput
        title="비밀번호 입력"
        subtitle="대출 상환을 위해 비밀번호를 입력해주세요."
        onPasswordComplete={handlePasswordInput}
      />
    );
  }

  // 금액이 잔액을 초과하는지 확인
  const isAmountValid =
    localAmount &&
    Number.parseInt(String(localAmount)) > 0 &&
    Number.parseInt(String(localAmount)) <= balance;

  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  return (
    <ScrollView className="flex-1 bg-[#F5F6F8]">
      <View className="px-6">
        <View className="bg-white rounded-2xl px-6 py-6 mt-2">
          <View className="flex flex-col space-y-6">
            <GlobalText weight="bold" className="text-xl text-gray-800 mb-2">
              대출 정보
            </GlobalText>
            <View className="bg-gray-100 rounded-2xl px-6 py-4 mt-2">
              <View className="flex flex-col space-y-60">
                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <GlobalText className="text-base text-gray-500">
                      남은 날짜
                    </GlobalText>
                  </View>
                  <GlobalText
                    weight="bold"
                    className={`text-lg font-medium ${remainingDaysColor}`}
                  >
                    {remainingDays}
                  </GlobalText>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <GlobalText className="text-base text-gray-500">
                      총 대출액
                    </GlobalText>
                  </View>
                  <GlobalText className="text-lg text-black tracking-wider">
                    {totalAmount.toLocaleString()}원
                  </GlobalText>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <GlobalText className="text-base text-gray-500">
                      남은 대출액
                    </GlobalText>
                  </View>
                  <GlobalText
                    weight="bold"
                    className="text-lg text-black tracking-wider"
                  >
                    {remainingAmount.toLocaleString()}원
                  </GlobalText>
                </View>
              </View>
            </View>

            {/* 금액 입력 */}
            <View className="mt-4 bg-white rounded-xl p-6 border border-gray-100">
              <View className="items-center">
                <GlobalText className="text-sm text-gray-500 mb-5">
                  상환 금액
                </GlobalText>
                <View className="flex-row items-center">
                  <GlobalText className="text-3xl font-bold mr-2">
                    {formatAmount(String(localAmount))}
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
                    : localAmount &&
                      Number.parseInt(String(localAmount)) > balance
                    ? "잔액이 부족합니다"
                    : `잔액: ${balance.toLocaleString()}원`}
                </GlobalText>
              </View>

              {/* 빠른 금액 선택 버튼 */}
              <View className="flex-row justify-between mt-6">
                {[1000, 5000, "전액"].map((value) => (
                  <Pressable
                    key={value}
                    className="flex-1 py-2 bg-gray-100 rounded-lg mx-1"
                    onPress={() => handleAmountButtonClick(value)}
                  >
                    <GlobalText className="text-sm font-medium text-center">
                      {value === "전액"
                        ? "전액"
                        : `+${value.toLocaleString()}원`}
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
                      <GlobalText className="text-xl font-medium">
                        {num}
                      </GlobalText>
                    </Pressable>
                  ))}
                  <Pressable
                    className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                    onPress={() => handleAmountChange("")}
                  >
                    <GlobalText className="text-xl font-medium">
                      취소
                    </GlobalText>
                  </Pressable>
                  <Pressable
                    className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                    onPress={() => handleAmountChange(localAmount + "0")}
                  >
                    <GlobalText className="text-xl font-medium">0</GlobalText>
                  </Pressable>
                  <Pressable
                    className="w-[30%] h-14 bg-gray-100 rounded-lg items-center justify-center"
                    onPress={() =>
                      handleAmountChange(String(localAmount).slice(0, -1))
                    }
                  >
                    <GlobalText className="text-xl font-medium">←</GlobalText>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 하단 버튼 */}
            <BottomButton
              onPress={() => setShowPinInput(true)}
              disabled={!isAmountValid}
              text="다음"
              variant={isAmountValid ? "primary" : "secondary"}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
