import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Banknote, ChevronDown, Check } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

// Account type definition
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
}

// Bank list
const bankList = [
  { id: "kb", name: "KB국민은행" },
  { id: "shinhan", name: "신한은행" },
  { id: "woori", name: "우리은행" },
  { id: "hana", name: "하나은행" },
  { id: "nh", name: "농협은행" },
  { id: "ibk", name: "IBK기업은행" },
  { id: "sc", name: "SC제일은행" },
  { id: "keb", name: "KEB하나은행" },
  { id: "kakao", name: "카카오뱅크" },
  { id: "toss", name: "토스뱅크" },
];

export default function AccountForm() {
  const [showBankList, setShowBankList] = useState(false);
  const [saveAccount, setSaveAccount] = useState(false);

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
    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      const newAccount: Account = {
        id: Date.now().toString(),
        bankName: accountForm.bankName,
        accountNumber: accountForm.accountNumber,
        ownerName: accountForm.ownerName,
      };

      try {
        SecureStore.setItemAsync(
          "sendMoneyRecipient",
          JSON.stringify(newAccount)
        );

        if (saveAccount) {
          SecureStore.getItemAsync("savedAccounts").then((savedAccounts) => {
            const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
            accounts.push(newAccount);
            SecureStore.setItemAsync("savedAccounts", JSON.stringify(accounts));
          });
        }
      } catch (error) {
        console.error("계좌 저장 중 오류 발생:", error);
      }

      router.push("/transfer/Amount");
    }
  };

  useEffect(() => {
    SecureStore.deleteItemAsync("sendMoneyAmount");
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-5 bg-white flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()}>
              <ChevronLeft color="#374151" size={24} />
            </Pressable>
          </View>
        </View>

        {/* Progress Steps */}
        <View className="px-5 py-3 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="text-xs mt-1 text-green-500 font-medium">
                받는 사람
              </Text>
            </View>
            <View className="flex-1 h-1 bg-gray-200" />
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-gray-600 font-bold">2</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">금액</Text>
            </View>
            <View className="flex-1 h-1 bg-gray-200" />
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-gray-600 font-bold">3</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">확인</Text>
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View className="m-5 mt-6 bg-white rounded-xl p-6 border border-gray-100">
          <Text className="font-bold text-lg mb-4">계좌 정보 입력</Text>

          {/* Bank Selection */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">은행 선택</Text>
            <TouchableOpacity
              className={`p-3 border border-gray-200 rounded-lg flex-row items-center justify-between ${
                errors.bankName ? "border-red-500" : ""
              }`}
              onPress={() => setShowBankList(!showBankList)}
            >
              <View className="flex-row items-center gap-2">
                {accountForm.bankName ? (
                  <View className="flex-row items-center gap-2">
                    <Banknote color="#49DB8A" size={18} />
                    <Text className="text-black">{accountForm.bankName}</Text>
                  </View>
                ) : (
                  <Text className="text-gray-400">은행을 선택하세요</Text>
                )}
              </View>
              <ChevronDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.bankName && (
              <Text className="text-xs text-red-500 mt-1">
                {errors.bankName}
              </Text>
            )}

            {showBankList && (
              <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                {bankList.map((bank) => (
                  <TouchableOpacity
                    key={bank.id}
                    className="p-3 flex-row items-center gap-2"
                    onPress={() => handleBankSelect(bank.name)}
                  >
                    <Banknote color="#49DB8A" size={16} />
                    <Text>{bank.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Account Number Input */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">계좌번호</Text>
            <TextInput
              placeholder="숫자만 입력하세요"
              className={`p-3 border border-gray-200 rounded-lg ${
                errors.accountNumber ? "border-red-500" : ""
              }`}
              value={accountForm.accountNumber}
              onChangeText={handleAccountNumberChange}
              keyboardType="numeric"
            />
            {errors.accountNumber && (
              <Text className="text-xs text-red-500 mt-1">
                {errors.accountNumber}
              </Text>
            )}
          </View>

          {/* Account Owner Input */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">예금주명</Text>
            <TextInput
              placeholder="예금주명을 입력하세요"
              className={`p-3 border border-gray-200 rounded-lg ${
                errors.ownerName ? "border-red-500" : ""
              }`}
              value={accountForm.ownerName}
              onChangeText={(value) =>
                setAccountForm({ ...accountForm, ownerName: value })
              }
            />
            {errors.ownerName && (
              <Text className="text-xs text-red-500 mt-1">
                {errors.ownerName}
              </Text>
            )}
          </View>

          {/* Save Account Option */}
          <TouchableOpacity
            className="flex-row items-center gap-2 mb-4"
            onPress={() => setSaveAccount(!saveAccount)}
          >
            <View
              className={`w-5 h-5 rounded items-center justify-center ${
                saveAccount ? "bg-green-500" : "border border-gray-300"
              }`}
            >
              {saveAccount && <Check size={14} color="white" />}
            </View>
            <Text className="text-sm">이 계좌 정보를 저장하기</Text>
          </TouchableOpacity>

          {/* Info Message */}
          <View className="bg-gray-50 p-3 rounded-lg mb-4">
            <Text className="text-xs text-gray-600">
              • 계좌번호와 예금주명을 정확히 입력해주세요.{"\n"}• 잘못된 계좌로
              송금된 경우 되돌릴 수 없습니다.{"\n"}• 저장된 계좌는 '내 계좌
              목록'에서 확인할 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="p-5 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="p-3 bg-green-500 rounded-lg flex-row items-center justify-center gap-2"
          onPress={handleNext}
        >
          <Text className="text-white font-medium">다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
