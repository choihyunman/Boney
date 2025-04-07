import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import GlobalText from "@/components/GlobalText";
import { usePromissoryNoteStore } from "@/stores/useLoanParentStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "expo-router";

interface PromissoryNoteProps {
  loanAmount?: number;
  repaymentDate?: string;
  formattedToday?: string;
  debtorName?: string;
  creditorName?: string;
  debtorSign?: string;
  creditorSign?: string;
  minHeight?: number; // minHeight 조절 가능
}

export default function PromissoryNote({
  loanAmount: propLoanAmount,
  repaymentDate: propRepaymentDate,
  formattedToday: propFormattedToday,
  debtorName: propDebtorName,
  creditorName: propCreditorName,
  debtorSign: propDebtorSign,
  creditorSign,
  minHeight = 400,
}: PromissoryNoteProps) {
  // 스토어에서 데이터 가져오기
  const promissoryNoteData = usePromissoryNoteStore(
    (state) => state.promissoryNoteData
  );
  const clearPromissoryNoteData = usePromissoryNoteStore(
    (state) => state.clearPromissoryNoteData
  );
  const user = useAuthStore((state) => state.user);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 스토어 데이터 또는 props 데이터 사용
  const loanAmount = promissoryNoteData?.loanAmount || propLoanAmount || 0;
  const repaymentDate =
    promissoryNoteData?.repaymentDate || propRepaymentDate || "";
  const formattedToday =
    propFormattedToday || formatDate(new Date().toISOString());
  const debtorName = promissoryNoteData?.debtorName || propDebtorName || "";
  const debtorSign = promissoryNoteData?.debtorSign || propDebtorSign || "";
  const parentName = user?.userName || propCreditorName || "";

  // 다시 쓰기 핸들러
  const handleRewrite = () => {
    clearPromissoryNoteData();
    router.back();
  };

  // 서명하기 핸들러
  const handleSign = () => {
    // 서명 화면으로 이동
    router.push({
      pathname: "/loan/parent/Signature",
      params: {
        isParent: "true",
        loanId: promissoryNoteData?.loanId,
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      <ScrollView className="flex-1 px-6 mt-6 space-y-6 pb-20">
        <View className="bg-white rounded-xl p-5 items-center">
          <GlobalText weight="bold" className="text-lg text-gray-800 mb-2">
            차용증
          </GlobalText>
          <View className="border border-gray-200 w-full mb-2" />
          <View
            className="rounded-xl px-4 pt-4 w-full justify-between"
            style={{ minHeight }}
          >
            {/* 좌측 정렬 내용 */}
            <View className="mb-8">
              <GlobalText weight="bold" className="text-lg mb-6">
                금액:{" "}
                <GlobalText weight="bold" className="text-lg text-[#4FC985]">
                  {loanAmount
                    ? `${Number(loanAmount).toLocaleString()} `
                    : "___________ "}
                </GlobalText>
                원
              </GlobalText>
              <GlobalText
                className="text-lg text-gray-700 mb-2"
                style={{ letterSpacing: -0.3, lineHeight: 26 }}
              >
                채무인은 채권자로부터 위 금액을 빌렸습니다.
              </GlobalText>
              <GlobalText
                className="text-lg text-gray-700 mb-2"
                style={{ letterSpacing: -0.3, lineHeight: 26 }}
              >
                <GlobalText weight="bold" className="text-lg text-[#4FC985]">
                  {formatDate(repaymentDate)}
                </GlobalText>{" "}
                까지
              </GlobalText>
              <GlobalText className="text-lg text-gray-700">
                채권자에게 갚겠습니다.
              </GlobalText>
            </View>

            {/* 중앙 정렬 날짜 */}
            <View className="items-center mb-8">
              <GlobalText
                className="text-lg text-gray-700"
                style={{ letterSpacing: -0.3, lineHeight: 26 }}
              >
                {formattedToday}
              </GlobalText>
            </View>

            {/* 우측 정렬 서명 */}
            <View className="items-end space-y-2">
              {/* 채무자 서명 */}
              <View className="flex-row items-center justify-end w-full">
                <View className="flex-row items-center">
                  <GlobalText className="text-lg text-gray-700 mr-2">
                    채무자{" "}
                    <GlobalText weight="bold" className="text-lg text-gray-700">
                      {debtorName}
                    </GlobalText>
                  </GlobalText>
                </View>
                <View
                  style={{
                    width: 100,
                    height: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {debtorSign ? (
                    <Image
                      source={{ uri: debtorSign }}
                      style={{
                        width: 100,
                        height: 40,
                        resizeMode: "contain",
                      }}
                    />
                  ) : (
                    <GlobalText className="text-md text-gray-400">
                      서명
                    </GlobalText>
                  )}
                </View>
              </View>

              {/* 채권자 서명 */}
              <View className="flex-row items-center justify-end w-full">
                <View className="flex-row items-center">
                  <GlobalText className="text-lg text-gray-700 mr-2">
                    채권자{" "}
                    <GlobalText weight="bold" className="text-lg text-gray-700">
                      {parentName}
                    </GlobalText>
                  </GlobalText>
                </View>
                <View
                  style={{
                    width: 100,
                    height: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {creditorSign ? (
                    <Image
                      source={{ uri: creditorSign }}
                      style={{
                        width: 100,
                        height: 40,
                        resizeMode: "contain",
                      }}
                    />
                  ) : (
                    <GlobalText className="text-md text-gray-400">
                      서명
                    </GlobalText>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 버튼 영역 */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity
            onPress={handleRewrite}
            className="py-4 px-6 rounded-lg bg-gray-200 flex-1 mr-2"
          >
            <GlobalText className="text-gray-700 text-center">
              다시 쓰기
            </GlobalText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSign}
            className="py-4 px-6 rounded-lg bg-[#4FC985] flex-[1.5]"
          >
            <GlobalText className="text-white text-center">서명하기</GlobalText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
