import React from "react";
import { View, Image } from "react-native";
import GlobalText from "@/components/GlobalText";

interface PromissoryNoteProps {
  loanAmount: number;
  repaymentDate: string;
  formattedToday: string;
  debtorName: string;
  creditorName: string;
  debtorSign: string;
  creditorSign: string;
  minHeight?: number;
}

export default function PromissoryNote({
  loanAmount,
  repaymentDate,
  formattedToday,
  debtorName,
  creditorName,
  debtorSign,
  creditorSign,
  minHeight = 400,
}: PromissoryNoteProps) {
  return (
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
              {repaymentDate}
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
                <GlobalText className="text-md text-gray-400">서명</GlobalText>
              )}
            </View>
          </View>

          {/* 채권자 서명 */}
          <View className="flex-row items-center justify-end w-full">
            <View className="flex-row items-center">
              <GlobalText className="text-lg text-gray-700 mr-2">
                채권자{" "}
                <GlobalText weight="bold" className="text-lg text-gray-700">
                  {creditorName}
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
                <GlobalText className="text-md text-gray-400">서명</GlobalText>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
