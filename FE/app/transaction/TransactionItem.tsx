import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DollarSign, CreditCard, Zap, Award } from "lucide-react-native";

type TransactionItemProps = {
  item: {
    id: string;
    icon: string;
    name: string;
    time: string;
    amount: number;
    balance?: number;
    tags?: string[];
  };
};

export default function TransactionItem({ item }: TransactionItemProps) {
  // 아이콘 선택 함수
  const getIcon = (iconType: string) => {
    let IconComponent = DollarSign;
    let backgroundColor = "#FEF9C3";
    let iconColor = "#EAB308";

    switch (iconType) {
      case "coin":
        IconComponent = DollarSign;
        backgroundColor = "#FEF9C3";
        iconColor = "#EAB308";
        break;
      case "allowance":
        IconComponent = CreditCard;
        backgroundColor = "#DCFCE7";
        iconColor = "#4FC985";
        break;
      case "bank":
        IconComponent = Zap;
        backgroundColor = "#DBEAFE";
        iconColor = "#3B82F6";
        break;
      case "trophy":
        IconComponent = Award;
        backgroundColor = "#F3E8FF";
        iconColor = "#9333EA";
        break;
    }

    return (
      <View style={[styles.iconContainer, { backgroundColor }]}>
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

  return (
    <View style={styles.container}>
      {/* 왼쪽 아이콘 */}
      {getIcon(item.icon)}

      {/* 중앙 컨텐츠 */}
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>식비</Text>
            <View style={styles.categoryBorder} />
          </View>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text style={styles.time}>{item.time}</Text>

        {/* 태그 컨테이너 수정 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}># {tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 오른쪽 금액 */}
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.amount,
            { color: item.amount > 0 ? "#4FC985" : "#000000" },
          ]}
        >
          {formatAmount(item.amount)}
        </Text>
        {item.balance !== undefined && (
          <Text style={styles.balance}>{item.balance.toLocaleString()}원</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 412,
    height: 89,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryContainer: {
    position: "relative",
    paddingRight: 8,
    marginRight: 8,
  },
  category: {
    fontFamily: "Geist-Regular",
    fontSize: 14,
    lineHeight: 24,
  },
  categoryBorder: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -7 }],
    width: 1,
    height: 14,
    backgroundColor: "black",
  },
  name: {
    fontFamily: "NEXON_Lv1_Gothic-Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  time: {
    fontFamily: "Geist-Regular",
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 5,
  },
  tag: {
    backgroundColor: "#49db8a1a",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  tagText: {
    fontFamily: "NEXON_Lv1_Gothic-Bold",
    fontSize: 12,
    color: "#4FC985",
    lineHeight: 18,
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginTop: 3,
  },
  amount: {
    fontFamily: "NEXON_Lv1_Gothic-Light",
    fontSize: 16,
    lineHeight: 24,
  },
  balance: {
    fontFamily: "NEXON_Lv1_Gothic-Regular",
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 20,
  },
});
