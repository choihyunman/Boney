import { View, Text, TouchableOpacity, Modal } from "react-native";
import { X } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";

interface LoanModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

export default function LoanModal({
  visible,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = "예",
  cancelText = "아니오",
  confirmColor = "#4FC985",
}: LoanModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white rounded-lg p-6 w-[320px] mx-4">
          <View className="flex-row justify-between items-center mb-4">
            <GlobalText weight="bold" className="text-lg">
              {title}
            </GlobalText>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <GlobalText className="text-gray-700 mb-6">{content}</GlobalText>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg mr-1"
            >
              <GlobalText className="text-center text-gray-700">
                {cancelText}
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3 rounded-lg"
              style={{ backgroundColor: confirmColor }}
            >
              <GlobalText className="text-center text-white">
                {confirmText}
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
