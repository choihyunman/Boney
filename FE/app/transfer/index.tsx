import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Banknote, Users } from "lucide-react-native";
import { useTransferStore } from "@/stores/useTransferStore";
import TransferProgress from "./TransferProgress";
import BottomButton from "@/components/Button";
import GlobalText from "@/components/GlobalText";
import { getFavoriteAccounts } from "@/apis/transferApi";

// 계좌 정보 타입 정의
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
}

export default function SendMoneyRecipient() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { setRecipient, clearTransferData } = useTransferStore();
  const [registeredAccounts, setRegisteredAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 계좌 목록 로드
  useEffect(() => {
    const loadSavedAccounts = async () => {
      try {
        const response = await getFavoriteAccounts();
        // API 응답 데이터를 Account 형식으로 변환
        const accounts: Account[] = response.data.map((item) => ({
          id: item.favoriteId.toString(),
          bankName: item.bankName,
          accountNumber: item.favoriteAccount,
          ownerName: item.accountHolder,
        }));
        setRegisteredAccounts(accounts);
      } catch (error) {
        console.error("계좌 목록 조회 중 오류 발생:", error);
        Alert.alert(
          "오류",
          "계좌 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedAccounts();
  }, []);

  const handleAccountTransfer = () => {
    router.push("/transfer/Account");
  };

  const handleNext = async () => {
    if (selectedAccount) {
      try {
        setRecipient(selectedAccount);
        router.push("/transfer/Amount");
      } catch (error) {
        console.error("Error saving recipient data:", error);
      }
    }
  };

  // 컴포넌트 마운트 시 이전 데이터 초기화
  useEffect(() => {
    clearTransferData();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 w-full bg-[#F9FAFB]">
        {/* Progress Steps */}
        <TransferProgress currentStep={1} />

        {/* 계좌 직접 입력 버튼 */}
        <View className="mx-5 mt-4 p-1">
          <Pressable
            className="w-full p-3 bg-white border border-gray-200 rounded-lg flex-row items-center justify-center"
            onPress={handleAccountTransfer}
          >
            <GlobalText className="font-medium py-1">
              계좌번호 직접 입력하기
            </GlobalText>
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* 등록된 계좌 목록 */}
          <View className="mx-5 mt-6 mb-24">
            <GlobalText className="text-lg font-bold mb-3">
              등록된 계좌
            </GlobalText>
            <View className="gap-2">
              {isLoading ? (
                <View className="p-8 rounded-xl items-center justify-center">
                  <GlobalText className="text-gray-500">로딩 중...</GlobalText>
                </View>
              ) : registeredAccounts.length > 0 ? (
                registeredAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    className={`p-5 rounded-xl border ${
                      selectedAccount?.id === account.id
                        ? "bg-[#4FC985]/10 border-[#4FC985]"
                        : "bg-white border-gray-100"
                    }`}
                    onPress={() => setSelectedAccount(account)}
                  >
                    <View className="flex-row items-center gap-4">
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center ${
                          selectedAccount?.id === account.id
                            ? "bg-[#4FC985]/20"
                            : "bg-[#4FC985]/10"
                        }`}
                      >
                        <Banknote color="#4FC985" size={24} />
                      </View>
                      <View>
                        <View className="flex-row items-center gap-2 mb-1">
                          <GlobalText
                            className={`text-lg font-medium ${
                              selectedAccount?.id === account.id
                                ? "text-[#4FC985]"
                                : ""
                            }`}
                          >
                            {account.ownerName}
                          </GlobalText>
                          <GlobalText className="text-sm text-gray-500">
                            {account.bankName}
                          </GlobalText>
                        </View>
                        <GlobalText className="text-sm text-gray-500">
                          {account.accountNumber}
                        </GlobalText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="p-8 rounded-xl items-center justify-center">
                  <Users color="#D1D5DB" size={48} />
                  <GlobalText className="text-gray-500 mt-3">
                    등록된 계좌가 없습니다
                  </GlobalText>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* 다음 버튼 */}
        <BottomButton
          onPress={handleNext}
          disabled={!selectedAccount}
          text="다음"
          variant={selectedAccount ? "primary" : "secondary"}
        />
      </View>
    </SafeAreaView>
  );
}
