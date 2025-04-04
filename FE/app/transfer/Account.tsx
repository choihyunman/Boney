import React, { useState, useEffect } from "react";
import { View, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Banknote, ChevronDown, Check } from "lucide-react-native";
import TransferProgress from "./TransferProgress";
import { useTransferStore } from "@/stores/useTransferStore";
import BottomButton from "@/components/Button";
import GlobalText from "@/components/GlobalText";
import { addFavoriteAccount } from "@/apis/transferApi";
import Toast from "react-native-toast-message";

// Account type definition
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
}

const bankList = [{ id: "boney", name: "버니은행" }];

export default function AccountForm() {
  const { setRecipient, saveTransferData, addSavedAccount, setAmount } =
    useTransferStore();
  const [showBankList, setShowBankList] = useState(false);
  const [saveAccount, setSaveAccount] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [accountForm, setAccountForm] = useState({
    bankName: "",
    accountNumber: "",
    ownerName: "",
  });

  const [errors, setErrors] = useState({
    bankName: "",
    accountNumber: "",
    ownerName: "",
  });

  const handleBankSelect = (bankName: string) => {
    setAccountForm({
      ...accountForm,
      bankName,
    });
    setErrors({
      ...errors,
      bankName: "",
    });
    setShowBankList(false);
  };

  const formatAccountNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");

    if (numbers.length <= 6) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 6)}-${numbers.slice(6, 12)}-${numbers.slice(
        12
      )}`;
    }
  };

  const handleAccountNumberChange = (value: string) => {
    const formatted = formatAccountNumber(value);
    setAccountForm({
      ...accountForm,
      accountNumber: formatted,
    });
    setErrors({
      ...errors,
      accountNumber: "",
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      bankName: "",
      accountNumber: "",
      ownerName: "",
    };

    if (!accountForm.bankName) {
      newErrors.bankName = "은행을 선택해주세요.";
      isValid = false;
    }

    if (!accountForm.accountNumber) {
      newErrors.accountNumber = "계좌번호를 입력해주세요.";
      isValid = false;
    } else if (accountForm.accountNumber.replace(/[^0-9]/g, "").length < 10) {
      newErrors.accountNumber = "유효한 계좌번호를 입력해주세요.";
      isValid = false;
    }

    if (!accountForm.ownerName) {
      newErrors.ownerName = "예금주명을 입력해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [accountForm]);

  const handleNext = async () => {
    setShowErrors(true);
    if (validateForm()) {
      const newAccount = {
        id: Date.now().toString(),
        bankName: accountForm.bankName,
        accountNumber: accountForm.accountNumber,
        ownerName: accountForm.ownerName,
      };

      try {
        setRecipient(newAccount);

        if (saveAccount) {
          try {
            await addFavoriteAccount(
              accountForm.bankName,
              accountForm.accountNumber.replace(/-/g, "")
            );
            await addSavedAccount(newAccount);
          } catch (error: any) {
            console.error("계좌 등록 중 오류 발생:", error);
            Toast.show({
              type: "error",
              text1: "계좌 등록 실패",
              text2: error.message || "계좌 등록 중 오류가 발생했습니다.",
            });
            return;
          }
        }

        await saveTransferData();
        router.push("/transfer/Amount");
      } catch (error) {
        console.error("계좌 저장 중 오류 발생:", error);
        Alert.alert(
          "오류",
          "계좌 정보 저장 중 오류가 발생했습니다. 다시 시도해주세요."
        );
      }
    }
  };

  // 컴포넌트 마운트 시 이전 금액 초기화
  useEffect(() => {
    setAmount("");
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Progress Steps */}
        <TransferProgress currentStep={1} />

        {/* Form Section */}
        <View className="m-5 bg-white rounded-xl p-6 border border-gray-100">
          {/* Bank Selection */}
          <View className="mb-4">
            <GlobalText className="text-base text-gray-600 mb-2">
              은행 선택
            </GlobalText>
            <Pressable
              className={`p-3 border border-gray-200 rounded-lg flex-row items-center justify-between ${
                errors.bankName && showErrors ? "border-red-500" : ""
              }`}
              onPress={() => setShowBankList(!showBankList)}
            >
              <View className="flex-row items-center gap-3">
                <GlobalText
                  className={`text-base ${
                    accountForm.bankName ? "text-black" : "text-[#9CA3AF]"
                  }`}
                >
                  {accountForm.bankName || "은행을 선택하세요"}
                </GlobalText>
              </View>
              <ChevronDown size={18} color="#9CA3AF" />
            </Pressable>
            {errors.bankName && showErrors && (
              <GlobalText className="text-xs text-red-500 mt-1">
                {errors.bankName}
              </GlobalText>
            )}

            {showBankList && (
              <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                {bankList.map((bank) => (
                  <Pressable
                    key={bank.id}
                    className={`p-3 flex-row items-center gap-3 ${
                      accountForm.bankName === bank.name ? "bg-[#4FC985]" : ""
                    }`}
                    onPress={() => handleBankSelect(bank.name)}
                  >
                    <Banknote
                      color={
                        accountForm.bankName === bank.name ? "white" : "#49DB8A"
                      }
                      size={24}
                    />
                    <GlobalText
                      className={
                        accountForm.bankName === bank.name ? "text-white" : ""
                      }
                    >
                      {bank.name}
                    </GlobalText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Account Number Input */}
          <View className="mb-4">
            <GlobalText className="text-base text-gray-600 mb-2">
              계좌번호
            </GlobalText>
            <TextInput
              placeholder="숫자만 입력하세요"
              placeholderTextColor="#9CA3AF"
              className={`p-3 border border-gray-200 rounded-lg text-base ${
                errors.accountNumber && showErrors ? "border-red-500" : ""
              }`}
              style={{ fontFamily: "NEXONLv1Gothic-Regular" }}
              value={accountForm.accountNumber}
              onChangeText={handleAccountNumberChange}
              keyboardType="numeric"
            />
            {errors.accountNumber && showErrors && (
              <GlobalText className="text-xs text-red-500 mt-1">
                {errors.accountNumber}
              </GlobalText>
            )}
          </View>

          {/* Account Owner Input */}
          <View className="mb-4">
            <GlobalText className="text-base text-gray-600 mb-2">
              예금주명
            </GlobalText>
            <TextInput
              placeholder="예금주명을 입력하세요"
              placeholderTextColor="#9CA3AF"
              className={`p-3 border border-gray-200 rounded-lg text-base ${
                errors.ownerName && showErrors ? "border-red-500" : ""
              }`}
              style={{ fontFamily: "NEXONLv1Gothic-Regular" }}
              value={accountForm.ownerName}
              onChangeText={(value) =>
                setAccountForm({ ...accountForm, ownerName: value })
              }
            />
            {errors.ownerName && showErrors && (
              <GlobalText className="text-xs text-red-500 mt-1">
                {errors.ownerName}
              </GlobalText>
            )}
          </View>

          {/* Save Account Option */}
          <Pressable
            className="flex-row items-center gap-3 mb-4"
            onPress={() => setSaveAccount(!saveAccount)}
          >
            <View
              className={`w-6 h-6 rounded items-center justify-center ${
                saveAccount ? "bg-[#4FC985]" : "border border-gray-300"
              }`}
            >
              {saveAccount && <Check size={16} color="white" />}
            </View>
            <GlobalText className="text-base">계좌 정보 저장하기</GlobalText>
          </Pressable>

          {/* Info Message */}
          <View className="bg-gray-50 p-3 mt-2 rounded-lg">
            <GlobalText className="text-sm text-gray-600">
              • 계좌번호와 예금주명을 정확히 입력해주세요.{"\n"}• 잘못된 계좌로
              송금된 경우 되돌릴 수 없습니다.{"\n"}• 저장된 계좌는 '내 계좌
              목록'에서 확인할 수 있습니다.
            </GlobalText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <BottomButton
        onPress={handleNext}
        disabled={!isFormValid}
        text="다음"
        variant={isFormValid ? "primary" : "secondary"}
      />
    </View>
  );
}
