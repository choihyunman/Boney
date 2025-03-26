import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { updateTransactionHashtags } from "../../apis/transactionApi";
import GlobalText from "@/components/GlobalText";

interface HashtagModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (hashtags: string[]) => void;
  initialHashtags?: string[];
  transactionId: number;
  token: string;
}

const HashtagModal: React.FC<HashtagModalProps> = ({
  visible,
  onClose,
  onSave,
  initialHashtags = [],
  transactionId,
  token,
}) => {
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [newHashtag, setNewHashtag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddHashtag = () => {
    if (newHashtag.trim()) {
      if (hashtags.length >= 3) {
        Alert.alert("알림", "해시태그는 최대 3개까지만 추가할 수 있습니다.");
        return;
      }

      const trimmedTag = newHashtag.trim().replace("#", "");
      if (trimmedTag.length > 6) {
        Alert.alert("알림", "해시태그는 최대 6글자까지만 입력할 수 있습니다.");
        return;
      }

      setHashtags([...hashtags, trimmedTag]);
      setNewHashtag("");
    }
  };

  const handleRemoveHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateTransactionHashtags(transactionId, hashtags, token);
      onSave(hashtags);
      onClose();
    } catch (error) {
      Alert.alert(
        "오류",
        error instanceof Error
          ? error.message
          : "해시태그 수정 중 오류가 발생했습니다."
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
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-lg w-full max-w-[400px] shadow-lg">
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <GlobalText className="text-xl font-semibold text-gray-900">
              해시태그 수정
            </GlobalText>
            <TouchableOpacity className="p-2" onPress={onClose}>
              <GlobalText className="text-lg text-gray-500">✕</GlobalText>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="flex-row flex-wrap gap-2 mb-4">
              {hashtags.map((tag, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-gray-100 rounded-full py-2 px-3"
                >
                  <GlobalText className="text-base font-medium text-[#4FC985]">
                    #{tag}
                  </GlobalText>
                  <TouchableOpacity
                    onPress={() => handleRemoveHashtag(index)}
                    className="ml-2"
                  >
                    <GlobalText className="text-base text-gray-500">
                      ✕
                    </GlobalText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View className="mt-3">
              <TextInput
                className="border border-gray-200 rounded-md p-3 text-base"
                value={newHashtag}
                onChangeText={setNewHashtag}
                placeholder="해시태그 입력 (최대 6글자)"
                maxLength={6}
                onSubmitEditing={handleAddHashtag}
              />
            </View>

            <View className="flex-row justify-end gap-2 mt-4">
              <TouchableOpacity
                className="px-4 py-3 rounded-md border border-gray-300"
                onPress={handleAddHashtag}
              >
                <GlobalText className="text-base">+ 추가</GlobalText>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 rounded-md bg-[#4FC985]"
                onPress={handleSave}
                disabled={isLoading}
              >
                <GlobalText className="text-base text-white font-medium">
                  {isLoading ? "저장 중..." : "저장하기"}
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default HashtagModal;
