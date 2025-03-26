import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { ChevronRight, Wallet } from "lucide-react-native";
import CategoryModal from "./CategoryModal";
import HashtagModal from "./Hashtag";
import {
  getTransactionDetail,
  TransactionDetailResponse,
  updateTransactionCategory,
} from "../../apis/transactionApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { getCategoryIcon } from "../../utils/categoryUtils";
import GlobalText from "@/components/GlobalText";

// formatAmount 함수 추가
const formatAmount = (amount: number, type: "WITHDRAWAL" | "DEPOSIT") => {
  const prefix = type === "DEPOSIT" ? "+" : "-";
  return `${prefix}${Math.abs(amount).toLocaleString()}원`;
};

interface CategoryInfo {
  id: number;
  name: string;
}

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo>({
    id: 0,
    name: "",
  });

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

  // 거래 상세 정보를 가져온 후 selectedCategory 업데이트
  useEffect(() => {
    if (transaction) {
      setSelectedCategory({
        id: transaction.transactionCategoryId,
        name: transaction.transactionCategoryName,
      });
    }
  }, [transaction]);

  const fetchTransactionDetail = async () => {
    if (!transactionId || !/^\d+$/.test(transactionId)) {
      console.log("❌ 잘못된 거래 ID:", transactionId);
      console.log("🧐 useLocalSearchParams 결과:", params);
      setError("유효하지 않은 거래 내역입니다.");
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentToken = useAuthStore.getState().token;
      console.log("📡 거래 상세 조회 요청:", {
        transactionId: transactionId,
        hasToken: !!currentToken,
        token: currentToken,
      });

      if (!currentToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await getTransactionDetail(
        Number(transactionId),
        currentToken
      );
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

  const handleCategorySelect = async (
    categoryId: number,
    categoryName: string
  ) => {
    if (!token || !transactionId) {
      console.error("❌ 토큰 또는 거래 ID 없음:", { token, transactionId });
      return;
    }

    try {
      console.log("📡 카테고리 수정 요청:", {
        transactionId,
        categoryId,
        categoryName,
      });

      const response = await updateTransactionCategory(
        Number(transactionId),
        categoryId,
        token
      );

      console.log("✅ 카테고리 수정 성공:", response);

      // 선택된 카테고리 상태 업데이트
      setSelectedCategory({ id: categoryId, name: categoryName });

      // 모달 닫기
      setIsCategoryModalOpen(false);

      // 거래 내역 다시 불러오기
      await fetchTransactionDetail();
    } catch (err) {
      console.error("❌ 카테고리 수정 실패:", err);
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "카테고리 수정에 실패했습니다."
      );
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
        <GlobalText className="text-lg text-gray-600">로딩 중...</GlobalText>
      </View>
    );
  if (error)
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <GlobalText className="text-lg text-red-500 text-center">
          {error}
        </GlobalText>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-[#4FC985] rounded-lg"
          onPress={fetchTransactionDetail}
        >
          <GlobalText className="text-white font-medium">다시 시도</GlobalText>
        </TouchableOpacity>
      </View>
    );
  if (!transaction)
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <GlobalText className="text-lg text-gray-600">
          거래 내역을 찾을 수 없습니다.
        </GlobalText>
      </View>
    );

  const { Icon, backgroundColor, iconColor } = getCategoryIcon(
    transaction.transactionCategoryName
  );

  return (
    <View className="flex-1 bg-white">
      {/* Main Top: Amount */}
      <View className="items-center justify-center py-16 px-4">
        <View
          className="rounded-full p-6 mb-4"
          style={{
            backgroundColor: backgroundColor
              .replace("bg-[", "")
              .replace("]", ""),
          }}
        >
          <Icon size={40} color={iconColor} />
        </View>
        <GlobalText className="text-[#4FC985] text-3xl font-semibold">
          {formatAmount(
            transaction.transactionAmount,
            transaction.transactionType
          )}
        </GlobalText>
      </View>

      {/* Main Bottom: Transaction Info */}
      <View className="px-6">
        <View className="bg-white rounded-lg border border-gray-200">
          {/* Category */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-200"
            onPress={() => setIsCategoryModalOpen(true)}
          >
            <GlobalText className="text-gray-600">카테고리</GlobalText>
            <View className="flex-row items-center">
              <GlobalText className="mr-2">
                {transaction.transactionCategoryName}
              </GlobalText>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Transaction Content */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <GlobalText className="text-gray-600">거래내용</GlobalText>
            <GlobalText className="mr-2">
              {transaction.transactionContent}
            </GlobalText>
          </View>

          {/* Transaction Date */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <GlobalText className="text-gray-600">거래일시</GlobalText>
            <GlobalText className="mr-2">
              {new Date(transaction.transactionDate).toLocaleString()}
            </GlobalText>
          </View>

          {/* Balance */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <GlobalText className="text-gray-600">잔액</GlobalText>
            <GlobalText className="mr-2">
              {Math.abs(transaction.transactionAmount).toLocaleString()}원
            </GlobalText>
          </View>

          {/* Hashtags */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setIsHashtagModalOpen(true)}
          >
            <GlobalText className="text-gray-600">해시태그</GlobalText>
            <View className="flex-row items-center gap-2">
              {transaction.hashtags.map((tag, index) => (
                <GlobalText key={index} className="text-[#4FC985] text-sm">
                  #{tag}
                </GlobalText>
              ))}
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <CategoryModal
        visible={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        selectedCategory={selectedCategory.id}
        onSelectCategory={(categoryId, categoryName) =>
          handleCategorySelect(categoryId, categoryName)
        }
      />

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
