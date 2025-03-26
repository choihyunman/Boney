import React from "react";
import { PinInput } from "../../components/PinInput";
import { router, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { usePinStore } from "@/stores/usePinStore";
import { useAuthStore } from "@/stores/useAuthStore";
export default function ConfirmPin() {
  const { password: originalPassword } = useLocalSearchParams<{
    password: string;
  }>();
  const account = useAuthStore((state) => state.account);
  const setPin = usePinStore((state) => state.setPin);

  return (
    <PinInput
      title="비밀번호 확인"
      subtitle="비밀번호를 다시 입력해주세요."
      showBackButton={false}
      onPasswordComplete={async (confirmPassword) => {
        if (confirmPassword === originalPassword) {
          try {
            await setPin(confirmPassword); // ✅ 서버에 PIN 저장
            router.replace("/auth/CompleteSignUp");
          } catch (err) {
            Alert.alert("오류", "비밀번호 설정 중 문제가 발생했습니다.");
          }
        } else {
          Alert.alert(
            "비밀번호 불일치",
            "입력하신 비밀번호가 일치하지 않습니다. 다시 입력해주세요.",
            [{ text: "확인" }]
          );
        }
      }}
    />
  );
}
