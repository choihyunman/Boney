import React from "react";
import { View, Text } from "react-native";
import { DollarSign, CreditCard, Zap, Award } from "lucide-react-native";

type TransactionItemProps = {
  item: {
    transactionId: number;
    icon: string;
    transactionContent: string;
    transactionDate: string;
    transactionAmount: number;
    transactionCategoryName: string;
    transactionAfterBalance: number;
    hashtags: string[];
  };
};

export default function TransactionItem({ item }: TransactionItemProps) {
  // 아이콘 선택 함수
  const getIcon = (iconType: string) => {
    let IconComponent = DollarSign;
    let backgroundColor = "bg-yellow-100";
    let iconColor = "#EAB308";

    switch (iconType) {
      case "coin":
        IconComponent = DollarSign;
        backgroundColor = "bg-yellow-100";
        iconColor = "#EAB308";
        break;
      case "allowance":
        IconComponent = CreditCard;
        backgroundColor = "bg-green-100";
        iconColor = "#4FC985";
        break;
      case "bank":
        IconComponent = Zap;
        backgroundColor = "bg-blue-100";
        iconColor = "#3B82F6";
        break;
      case "trophy":
        IconComponent = Award;
        backgroundColor = "bg-purple-100";
        iconColor = "#9333EA";
        break;
    }

    return (
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mt-3 ${backgroundColor}`}
      >
        <IconComponent size={20} color={iconColor} />
      </View>
    );
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    if (amount === 0) return "0원";

    const isPositive = amount > 0;
    const absAmount = Math.abs(amount);

    if (absAmount < 1000) {
      return `${isPositive ? "+" : "-"}${absAmount}원`;
    }

    return `${isPositive ? "+" : "-"}${absAmount.toLocaleString()}원`;
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View className="w-[412px] h-[89px] flex-row px-4 py-3 bg-white">
      {/* 왼쪽 아이콘 */}
      {getIcon(item.icon)}

      {/* 중앙 컨텐츠 */}
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <View className="relative pr-2 mr-2">
            <Text className="text-sm leading-6">
              {item.transactionCategoryName}
            </Text>
            <View className="absolute right-0 top-1/2 -translate-y-[7px] w-[1px] h-3.5 bg-black" />
          </View>
          <Text className="text-base leading-6">{item.transactionContent}</Text>
        </View>
        <Text className="text-sm text-gray-500 leading-5">
          {formatTime(item.transactionDate)}
        </Text>

        {/* 태그 컨테이너 */}
        {item.hashtags && item.hashtags.length > 0 && (
          <View className="flex-row mt-2 gap-1">
            {item.hashtags.map((tag, index) => (
              <View
                key={index}
                className="bg-[#49db8a1a] rounded-xl px-2 py-0.5"
              >
                <Text className="text-xs text-primary leading-[18px]">
                  # {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 오른쪽 금액 */}
      <View className="items-end justify-start mt-0.5">
        <Text
          className={`text-base leading-6 ${
            item.transactionAmount > 0 ? "text-primary" : "text-black"
          }`}
        >
          {formatAmount(item.transactionAmount)}
        </Text>
        {item.transactionAfterBalance !== undefined && (
          <Text className="text-xs text-gray-500 leading-5">
            {item.icon === "coin" ? "-" : ""}
            {item.transactionAfterBalance.toLocaleString()}원
          </Text>
        )}
      </View>
    </View>
  );
}
