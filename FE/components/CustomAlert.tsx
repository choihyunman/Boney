import React, { useRef, useEffect, useState } from "react";
import { Modal, View, TouchableOpacity, LayoutChangeEvent } from "react-native";
import GlobalText from "./GlobalText";
import { CheckCircle, XCircle } from "lucide-react-native";

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
  const [titleWidth, setTitleWidth] = useState(0);
  const titleRef = useRef<View>(null);

  const getColor = () => {
    return type === "success" ? "#4FC985" : "#FF4B4B";
  };

  const getIcon = () => {
    return type === "success" ? (
      <CheckCircle size={60} color={getColor()} />
    ) : (
      <XCircle size={60} color={getColor()} />
    );
  };

  const handleTitleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTitleWidth(width);
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
          <View className="mb-4">{getIcon()}</View>
          <View onLayout={handleTitleLayout}>
            <GlobalText weight="bold" className="text-2xl mb-4 text-center">
              {title}
            </GlobalText>
          </View>
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
