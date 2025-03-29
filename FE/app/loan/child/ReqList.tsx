import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import GlobalText from "../../../components/GlobalText";
import PopupModal from "../../../components/PopupModal";

// 대출 요청 데이터 타입 정의
type LoanRequest = {
  id: string;
  childName: string;
  amount: number;
  repaymentDate: string;
  applicationDate: string;
  creditScore: number;
};

export default function ChildLoanRequestsPage() {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([
    {
      id: "1",
      childName: "김짤랑",
      amount: 6000,
      repaymentDate: "2025-03-23",
      applicationDate: "2025-03-16",
      creditScore: 85,
    },
  ]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loanToCancel, setLoanToCancel] = useState<string | null>(null);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 대출 거부 핸들러
  const handleReject = (loanId: string) => {
    setLoanToCancel(loanId);
    setShowCancelModal(true);
  };

  // 모달에서 취소 확인 시 실행될 핸들러
  const handleConfirmCancel = () => {
    if (loanToCancel) {
      setLoanRequests(loanRequests.filter((loan) => loan.id !== loanToCancel));
      setLoanToCancel(null);
    }
    setShowCancelModal(false);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <PopupModal
        title="대출 신청 취소"
        content="정말 대출 신청을 취소하시겠습니까?"
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
      <View className="h-px w-full" />
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 mt-6">
        {/* 대기 중인 대출 요약 */}
        <View className="flex-row items-center mb-4">
          <GlobalText className="text-2xl text-gray-800" weight="bold">
            대기 중인 대출
          </GlobalText>
          <View className="ml-3 bg-[#4FC985] px-3 py-1 rounded-lg">
            <GlobalText className="text-white" weight="bold">
              {loanRequests.length}건
            </GlobalText>
          </View>
        </View>

        {/* 대기 중인 대출 목록 */}
        <View className="space-y-4">
          {loanRequests.map((loan) => (
            <View
              key={loan.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-4">
                <GlobalText className="text-xl text-gray-800" weight="bold">
                  신청 대출금
                </GlobalText>
                <GlobalText className="text-xl text-[#4FC985]" weight="bold">
                  {loan.amount.toLocaleString()}원
                </GlobalText>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <GlobalText className="text-md text-gray-600">
                    마감 날짜
                  </GlobalText>
                  <GlobalText className="font-medium text-lg" weight="bold">
                    {formatDate(loan.repaymentDate)}
                  </GlobalText>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <GlobalText className="text-md text-gray-600">
                    신청 날짜
                  </GlobalText>
                  <GlobalText className="font-medium text-lg">
                    {formatDate(loan.applicationDate)}
                  </GlobalText>
                </View>
              </View>

              <View className="mt-6 bg-gray-100 rounded-lg p-4">
                <GlobalText
                  className="text-md text-gray-600"
                  style={{ lineHeight: 22 }}
                >
                  보호자가 대출 신청을 검토 중이에요.
                  {"\n"}승인 되면 알림을 보내드릴게요.
                </GlobalText>
              </View>

              {/* 취소 버튼 */}
              <View className="mt-4 flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleReject(loan.id)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg mr-1"
                >
                  <GlobalText
                    className="text-center text-gray-700"
                    weight="bold"
                  >
                    취소하기
                  </GlobalText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {loanRequests.length === 0 && (
          <View className="flex-col items-center justify-center py-12">
            <GlobalText className="text-gray-500">
              요청 중인 대출이 없습니다.
            </GlobalText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
