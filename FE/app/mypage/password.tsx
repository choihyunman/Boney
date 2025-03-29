import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { PinInput } from "@/components/PinInput";
import { api } from "@/lib/api";
import { CustomAlert } from "@/components/CustomAlert";
import * as SecureStore from "expo-secure-store";

export default function ChangePassword() {
  const [step, setStep] = useState<"current" | "new" | "confirm">("current");
  const [newPassword, setNewPassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    onClose: () => {},
  });

  const handleCurrentPassword = async (password: string) => {
    try {
      const response = await api.post("/account/password/verify", {
        send_password: password,
      });

      if (response.data.data.isMatched === false) {
        setAlertConfig({
          title: "비밀번호 오류",
          message: "현재 비밀번호가 일치하지 않습니다.\n다시 입력해주세요.",
          onClose: () => setAlertVisible(false),
        });
        setAlertVisible(true);
      } else {
        setStep("new");
      }
    } catch (error: any) {
      const status = error?.response?.status;
      let errorMessage = "비밀번호 확인 중 문제가 발생했습니다.";

      if (status === 400) {
        errorMessage = "비밀번호 형식이 올바르지 않습니다.";
      } else if (status === 404) {
        errorMessage = "계정 정보를 찾을 수 없습니다.";
      }

      setAlertConfig({
        title: "오류",
        message: errorMessage,
        onClose: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    }
  };

  const handleNewPassword = (password: string) => {
    setNewPassword(password);
    setStep("confirm");
  };

  const handleConfirmPassword = async (confirmPassword: string) => {
    if (confirmPassword === newPassword) {
      try {
        await api.post("/account/password", {
          password: confirmPassword,
        });

        await SecureStore.setItemAsync("pin", confirmPassword);

        setAlertConfig({
          title: "변경 완료",
          message: "비밀번호가 성공적으로 변경되었습니다.",
          onClose: () => {
            setAlertVisible(false);
            router.back();
          },
        });
        setAlertVisible(true);
      } catch (error) {
        setAlertConfig({
          title: "오류",
          message: "비밀번호 변경 중 문제가 발생했습니다.",
          onClose: () => setAlertVisible(false),
        });
        setAlertVisible(true);
      }
    } else {
      setAlertConfig({
        title: "비밀번호 불일치",
        message: "새 비밀번호가 일치하지 않습니다.\n다시 입력해주세요.",
        onClose: () => {
          setAlertVisible(false);
          setStep("new");
        },
      });
      setAlertVisible(true);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "current":
        return (
          <PinInput
            title="현재 비밀번호 입력"
            subtitle="현재 비밀번호를 입력해주세요."
            onPasswordComplete={handleCurrentPassword}
          />
        );
      case "new":
        return (
          <PinInput
            title="새 비밀번호 입력"
            subtitle="새로운 비밀번호를 입력해주세요."
            onPasswordComplete={handleNewPassword}
          />
        );
      case "confirm":
        return (
          <PinInput
            title="비밀번호 확인"
            subtitle="새 비밀번호를 다시 입력해주세요."
            onPasswordComplete={handleConfirmPassword}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderStep()}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={alertConfig.onClose}
      />
    </SafeAreaView>
  );
}
