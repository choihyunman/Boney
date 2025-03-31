import React from "react";
import { View } from "react-native";
import { getCategoryIcon } from "../../utils/categoryUtils";
import GlobalText from "@/components/GlobalText";

type TransactionItemProps = {
  item: {
    transactionId: number;
    transactionContent: string;
    transactionDate: string;
    transactionAmount: number;
    transactionCategoryName: string;
    transactionCategoryId: number;
    transactionAfterBalance: number;
    hashtags: string[];
    transactionType: "WITHDRAWAL" | "DEPOSIT";
  };
};

export default function TransactionItem({ item }: TransactionItemProps) {
  console.log("🎯 TransactionItem received data:", item);

  // 카테고리 이름에 따른 아이콘 가져오기
  const { Icon, backgroundColor, iconColor } = getCategoryIcon(
    item.transactionCategoryName
  );

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    if (amount === 0) return "0원";
    const isDeposit = item.transactionType === "DEPOSIT";
    if (amount < 1000) {
      return `${isDeposit ? "+" : "-"}${amount}원`;
    }
    return `${isDeposit ? "+" : "-"}${amount.toLocaleString()}원`;
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View className="w-[412px] h-[89px] flex-row px-6 py-3 bg-white">
      {/* 왼쪽 아이콘 */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center mt-3"
        style={{
          backgroundColor: backgroundColor.replace("bg-[", "").replace("]", ""),
        }}
      >
        <Icon size={20} color={iconColor} />
      </View>

      {/* 중앙 컨텐츠 */}
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <View className="relative pr-2 mr-2">
            <GlobalText className="text-sm leading-6">
              {item.transactionCategoryName}
            </GlobalText>
            <View className="absolute right-0 top-1/2 -translate-y-[7px] w-[1px] h-3.5 bg-black" />
          </View>
          <GlobalText className="text-base leading-6">
            {item.transactionContent}
          </GlobalText>
        </View>
        <GlobalText className="text-sm text-gray-500 leading-5">
          {formatTime(item.transactionDate)}
        </GlobalText>

        {/* 해시시태그 컨테이너 */}
        {item.hashtags && item.hashtags.length > 0 && (
          <View className="flex-row mt-2 gap-1">
            {item.hashtags.map((tag, index) => (
              <View
                key={index}
                className="bg-[#49db8a1a] rounded-xl px-2 py-0.5"
              >
                <GlobalText className="text-xs text-[#4FC985] leading-[18px]">
                  # {tag}
                </GlobalText>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 오른쪽 금액 */}
      <View className="items-end justify-start mt-0.5">
        <GlobalText
          className={`text-base leading-6 ${
            item.transactionType === "DEPOSIT" ? "text-[#4FC985]" : "text-black"
          }`}
        >
          {formatAmount(item.transactionAmount)}
        </GlobalText>
        {item.transactionAfterBalance !== undefined && (
          <GlobalText className="text-xs text-gray-500 leading-5">
            {item.transactionAfterBalance.toLocaleString()}원
          </GlobalText>
        )}
      </View>
    </View>
  );
}
