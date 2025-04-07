import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import GlobalText from "../../components/GlobalText";
import { useChildDetailStore } from "../../stores/useChildDetailStore";
import { useTransferStore } from "../../stores/useTransferStore";
import { getBankName } from "../../constants/bank";
import { getChildProfileImage } from "@/utils/getChildProfileImage";

export default function ChildDetail() {
  const { child } = useLocalSearchParams();
  const childData = JSON.parse(child as string);
  const { setRecipient, saveTransferData } = useTransferStore();

  console.log("전체 childData:", childData);
  console.log("childGender:", childData.childGender);

  const handleAllowanceTransfer = () => {
    console.log("전체 childData:", childData);
    console.log("계좌번호:", childData.childAccountNum);

    setRecipient({
      id: childData.childId.toString(),
      bankName: getBankName(childData.bankNum),
      accountNumber: childData.childAccountNum,
      accountHolder: childData.childName,
    });

    saveTransferData();

    router.push({
      pathname: "/transfer/Amount",
    });
  };

  return (
    <View className="flex-1 bg-black/50">
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
        <View className="items-center py-[63px]">
          <Image
            source={getChildProfileImage(childData.childGender)}
            className="w-20 h-20 rounded-full mb-[18px]"
          />

          <GlobalText className="text-xl text-black mb-3">
            {childData.childName}
          </GlobalText>

          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center">
              <GlobalText className="text-sm text-[#666666] mr-1">
                신용 점수
              </GlobalText>
              <GlobalText weight="bold" className="text-sm text-[#666666]">
                {childData.creditScore}점
              </GlobalText>
            </View>

            <GlobalText className="text-sm text-[#CCCCCC] mx-2">|</GlobalText>

            <View className="flex-row items-center">
              <GlobalText className="text-sm text-[#666666] mr-1">
                대출금
              </GlobalText>
              <GlobalText
                weight="bold"
                className="text-sm text-[#666666] font-semibold"
              >
                {childData.loanAmount
                  ? childData.loanAmount.toLocaleString()
                  : 0}
                원
              </GlobalText>
            </View>
          </View>

          {childData.regularTransfer && (
            <View className="items-center mb-8">
              <GlobalText className="text-sm text-[#666666]">
                정기용돈{" "}
                {childData.regularTransfer.scheduledFrequency === "weekly"
                  ? "매주"
                  : "매월"}{" "}
                <GlobalText weight="bold" className="text-sm text-[#666666]">
                  {childData.regularTransfer.scheduledFrequency === "weekly"
                    ? ["월", "화", "수", "목", "금", "토", "일"][
                        childData.regularTransfer.startDate - 1
                      ]
                    : childData.regularTransfer.startDate}
                  {childData.regularTransfer.scheduledFrequency === "weekly"
                    ? "요일"
                    : "일"}
                </GlobalText>{" "}
                <GlobalText weight="bold" className="text-sm text-[#666666]">
                  {childData.regularTransfer.scheduledAmount.toLocaleString()}원
                </GlobalText>
              </GlobalText>
            </View>
          )}

          <View className="w-full gap-3">
            <TouchableOpacity
              className="bg-[#E5E5E5] rounded-xl py-3.5 items-center"
              onPress={handleAllowanceTransfer}
            >
              <GlobalText className="text-base font-semibold text-black">
                용돈 지급하기
              </GlobalText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#4FC885] rounded-xl py-3.5 items-center"
              onPress={() =>
                router.push({
                  pathname: "/child/RegularAllowance",
                  params: {
                    childName: childData.childName,
                    childId: childData.childId,
                    childGender: childData.childGender,
                  },
                })
              }
            >
              <GlobalText className="text-base font-semibold text-white">
                정기 용돈 설정하기
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
