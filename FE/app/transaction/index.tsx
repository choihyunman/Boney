import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import TransactionItem from "./TransactionItem";
import { getTransactionHistory, Transaction } from "../../apis/transactionApi";
import { useRouter } from "expo-router";
import Nav from "@/components/Nav";
import { useAuthStore } from "@/stores/useAuthStore";

export default function TransactionHistory() {
  const router = useRouter();
  const { token } = useAuthStore();
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
      console.log("❌ 인증 토큰 없음:", { token });
      setError("로그인이 필요합니다.");
      router.replace("/auth"); // 로그인 페이지로 리다이렉트 추가
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

      console.log("📡 거래내역 조회 요청:", {
        year,
        month,
        type,
        hasToken: !!token,
        tokenLength: token?.length,
      });

      const response = await getTransactionHistory(
        { year, month, type },
        token
      );

      console.log("📥 API 응답:", response);
      console.log("📥 API 응답 데이터:", response.data);
      console.log("📥 API 응답 데이터 타입:", typeof response.data);
      console.log(
        "📥 API 응답 데이터 길이:",
        Array.isArray(response.data) ? response.data.length : "Not an array"
      );

      if (!response.data || !Array.isArray(response.data)) {
        console.error("❌ API 응답 데이터 형식 오류:", response);
        setError("거래 내역 데이터 형식이 올바르지 않습니다.");
        return;
      }

      setTransactions(response.data);
    } catch (err) {
      console.error("❌ 거래내역 조회 실패:", err);
      if (err instanceof Error && err.message.includes("권한")) {
        router.replace("/auth");
      }
      setError(
        err instanceof Error
          ? err.message
          : "거래 내역을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
      // 500ms 후에 디바운스 상태 해제
      setTimeout(() => {
        isDebouncingRef.current = false;
      }, 500);
    }
  }, [activeTab, currentMonth, token]);

  // 컴포넌트 마운트 시 및 탭/월 변경 시 거래 내역 조회
  useEffect(() => {
    console.log("🔄 useEffect triggered:", { token, activeTab, currentMonth });
    if (token) {
      debouncedFetchTransactions();
    }
  }, [activeTab, currentMonth, token, debouncedFetchTransactions]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    console.log("🚀 Component mounted, initial data load");
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
        <View className="flex-row items-center justify-center py-4 bg-gray-100 rounded-xl shadow-sm">
          <TouchableOpacity onPress={goToPreviousMonth} className="mr-2">
            <ChevronLeft size={20} color={"#000000"} />
          </TouchableOpacity>
          <Text className="text-lg font-medium px-10">{currentMonth}</Text>
          <TouchableOpacity onPress={goToNextMonth} className="ml-2">
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
          <Text
            className={`text-base ${
              activeTab === "all" ? "text-black" : "text-gray-500"
            }`}
          >
            전체
          </Text>
          {activeTab === "all" && (
            <View className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#4FC985]" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange("out")}
          className="flex-1 py-3 items-center relative"
        >
          <Text
            className={`text-base ${
              activeTab === "out" ? "text-black" : "text-gray-500"
            }`}
          >
            나간 돈
          </Text>
          {activeTab === "out" && (
            <View className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#4FC985]" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange("in")}
          className="flex-1 py-3 items-center relative"
        >
          <Text
            className={`text-base ${
              activeTab === "in" ? "text-black" : "text-gray-500"
            }`}
          >
            들어온 돈
          </Text>
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
          <Text className="text-center py-5 text-base text-red-500">
            {error}
          </Text>
        ) : (
          Object.entries(groupedTransactions).map(([date, items]) => (
            <View key={date} className="pb-3">
              <View className="px-6 py-4 bg-[#F9FAFB]">
                <Text className="text-base text-gray-500">{date}</Text>
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
                      icon:
                        item.transactionType === "DEPOSIT"
                          ? "allowance"
                          : "coin",
                      transactionContent: item.transactionContent,
                      transactionDate: item.transactionDate,
                      transactionAmount: item.transactionAmount,
                      transactionCategoryName: item.transactionCategoryName,
                      transactionAfterBalance: item.transactionAfterBalance,
                      hashtags: item.hashtags,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      <Nav />
    </View>
  );
}
