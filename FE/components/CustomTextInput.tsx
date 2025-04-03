import { TextInput, TextInputProps, View } from "react-native";
import GlobalText from "./GlobalText";
import { useRef } from "react";

interface CustomTextAreaProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  maxLength?: number;
  height?: number;
}

export default function CustomTextArea({
  value,
  onChangeText,
  placeholder,
  maxLength,
  height = 100,
  ...rest
}: CustomTextAreaProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View
      className="relative w-full rounded-lg border border-gray-200 bg-white"
      style={{ height }}
    >
      {/* 커스텀 placeholder */}
      {value.length === 0 && (
        <GlobalText
          onPress={() => inputRef.current?.focus()}
          className="absolute left-4 top-3 text-gray-400"
          style={{
            fontFamily: "NEXONLv1Gothic-Regular",
            fontSize: 16,
            lineHeight: 24,
            maxWidth: "90%",
          }}
        >
          {placeholder}
        </GlobalText>
      )}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
        className="w-full px-4 py-3 text-base"
        style={{
          fontFamily: "NEXONLv1Gothic-Regular",
          fontSize: 16,
          lineHeight: 24,
        }}
        {...rest}
      />
    </View>
  );
}
