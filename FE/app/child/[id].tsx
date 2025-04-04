import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import GlobalText from "../../components/GlobalText";
import { useChildDetailStore } from "../../stores/useChildDetailStore";
import { useTransferStore } from "../../stores/useTransferStore";

export default function ChildDetail() {
  const { child } = useLocalSearchParams();
  const childData = JSON.parse(child as string);
  const { setRecipient } = useTransferStore();

  const handleAllowanceTransfer = () => {
    setRecipient({
      id: childData.childId.toString(),
      bankName: childData.bankName,
      accountNumber: childData.accountNumber,
      ownerName: childData.childName,
    });

    router.push({
      pathname: "/transfer/Amount",
      params: {
        userName: childData.childName,
        bankName: childData.bankName,
        accountNumber: childData.accountNumber,
      },
    });
  };

  return (
    <View className="flex-1 bg-black/50">
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
        <View className="items-center py-[63px]">
          <Image
            source={require("../../assets/profile/profile.jpg")}
            className="w-20 h-20 rounded-full mb-[18px]"
          />

          <GlobalText className="text-xl font-semibold text-black mb-3">
            {childData.childName}
          </GlobalText>

          <View className="flex-row items-center mb-8">
            <View className="flex-row items-center">
              <GlobalText className="text-sm text-[#666666] mr-1">
                신용 점수
              </GlobalText>
              <GlobalText className="text-sm text-[#666666]">
                {childData.creditScore}점
              </GlobalText>
            </View>

            <GlobalText className="text-sm text-[#CCCCCC] mx-2">|</GlobalText>

            <View className="flex-row items-center">
              <GlobalText className="text-sm text-[#666666] mr-1">
                대출금
              </GlobalText>
              <GlobalText className="text-sm text-[#666666]">
                {childData.loanAmount
                  ? childData.loanAmount.toLocaleString()
                  : 0}
                원
              </GlobalText>
            </View>
          </View>

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
                    profileImage: "../../assets/profile/profile.jpg",
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
