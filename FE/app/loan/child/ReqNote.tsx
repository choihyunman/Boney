import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import GlobalText from "../../../components/GlobalText";
import PromissoryNote from "./PromissoryNote";
import { useLoanRequestStore, useLoanStore } from "@/stores/useLoanChildStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { createLoan } from "@/apis/loanChildApi";
import { useMutation } from "@tanstack/react-query";
import { getKSTEndOfDayString } from "@/utils/date";
import Signature from "./Signature";

export default function PromissoryNotePage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const setLatestLoan = useLoanStore((state) => state.setLatestLoan);

  // 저장소에서 데이터 가져오기
  const { request } = useLoanRequestStore();
  const { amount, dueDate, signImage } = request;
  const user = useAuthStore((state) => state.user);
  const { userName } = user ?? {};

  // 현재 날짜 포맷팅
  const today = new Date();
  const formattedToday = `${today.getFullYear()}년 ${String(
    today.getMonth() + 1
  ).padStart(2, "0")}월 ${String(today.getDate()).padStart(2, "0")}일`;

  // 상환 날짜 포맷팅
  const formatDueDate = () => {
    if (!dueDate) return "";

    try {
      const date = new Date(dueDate);
      return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}월 ${String(date.getDate()).padStart(2, "0")}일`;
    } catch (e) {
      return "";
    }
  };

  // 상태 표시줄의 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 다시 쓰기 버튼 핸들러
  const handleRewrite = () => {
    router.back();
  };

  const { mutate: submitLoan, isPending } = useMutation({
    mutationFn: createLoan,
    onSuccess: (res) => {
      console.log("⭕ 대출 요청 성공", res);
      setLatestLoan(res.data);
      router.replace("/loan/child/ReqComplete");
    },
    onError: (err: any) => {
      Alert.alert("💸 대출 요청 에러", err.message);
    },
  });

  // 대출 신청하기 버튼 핸들러
  const handleSubmitLoan = async () => {
    console.log("💸 대출 신청하기 버튼 핸들러");
    const now = new Date();
    const requestDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    useLoanRequestStore.getState().setRequest("requestDate", requestDate);

    setShowSignature(true);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* 앱 컨텐츠 */}
      <ScrollView className="flex-1 px-6 mt-6 space-y-6 pb-20">
        <PromissoryNote
          loanAmount={amount ?? 0}
          repaymentDate={formatDueDate()}
          formattedToday={formattedToday}
          debtorName={userName ?? ""}
          debtorSign={signImage}
          minHeight={350}
        />

        {/* 버튼 영역 */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity
            onPress={handleRewrite}
            className="py-4 px-6 rounded-lg shadow-sm bg-gray-200 flex-1 mr-2"
          >
            <GlobalText className="text-gray-700 text-center">
              다시 쓰기
            </GlobalText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmitLoan}
            className="py-4 px-6 rounded-lg shadow-sm bg-[#4FC985] flex-[1.5]"
          >
            <GlobalText className="text-white text-center">서명하기</GlobalText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 서명 모달 */}
      <Modal
        visible={showSignature}
        animationType="slide"
        onRequestClose={() => setShowSignature(false)}
      >
        <Signature onClose={() => setShowSignature(false)} />
      </Modal>
    </View>
  );
}
