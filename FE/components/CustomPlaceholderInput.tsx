import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import GlobalText from "./GlobalText";

interface CustomPlaceholderInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function CustomPlaceholderInput({
  value,
  onChangeText,
  placeholder,
  style,
  ...rest
}: CustomPlaceholderInputProps) {
  return (
    <View style={{ position: "relative" }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          {
            fontFamily: "NEXONLv1Gothic-Regular",
            height: "100%",
            width: "100%",
          },
          style,
        ]}
        {...rest}
      />
      {!value && (
        <GlobalText
          style={{
            position: "absolute",
            left: 40,
            top: 0,
            fontFamily: "NEXONLv1Gothic-Regular",
            color: "#71717A",
            fontSize: 14,
            lineHeight: 56,
          }}
        >
          {placeholder}
        </GlobalText>
      )}
    </View>
  );
}
