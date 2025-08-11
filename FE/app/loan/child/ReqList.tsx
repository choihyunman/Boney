import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import GlobalText from "../../../components/GlobalText";
import PopupModal from "../../../components/PopupModal";
import { useLoanReqListQuery } from "@/hooks/useLoanReqListChildQuery";
import { useLoanReqListStore } from "@/stores/useLoanChildStore";
import { cancelLoan } from "@/apis/loanChildApi";
import { Clock } from "lucide-react-native";

export default function ChildLoanRequestsPage() {
  const { data: queryData, error, refetch } = useLoanReqListQuery();
  const reqList = useLoanReqListStore((state) => state.reqList);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loanToCancel, setLoanToCancel] = useState<number | null>(null);

  // 에러 핸들링 useEffect
  useEffect(() => {
    if (error) {
      console.error("❌ 대출 목록 조회 실패:", error.message);
    }
  }, [error]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 대출 거부 핸들러
  const handleCancel = (loanId: number) => {
    setLoanToCancel(loanId);
    setShowCancelModal(true);
  };

  // 모달에서 취소 확인 시 실행될 핸들러
  const handleConfirmCancel = async () => {
    if (!loanToCancel) return;

    try {
      await cancelLoan({ loan_id: loanToCancel });
      await refetch();

      // 상태 초기화
      setLoanToCancel(null);
      setShowCancelModal(false);
    } catch (err) {
      console.error("❌ 대출 신청 취소 실패:", err);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      <PopupModal
        title="대출 신청 취소"
        content="정말 대출 신청을 취소하시겠습니까?"
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />

      <FlatList
        data={reqList}
        keyExtractor={(item) => item.loan_id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="flex-row items-center mb-4">
            <GlobalText className="text-2xl text-gray-800" weight="bold">
              대기 중인 대출
            </GlobalText>
            <View className="ml-3 bg-[#4FC985] px-3 py-1 rounded-lg">
              <GlobalText className="text-white" weight="bold">
                {reqList.length}건
              </GlobalText>
            </View>
          </View>
        }
        renderItem={({ item: loan }) => (
          <View className="mb-4 bg-white rounded-xl p-5 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <GlobalText className="text-xl text-gray-800" weight="bold">
                신청 대출금
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

              <View className="flex-row justify-between items-center py-2">
                <GlobalText className="text-md text-gray-600">
                  신청 날짜
                </GlobalText>
                <GlobalText className="font-medium text-lg">
                  {formatDate(loan.request_date)}
                </GlobalText>
              </View>
            </View>

            <View className="mt-6 bg-gray-100 rounded-lg p-4">
              <GlobalText
                className="text-md text-gray-600"
                style={{ lineHeight: 22 }}
              >
                보호자가 대출 신청을 검토 중이에요.{"\n"}승인되면 알림을
                보내드릴게요.
              </GlobalText>
            </View>

            <View className="mt-4 flex-row space-x-3">
              <TouchableOpacity
                onPress={() => handleCancel(loan.loan_id)}
                className="flex-1 py-3 border border-gray-300 rounded-lg mr-1"
              >
                <GlobalText className="text-center text-gray-700" weight="bold">
                  취소하기
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-12">
            <Clock size={48} color="#D1D5DB" className="mb-4" />
            <GlobalText className="text-gray-500">
              {error
                ? "대기 중인 대출이 없습니다."
                : "대기 중인 대출이 없습니다."}
            </GlobalText>
          </View>
        )}
      />
    </View>
  );
}
