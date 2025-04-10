import React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import GlobalText from "./GlobalText";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: "success" | "error";
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  type = "success",
}) => {
  const getColor = () => {
    return type === "success" ? "#4FC985" : "#FF4B4B";
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-5 w-4/5 min-h-[200px] items-center justify-center">
          <View
            className="w-3 h-2 rounded-full mb-4"
            style={{ backgroundColor: getColor() }}
          />
          <GlobalText weight="bold" className="text-xl mb-4 text-center">
            {title}
          </GlobalText>
          <GlobalText className="text-lg mb-6 text-center leading-6">
            {message}
          </GlobalText>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: getColor() }}
            onPress={onClose}
          >
            <GlobalText weight="bold" className="text-white text-base">
              확인
            </GlobalText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
