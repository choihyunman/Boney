import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import GlobalText from "../../../components/GlobalText";
import LoanModal from "../../../components/PopupModal";
import { PinInput } from "../../../components/PinInput";
import { router } from "expo-router";
import {
  useReqListParentStore,
  useApproveStore,
} from "@/stores/useLoanParentStore";
import { useLoanReqListParentQuery } from "@/hooks/useLoanReqListParentQuery";
import { approveLoan, rejectLoan } from "@/apis/loanParentApi";

export default function ParentLoanRequestsPage() {
  const { data: queryData, error, refetch } = useLoanReqListParentQuery();
  const reqList = useReqListParentStore((state) => state.reqList);
  const hydrated = useReqListParentStore((state) => state.hydrated);

  // 에러 핸들링 useEffect
  useEffect(() => {
    if (error) {
      console.error("❌ 대출 목록 조회 실패:", error.message);
    }
  }, [error]);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loanToApprove, setLoanToApprove] = useState<number | null>(null);
  const [loanToReject, setLoanToReject] = useState<number | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState<string>("");

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 대출 승인 핸들러
  const handleApprove = (loanId: number) => {
    setLoanToApprove(loanId);
    setShowPinInput(true);
  };

  // 대출 거부 핸들러
  const handleReject = (loanId: number) => {
    setLoanToReject(loanId);
    setShowRejectModal(true);
  };

  // 비밀번호 입력
  const handlePasswordInput = async (password: string) => {
    if (!loanToApprove) return;

    try {
      console.log("입력 비밀번호: ", password);
      const res = await approveLoan(loanToApprove, password);

      // 승인된 대출 정보 저장
      useApproveStore.getState().setApprove("due_date", res.due_date);
      useApproveStore.getState().setApprove("loan_amount", res.loan_amount);
      useApproveStore.getState().setApprove("child_name", res.child_name);
      console.log("approve: ", useApproveStore.getState().approve);

      // UI 흐름 정리
      setLoanToApprove(null);
      setShowPinInput(false);

      // 목록 갱신 및 이동
      await refetch();
      router.push("/loan/parent/ReqApprove");
    } catch (err) {
      console.error("❌ 대출 승인 실패:", err);
      setShowPinInput(false); // PIN 입력창 닫기
    }
  };

  // 모달에서 거부 확인 시 실행될 핸들러
  const handleConfirmReject = async () => {
    if (!loanToReject) return;

    try {
      await rejectLoan(loanToReject);
      await refetch();

      setLoanToReject(null);
      setShowRejectModal(false);
    } catch (err) {
      console.error("❌ 대출 거부 실패:", err);
    }
  };

  // 신용 점수에 따른 색상 결정
  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return "text-[#4FC985]";
    if (score >= 31) return "text-[#FFD700]";
    return "text-[#EF4444]";
  };

  if (showPinInput) {
    return (
      <PinInput
        title="송금 비밀번호 입력"
        subtitle="대출 승인을 위해 비밀번호를 입력해주세요."
        onPasswordComplete={handlePasswordInput}
      />
    );
  }

  // 스토리지 복원 전에는 아무것도 안 그리기
  if (!hydrated) {
    return null; // 혹은 return <ActivityIndicator /> 로딩 표시
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
              {reqList.length}건
            </GlobalText>
          </View>
        </View>

        {/* 요청 중인 대출 목록 */}
        <View className="space-y-4">
          {reqList.map((loan) => (
            <View
              key={loan.loan_id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
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
                    {loan.child_name}
                  </GlobalText>{" "}
                  의 대출 요청
                </GlobalText>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <GlobalText className="text-xl text-gray-800" weight="bold">
                  요청 대출금
                </GlobalText>
                <GlobalText className="text-xl text-[#4FC985]" weight="bold">
                  {loan.loan_amount.toLocaleString()}원
                </GlobalText>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <GlobalText className="text-md text-gray-600">
                    마감 날짜
                  </GlobalText>
                  <GlobalText className="font-medium text-lg" weight="bold">
                    {formatDate(loan.due_date)}
                  </GlobalText>
                </View>

                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <GlobalText className="text-md text-gray-600">
                    신청 날짜
                  </GlobalText>
                  <GlobalText className="font-medium text-lg">
                    {formatDate(loan.request_date)}
                  </GlobalText>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <GlobalText className="text-md text-gray-600">
                    채권자 신용 점수
                  </GlobalText>
                  <GlobalText
                    className={`text-lg ${getCreditScoreColor(
                      loan.child_credit_score
                    )}`}
                    weight="bold"
                  >
                    {loan.child_credit_score}점
                  </GlobalText>
                </View>
              </View>

              {/* 승인/거부 버튼 */}
              <View className="mt-4 flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleReject(loan.loan_id)}
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
                  onPress={() => handleApprove(loan.loan_id)}
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

        {reqList.length === 0 && (
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
