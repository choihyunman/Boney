import React from "react";
import { View, Alert } from "react-native";
import { PinInput } from "@/components/PinInput";
import { useTransferStore } from "@/stores/useTransferStore";
import { router } from "expo-router";
import { verifyPassword } from "@/apis/pinApi";
import { transferMoney } from "@/apis/transferApi";
import * as SecureStore from "expo-secure-store";

export default function PinInputScreen() {
  const { transferData, clearTransferData } = useTransferStore();

  const formatAmount = (value: string) => {
    if (!value) return "0";
    return Number.parseInt(value).toLocaleString();
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!transferData.recipient || !transferData.amount) {
      Alert.alert("오류", "송금 정보가 없습니다.");
      return;
    }

    try {
      // 비밀번호 검증 API 호출
      const verifyResponse = await verifyPassword(password);

      if (verifyResponse.data.isMatched) {
        // 송금 API 호출
        const transferRequest = {
          sendPassword: password,
          amount: Number(transferData.amount),
          recipientBank: transferData.recipient.bankName,
          recipientAccountNumber: transferData.recipient.accountNumber.replace(
            /-/g,
            ""
          ),
        };

        const transferResponse = await transferMoney(transferRequest);

        if (transferResponse.status === "200") {
          // 송금 완료 페이지로 이동하기 전에 데이터 저장
          const completedTransferData = {
            recipient: transferData.recipient,
            amount: transferData.amount,
          };
          await SecureStore.setItemAsync(
            "completedTransfer",
            JSON.stringify(completedTransferData)
          );

          // Clear stored data
          await SecureStore.deleteItemAsync("sendMoneyRecipient");
          await SecureStore.deleteItemAsync("sendMoneyAmount");
          clearTransferData();

          // 송금 완료 페이지로 이동
          router.push("/transfer/CompleteTransfer");
        } else {
          Alert.alert(
            "오류",
            transferResponse.message || "송금 처리 중 오류가 발생했습니다."
          );
        }
      } else {
        Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("Error during transfer:", error);
      Alert.alert(
        "오류",
        "송금 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  if (!transferData.recipient || !transferData.amount) {
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      <PinInput
        title="송금 비밀번호 입력"
        subtitle={`${transferData.recipient.accountHolder}님에게 ${formatAmount(
          transferData.amount
        )}원을 송금합니다.`}
        onPasswordComplete={handlePasswordConfirm}
        onBackPress={() => router.back()}
      />
    </View>
  );
}
