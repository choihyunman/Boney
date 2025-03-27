import React from "react";
import { View, Pressable } from "react-native";
import GlobalText from "./GlobalText";

interface BottomButtonProps {
  onPress: () => void;
  disabled?: boolean;
  text: string;
  variant?: "primary" | "secondary";
}

export default function BottomButton({
  onPress,
  disabled,
  text,
  variant = "primary",
}: BottomButtonProps) {
  return (
    <View className="fixed bottom-0 left-0 right-0 px-5 pb-4">
      <Pressable
        className={`w-full p-5 rounded-xl ${
          variant === "primary" ? "bg-[#4FC985]" : "bg-gray-300"
        }`}
        onPress={onPress}
        disabled={disabled}
      >
        <GlobalText className="text-white text-center font-medium">
          {text}
        </GlobalText>
      </Pressable>
    </View>
  );
}
