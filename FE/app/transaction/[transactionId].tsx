import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { ChevronRight, Wallet } from "lucide-react-native";
import IncomeCategory from "./IncomeCategory";
import ExpenseCategory from "./ExpenseCategory";
import HashtagModal from "./Hashtag";
import {
  getTransactionDetail,
  TransactionDetailResponse,
  updateTransactionCategory,
} from "../../apis/transactionApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

// formatAmount 함수 추가
const formatAmount = (amount: number, type: "WITHDRAWAL" | "DEPOSIT") => {
  const prefix = type === "DEPOSIT" ? "+" : "-";
  return `${prefix}${Math.abs(amount).toLocaleString()}원`;
};

export default function TransactionDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transactionId =
    typeof params.transactionId === "string" ? params.transactionId : undefined;
  const { token } = useAuthStore();
  const [transaction, setTransaction] = useState<
    TransactionDetailResponse["data"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isHashtagModalOpen, setIsHashtagModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    console.log("🔄 TransactionDetail mounted:", {
      transactionId,
      hasToken: !!token,
      tokenLength: token?.length,
    });
    if (transactionId && token) {
      fetchTransactionDetail();
    }
  }, [transactionId, token]);

  const fetchTransactionDetail = async () => {
    if (!transactionId || !/^\d+$/.test(transactionId)) {
      console.log("❌ 잘못된 거래 ID:", transactionId);
      console.log("🧐 useLocalSearchParams 결과:", params);
      setError("유효하지 않은 거래 내역입니다.");
      router.back();
      return;
    }

    if (!token) {
      console.log("❌ 인증 토큰 없음");
      setError("로그인이 필요합니다.");
      router.replace("/auth");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📡 거래 상세 조회 요청:", {
        transactionId: transactionId,
        hasToken: !!token,
        tokenLength: token?.length,
      });

      const response = await getTransactionDetail(Number(transactionId), token);

      console.log("📥 거래 상세 조회 응답:", response);
      setTransaction(response.data);
    } catch (err) {
      console.error("❌ 거래 상세 조회 실패:", err);

      if (err instanceof Error) {
        if (err.message.includes("권한")) {
          router.replace("/auth"); // 권한 관련 에러시 로그인 페이지로 이동
        } else if (err.message.includes("찾을 수 없습니다")) {
          router.back(); // 존재하지 않는 거래의 경우 이전 페이지로
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : "거래 내역을 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    try {
      if (!token || !transactionId) {
        throw new Error("인증 토큰 또는 거래 ID가 없습니다.");
      }

      await updateTransactionCategory(
        Number(transactionId),
        Number(categoryId),
        token
      );
      setSelectedCategory(categoryId);
      setIsCategoryModalOpen(false);
      // 성공 시 데이터 다시 불러오기
      fetchTransactionDetail();
    } catch (err) {
      console.error("Error updating category:", err);
      // 에러 처리 로직 추가
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  const handleHashtagSave = async (hashtags: string[]) => {
    fetchTransactionDetail();
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading)
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">로딩 중...</Text>
      </View>
    );
  if (error)
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-lg text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-[#4FC985] rounded-lg"
          onPress={fetchTransactionDetail}
        >
          <Text className="text-white font-medium">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  if (!transaction)
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">
          거래 내역을 찾을 수 없습니다.
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      {/* Main Top: Amount */}
      <View className="items-center justify-center py-12 px-4">
        <View className="bg-[#E8F7EF] rounded-full p-4 mb-4">
          <Wallet size={32} color="#4FC985" />
        </View>
        <Text className="text-[#4FC985] text-3xl font-semibold">
          {formatAmount(
            transaction.transactionAmount,
            transaction.transactionType
          )}
        </Text>
      </View>

      {/* Main Bottom: Transaction Info */}
      <View className="px-6">
        <View className="bg-white rounded-lg border border-gray-200">
          {/* Category */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-200"
            onPress={() => setIsCategoryModalOpen(true)}
          >
            <Text className="text-gray-600">카테고리</Text>
            <View className="flex-row items-center">
              <Text className="mr-2">
                {transaction.transactionCategoryName}
              </Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Transaction Content */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-600">거래내용</Text>
            <Text className="mr-2">{transaction.transactionContent}</Text>
          </View>

          {/* Transaction Date */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-600">거래일시</Text>
            <Text className="mr-2">
              {new Date(transaction.transactionDate).toLocaleString()}
            </Text>
          </View>

          {/* Balance */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-600">잔액</Text>
            <Text className="mr-2">
              {Math.abs(transaction.transactionAmount).toLocaleString()}원
            </Text>
          </View>

          {/* Hashtags */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setIsHashtagModalOpen(true)}
          >
            <Text className="text-gray-600">해시태그</Text>
            <View className="flex-row items-center gap-2">
              {transaction.hashtags.map((tag, index) => (
                <Text key={index} className="text-[#4FC985] text-sm">
                  #{tag}
                </Text>
              ))}
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      {transaction.transactionType === "DEPOSIT" ? (
        <IncomeCategory
          visible={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      ) : (
        <ExpenseCategory
          visible={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {token && (
        <HashtagModal
          visible={isHashtagModalOpen}
          onClose={() => setIsHashtagModalOpen(false)}
          onSave={handleHashtagSave}
          transactionId={Number(transactionId)}
          token={token}
          initialHashtags={transaction.hashtags}
        />
      )}
    </View>
  );
}
