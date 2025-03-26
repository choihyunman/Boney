// 비밀번호 입력 페이지
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

interface PinInputProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean; // 뒤로가기 버튼 표시 여부
  onBackPress?: () => void;
  onForgotPasswordPress?: () => void;
  onPasswordComplete?: (password: string) => void;
}

export const PinInput = ({
  title,
  subtitle,
  showBackButton = false, // 기본값은 false
  onBackPress,
  onForgotPasswordPress,
  onPasswordComplete,
}: PinInputProps) => {
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
      {showBackButton && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackPress}>
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[styles.content, !showBackButton && styles.contentWithoutHeader]}
      >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 54,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
  },
  contentWithoutHeader: {
    paddingTop: 64, // 헤더가 없을 때는 상단 여백을 더 크게
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#49DB8A1A",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrapper: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
    fontFamily: "NEXON_Lv1_Gothic-Regular",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
    fontFamily: "NEXON_Lv1_Gothic-Regular",
  },
  passwordDots: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  dot: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  dotActive: {
    borderColor: "#4FC885",
  },
  numPadContainer: {
    width: width - 32,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: BUTTON_MARGIN,
  },
  button: {
    width: (width - 64 - BUTTON_MARGIN * 2) / 3,
    height: BUTTON_SIZE,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#333",
    fontFamily: "NEXON_Lv1_Gothic-Regular",
  },
  forgotPassword: {
    marginTop: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
    fontFamily: "NEXON_Lv1_Gothic-Regular",
  },
});
