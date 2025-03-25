import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Lock, ArrowLeft } from "lucide-react-native";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = 56;
const BUTTON_MARGIN = 8;
const NUM_PADS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["전체 삭제", "0", "←"],
];

interface PasswordPageProps {
  title: string;
  subtitle: string;
  onBackPress?: () => void;
  onForgotPasswordPress?: () => void;
  onPasswordComplete?: (password: string) => void;
}

export const PasswordPage = ({
  title,
  subtitle,
  onBackPress,
  onForgotPasswordPress,
  onPasswordComplete,
}: PasswordPageProps): JSX.Element => {
  const [password, setPassword] = useState<string[]>([]);

  const handleNumberPress = (num: string) => {
    if (password.length < 6) {
      const newPassword = [...password, num];
      setPassword(newPassword);
      if (newPassword.length === 6) {
        onPasswordComplete?.(newPassword.join(""));
      }
    }
  };

  const handleDelete = () => {
    setPassword(password.slice(0, -1));
  };

  const handleClear = () => {
    setPassword([]);
  };

  const renderNumPad = () => {
    return NUM_PADS.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((num, colIndex) => (
          <TouchableOpacity
            key={`${rowIndex}-${colIndex}`}
            style={styles.button}
            onPress={() => {
              if (num === "←") handleDelete();
              else if (num === "전체 삭제") handleClear();
              else handleNumberPress(num);
            }}
          >
            <Text style={styles.buttonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
          <ArrowLeft size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <Lock size={28} color="#4FC885" />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.passwordDots}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index < password.length && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.numPadContainer}>{renderNumPad()}</View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={onForgotPasswordPress}
        >
          <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ... existing styles ...
