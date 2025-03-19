import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import TransactionItem from "./TransactionItem";

// 거래 내역 데이터 타입 정의
type Transaction = {
  id: string;
  date: string;
  dayOfWeek: string;
  items: {
    id: string;
    icon: string;
    name: string;
    time: string;
    amount: number;
    balance?: number;
    tags?: string[];
  }[];
};

// 샘플 거래 내역 데이터
const transactionData: Transaction[] = [
  {
    id: "1",
    date: "11일",
    dayOfWeek: "화요일",
    items: [
      {
        id: "1-1",
        icon: "coin",
        name: "현만분식",
        time: "15:06:51",
        amount: 5,
        balance: 5,
        tags: ["떡볶이", "튀김", "순대"],
      },
    ],
  },
  {
    id: "2",
    date: "06일",
    dayOfWeek: "목요일",
    items: [
      {
        id: "2-1",
        icon: "allowance",
        name: "김세림 용돈",
        time: "16:21:50",
        amount: -10000,
        balance: 0,
      },
      {
        id: "2-2",
        icon: "bank",
        name: "국민은행 이신욱",
        time: "16:21:49",
        amount: 9884,
        balance: 10000,
      },
      {
        id: "2-3",
        icon: "coin",
        name: "김세림",
        time: "15:10:05",
        amount: 116,
        balance: 116,
      },
      {
        id: "2-4",
        icon: "trophy",
        name: "김세림 미션 보상",
        time: "15:08:59",
        amount: -1,
        balance: 0,
      },
    ],
  },
];

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState<"all" | "out" | "in">("all");
  const [currentMonth, setCurrentMonth] = useState<string>("2025년 03월");

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth("2025년 02월");
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth("2025년 04월");
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: "all" | "out" | "in") => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <ArrowLeft size={24} color={"#000000"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>거래내역</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Search size={24} />
        </TouchableOpacity>
      </View>

      {/* 월 선택기 */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <ChevronLeft size={20} color={"#000000"} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <ChevronRight size={20} color={"#000000"} />
        </TouchableOpacity>
      </View>

      {/* 탭 네비게이션 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => handleTabChange("all")}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            전체
          </Text>
          {activeTab === "all" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange("out")}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "out" && styles.activeTabText,
            ]}
          >
            나간 돈
          </Text>
          {activeTab === "out" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange("in")}
          style={styles.tab}
        >
          <Text
            style={[styles.tabText, activeTab === "in" && styles.activeTabText]}
          >
            들어온 돈
          </Text>
          {activeTab === "in" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* 거래 내역 목록 */}
      <ScrollView style={styles.transactionList}>
        {transactionData.map((transaction) => (
          <View key={transaction.id} style={styles.transactionGroup}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>
                {transaction.date} {transaction.dayOfWeek}
              </Text>
            </View>
            {transaction.items.map((item) => (
              <TransactionItem key={item.id} item={item} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 16,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#000000",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4FC985",
  },
  summary: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryButton: {
    marginRight: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4FC985",
  },
  transactionList: {
    flex: 1,
  },
  transactionGroup: {
    paddingBottom: 12,
  },
  dateHeader: {
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
