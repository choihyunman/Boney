import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import GlobalText from "@/components/GlobalText";

interface HeaderProps {
  title?: string;
  backgroundColor?: string;
  leftButton?: {
    onPress: () => void;
    text?: string;
    icon?: React.ReactNode;
  };
  rightButton?: {
    onPress: () => void;
    text?: string;
    icon?: React.ReactNode;
  };
}

export default function Header({
  title,
  backgroundColor = "white",
  leftButton,
  rightButton,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View
      className="flex-row items-center px-6 py-6"
      style={{ backgroundColor }}
    >
      <View className="w-16">
        {leftButton && (
          <TouchableOpacity onPress={leftButton.onPress}>
            {leftButton.icon ? (
              leftButton.icon
            ) : (
              <GlobalText weight="regular" className="text-[#9CA3AF] text-base">
                {leftButton.text}
              </GlobalText>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 items-center">
        <GlobalText weight="bold" className="text-xl text-gray-800">
          {title}
        </GlobalText>
      </View>

      <View className="w-16 items-end">
        {rightButton && (
          <TouchableOpacity onPress={rightButton.onPress}>
            {rightButton.icon ? (
              rightButton.icon
            ) : (
              <GlobalText weight="regular" className="text-[#000000] text-base">
                {rightButton.text}
              </GlobalText>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
