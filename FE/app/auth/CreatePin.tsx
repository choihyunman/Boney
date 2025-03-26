import React from "react";
import { PinInput } from "../../components/PinInput";
import { router } from "expo-router";

export default function CreatePin() {
  return (
    <PinInput
      title="비밀번호 입력"
      subtitle="앱 사용을 위해 비밀번호를 입력해주세요."
      showBackButton={false}
      // onForgotPasswordPress={() => router.push("/forgot-password")}
      onPasswordComplete={(password) => {
        // 비밀번호 검증 로직
        console.log("입력된 비밀번호:", password);
        // 다음 페이지로 이동하면서 비밀번호 전달
        router.push({
          pathname: "/auth/ConfirmPin",
          params: { password },
        } as any);
      }}
    />
  );
}
