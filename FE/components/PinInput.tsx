// 비밀번호 입력 페이지
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, TouchableOpacity, Dimensions, Animated } from "react-native";
import { Lock, ArrowLeft } from "lucide-react-native";
import GlobalText from "./GlobalText";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = 56;
const BUTTON_MARGIN = 8;
const BUTTON_WIDTH = (width - 64 - BUTTON_MARGIN * 2) / 3.5;
const NUM_PADS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["전체 삭제", "0", "←"],
];

interface PinInputProps {
  title: string;
  subtitle: string;
  onForgotPasswordPress?: () => void;
  onPasswordComplete?: (password: string) => void;
  onBackPress?: () => void;
}

export interface PinInputRef {
  clearPassword: () => void;
}

export const PinInput = forwardRef<PinInputRef, PinInputProps>(
  (
    { title, subtitle, onForgotPasswordPress, onPasswordComplete, onBackPress },
    ref
  ) => {
    const [password, setPassword] = useState<string[]>([]);
    const [animations] = useState(() =>
      Array(6)
        .fill(0)
        .map(() => new Animated.Value(0))
    );

    // 외부에서 호출할 수 있는 초기화 함수
    useImperativeHandle(ref, () => ({
      clearPassword: () => {
        setPassword([]);
      },
    }));

    useEffect(() => {
      animations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: index < password.length ? 1 : 0,
          useNativeDriver: true,
        }).start();
      });
    }, [password]);

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
        <View key={rowIndex} className="flex-row gap-4 mb-2 mr-2">
          {row.map((num, colIndex) => (
            <TouchableOpacity
              key={`${rowIndex}-${colIndex}`}
              className="bg-gray-100 rounded-lg justify-center items-center"
              style={{
                width: (width - 64 - BUTTON_MARGIN * 2) / 3.5,
                height: BUTTON_SIZE,
              }}
              onPress={() => {
                if (num === "←") handleDelete();
                else if (num === "전체 삭제") handleClear();
                else handleNumberPress(num);
              }}
            >
              <GlobalText
                className={`${
                  num === "전체 삭제" ? "text-base" : "text-xl"
                } text-gray-800`}
              >
                {num}
              </GlobalText>
            </TouchableOpacity>
          ))}
        </View>
      ));
    };

    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 items-center">
          <View className="w-16 h-16 bg-[#49DB8A1A] rounded-full justify-center items-center mt-16 mb-4">
            <View className="w-7 h-7">
              <Lock size={28} color="#4FC885" />
            </View>
          </View>

          <GlobalText className="text-lg text-gray-800 mb-2">
            {title}
          </GlobalText>
          <GlobalText className="text-sm text-gray-600 mb-8">
            {subtitle}
          </GlobalText>

          <View className="flex-row gap-3 mb-8 mr4">
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                className="w-5 h-10 justify-center items-center"
              >
                <Animated.View
                  className="absolute w-3 h-3 rounded-full bg-gray-300"
                  style={{
                    transform: [
                      {
                        scale: animations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        }),
                      },
                    ],
                    backgroundColor: animations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ["#D1D5DB", "#4FC885"],
                    }),
                  }}
                />
              </View>
            ))}
          </View>

          <View className="w-[calc(100%-32px)] px-4">{renderNumPad()}</View>
        </View>
      </View>
    );
  }
);
