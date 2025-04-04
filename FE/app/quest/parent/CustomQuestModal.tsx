import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import GlobalText from "@/components/GlobalText";
import CustomTextInput from "@/components/CustomTextInput";

interface CustomQuestModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
}

const CustomQuestModal: React.FC<CustomQuestModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [customTitle, setCustomTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCustomTitle(""); // 🔥 모달이 열릴 때마다 초기화
    }
  }, [visible]);

  const handleClose = () => {
    setCustomTitle("");
    onClose();
  };

  const handleSave = async () => {
    if (!customTitle.trim()) {
      Alert.alert("알림", "퀘스트 제목을 입력해주세요.");
      return;
    }

    if (customTitle.length > 15) {
      Alert.alert(
        "알림",
        "퀘스트 제목은 최대 15글자까지만 입력할 수 있습니다."
      );
      return;
    }

    try {
      setIsLoading(true);
      onSave(customTitle);
    } catch (error) {
      Alert.alert(
        "오류",
        error instanceof Error
          ? error.message
          : "퀘스트 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-lg w-full max-w-[400px] shadow-lg">
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <GlobalText className="text-xl font-semibold text-gray-900">
              직접 입력
            </GlobalText>
            <TouchableOpacity className="p-2" onPress={handleClose}>
              <GlobalText className="text-lg text-gray-500">✕</GlobalText>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="mt-3">
              <CustomTextInput
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="퀘스트 제목 입력 (최대 15글자)"
                maxLength={20}
                height={50}
                onSubmitEditing={handleSave}
              />
            </View>

            <View className="flex-row justify-end gap-2 mt-4">
              <TouchableOpacity
                className="px-4 py-3 rounded-md bg-[#4FC985]"
                onPress={handleSave}
                disabled={isLoading}
              >
                <GlobalText className="text-base text-white font-medium">
                  {isLoading ? "저장 중..." : "저장"}
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CustomQuestModal;
