import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import {
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react-native";
import TransactionItem from "./TransactionItem";
import { getTransactionHistory, Transaction } from "../../apis/transactionApi";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import GlobalText from "@/components/GlobalText";

export default function TransactionHistory() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<"all" | "out" | "in">("all");
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}년 ${month}월`;
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDebouncingRef = useRef(false);

  // 디바운스된 fetchTransactions 함수
  const debouncedFetchTransactions = useCallback(async () => {
    if (isDebouncingRef.current) return;

    if (!token) {
      setError("로그인이 필요합니다.");
      router.replace("/auth");
      return;
    }

    try {
      isDebouncingRef.current = true;
      setLoading(true);
      setError(null);
      const year = currentMonth.split("년")[0];
      const month = currentMonth.split("년")[1].split("월")[0].trim();
      const type =
        activeTab === "all"
          ? undefined
          : activeTab === "out"
          ? "withdrawal"
          : "deposit";

      const response = await getTransactionHistory(
        { year, month, type },
        token
      );

      if (!response.data || !Array.isArray(response.data)) {
        setError("거래 내역 데이터 형식이 올바르지 않습니다.");
        return;
      }

      setTransactions(response.data);
    } catch (err: any) {
      console.error("❌ 거래내역 조회 실패:", err);
      if (err instanceof Error && err.message.includes("권한")) {
        router.replace("/auth");
      }

      // 404 에러인 경우
      if (err.response?.status === 404) {
        setError("404");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "거래 내역을 불러오는데 실패했습니다."
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        isDebouncingRef.current = false;
      }, 500);
    }
  }, [activeTab, currentMonth, token]);

  // 화면이 포커스될 때마다 거래 내역 새로고침
  useFocusEffect(
    useCallback(() => {
      if (token) {
        debouncedFetchTransactions();
      }
    }, [token, debouncedFetchTransactions])
  );

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (token) {
      debouncedFetchTransactions();
    }
  }, []);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    if (loading || isDebouncingRef.current) return;
    const [year, month] = currentMonth.split("년");
    const monthNum = parseInt(month.split("월")[0]);
    if (monthNum === 1) {
      setCurrentMonth(`${parseInt(year) - 1}년 12월`);
    } else {
      setCurrentMonth(`${year}년 ${String(monthNum - 1).padStart(2, "0")}월`);
    }
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    if (loading || isDebouncingRef.current) return;
    const [year, month] = currentMonth.split("년");
    const monthNum = parseInt(month.split("월")[0]);
    if (monthNum === 12) {
      setCurrentMonth(`${parseInt(year) + 1}년 01월`);
    } else {
      setCurrentMonth(`${year}년 ${String(monthNum + 1).padStart(2, "0")}월`);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: "all" | "out" | "in") => {
    if (loading || isDebouncingRef.current) return;
    setActiveTab(tab);
  };

  // 거래 내역을 날짜별로 그룹화
  const groupedTransactions = transactions.reduce<
    Record<string, Transaction[]>
  >((acc, transaction) => {
    const date = new Date(transaction.transactionDate);
    const dateKey = `${date.getDate()}일 ${
      ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
    }요일`;

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-white">
      {/* 월 선택기 */}
      <View className="mx-5 my-2">
        <View className="flex-row items-center justify-center py-4 bg-gray-100 rounded-xl">
          <TouchableOpacity onPress={goToPreviousMonth} className="mr-4">
            <ChevronLeft size={20} color={"#000000"} />
          </TouchableOpacity>
          <GlobalText className="text-lg font-medium px-10">
            {currentMonth}
          </GlobalText>
          <TouchableOpacity onPress={goToNextMonth} className="ml-4">
            <ChevronRight size={20} color={"#000000"} />
          </TouchableOpacity>
        </View>
      </View>
      {/* 탭 네비게이션 */}
      <View className="flex-row border-b-2 border-gray-100 bg-white mt-4">
        <TouchableOpacity
          onPress={() => handleTabChange("all")}
          className="flex-1 py-3 items-center relative"
        >
          <GlobalText
            className={`text-base ${
              activeTab === "all" ? "text-black" : "text-gray-500"
            }`}
          >
            전체
          </GlobalText>
          {activeTab === "all" && (
            <View className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#4FC985]" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange("out")}
          className="flex-1 py-3 items-center relative"
        >
          <GlobalText
            className={`text-base ${
              activeTab === "out" ? "text-black" : "text-gray-500"
            }`}
          >
            나간 돈
          </GlobalText>
          {activeTab === "out" && (
            <View className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#4FC985]" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange("in")}
          className="flex-1 py-3 items-center relative"
        >
          <GlobalText
            className={`text-base ${
              activeTab === "in" ? "text-black" : "text-gray-500"
            }`}
          >
            들어온 돈
          </GlobalText>
          {activeTab === "in" && (
            <View className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#4FC985]" />
          )}
        </TouchableOpacity>
      </View>
      {/* 거래 내역 목록 */}
      <ScrollView className="flex-1 bg-white">
        {loading ? (
          <View style={{ flex: 1, backgroundColor: "white" }} />
        ) : error ? (
          <View className="flex-1 items-center justify-center py-40">
            <CalendarX size={64} color="#9CA3AF" />
            <GlobalText className="mt-4 text-lg text-gray-500">
              {error === "404" ? "이번 달 거래 내역이 없습니다" : error}
            </GlobalText>
          </View>
        ) : transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Receipt size={64} color="#9CA3AF" />
            <GlobalText className="mt-4 text-lg text-gray-500">
              조회할 거래내역이 없습니다
            </GlobalText>
            <GlobalText className="mt-2 text-sm text-gray-400">
              다른 기간을 선택해보세요
            </GlobalText>
          </View>
        ) : (
          Object.entries(groupedTransactions).map(([date, items]) => (
            <View key={date} className="pb-3">
              <View className="px-6 py-4 bg-[#F9FAFB]">
                <GlobalText className="text-base text-gray-500">
                  {date}
                </GlobalText>
              </View>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.transactionId}
                  onPress={() => {
                    const transactionId = item.transactionId?.toString();
                    if (!transactionId) return;

                    router.push({
                      pathname: "/transaction/[transactionId]",
                      params: { transactionId: transactionId },
                    });
                  }}
                >
                  <TransactionItem
                    item={{
                      transactionId: item.transactionId,
                      transactionCategoryId: item.transactionCategoryId,
                      transactionContent: item.transactionContent,
                      transactionDate: item.transactionDate,
                      transactionAmount: item.transactionAmount,
                      transactionCategoryName: item.transactionCategoryName,
                      transactionAfterBalance: item.transactionAfterBalance,
                      hashtags: item.hashtags,
                      transactionType: item.transactionType,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
