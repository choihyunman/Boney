import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLoanStore } from "@/stores/useLoanStore";

export default function LoanPendingPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loanToCancel, setLoanToCancel] = useState<string | null>(null);
  const { pendingLoans, setPendingLoans } = useLoanStore();

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 취소 버튼 핸들러
  const handleCancelClick = (loanId: string) => {
    setLoanToCancel(loanId);
    setShowCancelModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 mt-6 pb-20">
        {/* 대기 중인 대출 요약 */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-800">
            대기 중인 대출 {pendingLoans.length}건
          </Text>
        </View>

        {/* 대기 중인 대출 목록 */}
        <View className="space-y-4">
          {pendingLoans.map((loan) => (
            <View
              key={loan.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">
                  신청 대출금
                </Text>
                <Text className="text-lg font-bold text-[#4FC985]">
                  {loan.amount.toLocaleString()}원
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">상환 날짜</Text>
                  <Text className="font-medium">
                    {formatDate(loan.repaymentDate)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600">신청 날짜</Text>
                  <Text className="font-medium">
                    {formatDate(loan.applicationDate)}
                  </Text>
                </View>
              </View>

              <View className="mt-6 bg-gray-100 rounded-lg p-4">
                <Text className="text-sm text-gray-600">
                  보호자가 대출 신청을 검토 중입니다. 승인되면 알림을
                  보내드립니다.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleCancelClick(loan.id)}
                className="mt-4 py-3 border border-gray-300 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-medium">
                  취소하기
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {pendingLoans.length === 0 && (
          <View className="py-12 items-center justify-center">
            <Text className="text-gray-500">대기 중인 대출이 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
