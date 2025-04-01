import { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import GlobalText from "../../../components/GlobalText";
import AmountInputModal from "../../../components/AmountInputModal";
import { router } from "expo-router";
import LoanDatePickerModal from "../../../components/DatePickerModal";
import { useLoanRequestStore } from "@/stores/useLoanChildStore";

export default function LoanCreatePage() {
  const [loanAmount, setLoanAmount] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const { setRequest } = useLoanRequestStore();

  // 차용증 확인하기 버튼 클릭 핸들러
  const handleViewPromissoryNote = () => {
    console.log("🔍 차용증 확인하기 버튼");
    if (!loanAmount || !repaymentDate) return;

    const cleanedAmout = loanAmount.replace(/,/g, "");
    const numericAmount = Number(cleanedAmout);

    setRequest("amount", isNaN(numericAmount) ? 0 : numericAmount);
    setRequest("dueDate", repaymentDate);
    console.log("🔍 신청 대출액: ", loanAmount, "마감 날짜: ", repaymentDate);
    router.push("/loan/child/ReqNote");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1 px-6 mt-6 pb-20">
        {/* 흰색 카드 박스 */}
        <View className="bg-white rounded-xl shadow-sm p-5">
          {/* 제목 */}
          <GlobalText weight="bold" className="text-lg text-gray-800 mb-6">
            대출 금액과 날짜 정하기
          </GlobalText>

          {/* 금액 입력 섹션 */}
          <TouchableOpacity
            onPress={() => {
              setLoanAmount(""); // 기존 금액 제거
              setShowAmountModal(true); // 모달 열기
            }}
            className="mb-6"
          >
            {loanAmount ? (
              <GlobalText className="text-lg text-gray-800">
                <GlobalText weight="bold" className="text-2xl text-[#4FC985]">
                  {loanAmount}
                </GlobalText>{" "}
                원을
              </GlobalText>
            ) : (
              <GlobalText className="text-xl text-gray-400">
                얼마를 대출할까요?
              </GlobalText>
            )}
          </TouchableOpacity>

          {/* 날짜 선택 섹션 (금액 입력 후에만 보임) */}
          {loanAmount ? (
            <TouchableOpacity
              onPress={() => {
                setRepaymentDate(""); // 기존 날짜 제거
                setShowDateModal(true); // 모달 열기
              }}
            >
              {repaymentDate ? (
                <GlobalText className="text-lg text-gray-800">
                  <GlobalText weight="bold" className="text-2xl text-[#4FC985]">
                    {repaymentDate}
                  </GlobalText>{" "}
                  까지 대출합니다.
                </GlobalText>
              ) : (
                <GlobalText className="text-xl text-gray-400">
                  언제까지 갚을까요?
                </GlobalText>
              )}
            </TouchableOpacity>
          ) : null}

          {/* 차용증 확인하기 버튼 */}
          <TouchableOpacity
            onPress={handleViewPromissoryNote}
            disabled={!loanAmount || !repaymentDate}
            className={`w-full py-4 mt-8 rounded-lg ${
              loanAmount && repaymentDate ? "bg-[#4FC985]" : "bg-gray-200"
            }`}
          >
            <GlobalText
              weight="bold"
              className={`text-center ${
                loanAmount && repaymentDate ? "text-white" : "text-gray-400"
              }`}
            >
              차용증 확인하기
            </GlobalText>
          </TouchableOpacity>
        </View>
        <View className="mt-8 border-t border-gray-200" />

        <View className="left-0 right-0 px-4 py-4">
          {/* 타이틀 */}
          <GlobalText
            weight="bold"
            className="text-base text-lg text-gray-900 mb-2"
          >
            꼭 알아두세요.
          </GlobalText>

          {/* 목록 */}
          {[
            "채권자는 채무자의 신용 점수를 보고 대출 신청을 거절할 수 있어요.",
            "상환 기간 내에 대출을 갚지 못하면 월마다 신용 점수가 10점씩 내려가요.",
            "신용 점수가 30점 미만이 되면 다음 번 대출 신청이 제한돼요.",
            "대출을 갚으면 신용 점수가 10점 올라가요.",
          ].map((text, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <View className="mt-[6px] mr-2 w-2 h-2 rounded-full bg-green-500" />
              <GlobalText
                className="text-md text-gray-700"
                style={{ lineHeight: 24 }}
              >
                {text}
              </GlobalText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 금액 입력 모달 */}
      <AmountInputModal
        visible={showAmountModal}
        onClose={() => setShowAmountModal(false)}
        amount={loanAmount}
        onAmountChange={setLoanAmount}
        onComplete={() => setShowAmountModal(false)}
      />

      {showDateModal && (
        <LoanDatePickerModal
          onSelectDate={(date) => {
            setRepaymentDate(date);
            setShowDateModal(false);
          }}
          onClose={() => setShowDateModal(false)}
        />
      )}
    </View>
  );
}
