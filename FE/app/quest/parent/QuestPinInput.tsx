// 비밀번호 입력 페이지
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { Lock, ArrowLeft } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import Toast from "react-native-toast-message";
import { approvalQuest } from "@/apis/questApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuestApprovalStore } from "@/stores/useQuestStore";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = 56;
const BUTTON_MARGIN = 8;
const BUTTON_WIDTH = (width - 64 - BUTTON_MARGIN * 2) / 3.5;
const NUM_PADS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["전체 삭제", "0", "←"],
];

interface PinInputProps {
  title: string;
  subtitle: string;
  onForgotPasswordPress?: () => void;
  onPasswordComplete?: (response: any) => void;
  onBackPress?: () => void;
  questId: number;
  onError?: (error: any) => void;
}

export interface PinInputRef {
  clearPassword: () => void;
  showErrorToast: (message?: string) => void;
}

export const PinInput = forwardRef<PinInputRef, PinInputProps>(
  (
    {
      title,
      subtitle,
      onForgotPasswordPress,
      onPasswordComplete,
      onBackPress,
      questId,
      onError,
    },
    ref
  ) => {
    const [password, setPassword] = useState<string[]>([]);
    const [animations] = useState(() =>
      Array(6)
        .fill(0)
        .map(() => new Animated.Value(0))
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      animations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: index < password.length ? 1 : 0,
          useNativeDriver: true,
        }).start();
      });
    }, [password]);

    const handleNumberPress = (num: string) => {
      if (password.length < 6) {
        const newPassword = [...password, num];
        setPassword(newPassword);
        if (newPassword.length === 6) {
          handlePasswordComplete(newPassword.join(""));
        }
      }
    };

    const handleDelete = () => {
      setPassword(password.slice(0, -1));
    };

    const handleClear = () => {
      setPassword([]);
    };

    const handlePasswordComplete = async (password: string) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const response = await approvalQuest(questId, password);
        onPasswordComplete?.(response);

        // 승인 데이터 저장
        useQuestApprovalStore.getState().setQuestTitle(response.questTitle);
        useQuestApprovalStore.getState().setChildName(response.childName);
        useQuestApprovalStore.getState().setAmount(response.amount);
        useQuestApprovalStore.getState().setApprovalDate(response.approvalDate);
      } catch (error: any) {
        console.error("퀘스트 승인 실패:", error);
        if (error.response) {
          if (error.response.status === 401) {
            // Show toast notification with higher z-index
            Toast.show({
              type: "error",
              text1: "퀘스트 승인 실패",
              text2: "비밀번호가 일치하지 않습니다",
              position: "top",
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
              props: {
                style: {
                  zIndex: 9999,
                  elevation: 9999,
                },
              },
            });

            // Clear the password input
            setPassword([]);
          } else {
            // Pass other errors to the parent component
            onError?.(error);
          }
        } else {
          // Pass network errors to the parent component
          onError?.(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const renderNumPad = () => {
      return NUM_PADS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-4 mb-2 mr-2">
          {row.map((num, colIndex) => (
            <TouchableOpacity
              key={`${rowIndex}-${colIndex}`}
              className="bg-gray-100 rounded-lg justify-center items-center"
              style={{
                width: (width - 64 - BUTTON_MARGIN * 2) / 3.5,
                height: BUTTON_SIZE,
              }}
              onPress={() => {
                if (num === "←") handleDelete();
                else if (num === "전체 삭제") handleClear();
                else handleNumberPress(num);
              }}
            >
              <GlobalText
                className={`${
                  num === "전체 삭제" ? "text-base" : "text-xl"
                } text-gray-800`}
              >
                {num}
              </GlobalText>
            </TouchableOpacity>
          ))}
        </View>
      ));
    };

    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 items-center">
          <View className="w-16 h-16 bg-[#49DB8A1A] rounded-full justify-center items-center mt-16 mb-4">
            <View className="w-7 h-7">
              <Lock size={28} color="#4FC885" />
            </View>
          </View>

          <GlobalText className="text-lg text-gray-800 mb-2">
            {title}
          </GlobalText>
          <GlobalText className="text-sm text-gray-600 mb-8">
            {subtitle}
          </GlobalText>

          <View className="flex-row gap-3 mb-8 mr4">
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                className="w-5 h-10 justify-center items-center"
              >
                <Animated.View
                  className="absolute w-3 h-3 rounded-full bg-gray-300"
                  style={{
                    transform: [
                      {
                        scale: animations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        }),
                      },
                    ],
                    backgroundColor: animations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ["#D1D5DB", "#4FC885"],
                    }),
                  }}
                />
              </View>
            ))}
          </View>

          <View className="w-[calc(100%-32px)] px-4">{renderNumPad()}</View>
        </View>
      </View>
    );
  }
);

// 페이지 컴포넌트
export default function QuestPinInputPage() {
  const params = useLocalSearchParams();
  const questId = Number(params.questId);
  const router = useRouter();
  const pinInputRef = useRef<PinInputRef>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] =
    useState(false);
  const { setQuestTitle, setChildName, setApprovalDate, setAmount } =
    useQuestApprovalStore();

  const handlePasswordComplete = (response: any) => {
    // 성공 시 처리
    Toast.show({
      type: "success",
      text1: "퀘스트 승인이 완료되었습니다",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });

    // 승인 데이터를 스토어에 저장
    setQuestTitle(response.questTitle);
    setChildName(response.childName);
    setApprovalDate(response.approvalDate);
    setAmount(response.amount);

    // 승인 완료 페이지로 이동
    setTimeout(() => {
      router.push("/quest/parent/Approval");
    }, 1500);
  };

  const handleError = (error: any) => {
    console.error("퀘스트 승인 실패:", error);
    if (error.response) {
      const errorData = error.response.data;
      if (error.response.status === 403) {
        setShowInsufficientBalanceModal(true);
      } else {
        Toast.show({
          type: "error",
          text1:
            errorData.error?.message || "퀘스트 승인 중 오류가 발생했습니다",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "서버와의 통신 중 오류가 발생했습니다",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const handleModalConfirm = () => {
    setShowInsufficientBalanceModal(false);
    router.push("/quest/parent");
  };

  return (
    <View className="flex-1 bg-white">
      <PinInput
        ref={pinInputRef}
        title="비밀번호 입력"
        subtitle="퀘스트 승인을 위해 비밀번호를 입력해주세요"
        onPasswordComplete={handlePasswordComplete}
        onBackPress={() => router.back()}
        questId={questId}
        onError={handleError}
      />

      <Modal
        visible={showInsufficientBalanceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInsufficientBalanceModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-[80%] max-w-md">
            <GlobalText className="text-lg font-bold text-center mb-4">
              결제 실패
            </GlobalText>
            <GlobalText className="text-base text-center mb-6">
              잔액이 부족합니다
            </GlobalText>
            <TouchableOpacity
              className="bg-[#4FC985] py-3 rounded-lg"
              onPress={handleModalConfirm}
            >
              <GlobalText className="text-white text-center font-bold">
                확인
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
