import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import GlobalText from "../../../components/GlobalText";
import LoanModal from "../../../components/modal";
import { PinInput } from "../../../components/PinInput";
import { router } from "expo-router";

// 대출 요청 데이터 타입 정의
type LoanRequest = {
  id: string;
  childName: string;
  amount: number;
  repaymentDate: string;
  applicationDate: string;
  creditScore: number;
};

export default function ParentLoanRequestsPage() {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loanToApprove, setLoanToApprove] = useState<string | null>(null);
  const [loanToReject, setLoanToReject] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);

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

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 대출 승인 핸들러
  const handleApprove = (loanId: string) => {
    setLoanToApprove(loanId);
    setShowApproveModal(true);
  };

  // 대출 거부 핸들러
  const handleReject = (loanId: string) => {
    setLoanToReject(loanId);
    setShowRejectModal(true);
  };

  // 모달에서 승인 확인 시 실행될 핸들러
  const handleConfirmApprove = () => {
    if (loanToApprove) {
      setLoanRequests(loanRequests.filter((loan) => loan.id !== loanToApprove));
      setLoanToApprove(null);
      setShowPinInput(true);
    }
    setShowApproveModal(false);
  };

  // 모달에서 거부 확인 시 실행될 핸들러
  const handleConfirmReject = () => {
    if (loanToReject) {
      setLoanRequests(loanRequests.filter((loan) => loan.id !== loanToReject));
      setLoanToReject(null);
    }
    setShowRejectModal(false);
  };

  const handlePasswordConfirm = async (password: string) => {
    router.push("/loan/parent/ReqApprove");
  };

  // 신용 점수에 따른 색상 결정
  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return "text-[#4FC985]-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  if (showPinInput) {
    return (
      <PinInput
        title="송금 비밀번호 입력"
        subtitle="대출 승인을 위해 비밀번호를 입력해주세요."
        onPasswordComplete={handlePasswordConfirm}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="h-px w-full" />
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 mt-6">
        {/* 요청 중인 대출 요약 */}
        <View className="flex-row items-center mb-4">
          <GlobalText className="text-2xl text-gray-800" weight="bold">
            요청 중인 대출
          </GlobalText>
          <View className="ml-3 bg-[#4FC985] px-3 py-1 rounded-lg">
            <GlobalText className="text-white" weight="bold">
              {loanRequests.length}건
            </GlobalText>
          </View>
        </View>

        {/* 요청 중인 대출 목록 */}
        <View className="space-y-4">
          {loanRequests.map((loan) => (
            <View
              key={loan.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <LoanModal
                title="대출 요청 승인"
                content="정말 대출 요청을 승인하시겠습니까?"
                visible={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={() => handleConfirmApprove()}
              />
              <LoanModal
                title="대출 요청 거부"
                content="정말 대출 요청을 거부하시겠습니까?"
                visible={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={() => handleConfirmReject()}
              />
              <View className="flex-row justify-between items-center mb-4">
                <GlobalText className="text-lg text-gray-800" weight="bold">
                  <GlobalText className="text-xl text-[#4FC985]" weight="bold">
                    {loan.childName}
                  </GlobalText>{" "}
                  의 대출 요청
                </GlobalText>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <GlobalText className="text-xl text-gray-800" weight="bold">
                  요청 대출금
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

                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <GlobalText className="text-md text-gray-600">
                    신청 날짜
                  </GlobalText>
                  <GlobalText className="font-medium text-lg">
                    {formatDate(loan.applicationDate)}
                  </GlobalText>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <GlobalText className="text-md text-gray-600">
                    채권자 신용 점수
                  </GlobalText>
                  <GlobalText
                    className={`text-lg ${getCreditScoreColor(
                      loan.creditScore
                    )}`}
                    weight="bold"
                  >
                    {loan.creditScore}점
                  </GlobalText>
                </View>
              </View>

              {/* 승인/거부 버튼 */}
              <View className="mt-4 flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleReject(loan.id)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg mr-1"
                >
                  <GlobalText
                    className="text-center text-gray-700"
                    weight="bold"
                  >
                    거부하기
                  </GlobalText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleApprove(loan.id)}
                  className="flex-1 py-3 bg-[#4FC985] rounded-lg"
                >
                  <GlobalText className="text-center text-white" weight="bold">
                    승인하기
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
