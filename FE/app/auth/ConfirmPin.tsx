import React, { useState } from "react";
import { PinInput } from "../../components/PinInput";
import { router, useLocalSearchParams } from "expo-router";
import { usePinStore } from "@/stores/usePinStore";
import { CustomAlert } from "@/components/CustomAlert";

export default function ConfirmPin() {
  const { password: originalPassword } = useLocalSearchParams<{
    password: string;
  }>();
  const setPin = usePinStore((state) => state.setPin);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    onClose: () => {},
  });

  return (
    <>
      <PinInput
        title="비밀번호 확인"
        subtitle="비밀번호를 다시 입력해주세요."
        onPasswordComplete={async (confirmPassword) => {
          if (confirmPassword === originalPassword) {
            try {
              await setPin(confirmPassword);
              router.replace("/auth/CompleteSignUp");
            } catch (err) {
              setAlertConfig({
                title: "오류",
                message: "비밀번호 설정 중 문제가 발생했습니다.",
                onClose: () => setAlertVisible(false),
              });
              setAlertVisible(true);
            }
          } else {
            setAlertConfig({
              title: "비밀번호 불일치",
              message:
                "입력하신 비밀번호가 일치하지 않습니다.\n다시 입력해주세요.",
              onClose: () => {
                setAlertVisible(false);
                router.replace("/auth/CreatePin");
              },
            });
            setAlertVisible(true);
          }
        }}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={alertConfig.onClose}
      />
    </>
  );
}
