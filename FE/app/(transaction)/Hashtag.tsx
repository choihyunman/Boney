import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";

interface HashtagModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (hashtags: string[]) => void;
  initialHashtags?: string[];
}

const HashtagModal: React.FC<HashtagModalProps> = ({
  visible,
  onClose,
  onSave,
  initialHashtags = [],
}) => {
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [newHashtag, setNewHashtag] = useState("");

  const handleAddHashtag = () => {
    if (newHashtag.trim()) {
      if (hashtags.length >= 3) {
        return;
      }

      const trimmedTag = newHashtag.trim().replace("#", "");
      if (trimmedTag.length > 6) {
        return;
      }

      setHashtags([...hashtags, trimmedTag]);
      setNewHashtag("");
    }
  };

  const handleRemoveHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(hashtags);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-lg w-full max-w-[340px] shadow-lg">
          <View className="p-3.5 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-900">
              해시태그 수정
            </Text>
            <TouchableOpacity className="p-1" onPress={onClose}>
              <Text>✕</Text>
            </TouchableOpacity>
          </View>

          <View className="p-3.5">
            <View className="flex-row flex-wrap gap-1.5 mb-3.5">
              {hashtags.map((tag, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-gray-100 rounded-full py-1 px-2.5"
                >
                  <Text className="text-sm font-medium text-[#4FC985]">
                    #{tag}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveHashtag(index)}>
                    <Text>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text className="text-sm text-gray-600 mb-2.5">
              해시태그는 6글자, 최대 3개까지 가능합니다.
            </Text>

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity className="px-2.5 py-2.5 rounded-md border border-gray-300">
                <Text>+ 추가</Text>
              </TouchableOpacity>

              <TouchableOpacity className="px-2.5 py-2.5 rounded-md bg-[#4FC985]">
                <Text className="text-white font-medium">저장하기</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-2.5">
              <TextInput
                className="border border-gray-200 rounded-md p-2 text-sm"
                value={newHashtag}
                onChangeText={setNewHashtag}
                placeholder="해시태그 입력 (최대 6글자)"
                maxLength={6}
                onSubmitEditing={handleAddHashtag}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default HashtagModal;
