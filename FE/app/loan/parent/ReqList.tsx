import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import GlobalText from "@/components/GlobalText";
import LoanModal from "@/components/PopupModal";
import { router } from "expo-router";
import { useReqListParentStore } from "@/stores/useLoanParentStore";
import { useLoanReqListParentQuery } from "@/hooks/useLoanReqListParentQuery";
import { rejectLoan, ReqItem } from "@/apis/loanParentApi";
import { usePromissoryNoteStore } from "@/stores/useLoanParentStore";

export default function ParentLoanRequestsPage() {
  const { data: queryData, error, refetch } = useLoanReqListParentQuery();
  const reqList = useReqListParentStore((state) => state.reqList);
  const hydrated = useReqListParentStore((state) => state.hydrated);
  const setPromissoryNoteData = usePromissoryNoteStore(
    (state) => state.setPromissoryNoteData
  );

  // 에러 핸들링 useEffect
  useEffect(() => {
    if (error) {
      console.error("❌ 대출 목록 조회 실패:", error.message);
    }
  }, [error]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loanToReject, setLoanToReject] = useState<number | null>(null);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 대출 승인 핸들러
  const handleApprove = (loan: ReqItem) => {
    console.log("선택된 대출:", loan);

    // 차용증 데이터를 스토어에 저장
    setPromissoryNoteData({
      loanAmount: loan.loan_amount,
      repaymentDate: loan.due_date,
      debtorName: loan.child_name,
      debtorSign: loan.child_signature,
      loanId: loan.loan_id,
    });

    // 차용증 화면으로 이동
    router.push("/loan/parent/PromissoryNote");
  };

  // 대출 거부 핸들러
  const handleReject = (loanId: number) => {
    setLoanToReject(loanId);
    setShowRejectModal(true);
  };

  // 모달에서 거부 확인 시 실행될 핸들러
  const handleConfirmReject = async () => {
    if (!loanToReject) return;

    try {
      await rejectLoan(loanToReject);
      await refetch();

      setLoanToReject(null);
      setShowRejectModal(false);
    } catch (error) {
      console.error("API 호출 중 오류:", error);
      Alert.alert("오류", "처리 중 오류가 발생했습니다.");
    }
  };

  // 신첩 점수에 따른 색상 결정
  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return "text-[#4FC985]";
    if (score >= 31) return "text-[#FFD700]";
    return "text-[#EF4444]";
  };

  // 스토리지 복원 전에는 아무것도 안 그리기
  if (!hydrated) {
    return null; // 혹은 return <ActivityIndicator /> 로딩 표시
  }

  return (
    <View className="flex-1 bg-[#F5F6F8]">
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
              className="bg-white rounded-xl p-5 border border-gray-100"
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
                  onPress={() => handleApprove(loan)}
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
