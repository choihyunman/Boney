import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Image, Animated } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import GlobalText from "../../components/GlobalText";
import { useTransferStore } from "../../stores/useTransferStore";
import { getBankName } from "../../constants/bank";
import { getChildProfileImage } from "@/utils/getChildProfileImage";
import { X } from "lucide-react-native";

export default function ChildDetail() {
  const { child } = useLocalSearchParams();
  const childData = JSON.parse(child as string);
  const { setRecipient, saveTransferData } = useTransferStore();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handleAllowanceTransfer = () => {
    setRecipient({
      id: childData.childId.toString(),
      bankName: getBankName(childData.bankNum),
      accountNumber: childData.childAccountNum,
      accountHolder: childData.childName,
    });

    saveTransferData();

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace({
        pathname: "/transfer/Amount",
      });
    });
  };

  const handleRegularAllowance = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace({
        pathname: "/child/RegularAllowance",
        params: {
          childName: childData.childName,
          childId: childData.childId,
          childGender: childData.childGender,
          scheduledAmount: childData.regularTransfer?.scheduledAmount,
          scheduledFrequency: childData.regularTransfer?.scheduledFrequency,
          startDate: childData.regularTransfer?.startDate,
        },
      });
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"],
        }),
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        className="flex-1"
      >
        <Animated.View
          style={{
            transform: [{ translateY }],
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-6"
          >
            <View className="absolute top-4 right-4">
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <X size={24} color="#666666" />
              </TouchableOpacity>
            </View>

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

                <GlobalText className="text-sm text-[#CCCCCC] mx-2">
                  |
                </GlobalText>

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
                    <GlobalText
                      weight="bold"
                      className="text-sm text-[#666666]"
                    >
                      {childData.regularTransfer.scheduledFrequency === "weekly"
                        ? ["월", "화", "수", "목", "금", "토", "일"][
                            childData.regularTransfer.startDate - 1
                          ]
                        : childData.regularTransfer.startDate}
                      {childData.regularTransfer.scheduledFrequency === "weekly"
                        ? "요일"
                        : "일"}
                    </GlobalText>{" "}
                    <GlobalText
                      weight="bold"
                      className="text-sm text-[#666666]"
                    >
                      {childData.regularTransfer.scheduledAmount.toLocaleString()}
                      원
                    </GlobalText>
                  </GlobalText>
                </View>
              )}

              <View className="w-full space-y-2">
                <TouchableOpacity
                  className="bg-[#E5E5E5] rounded-xl py-3.5 items-center mb-2"
                  onPress={handleAllowanceTransfer}
                >
                  <GlobalText className="text-base font-semibold text-black">
                    용돈 지급하기
                  </GlobalText>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-[#4FC885] rounded-xl py-3.5 items-center"
                  onPress={handleRegularAllowance}
                >
                  <GlobalText className="text-base font-semibold text-white">
                    정기 용돈 설정하기
                  </GlobalText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}
