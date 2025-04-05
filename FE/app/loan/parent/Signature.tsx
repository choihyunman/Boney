import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Alert, Image } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import GlobalText from "@/components/GlobalText";
import { router, useLocalSearchParams } from "expo-router";
import { useLoanRequestStore, useLoanStore } from "@/stores/useLoanChildStore";
import { createLoan } from "@/apis/loanChildApi";
import { getKSTEndOfDayString } from "@/utils/date";
import { PinInput } from "@/components/PinInput";
import { approveLoan } from "@/apis/loanParentApi";
import { useApproveStore } from "@/stores/useLoanParentStore";

interface SignatureProps {
  onClose: () => void;
  onSignatureComplete?: (signature: string) => void;
  isParent?: boolean;
  loanId?: number;
}

export default function Signature({
  onClose,
  onSignatureComplete,
  isParent = false,
  loanId,
}: SignatureProps) {
  const [signatureKey, setSignatureKey] = useState(Date.now());
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const { setApprove } = useApproveStore();
  const { isParent: isParentParam, loanId: loanIdParam } =
    useLocalSearchParams<{ isParent?: string; loanId?: string }>();

  // params에서 isParent와 loanId를 가져옴
  const isParentFromParams = isParentParam === "true";
  const loanIdFromParams = loanIdParam ? Number(loanIdParam) : undefined;

  // props와 params 중 하나라도 true면 isParent로 처리
  const finalIsParent = isParent || isParentFromParams;
  const finalLoanId = loanId || loanIdFromParams;

  const { request } = useLoanRequestStore();
  const { amount, dueDate } = request;
  const setLatestLoan = useLoanStore((state) => state.setLatestLoan);

  const handlePasswordInput = async (password: string) => {
    console.log("4. handlePasswordInput 시작");
    console.log("isParent:", finalIsParent);
    console.log("loanId:", finalLoanId);
    console.log("signatureImage:", signatureImage ? "있음" : "없음");
    try {
      if (finalIsParent && finalLoanId) {
        console.log("5. 부모 서명 처리 시작");
        // 부모 서명인 경우 API 호출
        const requestData = {
          loan_id: finalLoanId,
          password: password,
          parent_signature: signatureImage!.split(",")[1],
        };
        console.log("API 요청 데이터:", {
          ...requestData,
          parent_signature:
            requestData.parent_signature.substring(0, 20) + "...", // 서명 데이터가 너무 길어서 일부만 출력
        });

        const response = await approveLoan(requestData);
        console.log("API 응답:", response);

        // 응답 데이터를 스토어에 저장
        setApprove("data", response.data);
        setShowPinInput(false);
        router.push("/loan/parent/ReqApprove");
      } else {
        const response = await createLoan({
          loan_amount: amount ?? 0,
          due_date: dueDate
            ? `${dueDate}T00:00:00`
            : new Date().toISOString().split("T")[0] + "T00:00:00",
          child_signature: signatureImage!.split(",")[1],
        });

        setLatestLoan(response.data);
        setShowPinInput(false);
        router.push("/loan/child/ReqComplete");
      }
    } catch (error: any) {
      console.error("API 호출 중 오류:", {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.message,
        headers: error.response?.headers,
      });
      Alert.alert("오류", "처리 중 오류가 발생했습니다.");
    }
  };

  const handleSignature = async (signatureImage: string) => {
    try {
      console.log("1. handleSignature 시작");
      console.log("✅ onOK 콜백으로 서명 받음");
      console.log("📸 서명 이미지 전체 데이터:", signatureImage);

      if (!signatureImage || signatureImage.trim().length === 0) {
        Alert.alert("알림", "서명을 해주세요.");
        return;
      }

      // 데이터 URL 형식 확인 및 처리
      if (!signatureImage.startsWith("data:image/png;base64,")) {
        Alert.alert("오류", "서명 이미지 형식이 올바르지 않습니다.");
        return;
      }

      // base64 문자열만 추출
      const base64Image = signatureImage.split(",")[1];
      setSignatureImage(signatureImage); // 미리보기를 위해 저장

      console.log("2. PIN 입력 모달 표시 전");
      // PIN 입력 모달 표시
      setShowPinInput(true);
      console.log("3. PIN 입력 모달 표시 후");
    } catch (error) {
      console.error("❌ 서명 처리 중 오류:", error);
      Alert.alert("오류", "서명 처리 중 오류가 발생했습니다.");
    }
  };

  const handleClear = () => {
    console.log("🧹 다시 작성");
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
      setSignatureImage(null);
    } else {
      setSignatureKey(Date.now());
    }
  };

  const handleSubmit = () => {
    console.log("📤 서명 완료 버튼 누름");
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    } else {
      Alert.alert("오류", "서명 참조를 가져올 수 없습니다.");
    }
  };

  if (showPinInput) {
    return (
      <PinInput
        title="송금 비밀번호 입력"
        subtitle="대출 승인을 위해 비밀번호를 입력해주세요."
        onPasswordComplete={handlePasswordInput}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-gray-50 border-b border-gray-200">
        <GlobalText className="text-gray-600 text-center mb-2">
          서명 안내
        </GlobalText>
        <GlobalText className="text-gray-500 text-sm text-center">
          여기에 서명해 주세요. 정해진 날짜 안에 꼭 갚겠다는 소중한 약속이에요.
        </GlobalText>
      </View>

      <View className="flex-1 p-4">
        <View className="h-[300px] bg-white rounded-lg overflow-hidden mb-4 border border-gray-200">
          <SignatureCanvas
            ref={signatureRef}
            key={signatureKey}
            onOK={handleSignature}
            onEmpty={() => {
              Alert.alert("알림", "서명을 해주세요.");
            }}
            descriptionText=""
            clearText=""
            confirmText=""
            webStyle={`
              .m-signature-pad {
                border: none;
                background-color: white;
                width: 100%;
                height: 100%;
              }
              .m-signature-pad--body {
                border: none;
                background-color: white;
              }
              canvas {
                border: none;
                background-color: white;
              }
              .m-signature-pad--footer {
                display: none;
              }
            `}
          />
        </View>

        <View className="flex-row justify-between gap-4">
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-3 rounded-lg"
            onPress={handleClear}
          >
            <GlobalText className="text-center text-gray-600">
              다시 작성
            </GlobalText>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#4FC985] py-3 rounded-lg"
            onPress={handleSubmit}
          >
            <GlobalText className="text-center text-white">
              서명 완료
            </GlobalText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
