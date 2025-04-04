import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Alert, Image } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import GlobalText from "@/components/GlobalText";
import { router } from "expo-router";
import { useLoanRequestStore, useLoanStore } from "@/stores/useLoanChildStore";
import { createLoan } from "@/apis/loanChildApi";
import { getKSTEndOfDayString } from "@/utils/date";

interface SignatureProps {
  onClose: () => void;
}

export default function Signature({ onClose }: SignatureProps) {
  const [signatureKey, setSignatureKey] = useState(Date.now());
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const setLatestLoan = useLoanStore((state) => state.setLatestLoan);

  const { request } = useLoanRequestStore();
  const { amount, dueDate } = request;

  const handleSignature = async (signatureImage: string) => {
    try {
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

      const response = await createLoan({
        loan_amount: amount ?? 0,
        due_date: dueDate
          ? `${dueDate}T00:00:00`
          : new Date().toISOString().split("T")[0] + "T00:00:00",
        child_signature: base64Image,
      });

      setLatestLoan(response.data);
      router.push("/loan/child/ReqComplete");
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

        {signatureImage && (
          <View className="mb-4 p-2 border border-gray-200 rounded-lg">
            <GlobalText className="text-gray-600 mb-2">
              서명 미리보기
            </GlobalText>
            <Image
              source={{ uri: signatureImage }}
              style={{ width: "100%", height: 100, backgroundColor: "white" }}
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-row justify-between px-4">
          <TouchableOpacity
            onPress={handleClear}
            className="bg-gray-100 px-6 py-3 rounded-lg"
          >
            <GlobalText className="text-gray-700 font-medium">
              다시 작성
            </GlobalText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-[#4FC985] px-6 py-3 rounded-lg"
          >
            <GlobalText className="text-white font-medium">
              서명 완료
            </GlobalText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
