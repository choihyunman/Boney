import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  BackHandler,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import GlobalText from "@/components/GlobalText";
import { router, useLocalSearchParams } from "expo-router";
import { useLoanRequestStore, useLoanStore } from "@/stores/useLoanChildStore";
import { createLoan } from "@/apis/loanChildApi";
import { PinInput, PinInputRef } from "@/components/PinInput";
import { approveLoan } from "@/apis/loanParentApi";
import { useApproveStore } from "@/stores/useLoanParentStore";
import Toast from "react-native-toast-message";

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const pinInputRef = useRef<PinInputRef>(null);
  const { setApprove } = useApproveStore();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldNavigateToReqList, setShouldNavigateToReqList] = useState(false);
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
        router.replace("/");
        router.replace("/loan/parent/ReqApprove");
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

      // 잔액 부족 오류 처리
      if (error.response?.status === 400) {
        // 잔액 부족 오류 메시지 확인
        const errorMessage = error.response?.data?.message || "";
        if (errorMessage.includes("잔액") || errorMessage.includes("부족")) {
          setErrorMessage("잔액이 부족합니다\n 충전 후 다시 시도해주세요");
        } else {
          // 다른 400 오류
          setErrorMessage(errorMessage || "처리 중 오류가 발생했습니다.");
        }

        // 결제 실패 시 모달 표시 후 ReqList 페이지로 이동
        setShowErrorModal(true);
      } else if (error.response?.status === 401) {
        // 비밀번호 불일치 오류 - 토스트 알림 사용
        Toast.show({
          type: "error",
          text1: "비밀번호 오류",
          text2: "비밀번호가 일치하지 않습니다.",
        });

        // 비밀번호 오류 시에는 페이지 이동 없이 입력창 초기화
        if (pinInputRef.current) {
          pinInputRef.current.clearPassword();
        }
      } else {
        // 기타 오류
        setErrorMessage("처리 중 오류가 발생했습니다.");

        // 결제 실패 시 모달 표시 후 ReqList 페이지로 이동
        setShowErrorModal(true);
      }
    }
  };

  // 모달 확인 버튼 처리
  const handleModalConfirm = () => {
    setShowErrorModal(false);
    setShowPinInput(false);
    router.replace("/loan/parent/ReqList");
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
    if (isSubmitted) {
      return;
    }

    console.log("📤 서명 완료 버튼 누름");
    if (signatureRef.current) {
      setIsSubmitted(true);
      signatureRef.current.readSignature();
    } else {
      Alert.alert("오류", "서명 참조를 가져올 수 없습니다.");
    }
  };

  // Back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  if (showPinInput) {
    return (
      <>
        <PinInput
          ref={pinInputRef}
          title="송금 비밀번호 입력"
          subtitle="대출 승인을 위해 비밀번호를 입력해주세요."
          onPasswordComplete={handlePasswordInput}
        />

        {/* 오류 모달 */}
        <Modal
          visible={showErrorModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-xl p-6 w-[80%] max-w-md">
              <GlobalText weight="bold" className="text-lg text-center mb-4">
                결제 실패
              </GlobalText>
              <GlobalText className="text-base text-center mb-6">
                {errorMessage}
              </GlobalText>
              <TouchableOpacity
                className="bg-[#4FC985] py-3 rounded-lg"
                onPress={handleModalConfirm}
              >
                <GlobalText weight="bold" className="text-white text-center">
                  확인
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6F8]">
      <View className="pb-6 bg-white">
        <GlobalText
          weight="bold"
          className="text-xl text-gray-700 text-center mb-3"
        >
          서명 안내
        </GlobalText>
        <GlobalText className="text-gray-500 text-md text-center">
          여기에 서명해 주세요{"\n"}
        </GlobalText>
        <GlobalText className="text-gray-500 text-md text-center">
          정해진 날짜 안에 꼭 갚겠다는 소중한 약속이에요
        </GlobalText>
      </View>

      <View className="flex-1 p-6">
        <View className="h-[300px] bg-white rounded-lg overflow-hidden mb-4">
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
            className="flex-1 bg-white py-4 rounded-lg"
            onPress={handleClear}
          >
            <GlobalText className="text-center text-gray-600">
              다시 작성
            </GlobalText>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#4FC985] py-4 rounded-lg"
            onPress={handleSubmit}
            disabled={isSubmitted}
          >
            <GlobalText weight="bold" className="text-center text-white">
              {isSubmitted ? "서명 제출 중" : "서명 완료"}
            </GlobalText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
