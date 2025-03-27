import { View, Text, TouchableOpacity, Modal } from "react-native";
import { X } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
interface LoanModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LoanModal({
  visible,
  onClose,
  onConfirm,
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
              대출 신청 취소
            </GlobalText>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <GlobalText className="text-gray-700 mb-6">
            정말 대출 신청을 취소하시겠습니까?
          </GlobalText>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg mr-1"
            >
              <GlobalText className="text-center text-gray-700">
                아니오
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3 bg-[#4FC985] rounded-lg"
            >
              <GlobalText className="text-center text-white">예</GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
